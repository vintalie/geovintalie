<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'google_account_id', 'access_token', 'refresh_token', 'token_type', 'expires_at', 'scope', 'last_synced_at'])]
#[Hidden(['access_token', 'refresh_token'])]
class GoogleBusinessConnection extends Model
{
    protected $casts = [
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
        'expires_at' => 'datetime',
        'last_synced_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tokenValido(): bool
    {
        return $this->access_token && $this->expires_at && $this->expires_at->isFuture();
    }

    public function expiradoOuProximoDeExpirar(): bool
    {
        return !$this->expires_at || $this->expires_at->subMinutes(5)->isPast();
    }
}
