<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['',''])]
class Property extends Model
{
    use HasFactory;
    public function address(){
        return $this->belongsTo('street');
    }
}
