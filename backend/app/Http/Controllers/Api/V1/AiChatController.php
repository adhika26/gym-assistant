<?php

namespace App\Http\Controllers\Api\V1;

use App\Ai\Agents\FitnessCoach;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ChatRequest;
use App\Services\Ai\FitnessContextBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()
                ->conversations()
                ->latest('updated_at')
                ->paginate(20)
        );
    }

    public function messages(Request $request, string $id): JsonResponse
    {
        $conversation = $request->user()
            ->conversations()
            ->findOrFail($id);

        $messages = $conversation->messages()
            ->oldest()
            ->get(['id', 'role', 'content', 'created_at']);

        return response()->json([
            'conversation_id' => $conversation->id,
            'messages' => $messages,
        ]);
    }

    public function chat(
        ChatRequest $request,
        FitnessContextBuilder $contextBuilder,
    ): JsonResponse {
        set_time_limit(120);

        $validated = $request->validated();
        $user = $request->user();
        $conversationId = $validated['conversation_id'] ?? null;

        $dailyLimit = (int) config('ai.limits.daily_messages');
        $usedToday = $user->aiUsageLogs()
            ->whereDate('created_at', today())
            ->count();

        if ($dailyLimit > 0 && $usedToday >= $dailyLimit) {
            return response()->json([
                'message' => 'Kuota harian AI sudah habis. Coba lagi besok.',
            ], 429);
        }

        if ($conversationId !== null) {
            $ownsConversation = $user->conversations()
                ->whereKey($conversationId)
                ->exists();

            abort_unless($ownsConversation, 404);
        }

        $agent = new FitnessCoach($contextBuilder->forUser($user));

        $startedAt = microtime(true);

        $response = $agent
            ->continueOrStart($conversationId, $user)
            ->prompt(
                $validated['message'],
                provider: config('ai.default'),
                model: config('ai.default_model'),
                timeout: 120,
            );

        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

        $user->aiUsageLogs()->create([
            'conversation_id' => $response->conversationId,
            'provider' => config('ai.default'),
            'model' => config('ai.default_model'),
            'input_tokens' => $response->usage->inputTokens,
            'output_tokens' => $response->usage->outputTokens,
            'total_tokens' => $response->usage->totalTokens(),
            'latency_ms' => $latencyMs,
        ]);

        return response()->json([
            'conversation_id' => $response->conversationId,
            'message' => (string) $response,
            'usage' => [
                'input_tokens' => $response->usage->inputTokens,
                'output_tokens' => $response->usage->outputTokens,
                'total_tokens' => $response->usage->totalTokens(),
            ],
            'quota' => [
                'used' => $usedToday + 1,
                'limit' => $dailyLimit,
            ],
        ]);
    }
}