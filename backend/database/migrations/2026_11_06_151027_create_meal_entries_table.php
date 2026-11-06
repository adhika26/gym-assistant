<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('food_id')->nullable()->constrained('foods')->nullOnDelete();
            $table->date('consumed_on');
            $table->string('meal_type', 20);
            $table->decimal('quantity_g', 7, 1);

            $table->decimal('calories', 7, 2);
            $table->decimal('protein_g', 6, 2);
            $table->decimal('carbs_g', 6, 2);
            $table->decimal('fat_g', 6, 2);

            $table->timestamps();

            $table->index(['user_id', 'consumed_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_entries');
    }
};