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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable(false);
            $table->string('n_property')->nullable(false);
            $table->string('complement');
            $table->string('main_image');
            $table->string('cover_image');
            $table->string('content_html');
            $table->string('additional_info');
            $table->string('contact1_email')->nullable(false);
            $table->string('contact2_email');
            $table->string('number1')->nullable(false);
            $table->string('number2');
            $table->string('number3');


            
            $table->foreignId('street_id')->constrained('street')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
