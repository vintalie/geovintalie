<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

    
#[fillable(['name','tipo','img_main','user_id' ]) ]
class Product extends Model
{
    use HasFactory;

    public function stock(){
        return $this->hasMany(Stock::class);
    }
    public function product(){
        return $this->hasMany(Property::class);
    }
}
