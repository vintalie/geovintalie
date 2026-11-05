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
            $table->string('name')->nullable(false);
            $table->string('tipo')->nullable();
            $table->string('img_main')->nullable();
            $table->string('img_cover')->nullable();
            $table->longText('html')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('disabled')->default(false);
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('property_id')->nullable()->constrained('properties');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
