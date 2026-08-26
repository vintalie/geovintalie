<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'abbreviation', 'country', 'cities'])]
class State extends Model
{
    use HasFactory;


    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}
