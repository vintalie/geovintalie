<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;


#[Fillable(['name'])]
class Country extends Model
{
    use HasFactory;
    public function states(){
        return $this->hasMany(State::class);
    }
}
