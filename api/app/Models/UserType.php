<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['nome'])]
class UserType extends Model
{
    use HasFactory;
    public function user(){
        return $this->hasMany(User::class);
    }
}
