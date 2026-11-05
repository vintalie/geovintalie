<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'provider_id',
        'appointment_id',
    ];

    /**
     * Cliente da conversa.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Prestador da conversa.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'provider_id');
    }

    /**
     * Agendamento ao qual a conversa esta vinculada (opcional).
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * Mensagens da conversa, ordenadas por criacao.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id')->oldest('created_at');
    }

    /**
     * Uma conversa so envolve o cliente autenticado ou o usuario do prestador.
     */
    public function scopeForParticipant($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('client_id', $userId)
              ->orWhereHas('provider.user', function ($q2) use ($userId) {
                  $q2->where('id', $userId);
              });
        });
    }
}
