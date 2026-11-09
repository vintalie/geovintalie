<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable(['nome', 'descricao'])]
class Permission extends Model
{
    use HasFactory;

    public function userTypes()
    {
        return $this->belongsToMany(
            UserType::class,
            'user_type_permission',
            'permission_id',
            'user_type_id',
        );
    }
}
