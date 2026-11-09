<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'problem_description',
        'suggested_category_id',
        'suggested_category_name',
        'confidence',
        'ai_provider',
        'raw_response',
    ];

    protected $casts = [
        'confidence' => 'decimal:2',
        'raw_response' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function suggestedCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'suggested_category_id');
    }
}
