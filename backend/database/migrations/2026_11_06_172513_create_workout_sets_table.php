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
    Schema::create('workout_sets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('workout_session_id')->constrained()->cascadeOnDelete();
        $table->foreignId('exercise_id')->nullable()->constrained('exercises')->nullOnDelete();

        // Snapshot nama exercise agar histori tetap terbaca
        $table->string('exercise_name');

        $table->unsignedSmallInteger('set_number');
        $table->decimal('weight_kg', 6, 2)->nullable();
        $table->unsignedSmallInteger('reps');
        $table->decimal('rpe', 3, 1)->nullable();
        $table->boolean('is_warmup')->default(false);
        $table->text('notes')->nullable();

        $table->timestamps();

        $table->index(['workout_session_id', 'exercise_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('workout_sets');
}
};
