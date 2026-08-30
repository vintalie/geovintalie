<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['name', 'state_id'])]

class City extends Model
{
    use HasFactory;
    public function state(){
        return $this->belongsTo(State::class);
    }
    public function neighborhood(){
        return $this->hasMany(Neighborhood::class);
    }
}
