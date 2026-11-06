<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'gender' => 'male',
            'birth_date' => now()->subYears(30)->toDateString(),
            'height_cm' => 180,
            'weight_kg' => 80,
            'activity_level' => 'moderate',
            'experience_level' => 'beginner',
            'goal' => 'cut',
        ], $overrides);
    }

    public function test_guest_cannot_access_profile(): void
    {
        $this->getJson('/api/v1/profile')->assertUnauthorized();
        $this->putJson('/api/v1/profile', $this->validPayload())->assertUnauthorized();
    }

    public function test_profile_is_null_before_onboarding(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/profile')
            ->assertOk()
            ->assertJsonPath('profile', null);
    }

    public function test_user_can_create_profile_with_calculated_targets(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile', $this->validPayload())
            ->assertOk()
            ->assertJsonPath('profile.bmr', 1780)
            ->assertJsonPath('profile.tdee', 2759)
            ->assertJsonPath('profile.calorie_target', 2210)
            ->assertJsonPath('profile.protein_g', 160)
            ->assertJsonPath('profile.fat_g', 61)
            ->assertJsonPath('profile.carbs_g', 255)
            ->assertJsonPath('profile.water_ml', 2800);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'goal' => 'cut',
            'calorie_target' => 2210,
        ]);
    }

    public function test_updating_profile_does_not_create_duplicate(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile', $this->validPayload())->assertOk();
        $this->putJson('/api/v1/profile', $this->validPayload(['weight_kg' => 78]))->assertOk();

        $this->assertDatabaseCount('profiles', 1);
    }

    public function test_profile_validation_rejects_invalid_values(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile', $this->validPayload([
            'goal' => 'extreme',
            'height_cm' => 10,
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['goal', 'height_cm']);
    }
}