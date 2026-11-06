<?php

namespace App\Services;

use InvalidArgumentException;

class TargetCalculator
{
    private const ACTIVITY_FACTORS = [
        'sedentary' => 1.2,
        'light' => 1.375,
        'moderate' => 1.55,
        'very_active' => 1.725,
        'extra_active' => 1.9,
    ];

    private const GOAL_ADJUSTMENTS = [
        'cut' => 0.80,
        'maintain' => 1.0,
        'bulk' => 1.10,
    ];

    private const PROTEIN_FACTORS = [
        'cut' => 2.0,
        'maintain' => 1.6,
        'bulk' => 1.8,
    ];

    public function calculate(array $input): array
    {
        $gender = $input['gender'];
        $activity = $input['activity_level'];
        $goal = $input['goal'];

        if (! in_array($gender, ['male', 'female'], true)) {
            throw new InvalidArgumentException("Gender tidak valid: {$gender}");
        }

        if (! isset(self::ACTIVITY_FACTORS[$activity])) {
            throw new InvalidArgumentException("Activity level tidak valid: {$activity}");
        }

        if (! isset(self::GOAL_ADJUSTMENTS[$goal])) {
            throw new InvalidArgumentException("Goal tidak valid: {$goal}");
        }

        $weight = (float) $input['weight_kg'];
        $height = (float) $input['height_cm'];
        $age = (int) $input['age'];

        $bmr = 10 * $weight + 6.25 * $height - 5 * $age + ($gender === 'male' ? 5 : -161);
        $tdee = $bmr * self::ACTIVITY_FACTORS[$activity];

        $calories = (int) (round(($tdee * self::GOAL_ADJUSTMENTS[$goal]) / 10) * 10);

        $minimumCalories = $gender === 'male' ? 1500 : 1200;
        $calories = max($calories, $minimumCalories, (int) round($bmr));

        $protein = (int) round($weight * self::PROTEIN_FACTORS[$goal]);
        $fat = (int) round(($calories * 0.25) / 9);
        $carbs = max(0, (int) round(($calories - ($protein * 4) - ($fat * 9)) / 4));

        return [
            'bmr' => (int) round($bmr),
            'tdee' => (int) round($tdee),
            'calories' => $calories,
            'protein_g' => $protein,
            'fat_g' => $fat,
            'carbs_g' => $carbs,
            'water_ml' => (int) round($weight * 35),
        ];
    }
}