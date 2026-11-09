<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'category',
    'signal_type',
    'weight',
    'property_id',
    'city',
    'state',
    'latitude',
    'longitude',
    'recorded_at',
])]
class ReportDemandSignal extends Model
{
    use HasFactory;

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
