<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Appointment;
use App\Models\ChatConversation;
use App\Models\FeatureFlag;
use App\Models\ServiceProvider;
use Illuminate\Http\Request;

class ConversationsController extends Controller
{
    /**
     * Lista as conversas do usuario autenticado (cliente ou prestador).
     */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $conversations = ChatConversation::with(['client', 'provider.user'])
            ->forParticipant($request->user()->id)
            ->latest('updated_at')
            ->paginate(20);

        return ConversationResource::collection($conversations);
    }

    /**
     * Cria (ou retorna existente) uma conversa entre cliente e prestador.
     * Opcionalmente vincula a um agendamento do cliente.
     */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'appointment_id' => 'nullable|exists:appointments,id',
        ]);

        $provider = ServiceProvider::find($request->provider_id);
        if (!$provider || !$provider->is_active) {
            abort(403, 'Prestador de servico nao disponível.');
        }

        $appointmentId = $request->appointment_id;
        if ($appointmentId) {
            $appointment = Appointment::where('id', $appointmentId)
                ->where('client_id', $request->user()->id)
                ->first();
            if (!$appointment) {
                abort(403, 'Agendamento invalido ou nao pertence a este cliente.');
            }
        }

        // Retorna conversa existente para o mesmo par cliente x prestador x agendamento
        $conversation = ChatConversation::where('client_id', $request->user()->id)
            ->where('provider_id', $provider->id)
            ->where('appointment_id', $appointmentId ?? null)
            ->first();

        if (!$conversation) {
            $conversation = ChatConversation::create([
                'client_id' => $request->user()->id,
                'provider_id' => $provider->id,
                'appointment_id' => $appointmentId,
            ]);
        }

        return new ConversationResource($conversation->load('client', 'provider.user'));
    }

    /**
     * Exibe uma conversa com suas mensagens (apenas participantes).
     */
    public function show(Request $request, ChatConversation $conversation)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $conversation);

        return new ConversationResource($conversation->load([
            'client',
            'provider.user',
            'messages.sender',
            'appointment.client',
            'appointment.provider.user',
        ]));
    }

    /**
     * Inicia uma nova conversa vazia (sem agendamento vinculado).
     * Atalho para o frontend abrir o chat direto com um prestador.
     */
    public function open(Request $request)
    {
        return $this->store($request);
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
