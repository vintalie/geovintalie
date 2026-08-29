<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\City;
use App\Models\Country;


#[Fillable(['name', 'abbreviation', 'country_id','country' ,'cities'])]
class State extends Model
{
    use HasFactory;

    protected $with = ['country']; 
    public function cities() {
        return $this->hasMany(City::class);
    }
    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}
