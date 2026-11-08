<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReviewResource;
use App\Models\Appointment;
use App\Models\FeatureFlag;
use App\Models\Review;
use App\Models\ServiceListing;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /** Criar avaliacao mutua cliente -> prestador apos servico concluido. */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_reviews')) {
            abort(403, 'Avaliacoes nao habilitadas.');
        }

        $user = $request->user();

        $data = $request->validate([
            'service_listing_id' => 'required|exists:service_listings,id',
            'service_provider_id' => 'required|exists:service_providers,id',
            'rating' => 'required|integer|min:' . Review::RATING_MIN . '|max:' . Review::RATING_MAX,
            'comment' => 'nullable|string|max:2000',
        ]);

        $listing = ServiceListing::with('provider')->findOrFail($data['service_listing_id']);

        // O servico avaliado deve pertencer ao prestador informado.
        if ((int) $listing->provider_id !== (int) $data['service_provider_id']) {
            abort(403, 'O servico informado nao pertence ao prestador informado.');
        }

        $provider = $listing->provider;

        // Nao permite auto-avaliacao: o cliente nao e o prestador.
        if ($provider->user_id === $user->id) {
            abort(403, 'Voce nao pode avaliar o proprio servico.');
        }

        // Apenas o cliente que contratou o servico e ja o concluiu pode avaliar.
        $contratou = Appointment::where('client_id', $user->id)
            ->where('provider_id', $provider->id)
            ->where('status', Appointment::STATUS_CONCLUIDO)
            ->exists();

        if (! $contratou) {
            abort(403, 'Apenas clientes que contrataram o servico e ja o concluiram podem avalia-lo.');
        }

        // Uma avaliacao por cliente por servico.
        $jaAvaliou = Review::where('evaluator_id', $user->id)
            ->where('service_listing_id', $listing->id)
            ->exists();
        if ($jaAvaliou) {
            abort(409, 'Voce ja avaliou este servico.');
        }

        $review = Review::create([
            'service_listing_id' => $listing->id,
            'service_provider_id' => $provider->id,
            'evaluator_id' => $user->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $provider->recalculateRating();
        $listing->recalculateRating();

        return (new ReviewResource(
            $review->load('evaluator', 'provider')
        ))->response($request)->setStatusCode(201);
    }

    /**
     * Listar avaliacoes do usuario autenticado.
     * ?role=sent  -> avaliacoes que o usuario escreveu como cliente (default)
     * ?role=received -> avaliacoes recebidas pelo usuario como prestador
     */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_reviews')) {
            abort(403, 'Avaliacoes nao habilitadas.');
        }

        $user = $request->user();
        $role = $request->query('role', 'sent');

        $query = Review::with(['evaluator', 'provider']);

        if ($role === 'received') {
            // Avaliacoes recebidas: o usuario autenticado e o prestador avaliado.
            $query->whereHas('provider', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } else {
            // Avaliacoes enviadas: o usuario autenticado e o avaliador (cliente).
            $query->where('evaluator_id', $user->id);
        }

        $reviews = $query->orderByDesc('created_at')->paginate(20);

        return ReviewResource::collection($reviews);
    }

    /** Listar avaliacoes recebidas por um prestador (publico). */
    public function byProvider(Request $request, string $provider_id)
    {
        if (!FeatureFlag::isEnabled('ff_reviews')) {
            abort(403, 'Avaliacoes nao habilitadas.');
        }

        $reviews = Review::with('evaluator')
            ->where('service_provider_id', $provider_id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return ReviewResource::collection($reviews);
    }
}
