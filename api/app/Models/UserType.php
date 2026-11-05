<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserType extends Model
{
    use HasFactory;
    public function user(){
        return $this->hasMany(User::class);
    }
}
