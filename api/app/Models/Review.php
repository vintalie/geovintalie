<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /**
     * Tabela de avaliacoes mutuas cliente-prestador (Escopo B5).
     * Reutiliza service_evaluations, ja criada pela migracao do escopo, que possui
     * FKs para service_listings (service_listing_id), service_providers
     * (service_provider_id) e users (evaluator_id).
     */
    protected $table = 'service_evaluations';

    protected $fillable = [
        'service_listing_id',
        'service_provider_id',
        'evaluator_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public const RATING_MIN = 1;
    public const RATING_MAX = 5;

    /**
     * Servico avaliado.
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(ServiceListing::class, 'service_listing_id');
    }

    /**
     * Prestador avaliado.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'service_provider_id');
    }

    /**
     * Usuario (cliente) que avaliou.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }
}
