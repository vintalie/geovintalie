<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class ChatMessageController extends Controller
{
    /** Enviar uma mensagem em uma conversa (somente participantes). */
    public function store(Request $request, ChatConversation $conversation)
    {
        $user = $request->user();

        if (!$this->isParticipant($conversation, $user)) {
            abort(403, 'Voce nao participa desta conversa.');
        }

        $data = $request->validate([
            'body' => 'required|string|max:4000',
        ]);

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $data['body'],
        ]);

        return (new MessageResource($message->load('sender')))->response($request)->setStatusCode(201);
    }

    /** Marcar uma mensagem como lida (somente destinatario). */
    public function markRead(Request $request, ChatMessage $message)
    {
        $user = $request->user();

        $message->load(['conversation.provider']);

        if (!$this->isParticipant($message->conversation, $user)) {
            abort(403, 'Voce nao participa desta conversa.');
        }

        if ((int) $message->sender_id === (int) $user->id) {
            abort(403, 'Nao eh possivel marcar a propria mensagem como lida.');
        }

        $message->update(['read_at' => now()]);

        return new MessageResource($message->load('sender'));
    }

    private function isParticipant(ChatConversation $conversation, $user): bool
    {
        $conversation->loadMissing('provider');

        return (int) $conversation->client_id === (int) $user->id
            || (int) optional($conversation->provider)->user_id === (int) $user->id;
    }
}
