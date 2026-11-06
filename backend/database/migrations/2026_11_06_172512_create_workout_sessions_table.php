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
    Schema::create('workout_sessions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->date('performed_on');
        $table->string('name', 100);
        $table->unsignedSmallInteger('duration_min')->nullable();
        $table->unsignedTinyInteger('perceived_exertion')->nullable();
        $table->text('notes')->nullable();
        $table->timestamps();

        $table->index(['user_id', 'performed_on']);
    });
}

public function down(): void
{
    Schema::dropIfExists('workout_sessions');
}
};
