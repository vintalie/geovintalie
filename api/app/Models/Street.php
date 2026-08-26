<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'neighborhood_id'])]
class Street extends Model
{
    use HasFactory;

    public function neighborhood()
    {
        return $this->belongsTo(Neighborhood::class);
    }
}
