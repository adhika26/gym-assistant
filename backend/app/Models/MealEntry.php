<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'food_id', 'consumed_on', 'meal_type', 'quantity_g',
    'calories', 'protein_g', 'carbs_g', 'fat_g',
])]
class MealEntry extends Model
{
    protected function casts(): array
    {
        return [
            'consumed_on' => 'date',
            'quantity_g' => 'float',
            'calories' => 'float',
            'protein_g' => 'float',
            'carbs_g' => 'float',
            'fat_g' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function food(): BelongsTo
    {
        return $this->belongsTo(Food::class);
    }
}