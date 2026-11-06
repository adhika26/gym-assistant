<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'exercise_id', 'exercise_name', 'set_number',
    'weight_kg', 'reps', 'rpe', 'is_warmup', 'notes',
])]
class WorkoutSet extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'weight_kg' => 'float',
            'reps' => 'integer',
            'rpe' => 'float',
            'is_warmup' => 'boolean',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'workout_session_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}