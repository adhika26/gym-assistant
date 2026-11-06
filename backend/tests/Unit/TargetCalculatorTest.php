<?php

namespace Tests\Unit;

use App\Services\TargetCalculator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class TargetCalculatorTest extends TestCase
{
    public function test_it_calculates_cut_targets_for_male(): void
    {
        $result = (new TargetCalculator())->calculate([
            'gender' => 'male',
            'age' => 30,
            'height_cm' => 180,
            'weight_kg' => 80,
            'activity_level' => 'moderate',
            'goal' => 'cut',
        ]);

        $this->assertSame(1780, $result['bmr']);
        $this->assertSame(2759, $result['tdee']);
        $this->assertSame(2210, $result['calories']);
        $this->assertSame(160, $result['protein_g']);
        $this->assertSame(61, $result['fat_g']);
        $this->assertSame(255, $result['carbs_g']);
        $this->assertSame(2800, $result['water_ml']);
    }

    public function test_it_never_goes_below_minimum_calories(): void
    {
        $result = (new TargetCalculator())->calculate([
            'gender' => 'female',
            'age' => 40,
            'height_cm' => 150,
            'weight_kg' => 45,
            'activity_level' => 'sedentary',
            'goal' => 'cut',
        ]);

        $this->assertSame(1200, $result['calories']);
    }

    public function test_it_rejects_invalid_goal(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new TargetCalculator())->calculate([
            'gender' => 'male',
            'age' => 30,
            'height_cm' => 180,
            'weight_kg' => 80,
            'activity_level' => 'moderate',
            'goal' => 'bulking-extreme',
        ]);
    }
}