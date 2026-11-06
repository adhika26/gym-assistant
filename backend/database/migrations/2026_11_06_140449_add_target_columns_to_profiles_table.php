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
    Schema::table('profiles', function (Blueprint $table) {
        $table->unsignedInteger('bmr')->nullable();
        $table->unsignedInteger('tdee')->nullable();
        $table->unsignedInteger('calorie_target')->nullable();
        $table->unsignedSmallInteger('protein_g')->nullable();
        $table->unsignedSmallInteger('fat_g')->nullable();
        $table->unsignedSmallInteger('carbs_g')->nullable();
        $table->unsignedSmallInteger('water_ml')->nullable();
    });
}

public function down(): void
{
    Schema::table('profiles', function (Blueprint $table) {
        $table->dropColumn([
            'bmr',
            'tdee',
            'calorie_target',
            'protein_g',
            'fat_g',
            'carbs_g',
            'water_ml',
        ]);
    });
}
};
