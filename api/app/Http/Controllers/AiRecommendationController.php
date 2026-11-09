<?php

namespace App\Http\Controllers;

use App\Models\AiRecommendation;
use App\Models\ServiceCategory;
use App\Services\AiRecommendationService;
use Illuminate\Http\Request;

class AiRecommendationController extends Controller
{
    public function store(Request $request, AiRecommendationService $aiService)
    {
        $validated = $request->validate([
            'problem_description' => 'required|string|min:10|max:2000',
        ]);

        $result = $aiService->suggest($validated['problem_description']);

        $category = $result['category'];
        $categoryPayload = $category ? [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
        ] : null;

        $recommendation = AiRecommendation::create([
            'user_id' => $request->user()?->id,
            'problem_description' => $validated['problem_description'],
            'suggested_category_id' => $category?->id,
            'suggested_category_name' => $result['suggested_category_name'],
            'confidence' => $result['confidence'],
            'ai_provider' => $result['ai_provider'],
            'raw_response' => [
                'reason' => $result['reason'],
            ],
        ]);

        return response()->json([
            'message' => 'Recomendacao gerada com sucesso.',
            'data' => array_merge([
                'id' => $recommendation->id,
                'problem_description' => $validated['problem_description'],
                'suggested_category' => $categoryPayload,
                'confidence' => $result['confidence'],
                'reason' => $result['reason'],
                'ai_provider' => $result['ai_provider'],
            ], $categoryPayload ? ['providers' => $this->providersPayload($result['providers'])] : ['providers' => []]),
        ], 201);
    }

    protected function providersPayload(\Illuminate\Database\Eloquent\Collection $providers): array
    {
        return $providers->map(function ($listing) {
            return [
                'listing_id' => $listing->id,
                'title' => $listing->title,
                'provider' => [
                    'id' => $listing->provider->id,
                    'business_name' => $listing->provider->business_name,
                    'description' => $listing->provider->description,
                    'average_rating' => $listing->provider->average_rating,
                    'total_reviews' => $listing->provider->total_reviews,
                ],
                'category_id' => $listing->category_id,
                'price' => $listing->price,
                'city' => $listing->city,
                'state' => $listing->state,
            ];
        })->values()->all();
    }
}
