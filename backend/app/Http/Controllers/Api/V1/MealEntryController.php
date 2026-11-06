<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreMealEntryRequest;
use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MealEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $date = $validated['date'] ?? now()->toDateString();

        $entries = $request->user()
            ->mealEntries()
            ->with('food')
            ->whereDate('consumed_on', $date)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'date' => $date,
            'entries' => $entries,
            'totals' => [
                'calories' => round($entries->sum('calories'), 2),
                'protein_g' => round($entries->sum('protein_g'), 2),
                'carbs_g' => round($entries->sum('carbs_g'), 2),
                'fat_g' => round($entries->sum('fat_g'), 2),
            ],
        ]);
    }

    public function store(StoreMealEntryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $food = Food::visibleTo($request->user()->id)
            ->findOrFail($validated['food_id']);

        $factor = $validated['quantity_g'] / 100;

        $entry = $request->user()->mealEntries()->create([
            'food_id' => $food->id,
            'consumed_on' => $validated['consumed_on'],
            'meal_type' => $validated['meal_type'],
            'quantity_g' => $validated['quantity_g'],
            'calories' => round($food->calories * $factor, 2),
            'protein_g' => round($food->protein_g * $factor, 2),
            'carbs_g' => round($food->carbs_g * $factor, 2),
            'fat_g' => round($food->fat_g * $factor, 2),
        ]);

        return response()->json([
            'entry' => $entry->load('food'),
        ], 201);
    }
}