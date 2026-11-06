<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            ['name' => 'Barbell Back Squat', 'primary_muscle' => 'quads', 'secondary_muscles' => ['glutes', 'hamstrings', 'core'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Barbell Deadlift', 'primary_muscle' => 'hamstrings', 'secondary_muscles' => ['glutes', 'back', 'core'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Barbell Bench Press', 'primary_muscle' => 'chest', 'secondary_muscles' => ['triceps', 'shoulders'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Overhead Press', 'primary_muscle' => 'shoulders', 'secondary_muscles' => ['triceps', 'core'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Barbell Row', 'primary_muscle' => 'back', 'secondary_muscles' => ['biceps', 'rear delts'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Pull Up', 'primary_muscle' => 'back', 'secondary_muscles' => ['biceps', 'core'], 'equipment' => 'bodyweight', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Lat Pulldown', 'primary_muscle' => 'back', 'secondary_muscles' => ['biceps'], 'equipment' => 'cable', 'difficulty' => 'beginner', 'is_compound' => true],
            ['name' => 'Seated Cable Row', 'primary_muscle' => 'back', 'secondary_muscles' => ['biceps'], 'equipment' => 'cable', 'difficulty' => 'beginner', 'is_compound' => true],
            ['name' => 'Dumbbell Curl', 'primary_muscle' => 'biceps', 'secondary_muscles' => ['forearms'], 'equipment' => 'dumbbell', 'difficulty' => 'beginner', 'is_compound' => false],
            ['name' => 'Triceps Pushdown', 'primary_muscle' => 'triceps', 'secondary_muscles' => [], 'equipment' => 'cable', 'difficulty' => 'beginner', 'is_compound' => false],
            ['name' => 'Leg Press', 'primary_muscle' => 'quads', 'secondary_muscles' => ['glutes', 'hamstrings'], 'equipment' => 'machine', 'difficulty' => 'beginner', 'is_compound' => true],
            ['name' => 'Romanian Deadlift', 'primary_muscle' => 'hamstrings', 'secondary_muscles' => ['glutes', 'back'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Walking Lunge', 'primary_muscle' => 'quads', 'secondary_muscles' => ['glutes', 'hamstrings'], 'equipment' => 'dumbbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Plank', 'primary_muscle' => 'core', 'secondary_muscles' => ['shoulders'], 'equipment' => 'bodyweight', 'difficulty' => 'beginner', 'is_compound' => false],
            ['name' => 'Hanging Leg Raise', 'primary_muscle' => 'core', 'secondary_muscles' => ['hip flexors'], 'equipment' => 'bodyweight', 'difficulty' => 'advanced', 'is_compound' => false],
            ['name' => 'Push Up', 'primary_muscle' => 'chest', 'secondary_muscles' => ['triceps', 'shoulders', 'core'], 'equipment' => 'bodyweight', 'difficulty' => 'beginner', 'is_compound' => true],
            ['name' => 'Dumbbell Shoulder Press', 'primary_muscle' => 'shoulders', 'secondary_muscles' => ['triceps'], 'equipment' => 'dumbbell', 'difficulty' => 'beginner', 'is_compound' => true],
            ['name' => 'Face Pull', 'primary_muscle' => 'rear delts', 'secondary_muscles' => ['upper back'], 'equipment' => 'cable', 'difficulty' => 'beginner', 'is_compound' => false],
            ['name' => 'Standing Calf Raise', 'primary_muscle' => 'calves', 'secondary_muscles' => [], 'equipment' => 'machine', 'difficulty' => 'beginner', 'is_compound' => false],
            ['name' => 'Barbell Hip Thrust', 'primary_muscle' => 'glutes', 'secondary_muscles' => ['hamstrings'], 'equipment' => 'barbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Incline Dumbbell Press', 'primary_muscle' => 'chest', 'secondary_muscles' => ['shoulders', 'triceps'], 'equipment' => 'dumbbell', 'difficulty' => 'intermediate', 'is_compound' => true],
            ['name' => 'Lateral Raise', 'primary_muscle' => 'shoulders', 'secondary_muscles' => [], 'equipment' => 'dumbbell', 'difficulty' => 'beginner', 'is_compound' => false],
        ];

        foreach ($exercises as $exercise) {
            Exercise::updateOrCreate(
                ['slug' => Str::slug($exercise['name'])],
                [
                    ...$exercise,
                    'source' => 'seed',
                    'created_by' => null,
                ],
            );
        }
    }
}