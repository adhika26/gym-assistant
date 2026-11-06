<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FoodController;
use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\MealEntryController;
use App\Http\Controllers\Api\V1\ExerciseController;
use App\Http\Controllers\Api\V1\WorkoutSessionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/v1/ping', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'gym-assistant',
    ]);
});

Route::post('/v1/auth/register', [AuthController::class, 'register']);
Route::post('/v1/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/v1/auth/me', [AuthController::class, 'me']);
    Route::post('/v1/auth/logout', [AuthController::class, 'logout']);

    Route::get('/v1/profile', [ProfileController::class, 'show']);
    Route::put('/v1/profile', [ProfileController::class, 'update']);

    Route::get('/v1/foods', [FoodController::class, 'index']);
    Route::post('/v1/foods', [FoodController::class, 'store']);

    Route::get('/v1/meal-entries', [MealEntryController::class, 'index']);
Route::post('/v1/meal-entries', [MealEntryController::class, 'store']);
Route::put('/v1/meal-entries/{id}', [MealEntryController::class, 'update']);
Route::delete('/v1/meal-entries/{id}', [MealEntryController::class, 'destroy']);

Route::get('/v1/exercises', [ExerciseController::class, 'index']);

Route::get('/v1/workout-sessions', [WorkoutSessionController::class, 'index']);
Route::post('/v1/workout-sessions', [WorkoutSessionController::class, 'store']);
Route::get('/v1/workout-sessions/{id}', [WorkoutSessionController::class, 'show']);
Route::delete('/v1/workout-sessions/{id}', [WorkoutSessionController::class, 'destroy']);
});