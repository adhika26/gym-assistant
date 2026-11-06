<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;

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