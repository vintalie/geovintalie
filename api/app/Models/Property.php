<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable([
    'name',
    'n_property',
    'contact1_email',
    'number1',
    'user_id'
])]
class Property extends Model
{
    use HasFactory;
    

    public function address(){
        return $this->belongsTo(Street::class);
    }
    public function productStock(){
        return $this->hasMany(Product::class);
    }
}
