<?php

namespace Tests\Feature;

use App\Models\Food;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MealEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_meal_entries(): void
    {
        $this->getJson('/api/v1/meal-entries')->assertUnauthorized();
        $this->postJson('/api/v1/meal-entries', [])->assertUnauthorized();
    }

    public function test_user_can_log_food_and_macros_are_calculated(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $food = Food::factory()->create([
            'name' => 'Nasi putih',
            'calories' => 130,
            'protein_g' => 2.7,
            'carbs_g' => 28.2,
            'fat_g' => 0.3,
        ]);

        $response = $this->postJson('/api/v1/meal-entries', [
            'food_id' => $food->id,
            'consumed_on' => '2026-11-06',
            'meal_type' => 'lunch',
            'quantity_g' => 200,
        ]);

        $response->assertCreated()
            ->assertJsonPath('entry.food.name', 'Nasi putih')
            ->assertJsonPath('entry.quantity_g', 200);

        $this->assertEquals(260, $response->json('entry.calories'));
        $this->assertEquals(5.4, $response->json('entry.protein_g'));
        $this->assertEquals(56.4, $response->json('entry.carbs_g'));
        $this->assertEquals(0.6, $response->json('entry.fat_g'));

        $this->assertDatabaseHas('meal_entries', [
            'user_id' => $user->id,
            'food_id' => $food->id,
            'calories' => 260,
        ]);
    }

    public function test_user_cannot_log_another_users_private_food(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $privateFood = Food::factory()->create([
            'created_by' => $other->id,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/meal-entries', [
            'food_id' => $privateFood->id,
            'consumed_on' => '2026-11-06',
            'meal_type' => 'lunch',
            'quantity_g' => 100,
        ])->assertNotFound();
    }

    public function test_index_returns_entries_and_daily_totals(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $food = Food::factory()->create();

        $user->mealEntries()->create([
            'food_id' => $food->id,
            'consumed_on' => '2026-11-06',
            'meal_type' => 'lunch',
            'quantity_g' => 100,
            'calories' => 200,
            'protein_g' => 10,
            'carbs_g' => 20,
            'fat_g' => 5,
        ]);

        $user->mealEntries()->create([
            'food_id' => $food->id,
            'consumed_on' => '2026-11-06',
            'meal_type' => 'dinner',
            'quantity_g' => 150,
            'calories' => 300,
            'protein_g' => 15,
            'carbs_g' => 30,
            'fat_g' => 7.5,
        ]);

        // Tanggal lain, tidak boleh ikut
        $user->mealEntries()->create([
            'food_id' => $food->id,
            'consumed_on' => '2026-11-05',
            'meal_type' => 'lunch',
            'quantity_g' => 100,
            'calories' => 999,
            'protein_g' => 99,
            'carbs_g' => 99,
            'fat_g' => 99,
        ]);

        // Milik user lain, tidak boleh ikut
        $other->mealEntries()->create([
            'food_id' => $food->id,
            'consumed_on' => '2026-11-06',
            'meal_type' => 'lunch',
            'quantity_g' => 100,
            'calories' => 777,
            'protein_g' => 77,
            'carbs_g' => 77,
            'fat_g' => 77,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/meal-entries?date=2026-11-06')
            ->assertOk()
            ->assertJsonCount(2, 'entries')
            ->assertJsonPath('totals.calories', 500)
            ->assertJsonPath('totals.protein_g', 25)
            ->assertJsonPath('totals.carbs_g', 50)
            ->assertJsonPath('totals.fat_g', 12.5);
    }

    public function test_meal_entry_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/meal-entries', [
            'meal_type' => 'brunch',
            'quantity_g' => 0,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'food_id',
                'consumed_on',
                'meal_type',
                'quantity_g',
            ]);
    }

    private function makeEntry(User $user, Food $food, array $overrides = [])
{
    return $user->mealEntries()->create(array_merge([
        'food_id' => $food->id,
        'consumed_on' => '2026-11-06',
        'meal_type' => 'lunch',
        'quantity_g' => 100,
        'calories' => 130,
        'protein_g' => 2.7,
        'carbs_g' => 28.2,
        'fat_g' => 0.3,
    ], $overrides));
}

public function test_user_can_update_quantity_and_macros_are_recalculated(): void
{
    $user = User::factory()->create();
    $food = Food::factory()->create([
        'calories' => 130,
        'protein_g' => 2.7,
        'carbs_g' => 28.2,
        'fat_g' => 0.3,
    ]);
    $entry = $this->makeEntry($user, $food);

    Sanctum::actingAs($user);

    $response = $this->putJson("/api/v1/meal-entries/{$entry->id}", [
        'quantity_g' => 250,
        'meal_type' => 'dinner',
    ]);

    $response->assertOk()
        ->assertJsonPath('entry.meal_type', 'dinner')
        ->assertJsonPath('entry.quantity_g', 250);

    $this->assertEquals(325, $response->json('entry.calories'));
    $this->assertEquals(6.75, $response->json('entry.protein_g'));
}

public function test_user_cannot_update_another_users_entry(): void
{
    $user = User::factory()->create();
    $other = User::factory()->create();
    $food = Food::factory()->create();
    $entry = $this->makeEntry($other, $food);

    Sanctum::actingAs($user);

    $this->putJson("/api/v1/meal-entries/{$entry->id}", [
        'quantity_g' => 200,
    ])->assertNotFound();
}

public function test_user_can_delete_own_entry(): void
{
    $user = User::factory()->create();
    $food = Food::factory()->create();
    $entry = $this->makeEntry($user, $food);

    Sanctum::actingAs($user);

    $this->deleteJson("/api/v1/meal-entries/{$entry->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('meal_entries', [
        'id' => $entry->id,
    ]);
}

public function test_user_cannot_delete_another_users_entry(): void
{
    $user = User::factory()->create();
    $other = User::factory()->create();
    $food = Food::factory()->create();
    $entry = $this->makeEntry($other, $food);

    Sanctum::actingAs($user);

    $this->deleteJson("/api/v1/meal-entries/{$entry->id}")
        ->assertNotFound();
}
}