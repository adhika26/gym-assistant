<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FoodTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_foods(): void
    {
        $this->getJson('/api/v1/foods')->assertUnauthorized();
        $this->postJson('/api/v1/foods', [])->assertUnauthorized();
    }

    public function test_user_sees_global_and_own_foods_only(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $global = Food::factory()->create([
            'name' => 'Global Food',
            'created_by' => null,
        ]);
        $own = Food::factory()->create([
            'name' => 'My Food',
            'created_by' => $user->id,
        ]);
        Food::factory()->create([
            'name' => 'Other Food',
            'created_by' => $other->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/foods')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $names = collect($response->json('data'))->pluck('name');

        $this->assertTrue($names->contains($global->name));
        $this->assertTrue($names->contains($own->name));
        $this->assertFalse($names->contains('Other Food'));
    }

    public function test_foods_can_be_searched_by_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Food::factory()->create(['name' => 'Nasi putih']);
        Food::factory()->create(['name' => 'Ayam bakar']);

        $this->getJson('/api/v1/foods?q=nasi')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Nasi putih');
    }

    public function test_user_can_create_custom_food(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/foods', [
            'name' => 'Protein shake',
            'calories' => 120,
            'protein_g' => 24,
            'carbs_g' => 3,
            'fat_g' => 1.5,
        ])
            ->assertCreated()
            ->assertJsonPath('food.name', 'Protein shake')
            ->assertJsonPath('food.source', 'user');

        $this->assertDatabaseHas('foods', [
            'name' => 'Protein shake',
            'created_by' => $user->id,
            'source' => 'user',
        ]);
    }

    public function test_create_food_validates_required_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/foods', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'calories',
                'protein_g',
                'carbs_g',
                'fat_g',
            ]);
    }
}