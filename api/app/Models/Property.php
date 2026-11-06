<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'complement',
    'main_image',
    'cover_image',
    'n_property',
    'contact1_email',
    'contact2_email',
    'additional_info',
    'content_html',
    'number1',
    'number2',
    'number3',
    'street_id',
    'user_id'
])]
class Property extends Model
{
    use HasFactory;


    public function address() {
        return $this->belongsTo(Street::class);
    }

    /** Rua da propriedade (alias de address). */
    public function street(): BelongsTo {
        return $this->belongsTo(Street::class);
    }

    /** Usuario (proprietario/anunciante) da propriedade. */
    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function productStock() {
        return $this->hasMany(Product::class);
    }
}
