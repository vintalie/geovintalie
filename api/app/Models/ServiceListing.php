<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'category_id',
        'title',
        'description',
        'price',
        'price_type',
        'address',
        'city',
        'state',
        'zip_code',
        'latitude',
        'longitude',
        'is_active',
        'average_rating',
        'total_reviews',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'average_rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'provider_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(ServiceEvaluation::class, 'service_listing_id');
    }

    public function recalculateRating(): void
    {
        // Somente avaliacoes recebidas pelo servico (direcao direta: cliente avalia prestador).
        // Avaliacoes em que o prestador e o avaliador (direcao inversa) nao compoem a media do servico.
        $evaluations = $this->evaluations()->whereNull('service_client_id');
        $average = $evaluations->avg('rating');

        $this->average_rating = $average ? (float) round($average, 2) : 0.00;
        $this->total_reviews = (int) $evaluations->count();

        $this->save();
    }
}
