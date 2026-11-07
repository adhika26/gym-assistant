<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MeasurementTest extends TestCase
{
    use RefreshDatabase;

    private function createProfile(User $user): void
    {
        $user->profile()->create([
            'gender' => 'male',
            'birth_date' => now()->subYears(30)->toDateString(),
            'height_cm' => 180,
            'weight_kg' => 80,
            'activity_level' => 'moderate',
            'experience_level' => 'beginner',
            'goal' => 'cut',
            'bmr' => 1780,
            'tdee' => 2759,
            'calorie_target' => 2210,
            'protein_g' => 160,
            'fat_g' => 61,
            'carbs_g' => 255,
            'water_ml' => 2800,
        ]);
    }

    public function test_guest_cannot_access_measurements(): void
    {
        $this->getJson('/api/v1/measurements')->assertUnauthorized();
        $this->postJson('/api/v1/measurements', [])->assertUnauthorized();
    }

    public function test_user_can_create_measurement_and_targets_are_recalculated(): void
    {
        $user = User::factory()->create();
        $this->createProfile($user);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/measurements', [
            'measured_on' => now()->toDateString(),
            'weight_kg' => 78,
            'body_fat_pct' => 18.5,
            'waist_cm' => 80,
        ])
            ->assertCreated()
            ->assertJsonPath('measurement.weight_kg', 78);

        $this->assertDatabaseHas('body_measurements', [
            'user_id' => $user->id,
            'weight_kg' => 78,
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'weight_kg' => 78,
            'calorie_target' => 2180,
        ]);
    }

    public function test_same_date_updates_instead_of_creating_duplicate(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'measured_on' => now()->toDateString(),
            'weight_kg' => 80,
        ];

        $this->postJson('/api/v1/measurements', $payload)->assertCreated();
        $this->postJson('/api/v1/measurements', [
            ...$payload,
            'weight_kg' => 79,
        ])->assertCreated();

        $this->assertDatabaseCount('body_measurements', 1);
        $this->assertDatabaseHas('body_measurements', [
            'user_id' => $user->id,
            'weight_kg' => 79,
        ]);
    }

    public function test_index_returns_only_own_measurements_with_date_filter(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $user->bodyMeasurements()->create([
            'measured_on' => now()->subDays(10)->toDateString(),
            'weight_kg' => 81,
        ]);

        $recent = $user->bodyMeasurements()->create([
            'measured_on' => now()->toDateString(),
            'weight_kg' => 80,
        ]);

        $other->bodyMeasurements()->create([
            'measured_on' => now()->toDateString(),
            'weight_kg' => 70,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/measurements?from=' . now()->subDays(1)->toDateString())
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $recent->id);
    }

    public function test_user_can_delete_own_measurement(): void
    {
        $user = User::factory()->create();
        $measurement = $user->bodyMeasurements()->create([
            'measured_on' => now()->toDateString(),
            'weight_kg' => 80,
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/measurements/{$measurement->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('body_measurements', [
            'id' => $measurement->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_measurement(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $measurement = $other->bodyMeasurements()->create([
            'measured_on' => now()->toDateString(),
            'weight_kg' => 70,
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/measurements/{$measurement->id}")
            ->assertNotFound();
    }

    public function test_measurement_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/measurements', [
            'measured_on' => now()->addDay()->toDateString(),
            'weight_kg' => 10,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['measured_on', 'weight_kg']);
    }
}