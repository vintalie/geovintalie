<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = ['product_id','property_id','value','color','size','quantity'];
    protected $with = ['product','property'];
    public function product(){
        return $this->belongsTo(Product::class);
    }
    public function property(){
        return $this->belongsTo(Property::class);
    }
}
