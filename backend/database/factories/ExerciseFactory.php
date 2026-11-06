<?php

namespace Database\Factories;

use App\Models\Exercise;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Exercise>
 */
class ExerciseFactory extends Factory
{
    protected $model = Exercise::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'primary_muscle' => 'chest',
            'secondary_muscles' => ['triceps'],
            'equipment' => 'barbell',
            'difficulty' => 'beginner',
            'is_compound' => true,
            'instructions' => null,
            'source' => 'seed',
            'created_by' => null,
        ];
    }
}