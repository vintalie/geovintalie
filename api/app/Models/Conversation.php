<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    /**
     * Tabela de conversas do chat interno (Escopo B4).
     * Reutiliza chat_conversations, ja criada pela migracao do escopo, que possui
     * FKs para users (client_id), service_providers (provider_id) e
     * appointments (appointment_id).
     */
    protected $table = 'chat_conversations';

    protected $fillable = [
        'client_id',
        'provider_id',
        'appointment_id',
    ];

    protected $casts = [
        'appointment_id' => 'integer',
    ];

    /**
     * Cliente (usuario) da conversa.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Prestador de servico da conversa.
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
        return $this->hasMany(Message::class, 'conversation_id')->oldest('created_at');
    }

    /**
     * Escopo: conversas em que o usuario participa (cliente ou usuario do prestador).
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

    /**
     * Verifica se o usuario participa da conversa.
     */
    public function isParticipant($user): bool
    {
        $this->loadMissing('provider');

        return (int) $this->client_id === (int) $user->id
            || (int) optional($this->provider)->user?->id === (int) $user->id;
    }
}
