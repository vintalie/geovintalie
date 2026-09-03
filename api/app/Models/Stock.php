<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $with = ['products'];
    public function property(){
        $this->belongsTo(Property::class);
    }
    public function products(){
        $this->belongsToMany(Product::class);
    }
}
