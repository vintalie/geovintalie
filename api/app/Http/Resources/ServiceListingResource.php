<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider_id' => $this->provider_id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => (float) $this->price,
            'price_type' => $this->price_type,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'latitude' => $this->latitude ? (float) $this->latitude : null,
            'longitude' => $this->longitude ? (float) $this->longitude : null,
            'is_active' => (bool) $this->is_active,
            'average_rating' => (float) $this->average_rating,
            'total_reviews' => (int) $this->total_reviews,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'provider' => $this->whenLoaded('provider', function () {
                return [
                    'id' => $this->provider->id,
                    'business_name' => $this->provider->business_name,
                    'user' => $this->provider->user ? [
                        'id' => $this->provider->user->id,
                        'name' => $this->provider->user->name,
                    ] : null,
                ];
            }),
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ];
            }),
        ];
    }
}
