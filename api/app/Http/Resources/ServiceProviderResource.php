<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'business_name' => $this->business_name,
            'cnpj_cpf' => $this->cnpj_cpf,
            'description' => $this->description,
            'avatar_url' => $this->avatar_url,
            'cover_url' => $this->cover_url,
            'average_rating' => (float) $this->average_rating,
            'total_reviews' => (int) $this->total_reviews,
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
        ];
    }
}
