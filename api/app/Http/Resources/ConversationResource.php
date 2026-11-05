<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'provider_id' => $this->provider_id,
            'appointment_id' => $this->appointment_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client->id,
                    'name' => $this->client->name,
                    'email' => $this->client->email,
                ];
            }),
            'provider' => $this->whenLoaded('provider.user', function () {
                return [
                    'id' => $this->provider->id,
                    'business_name' => $this->provider->business_name,
                    'user' => [
                        'id' => $this->provider->user->id,
                        'name' => $this->provider->user->name,
                        'email' => $this->provider->user->email,
                    ],
                ];
            }),
            'appointment' => $this->whenLoaded('appointment', function () {
                return new AppointmentResource($this->appointment);
            }),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'unread_count' => $this->whenLoaded('messages', function () {
                return (int) $this->messages->whereNull('read_at')->where('sender_id', '!=', auth()->id())->count();
            }),
        ];
    }
}
