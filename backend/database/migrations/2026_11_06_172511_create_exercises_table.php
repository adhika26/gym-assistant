<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('exercises', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('primary_muscle', 50);
        $table->json('secondary_muscles')->nullable();
        $table->string('equipment', 50)->nullable();
        $table->string('difficulty', 20)->default('beginner');
        $table->boolean('is_compound')->default(false);
        $table->text('instructions')->nullable();

        $table->string('source', 20)->default('seed');
        $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamps();

        $table->index('name');
        $table->index('primary_muscle');
    });
}

public function down(): void
{
    Schema::dropIfExists('exercises');
}
};
