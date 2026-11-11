<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceEvaluationResource;
use App\Models\Appointment;
use App\Models\FeatureFlag;
use App\Models\ServiceEvaluation;
use App\Models\ServiceListing;
use Illuminate\Http\Request;

class ServiceEvaluationController extends Controller
{
    /** Criar avaliacao mutua apos servico concluido.
     *
     * Direcao direta: cliente avalia prestador (evaluator = cliente).
     * Direcao inversa: prestador avalia cliente (evaluator = prestador, service_client_id = cliente),
     * detectada quando o usuario autenticado e o proprio prestador do servico.
     */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_service_evaluations')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $user = $request->user();

        $data = $request->validate([
            'service_listing_id' => 'required|exists:service_listings,id',
            'service_provider_id' => 'required|exists:service_providers,id',
            'service_client_id' => 'nullable|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $listing = ServiceListing::with('provider')->findOrFail($data['service_listing_id']);

        // O servico informado deve pertencer ao prestador informado.
        if ((int) $listing->provider_id !== (int) $data['service_provider_id']) {
            abort(403, 'O servico informado nao pertence ao prestador informado.');
        }

        $provider = $listing->provider;
        $isReverse = (int) $provider->user_id === (int) $user->id;
        $evaluatedClientId = $data['service_client_id'] ?? null;

        // Nao permite auto-avaliacao.
        if ($isReverse) {
            if ((int) $evaluatedClientId === (int) $user->id) {
                abort(403, 'Voce nao pode avaliar a si mesmo.');
            }
        } elseif ($provider->user_id === $user->id) {
            abort(403, 'Voce nao pode avaliar o proprio servico.');
        }

        // Deve haver um agendamento concluido entre as partes.
        if ($isReverse) {
            // Prestador avalia o cliente que atendeu.
            $contratou = Appointment::where('client_id', $evaluatedClientId)
                ->where('provider_id', $provider->id)
                ->where('status', Appointment::STATUS_CONCLUIDO)
                ->exists();
        } else {
            // Cliente avalia o prestador que contratou.
            $contratou = Appointment::where('client_id', $user->id)
                ->where('provider_id', $provider->id)
                ->where('status', Appointment::STATUS_CONCLUIDO)
                ->exists();
        }

        if (! $contratou) {
            abort(403, 'Apenas quem participou de um servico ja concluido pode avalia-lo.');
        }

        // Uma avaliacao por avaliador por alvo em cada servico.
        $duplicateQuery = ServiceEvaluation::where('evaluator_id', $user->id)
            ->where('service_listing_id', $listing->id);
        if ($isReverse) {
            $duplicateQuery->where('service_client_id', $evaluatedClientId);
        } else {
            $duplicateQuery->whereNull('service_client_id');
        }
        if ($duplicateQuery->exists()) {
            abort(409, 'Voce ja avaliou este servico.');
        }

        $evaluation = ServiceEvaluation::create([
            'service_listing_id' => $listing->id,
            'service_provider_id' => $provider->id,
            'service_client_id' => $isReverse ? $evaluatedClientId : null,
            'evaluator_id' => $user->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $provider->recalculateRating();
        $listing->recalculateRating();

        $relations = ['evaluator', 'provider'];
        if ($isReverse) {
            $relations[] = 'client';
        }
        $evaluation->load($relations);

        return new ServiceEvaluationResource($evaluation);
    }

    /** Listar avaliacoes recebidas por um prestador. */
    public function byProvider(Request $request, string $provider_id)
    {
        $evaluations = ServiceEvaluation::with('evaluator')
            ->where('service_provider_id', $provider_id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return ServiceEvaluationResource::collection($evaluations);
    }
}
