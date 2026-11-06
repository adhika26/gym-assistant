<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'brand', 'barcode', 'category',
    'calories', 'protein_g', 'carbs_g', 'fat_g',
    'fiber_g', 'sugar_g', 'sodium_mg',
    'source', 'is_verified', 'created_by',
])]
class Food extends Model
{
    protected $table = 'foods';
    protected function casts(): array
    {
        return [
            'calories' => 'float',
            'protein_g' => 'float',
            'carbs_g' => 'float',
            'fat_g' => 'float',
            'fiber_g' => 'float',
            'sugar_g' => 'float',
            'sodium_mg' => 'float',
            'is_verified' => 'boolean',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function mealEntries(): HasMany
    {
        return $this->hasMany(MealEntry::class);
    }

    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(function (Builder $query) use ($userId) {
            $query->whereNull('created_by')->orWhere('created_by', $userId);
        });
    }
}