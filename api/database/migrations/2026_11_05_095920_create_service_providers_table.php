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
        Schema::create('service_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('business_name')->nullable(false);
            $table->string('cnpj_cpf', 20)->nullable();
            $table->text('description')->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->string('cover_url', 500)->nullable();
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->integer('total_reviews')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_providers');
    }
};
