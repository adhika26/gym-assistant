<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreMeasurementRequest;
use App\Services\TargetCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MeasurementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $query = $request->user()->bodyMeasurements();

        if (! empty($validated['from'])) {
            $query->whereDate('measured_on', '>=', $validated['from']);
        }

        if (! empty($validated['to'])) {
            $query->whereDate('measured_on', '<=', $validated['to']);
        }

        return response()->json(
            $query->orderByDesc('measured_on')->paginate(50)->withQueryString()
        );
    }

    public function store(
        StoreMeasurementRequest $request,
        TargetCalculator $calculator,
    ): JsonResponse {
        $user = $request->user();
        $validated = $request->validated();

        $measurement = $user->bodyMeasurements()->updateOrCreate(
            ['measured_on' => $validated['measured_on']],
            $validated,
        );

        $latest = $user->bodyMeasurements()->orderByDesc('measured_on')->first();
        $profile = $user->profile;

        if ($profile && $latest && $latest->id === $measurement->id) {
            $targets = $calculator->calculate([
                'gender' => $profile->gender,
                'age' => $profile->birth_date->age,
                'height_cm' => $profile->height_cm,
                'weight_kg' => $measurement->weight_kg,
                'activity_level' => $profile->activity_level,
                'goal' => $profile->goal,
            ]);

            $profile->update([
                'weight_kg' => $measurement->weight_kg,
                'bmr' => $targets['bmr'],
                'tdee' => $targets['tdee'],
                'calorie_target' => $targets['calories'],
                'protein_g' => $targets['protein_g'],
                'fat_g' => $targets['fat_g'],
                'carbs_g' => $targets['carbs_g'],
                'water_ml' => $targets['water_ml'],
            ]);
        }

        return response()->json([
            'measurement' => $measurement,
            'profile' => $profile?->fresh(),
        ], 201);
    }

    public function destroy(Request $request, int $id): Response
    {
        $measurement = $request->user()
            ->bodyMeasurements()
            ->findOrFail($id);

        $measurement->delete();

        return response()->noContent();
    }
}