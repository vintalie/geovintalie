<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ServiceEvaluation;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'cnpj_cpf',
        'description',
        'avatar_url',
        'cover_url',
        'average_rating',
        'total_reviews',
        'is_active',
    ];

    protected $casts = [
        'average_rating' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(ServiceListing::class, 'provider_id');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(ServiceEvaluation::class, 'service_provider_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'provider_id');
    }

    public function recalculateRating(): void
    {
        $average = $this->evaluations()->avg('rating');
        $this->average_rating = $average ? (float) round($average, 2) : 0.00;
        $this->total_reviews = (int) $this->evaluations()->count();
        $this->save();
    }
}
