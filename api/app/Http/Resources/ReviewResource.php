<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_listing_id' => $this->service_listing_id,
            'service_provider_id' => $this->service_provider_id,
            'evaluator_id' => $this->evaluator_id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'evaluator' => $this->whenLoaded('evaluator', function () {
                return [
                    'id' => $this->evaluator->id,
                    'name' => $this->evaluator->name,
                    'email' => $this->evaluator->email,
                ];
            }),
            'provider' => $this->whenLoaded('provider', function () {
                return [
                    'id' => $this->provider->id,
                    'business_name' => $this->provider->business_name,
                ];
            }),
        ];
    }
}
