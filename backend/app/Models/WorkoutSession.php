<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'performed_on', 'name', 'duration_min', 'perceived_exertion', 'notes',
])]
class WorkoutSession extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'performed_on' => 'date:Y-m-d',
            'duration_min' => 'integer',
            'perceived_exertion' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class)->orderBy('set_number');
    }
}