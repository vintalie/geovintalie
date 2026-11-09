<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandingPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'city',
        'state',
        'country',
        'neighborhood',
        'activity',
        'meta_title',
        'meta_description',
        'h1',
        'content',
        'structured_data',
        'published',
        'published_at',
    ];

    protected $casts = [
        'published' => 'boolean',
        'structured_data' => 'array',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
