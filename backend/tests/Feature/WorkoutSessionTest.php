<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\User;
use App\Models\WorkoutSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkoutSessionTest extends TestCase
{
    use RefreshDatabase;

    private function makeSession(User $user, array $overrides = []): WorkoutSession
    {
        return $user->workoutSessions()->create(array_merge([
            'performed_on' => '2026-11-07',
            'name' => 'Push Day',
        ], $overrides));
    }

    public function test_guest_cannot_access_workout_sessions(): void
    {
        $this->getJson('/api/v1/workout-sessions')->assertUnauthorized();
        $this->postJson('/api/v1/workout-sessions', [])->assertUnauthorized();
    }

    public function test_user_can_create_session_with_sets(): void
    {
        $user = User::factory()->create();
        $exercise = Exercise::factory()->create(['name' => 'Bench Press']);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/workout-sessions', [
            'performed_on' => '2026-11-07',
            'name' => 'Push Day',
            'duration_min' => 60,
            'perceived_exertion' => 8,
            'sets' => [
                [
                    'exercise_id' => $exercise->id,
                    'weight_kg' => 40,
                    'reps' => 10,
                    'rpe' => 8,
                ],
                [
                    'exercise_id' => $exercise->id,
                    'weight_kg' => 42.5,
                    'reps' => 8,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('session.name', 'Push Day')
            ->assertJsonCount(2, 'session.sets')
            ->assertJsonPath('session.sets.0.set_number', 1)
            ->assertJsonPath('session.sets.1.set_number', 2)
            ->assertJsonPath('session.sets.0.exercise_name', 'Bench Press');

        $this->assertDatabaseHas('workout_sessions', [
            'user_id' => $user->id,
            'name' => 'Push Day',
        ]);

        $this->assertDatabaseHas('workout_sets', [
            'workout_session_id' => $response->json('session.id'),
            'exercise_name' => 'Bench Press',
            'set_number' => 2,
            'reps' => 8,
        ]);
    }

    public function test_user_cannot_use_another_users_private_exercise(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $privateExercise = Exercise::factory()->create([
            'created_by' => $other->id,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/workout-sessions', [
            'performed_on' => '2026-11-07',
            'name' => 'Push Day',
            'sets' => [
                [
                    'exercise_id' => $privateExercise->id,
                    'reps' => 10,
                ],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('sets');
    }

    public function test_index_returns_only_own_sessions_with_date_filter(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $session = $this->makeSession($user, [
            'performed_on' => '2026-11-07',
        ]);
        $session->sets()->create([
            'exercise_id' => Exercise::factory()->create()->id,
            'exercise_name' => 'Bench Press',
            'set_number' => 1,
            'weight_kg' => 40,
            'reps' => 10,
        ]);
        $session->sets()->create([
            'exercise_id' => Exercise::factory()->create()->id,
            'exercise_name' => 'Bench Press',
            'set_number' => 2,
            'weight_kg' => 40,
            'reps' => 8,
        ]);

        $this->makeSession($user, [
            'performed_on' => '2026-10-01',
            'name' => 'Old Session',
        ]);

        $this->makeSession($other, [
            'performed_on' => '2026-11-07',
            'name' => 'Other Session',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/workout-sessions?from=2026-11-01&to=2026-11-30')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $session->id)
            ->assertJsonPath('data.0.sets_count', 2);
    }

    public function test_user_can_view_own_session_detail(): void
    {
        $user = User::factory()->create();
        $session = $this->makeSession($user);

        $exercise = Exercise::factory()->create(['name' => 'Barbell Squat']);
        $session->sets()->create([
            'exercise_id' => $exercise->id,
            'exercise_name' => $exercise->name,
            'set_number' => 1,
            'weight_kg' => 60,
            'reps' => 8,
        ]);

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/workout-sessions/{$session->id}")
            ->assertOk()
            ->assertJsonPath('session.sets.0.exercise.name', 'Barbell Squat')
            ->assertJsonPath('session.sets.0.weight_kg', 60);
    }

    public function test_user_cannot_view_or_delete_another_users_session(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $session = $this->makeSession($other);

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/workout-sessions/{$session->id}")
            ->assertNotFound();

        $this->deleteJson("/api/v1/workout-sessions/{$session->id}")
            ->assertNotFound();
    }

    public function test_user_can_delete_own_session_and_sets_are_removed(): void
    {
        $user = User::factory()->create();
        $session = $this->makeSession($user);

        $set = $session->sets()->create([
            'exercise_id' => Exercise::factory()->create()->id,
            'exercise_name' => 'Bench Press',
            'set_number' => 1,
            'weight_kg' => 40,
            'reps' => 10,
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/workout-sessions/{$session->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('workout_sessions', [
            'id' => $session->id,
        ]);

        $this->assertDatabaseMissing('workout_sets', [
            'id' => $set->id,
        ]);
    }

    public function test_workout_session_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/workout-sessions', [
            'name' => '',
            'sets' => [],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'performed_on',
                'name',
                'sets',
            ]);
    }
}