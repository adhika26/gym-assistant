<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExerciseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_exercises(): void
    {
        $this->getJson('/api/v1/exercises')->assertUnauthorized();
    }

    public function test_user_sees_global_and_own_exercises_only(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Exercise::factory()->create([
            'name' => 'Global Exercise',
            'created_by' => null,
        ]);
        Exercise::factory()->create([
            'name' => 'My Exercise',
            'created_by' => $user->id,
        ]);
        Exercise::factory()->create([
            'name' => 'Other Exercise',
            'created_by' => $other->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/exercises')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains('Global Exercise'));
        $this->assertTrue($names->contains('My Exercise'));
        $this->assertFalse($names->contains('Other Exercise'));
    }

    public function test_exercises_can_be_searched_by_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Exercise::factory()->create(['name' => 'Barbell Back Squat']);
        Exercise::factory()->create(['name' => 'Barbell Bench Press']);

        $this->getJson('/api/v1/exercises?q=squat')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Barbell Back Squat');
    }

    public function test_exercises_can_be_filtered_by_muscle_and_equipment(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Exercise::factory()->create([
            'name' => 'Back Squat',
            'primary_muscle' => 'quads',
            'equipment' => 'barbell',
        ]);
        Exercise::factory()->create([
            'name' => 'Dumbbell Curl',
            'primary_muscle' => 'biceps',
            'equipment' => 'dumbbell',
        ]);

        $this->getJson('/api/v1/exercises?muscle=quads&equipment=barbell')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Back Squat');
    }
}