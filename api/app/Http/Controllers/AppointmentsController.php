<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\FeatureFlag;
use App\Models\ServiceProvider;
use Illuminate\Http\Request;

class AppointmentsController extends Controller
{
    /**
     * Lista os agendamentos do usuario autenticado.
     *
     * O cliente ve agendamentos onde eh o client; o prestador ve
     * agendamentos de seu servico (atravessando ServiceProvider.user).
     * Use ?role=client|provider para forcar uma perspectiva.
     */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $user = $request->user();
        $role = $request->query('role', null);

        $query = Appointment::with(['client', 'provider.user']);

        if ($role === 'provider' || ($role === null && $user->serviceProvider)) {
            $query->forProvider($user->id);
        } else {
            $query->forClient($user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->string('status'));
        }

        $appointments = $query->latest('date', 'time')->paginate(20);

        return AppointmentResource::collection($appointments);
    }

    /**
     * Cria um agendamento (cliente solicita servico a um prestador).
     */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required',
            'valor' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $provider = ServiceProvider::find($request->provider_id);
        if (!$provider || !$provider->is_active) {
            abort(403, 'Prestador de servico nao disponível.');
        }

        $appointment = Appointment::create([
            'client_id' => $request->user()->id,
            'provider_id' => $provider->id,
            'date' => $request->date,
            'time' => $request->time,
            'status' => Appointment::STATUS_PENDENTE,
            'valor' => $request->valor,
            'observacoes' => $request->observacoes,
        ]);

        return (new AppointmentResource($appointment->load('client', 'provider.user')))->response($request)->setStatusCode(201);
    }

    /**
     * Exibe um agendamento (apenas participantes).
     */
    public function show(Request $request, Appointment $appointment)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $appointment);

        return new AppointmentResource($appointment->load('client', 'provider.user'));
    }

    /**
     * Atualiza status/valor/observacoes.
     *
     * - Prestador: confirmar, recusar, concluir e definir valor.
     * - Cliente: cancelar.
     */
    public function update(Request $request, Appointment $appointment)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $this->authorizeParticipant($request, $appointment);

        $isProvider = $appointment->provider->user_id === $request->user()->id;

        $rules = [
            'status' => 'sometimes|in:' . implode(',', Appointment::STATUSES),
            'valor' => 'sometimes|numeric|min:0',
            'observacoes' => 'sometimes|string|max:1000',
        ];
        $request->validate($rules);

        if ($isProvider) {
            if ($request->has('status') && !in_array($request->status, [
                Appointment::STATUS_CONFIRMADO,
                Appointment::STATUS_RECUSADO,
                Appointment::STATUS_CONCLUIDO,
            ])) {
                abort(403, 'Status nao permitido para o prestador.');
            }
        } else {
            // Cliente so pode cancelar
            if ($request->has('status') && $request->status !== Appointment::STATUS_CANCELADO) {
                abort(403, 'Cliente so pode cancelar o agendamento.');
            }
            if ($request->has('valor')) {
                abort(403, 'Cliente nao pode alterar o valor.');
            }
        }

        $appointment->update($request->only(['status', 'valor', 'observacoes']));

        return new AppointmentResource($appointment->fresh()->load('client', 'provider.user'));
    }

    /**
     * Cancela (remove) um agendamento pendente de propriedade do cliente.
     */
    public function destroy(Request $request, Appointment $appointment)
    {
        if (!FeatureFlag::isEnabled('ff_agendamentos_chat')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        if ($appointment->client_id !== $request->user()->id) {
            abort(403, 'Apenas o cliente pode cancelar este agendamento.');
        }

        if ($appointment->status !== Appointment::STATUS_PENDENTE) {
            abort(403, 'So e possivel cancelar agendamentos pendentes.');
        }

        $appointment->delete();

        return response()->noContent();
    }

    /**
     * Garante que o usuario autenticado participa do agendamento.
     */
    private function authorizeParticipant(Request $request, Appointment $appointment): void
    {
        $user = $request->user();
        $isClient = $appointment->client_id === $user->id;
        $isProvider = $appointment->provider->user_id === $user->id;

        if (!$isClient && !$isProvider) {
            abort(403, 'Acesso negado. Voce nao participa deste agendamento.');
        }
    }
}
