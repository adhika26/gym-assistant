<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        $foods = [
            ['name' => 'Nasi putih', 'category' => 'karbohidrat', 'calories' => 130, 'protein_g' => 2.7, 'carbs_g' => 28.2, 'fat_g' => 0.3, 'fiber_g' => 0.4],
            ['name' => 'Nasi merah', 'category' => 'karbohidrat', 'calories' => 110, 'protein_g' => 2.6, 'carbs_g' => 23.0, 'fat_g' => 0.9, 'fiber_g' => 1.8],
            ['name' => 'Ayam dada tanpa kulit', 'category' => 'protein', 'calories' => 165, 'protein_g' => 31.0, 'carbs_g' => 0.0, 'fat_g' => 3.6, 'fiber_g' => 0],
            ['name' => 'Telur ayam rebus', 'category' => 'protein', 'calories' => 155, 'protein_g' => 13.0, 'carbs_g' => 1.1, 'fat_g' => 11.0, 'fiber_g' => 0],
            ['name' => 'Tahu', 'category' => 'protein', 'calories' => 76, 'protein_g' => 8.0, 'carbs_g' => 1.9, 'fat_g' => 4.8, 'fiber_g' => 0.3],
            ['name' => 'Tempe', 'category' => 'protein', 'calories' => 193, 'protein_g' => 20.8, 'carbs_g' => 7.6, 'fat_g' => 10.8, 'fiber_g' => 1.4],
            ['name' => 'Ikan kembung', 'category' => 'protein', 'calories' => 103, 'protein_g' => 22.0, 'carbs_g' => 0.0, 'fat_g' => 1.0, 'fiber_g' => 0],
            ['name' => 'Oatmeal kering', 'category' => 'karbohidrat', 'calories' => 389, 'protein_g' => 16.9, 'carbs_g' => 66.3, 'fat_g' => 6.9, 'fiber_g' => 10.6],
            ['name' => 'Roti gandum', 'category' => 'karbohidrat', 'calories' => 247, 'protein_g' => 13.0, 'carbs_g' => 41.0, 'fat_g' => 3.4, 'fiber_g' => 6.0],
            ['name' => 'Susu full cream', 'category' => 'dairy', 'calories' => 61, 'protein_g' => 3.2, 'carbs_g' => 4.3, 'fat_g' => 3.5, 'fiber_g' => 0],
            ['name' => 'Pisang', 'category' => 'buah', 'calories' => 89, 'protein_g' => 1.1, 'carbs_g' => 22.8, 'fat_g' => 0.3, 'fiber_g' => 2.6],
            ['name' => 'Apel', 'category' => 'buah', 'calories' => 52, 'protein_g' => 0.3, 'carbs_g' => 13.8, 'fat_g' => 0.2, 'fiber_g' => 2.4],
            ['name' => 'Brokoli', 'category' => 'sayur', 'calories' => 34, 'protein_g' => 2.8, 'carbs_g' => 6.6, 'fat_g' => 0.4, 'fiber_g' => 2.6],
            ['name' => 'Bayam', 'category' => 'sayur', 'calories' => 23, 'protein_g' => 2.9, 'carbs_g' => 3.6, 'fat_g' => 0.4, 'fiber_g' => 2.2],
            ['name' => 'Minyak zaitun', 'category' => 'lemak', 'calories' => 884, 'protein_g' => 0.0, 'carbs_g' => 0.0, 'fat_g' => 100.0, 'fiber_g' => 0],
            ['name' => 'Alpukat', 'category' => 'lemak', 'calories' => 160, 'protein_g' => 2.0, 'carbs_g' => 8.5, 'fat_g' => 14.7, 'fiber_g' => 6.7],
            ['name' => 'Kacang almond', 'category' => 'lemak', 'calories' => 579, 'protein_g' => 21.2, 'carbs_g' => 21.6, 'fat_g' => 49.9, 'fiber_g' => 12.5],
            ['name' => 'Greek yogurt', 'category' => 'dairy', 'calories' => 59, 'protein_g' => 10.0, 'carbs_g' => 3.6, 'fat_g' => 0.4, 'fiber_g' => 0],
        ];

        foreach ($foods as $food) {
            Food::firstOrCreate(
                ['name' => $food['name'], 'brand' => null],
                [
                    ...$food,
                    'source' => 'seed',
                    'is_verified' => true,
                    'created_by' => null,
                ],
            );
        }
    }
}