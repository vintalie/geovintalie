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
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('problem_description');
            $table->foreignId('suggested_category_id')->nullable()->constrained('service_categories')->onDelete('set null');
            $table->string('suggested_category_name')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->string('ai_provider')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
