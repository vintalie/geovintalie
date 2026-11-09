<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceListingResource;
use App\Models\ServiceListing;
use Illuminate\Http\Request;
use Illuminate\Support\Number;

class ServiceSearchController extends Controller
{
    /**
     * Busca de servicos com filtros (Escopo B2).
     *
     * Filtros suportados:
     *  - category_id: ID da categoria
     *  - city / state: localidade (busca parcial, case insensitive)
     *  - min_rating / max_rating: avaliacao media (0 a 5 estrelas)
     *  - min_price / max_price: preco
     *  - q: busca por texto (titulo/descricao)
     *  - limit: tamanho da pagina (1 a 100, padrao 20)
     *
     * Endpoint publico (sem autenticacao), alinhado com o contrato OpenAPI v2
     * (/api/v2/service-search, tag service-search).
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|integer|exists:service_categories,id',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'min_rating' => 'nullable|numeric|between:0,5',
            'max_rating' => 'nullable|numeric|between:0,5',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'q' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = ServiceListing::with(['provider.user', 'category'])
            ->where('is_active', true);

        $request->whenFilled('category_id', fn ($value) =>
            $query->where('category_id', $value));

        $request->whenFilled('city', fn ($value) =>
            $query->where('city', 'like', '%' . $value . '%'));

        $request->whenFilled('state', fn ($value) =>
            $query->where('state', 'like', '%' . $value . '%'));

        $request->whenFilled('min_rating', fn ($value) =>
            $query->where('average_rating', '>=', $value));

        $request->whenFilled('max_rating', fn ($value) =>
            $query->where('average_rating', '<=', $value));

        $request->whenFilled('min_price', fn ($value) =>
            $query->where('price', '>=', $value));

        $request->whenFilled('max_price', fn ($value) =>
            $query->where('price', '<=', $value));

        $request->whenFilled('q', fn ($value) =>
            $query->where(function ($q) use ($value) {
                $q->where('title', 'like', '%' . $value . '%')
                  ->orWhere('description', 'like', '%' . $value . '%');
            }));

        $limit = $request->integer('limit') ?? 20;
        $results = $query
            ->orderByDesc('average_rating')
            ->orderByDesc('created_at')
            ->paginate($limit);

        return response()->json([
            'data' => $results->getCollection()
                ->map(fn ($listing) => (new ServiceListingResource($listing))->resolve())
                ->all(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'from' => $results->firstItem(),
                'to' => $results->lastItem(),
            ],
        ]);
    }
}
