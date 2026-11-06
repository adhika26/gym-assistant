<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'slug', 'primary_muscle', 'secondary_muscles',
    'equipment', 'difficulty', 'is_compound', 'instructions',
    'source', 'created_by',
])]
class Exercise extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'secondary_muscles' => 'array',
            'is_compound' => 'boolean',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function workoutSets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class);
    }

    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(function (Builder $query) use ($userId) {
            $query->whereNull('created_by')->orWhere('created_by', $userId);
        });
    }
}