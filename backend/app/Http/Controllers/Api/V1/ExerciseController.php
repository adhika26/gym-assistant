<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'muscle' => ['nullable', 'string', 'max:50'],
            'equipment' => ['nullable', 'string', 'max:50'],
        ]);

        $query = Exercise::query()->visibleTo($request->user()->id);

        if (! empty($validated['q'])) {
            $like = '%' . mb_strtolower($validated['q']) . '%';

            $query->whereRaw('LOWER(name) LIKE ?', [$like]);
        }

        if (! empty($validated['muscle'])) {
            $query->where('primary_muscle', $validated['muscle']);
        }

        if (! empty($validated['equipment'])) {
            $query->where('equipment', $validated['equipment']);
        }

        return response()->json(
            $query->orderBy('name')->paginate(50)->withQueryString()
        );
    }
}