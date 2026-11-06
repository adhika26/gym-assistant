<?php

namespace Database\Factories;

use App\Models\Food;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Food>
 */
class FoodFactory extends Factory
{
    protected $model = Food::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'brand' => null,
            'barcode' => null,
            'category' => 'protein',
            'calories' => fake()->randomFloat(2, 50, 500),
            'protein_g' => fake()->randomFloat(2, 0, 40),
            'carbs_g' => fake()->randomFloat(2, 0, 60),
            'fat_g' => fake()->randomFloat(2, 0, 30),
            'fiber_g' => null,
            'sugar_g' => null,
            'sodium_mg' => null,
            'source' => 'seed',
            'is_verified' => true,
            'created_by' => null,
        ];
    }
}