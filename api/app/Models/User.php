<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\ConfigsInterface;
use App\Models\Appointment;
use App\Models\Review;
use App\Models\ServiceEvaluation;
use App\Models\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\HasMany;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;





#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use Notifiable, HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $attributes = [
        'tipo_id' => 1, // valor padrão que existe na tabela user_types
    ];

    public function UserType() {
        return $this->belongsTo(UserType::class, 'tipo_id');
    }

    public function products(){
        return $this->hasMany(Product::class, 'user_id');
    }
    public function getUserConfigs(){
        return $this->hasOne(ConfigsInterface::class);
    }
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */

    public function serviceProvider()
    {
        return $this->hasOne(ServiceProvider::class, 'user_id');
    }

    public function evaluationsGiven()
    {
        return $this->hasMany(ServiceEvaluation::class, 'evaluator_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'evaluator_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
}
