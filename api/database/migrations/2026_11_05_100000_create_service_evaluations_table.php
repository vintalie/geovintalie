<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Run the migrations. */
    public function up(): void
    {
        Schema::create('service_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_listing_id')->constrained('service_listings')->onDelete('cascade');
            $table->foreignId('service_provider_id')->constrained('service_providers')->onDelete('cascade'); // avaliado
            $table->foreignId('evaluator_id')->constrained('users')->onDelete('cascade'); // avaliador (cliente)
            $table->unsignedTinyInteger('rating'); // nota 1 a 5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['evaluator_id', 'service_listing_id'], 'unique_evaluator_per_listing');
            $table->index(['service_provider_id', 'created_at']);
            $table->index(['evaluator_id']);
        });
    }

    /** Reverse the migrations. */
    public function down(): void
    {
        Schema::dropIfExists('service_evaluations');
    }
};
