<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'read_at' => $this->read_at ? $this->read_at->toISOString() : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'sender' => $this->whenLoaded('sender', function () {
                return [
                    'id' => $this->sender->id,
                    'name' => $this->sender->name,
                    'email' => $this->sender->email,
                ];
            }),
            'is_mine' => $this->sender_id === auth()->id(),
            'has_attachment' => $this->hasAttachment(),
            'file_name' => $this->file_name,
            'file_mime' => $this->file_mime,
            'file_size' => $this->file_size,
            'file_url' => $this->file_path ? Storage::disk('public')->url($this->file_path) : null,
        ];
    }
}
