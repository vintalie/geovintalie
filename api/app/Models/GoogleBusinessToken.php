<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

#[Fillable([
    'user_id',
    'google_account_id',
    'google_account_name',
    'access_token_encrypted',
    'refresh_token_encrypted',
    'token_type',
    'expires_at',
    'scopes',
    'profile_data',
])]
#[Hidden([
    'access_token_encrypted',
    'refresh_token_encrypted',
])]
class GoogleBusinessToken extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function accessToken(): Attribute
    {
        return Attribute::make(
            get: fn () => ($value = $this->getAttribute('access_token_encrypted')) ? Crypt::decryptString($value) : null,
            set: fn (?string $value) => $this->setAttribute('access_token_encrypted', $value ? Crypt::encryptString($value) : null),
        );
    }

    protected function refreshToken(): Attribute
    {
        return Attribute::make(
            get: fn () => ($value = $this->getAttribute('refresh_token_encrypted')) ? Crypt::decryptString($value) : null,
            set: fn (?string $value) => $this->setAttribute('refresh_token_encrypted', $value ? Crypt::encryptString($value) : null),
        );
    }

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'profile_data' => 'array',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at ? $this->expires_at->isPast() : true;
    }

    /**
     * Retorna o access token de uso direto (descriptografado).
     * Uso interno do serviço; expor com cuidado.
     */
    public function getPlainAccessToken(): ?string
    {
        return $this->access_token;
    }

    public function getPlainRefreshToken(): ?string
    {
        return $this->refresh_token;
    }
}
