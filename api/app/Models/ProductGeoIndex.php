<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductGeoIndex extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'property_id',
        'latitude',
        'longitude',
        'stock_quantity',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'stock_quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
