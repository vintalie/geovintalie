<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class UserType extends Model
{
    public function user(){
        $this->hasMany(User::class);
    }
}
