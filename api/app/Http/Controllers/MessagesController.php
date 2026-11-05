<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\FeatureFlag;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    /**
     * Lista as mensagens de uma conversa (apenas participantes).
     * Mensagens nao lidas enviadas por outros sao marcadas como lidas.
     */
    public function index(Request $request, ChatConversation $conversation)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $conversation);

        // Marca como lidas mensagens recebidas
        $conversation->messages()->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender')
            ->oldest('created_at')
            ->paginate(50);

        return MessageResource::collection($messages);
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

        return new MessageResource($message->load('sender'));
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
