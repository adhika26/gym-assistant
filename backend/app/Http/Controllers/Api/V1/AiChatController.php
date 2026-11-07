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

        if ($conversationId !== null) {
            $ownsConversation = $user->conversations()
                ->whereKey($conversationId)
                ->exists();

            abort_unless($ownsConversation, 404);
        }

        $agent = new FitnessCoach($contextBuilder->forUser($user));

        $response = $agent
            ->continueOrStart($conversationId, $user)
            ->prompt(
                $validated['message'],
                provider: config('ai.default'),
                model: config('ai.default_model'),
                timeout: 120,
            );

        return response()->json([
            'conversation_id' => $response->conversationId,
            'message' => (string) $response,
        ]);
    }
}