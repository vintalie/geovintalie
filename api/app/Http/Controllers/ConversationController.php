<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Models\Appointment;
use App\Models\Conversation;
use App\Models\FeatureFlag;
use App\Models\ServiceProvider;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /** Listar conversas do usuario autenticado (cliente ou usuario do prestador). */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_chat')) {
            abort(403, 'Chat interno nao habilitado.');
        }

        $user = $request->user();

        $query = Conversation::forParticipant($user->id)
            ->with(['client', 'provider.user', 'messages.sender'])
            ->latest();

        return ConversationResource::collection($query->paginate(20));
    }

    /** Criar (ou reutilizar) a conversa entre o cliente autenticado e um prestador. */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_chat')) {
            abort(403, 'Chat interno nao habilitado.');
        }

        $user = $request->user();

        $data = $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'appointment_id' => 'nullable|exists:appointments,id',
        ]);

        $provider = ServiceProvider::findOrFail($data['provider_id']);

        // Se informado, o agendamento deve pertencer ao cliente e ao prestador.
        if (!empty($data['appointment_id'])) {
            $appointment = Appointment::where('id', $data['appointment_id'])
                ->where('client_id', $user->id)
                ->where('provider_id', $provider->id)
                ->first();

            if (!$appointment) {
                abort(403, 'O agendamento informado nao existe ou nao pertence a voce.');
            }
        }

        $conversation = Conversation::where('client_id', $user->id)
            ->where('provider_id', $provider->id)
            ->when($data['appointment_id'], fn ($q) => $q->where('appointment_id', $data['appointment_id']))
            ->when(empty($data['appointment_id']), fn ($q) => $q->whereNull('appointment_id'))
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'client_id' => $user->id,
                'provider_id' => $provider->id,
                'appointment_id' => $data['appointment_id'] ?? null,
            ]);
        }

        return (new ConversationResource(
            $conversation->load(['client', 'provider.user'])
        ))->response($request)->setStatusCode(201);
    }

    /** Exibir conversa com mensagens (somente participantes). */
    public function show(Request $request, Conversation $conversation)
    {
        if (!FeatureFlag::isEnabled('ff_chat')) {
            abort(403, 'Chat interno nao habilitado.');
        }

        $user = $request->user();

        if (!$conversation->isParticipant($user)) {
            abort(403, 'Voce nao participa desta conversa.');
        }

        return new ConversationResource(
            $conversation->load(['client', 'provider.user', 'messages.sender'])
        );
    }
}
