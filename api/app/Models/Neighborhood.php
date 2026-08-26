<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['name', 'city_id'])]
class Neighborhood extends Model
{
    use HasFactory;

    public function city()
    {
        return $this->belongsTo(City::class);
    }
    public function streets(){
        return $this->hasMany(Street::class);
    }
}
