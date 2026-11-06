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
    Schema::create('profiles', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

        $table->string('gender', 10);
        $table->date('birth_date');
        $table->unsignedSmallInteger('height_cm');
        $table->decimal('weight_kg', 5, 2);

        $table->string('activity_level', 20);
        $table->string('experience_level', 20);
        $table->string('goal', 20);

        $table->decimal('target_weight_kg', 5, 2)->nullable();
        $table->decimal('weekly_rate_kg', 4, 2)->nullable();
        $table->string('unit_system', 10)->default('metric');
        $table->string('timezone', 64)->default('Asia/Jakarta');

        $table->json('equipment')->nullable();
        $table->json('dietary_preferences')->nullable();
        $table->json('allergies')->nullable();

        $table->timestamp('onboarded_at')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::dropIfExists('profiles');
}
};
