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
     * Aceita corpo de texto (opcional) e um anexo de arquivo (opcional).
     * Pelo menos um dos dois deve ser informado.
     */
    public function store(Request $request, ChatConversation $conversation)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $conversation);

        $request->validate([
            'body' => 'nullable|string|max:4000',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,csv,rtf,odt,zip,jpg,jpeg,png,webp,gif,mp3,wav,ogg,m4a,xlsx,xls',
        ]);

        if (empty((string) $request->body) && !$request->hasFile('file')) {
            return response()->json([
                'message' => 'Informe uma mensagem ou anexe um arquivo.',
            ], 422);
        }

        $filePath = null;
        $fileName = null;
        $fileMime = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            $uploaded = $request->file('file');
            $filePath = $uploaded->store('chat/messages', 'public');
            $fileName = $uploaded->getClientOriginalName();
            $fileMime = $uploaded->getMimeType();
            $fileSize = (int) $uploaded->getSize();
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $request->body ?? '',
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_mime' => $fileMime,
            'file_size' => $fileSize,
        ]);

        return (new MessageResource($message->load('sender')))->response($request)->setStatusCode(201);
    }

    /**
     * Faz o download do anexo de uma mensagem (somente participantes da conversa).
     */
    public function download(Request $request, ChatMessage $message)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $conversation = $message->loadMissing('conversation.provider')->conversation;
        $this->authorizeParticipant($request, $conversation);

        if (!$message->hasAttachment()) {
            abort(404, 'Esta mensagem nao possui anexo.');
        }

        $path = storage_path('app/public/' . $message->file_path);

        if (!file_exists($path)) {
            abort(404, 'Arquivo nao encontrado no servidor.');
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            abort(404, 'Nao foi possivel ler o arquivo.');
        }

        return response($contents, 200, [
            'Content-Type' => $message->file_mime ?: 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $message->file_name . '"',
        ]);
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
