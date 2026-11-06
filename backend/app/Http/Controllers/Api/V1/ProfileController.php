<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Services\TargetCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => $request->user()->profile,
        ]);
    }

    public function update(
        UpdateProfileRequest $request,
        TargetCalculator $calculator,
    ): JsonResponse {
        $validated = $request->validated();

        $targets = $calculator->calculate([
            'gender' => $validated['gender'],
            'age' => $request->date('birth_date')->age,
            'height_cm' => $validated['height_cm'],
            'weight_kg' => $validated['weight_kg'],
            'activity_level' => $validated['activity_level'],
            'goal' => $validated['goal'],
        ]);

        $profile = $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                ...$validated,
                'bmr' => $targets['bmr'],
                'tdee' => $targets['tdee'],
                'calorie_target' => $targets['calories'],
                'protein_g' => $targets['protein_g'],
                'fat_g' => $targets['fat_g'],
                'carbs_g' => $targets['carbs_g'],
                'water_ml' => $targets['water_ml'],
                'onboarded_at' => now(),
            ],
        );

        return response()->json([
            'profile' => $profile->fresh(),
        ]);
    }
}