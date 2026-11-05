<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\FeatureFlag;
use App\Models\ServiceProvider;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    private function requireFeatureFlag(Request $request): void
    {
        if (!FeatureFlag::isEnabled('ff_appointment')) {
            abort(403, 'Agendamentos nao habilitados.');
        }
    }

    /** Listar agendamentos do cliente autenticado ou do prestador vinculado ao usuario. */
    public function index(Request $request)
    {
        $this->requireFeatureFlag($request);
        $user = $request->user();

        $query = Appointment::with(['client', 'provider.user']);

        $provider = ServiceProvider::where('user_id', $user->id)->first();

        if ($provider) {
            $query->whereHas('provider.user', function ($q) use ($user) {
                $q->where('id', $user->id);
            });
        } else {
            $query->where('client_id', $user->id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        if ($request->has('date') && $request->date !== '') {
            $query->where('date', $request->date);
        }
        if ($request->has('provider_id') && $request->provider_id !== '' && $provider) {
            $query->where('provider_id', $request->provider_id);
        }

        return AppointmentResource::collection($query->latest()->paginate(20));
    }

    /** Criar um agendamento (apenas clientes). */
    public function store(Request $request)
    {
        $this->requireFeatureFlag($request);

        $user = $request->user();

        $data = $request->validate([
            'provider_id' => 'required|exists:service_providers,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'valor' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::create([
            'client_id' => $user->id,
            'provider_id' => $data['provider_id'],
            'date' => $data['date'],
            'time' => $data['time'],
            'status' => Appointment::STATUS_PENDENTE,
            'valor' => $data['valor'] ?? null,
            'observacoes' => $data['observacoes'] ?? null,
        ]);

        return (new AppointmentResource(
            $appointment->load(['client', 'provider.user'])
        ))->response($request)->setStatusCode(201);
    }

    /** Exibir um agendamento (somente cliente ou prestador envolvidos). */
    public function show(Request $request, Appointment $appointment)
    {
        $this->requireFeatureFlag($request);

        $user = $request->user();

        $appointment->load(['client', 'provider.user']);

        if ((int) $appointment->client_id !== (int) $user->id
            && (int) optional($appointment->provider)->user?->id !== (int) $user->id) {
            abort(403, 'Voce nao participa deste agendamento.');
        }

        return new AppointmentResource($appointment);
    }

    /** Atualizar status (e observacoes/valor) — somente o prestador do agendamento. */
    public function update(Request $request, Appointment $appointment)
    {
        $this->requireFeatureFlag($request);

        $user = $request->user();

        $provider = ServiceProvider::where('user_id', $user->id)->first();

        if (!$provider || (int) $provider->id !== (int) $appointment->provider_id) {
            abort(403, 'Apenas o prestador do agendamento pode atualizá-lo.');
        }

        $data = $request->validate([
            'status' => 'required|in:' . implode(',', Appointment::STATUSES),
            'valor' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $appointment->update($data);

        return new AppointmentResource($appointment->load(['client', 'provider.user']));
    }

    /** Cancelar agendamento — somente o cliente, apenas se pendente. */
    public function destroy(Request $request, Appointment $appointment)
    {
        $this->requireFeatureFlag($request);

        $user = $request->user();

        if ((int) $appointment->client_id !== (int) $user->id) {
            abort(403, 'Apenas o cliente pode cancelar o agendamento.');
        }

        if ($appointment->status !== Appointment::STATUS_PENDENTE) {
            abort(409, 'Só é possível cancelar agendamentos pendentes.');
        }

        $appointment->delete();

        return response()->noContent();
    }
}
