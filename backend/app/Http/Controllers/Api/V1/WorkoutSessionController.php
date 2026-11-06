<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreWorkoutSessionRequest;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkoutSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $query = $request->user()
            ->workoutSessions()
            ->withCount('sets');

        if (! empty($validated['from'])) {
            $query->whereDate('performed_on', '>=', $validated['from']);
        }

        if (! empty($validated['to'])) {
            $query->whereDate('performed_on', '<=', $validated['to']);
        }

        return response()->json(
            $query
                ->orderByDesc('performed_on')
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString()
        );
    }

    public function store(StoreWorkoutSessionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $exerciseIds = collect($validated['sets'])
            ->pluck('exercise_id')
            ->unique();

        $exercises = Exercise::visibleTo($user->id)
            ->whereIn('id', $exerciseIds)
            ->get()
            ->keyBy('id');

        if ($exercises->count() !== $exerciseIds->count()) {
            throw ValidationException::withMessages([
                'sets' => 'Ada exercise yang tidak valid atau bukan milik Anda.',
            ]);
        }

        $session = DB::transaction(function () use ($user, $validated, $exercises) {
            $session = $user->workoutSessions()->create([
                'performed_on' => $validated['performed_on'],
                'name' => $validated['name'],
                'duration_min' => $validated['duration_min'] ?? null,
                'perceived_exertion' => $validated['perceived_exertion'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $counters = [];

            foreach ($validated['sets'] as $set) {
                $exerciseId = $set['exercise_id'];

                $counters[$exerciseId] = ($counters[$exerciseId] ?? 0) + 1;

                $session->sets()->create([
                    'exercise_id' => $exerciseId,
                    'exercise_name' => $exercises[$exerciseId]->name,
                    'set_number' => $counters[$exerciseId],
                    'weight_kg' => $set['weight_kg'] ?? null,
                    'reps' => $set['reps'],
                    'rpe' => $set['rpe'] ?? null,
                    'is_warmup' => $set['is_warmup'] ?? false,
                    'notes' => $set['notes'] ?? null,
                ]);
            }

            return $session;
        });

        return response()->json([
            'session' => $session->load('sets.exercise'),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $session = $request->user()
            ->workoutSessions()
            ->with('sets.exercise')
            ->findOrFail($id);

        return response()->json([
            'session' => $session,
        ]);
    }

    public function destroy(Request $request, int $id): Response
    {
        $session = $request->user()
            ->workoutSessions()
            ->findOrFail($id);

        $session->delete();

        return response()->noContent();
    }
}