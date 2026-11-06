<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'measured_on',
    'weight_kg',
    'body_fat_pct',
    'waist_cm',
    'chest_cm',
    'arm_cm',
    'thigh_cm',
    'hip_cm',
    'notes',
])]
class BodyMeasurement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'measured_on' => 'date:Y-m-d',
            'weight_kg' => 'float',
            'body_fat_pct' => 'float',
            'waist_cm' => 'float',
            'chest_cm' => 'float',
            'arm_cm' => 'float',
            'thigh_cm' => 'float',
            'hip_cm' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}