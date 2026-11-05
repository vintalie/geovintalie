<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'enabled',
        'rollout_percentage',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'rollout_percentage' => 'integer',
    ];

    public static function isEnabled(string $name): bool
    {
        $flag = self::where('name', $name)->first();
        if (!$flag) {
            return false;
        }
        if (!$flag->enabled) {
            return false;
        }
        if ($flag->rollout_percentage >= 100) {
            return true;
        }
        if ($flag->rollout_percentage <= 0) {
            return false;
        }
        // Rollout percentual simples baseado no nome (deterministico)
        $hash = crc32($name) % 100;
        return $hash < $flag->rollout_percentage;
    }
}
