<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\FeatureFlag;
use App\Models\Message;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    /**
     * Lista as mensagens de uma conversa (apenas participantes).
     * Quando nao informada a conversa, lista mensagens das conversas em que
     * o usuario participa (usado pela rota /messages).
     * Mensagens nao lidas enviadas por outros sao marcadas como lidas.
     */
    public function index(Request $request, ChatConversation $conversation = null)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $user = $request->user();

        if ($conversation) {
            $this->authorizeParticipant($request, $conversation);

            // Marca como lidas mensagens recebidas
            $conversation->messages()->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $messages = $conversation->messages()
                ->with('sender')
                ->oldest('created_at')
                ->paginate(50);

            return MessageResource::collection($messages);
        }

        // Listagem geral de mensagens das conversas em que o usuario participa.
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

    /**
     * Envia uma nova mensagem na conversa.
     */
    public function store(Request $request, ChatConversation $conversation)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $conversation);

        $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        return (new MessageResource($message->load('sender')))->response($request)->setStatusCode(201);
    }

    /**
     * Garante que o usuario autenticado participa da conversa.
     */
    private function authorizeParticipant(Request $request, ChatConversation $conversation): void
    {
        $user = $request->user();
        $isClient = $conversation->client_id === $user->id;
        $isProvider = $conversation->provider->user_id === $user->id;

        if (!$isClient && !$isProvider) {
            abort(403, 'Acesso negado. Voce nao participa desta conversa.');
        }
    }
}
