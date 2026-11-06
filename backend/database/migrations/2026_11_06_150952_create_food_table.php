<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('barcode', 64)->nullable()->unique();
            $table->string('category', 50)->nullable();

            // Nilai per 100 gram
            $table->decimal('calories', 7, 2);
            $table->decimal('protein_g', 6, 2);
            $table->decimal('carbs_g', 6, 2);
            $table->decimal('fat_g', 6, 2);
            $table->decimal('fiber_g', 6, 2)->nullable();
            $table->decimal('sugar_g', 6, 2)->nullable();
            $table->decimal('sodium_mg', 8, 2)->nullable();

            $table->string('source', 20)->default('user');
            $table->boolean('is_verified')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};