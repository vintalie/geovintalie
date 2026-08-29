<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['name', 'state_id', 'country_id'])]

class City extends Model
{
    use HasFactory;
    function state(){
        return $this->belongsTo(State::class);
    }
}
