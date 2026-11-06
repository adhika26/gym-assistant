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
    Schema::create('body_measurements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->date('measured_on');

        $table->decimal('weight_kg', 5, 2);
        $table->decimal('body_fat_pct', 4, 1)->nullable();

        $table->decimal('waist_cm', 5, 1)->nullable();
        $table->decimal('chest_cm', 5, 1)->nullable();
        $table->decimal('arm_cm', 5, 1)->nullable();
        $table->decimal('thigh_cm', 5, 1)->nullable();
        $table->decimal('hip_cm', 5, 1)->nullable();

        $table->text('notes')->nullable();
        $table->timestamps();

        $table->unique(['user_id', 'measured_on']);
        $table->index(['user_id', 'measured_on']);
    });
}

public function down(): void
{
    Schema::dropIfExists('body_measurements');
}
};
