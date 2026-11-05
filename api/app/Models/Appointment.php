<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    /**
     * Status possiveis de um agendamento (Escopo B4).
     */
    public const STATUS_PENDENTE = 'pendente';
    public const STATUS_CONFIRMADO = 'confirmado';
    public const STATUS_RECUSADO = 'recusado';
    public const STATUS_CONCLUIDO = 'concluido';
    public const STATUS_CANCELADO = 'cancelado';

    public const STATUSES = [
        self::STATUS_PENDENTE,
        self::STATUS_CONFIRMADO,
        self::STATUS_RECUSADO,
        self::STATUS_CONCLUIDO,
        self::STATUS_CANCELADO,
    ];

    protected $fillable = [
        'client_id',
        'provider_id',
        'date',
        'time',
        'status',
        'valor',
        'observacoes',
    ];

    protected $casts = [
        'date' => 'date',
        'valor' => 'decimal:2',
    ];

    /**
     * Cliente (usuario) que solicitou o agendamento.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Prestador de servico responsavel pelo agendamento.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'provider_id');
    }

    /**
     * Conversas de chat vinculadas a este agendamento.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(ChatConversation::class, 'appointment_id');
    }

    /**
     * Escopo: agendamentos de um cliente.
     */
    public function scopeForClient($query, int $userId)
    {
        return $query->where('client_id', $userId);
    }

    /**
     * Escopo: agendamentos de um prestador (atravessando o usuario).
     */
    public function scopeForProvider($query, int $userId)
    {
        return $query->whereHas('provider.user', function ($q) use ($userId) {
            $q->where('id', $userId);
        });
    }
}
