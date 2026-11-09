<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreFoodRequest;
use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));

        $query = Food::query()->visibleTo($request->user()->id);

        if ($term !== '') {
            $like = '%' . mb_strtolower($term) . '%';

            $query->where(function ($query) use ($like) {
                $query->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(brand) LIKE ?', [$like]);
            });
        }

        return response()->json(
            $query->orderBy('name')->paginate(20)->withQueryString()
        );
    }

    public function store(StoreFoodRequest $request): JsonResponse
    {
        $food = Food::create([
            ...$request->validated(),
            'source' => 'user',
            'is_verified' => false,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'food' => $food,
        ], 201);
    }
}