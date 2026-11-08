<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Models\FeatureFlag;
use App\Models\Message;
use Illuminate\Http\Request;

/**
 * Mensagens (Escopo B4).
 *
 * `store` e a autorizacao de participante estao em MessagesController
 * (implementacao unificada). Nesta classe ficam apenas as acoes que nao
 * pertencem a uma conversa especifica: listagem geral de mensagens e
 * leitura/marcacao de uma mensagem avulsa.
 */
class MessageController extends MessagesController
{
    /** Listar mensagens das conversas em que o usuario participa. */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_chat')) {
            abort(403, 'Chat interno nao habilitado.');
        }

        $user = $request->user();

        $query = Message::whereHas('conversation', function ($q) use ($user) {
            $q->where(function ($qq) use ($user) {
                $qq->where('client_id', $user->id)
                   ->orWhereHas('provider.user', function ($q2) use ($user) {
                       $q2->where('id', $user->id);
                   });
            });
        })->with(['conversation', 'sender'])->latest();

        if ($request->has('conversation_id') && $request->conversation_id !== '') {
            $query->where('conversation_id', $request->conversation_id);
        }

        return MessageResource::collection($query->paginate(20));
    }

    /** Marcar uma mensagem como lida (somente o destinatario). */
    public function markRead(Request $request, Message $message)
    {
        if (!FeatureFlag::isEnabled('ff_chat')) {
            abort(403, 'Chat interno nao habilitado.');
        }

        $user = $request->user();

        $message->load(['conversation.provider']);

        if (!$message->conversation->isParticipant($user)) {
            abort(403, 'Voce nao participa desta conversa.');
        }

        if ((int) $message->sender_id === (int) $user->id) {
            abort(403, 'Nao eh possivel marcar a propria mensagem como lida.');
        }

        $message->update(['read_at' => now()]);

        return new MessageResource($message->load('sender'));
    }
}
