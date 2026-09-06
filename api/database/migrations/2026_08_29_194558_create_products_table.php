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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('tipo');
            $table->string('img_main');
            $table->string('img_cover');
            $table->longText('html');
            $table->boolean('disabled');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('property_id')->constrained('properties');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');
        Schema::dropIfExists('properties');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('products');
        DB::statement('PRAGMA foreign_keys = ON');
    }
};
