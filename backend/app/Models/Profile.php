<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'gender',
    'birth_date',
    'height_cm',
    'weight_kg',
    'activity_level',
    'experience_level',
    'goal',
    'target_weight_kg',
    'weekly_rate_kg',
    'unit_system',
    'timezone',
    'equipment',
    'dietary_preferences',
    'allergies',
    'onboarded_at',
])]
class Profile extends Model
{
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'height_cm' => 'integer',
            'weight_kg' => 'decimal:2',
            'target_weight_kg' => 'decimal:2',
            'weekly_rate_kg' => 'decimal:2',
            'equipment' => 'array',
            'dietary_preferences' => 'array',
            'allergies' => 'array',
            'onboarded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): HasOne
{
    return $this->hasOne(Profile::class);
}
}