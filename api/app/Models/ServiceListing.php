<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
