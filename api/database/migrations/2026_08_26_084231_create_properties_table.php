<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ForeignIdColumnDefinition;
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
            $table->string('complement')->nullable();
            $table->string('main_image')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('content_html')->nullable();
            $table->string('additional_info')->nullable();
            $table->string('contact1_email')->nullable();
            $table->string('contact2_email')->nullable();
            $table->string('number1')->nullable();
            $table->string('number2')->nullable();
            $table->string('number3')->nullable();
            $table->foreignId('street_id')->constrained('streets');
            $table->foreignId('user_id')->constrained('users');


            
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
