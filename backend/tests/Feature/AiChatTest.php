<?php

namespace Tests\Feature;

use App\Ai\Agents\FitnessCoach;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_ai_endpoints(): void
    {
        $this->getJson('/api/v1/ai/conversations')->assertUnauthorized();
        $this->postJson('/api/v1/ai/chat', [])->assertUnauthorized();
    }

    public function test_user_can_chat_and_conversation_is_stored(): void
    {
        FitnessCoach::fake(['Halo! Sisa kalori Anda cukup untuk makan siang.']);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Apa saran makan siang saya?',
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'message',
                'Halo! Sisa kalori Anda cukup untuk makan siang.',
            )
            ->assertJsonStructure(['conversation_id', 'message']);

        $this->assertDatabaseCount('agent_conversations', 1);
        $this->assertDatabaseCount('agent_conversation_messages', 2);
    }

    public function test_user_can_view_own_conversation_messages(): void
    {
        FitnessCoach::fake(['Balasan pertama.']);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $chat = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Halo',
        ])->assertOk();

        $conversationId = $chat->json('conversation_id');

        $this->getJson("/api/v1/ai/conversations/{$conversationId}/messages")
            ->assertOk()
            ->assertJsonCount(2, 'messages')
            ->assertJsonPath('messages.0.role', 'user')
            ->assertJsonPath('messages.1.role', 'assistant');
    }

    public function test_user_cannot_access_another_users_conversation(): void
    {
        FitnessCoach::fake(['Balasan.']);

        $other = User::factory()->create();
        Sanctum::actingAs($other);

        $otherConversationId = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Halo',
        ])->json('conversation_id');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson("/api/v1/ai/conversations/{$otherConversationId}/messages")
            ->assertNotFound();

        $this->postJson('/api/v1/ai/chat', [
            'message' => 'Halo',
            'conversation_id' => $otherConversationId,
        ])->assertNotFound();
    }

    public function test_conversation_list_only_contains_own_conversations(): void
    {
        FitnessCoach::fake(['Balasan.']);

        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);
        $ownId = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Pesan user',
        ])->json('conversation_id');

        Sanctum::actingAs($other);
        $this->postJson('/api/v1/ai/chat', [
            'message' => 'Pesan lain',
        ])->assertOk();

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/ai/conversations')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownId);
    }

    public function test_chat_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/ai/chat', [
            'message' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('message');
    }

    public function test_usage_is_logged_after_chat(): void
{
    FitnessCoach::fake(['Balasan.']);

    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/ai/chat', [
        'message' => 'Halo',
    ])->assertOk();

    $this->assertDatabaseHas('ai_usage_logs', [
        'user_id' => $user->id,
        'provider' => config('ai.default'),
        'model' => config('ai.default_model'),
    ]);
}

public function test_daily_quota_is_enforced(): void
{
    FitnessCoach::fake(['Balasan.']);

    config(['ai.limits.daily_messages' => 1]);

    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/ai/chat', [
        'message' => 'Halo',
    ])->assertOk();

    $this->postJson('/api/v1/ai/chat', [
        'message' => 'Halo lagi',
    ])->assertStatus(429);
}
}