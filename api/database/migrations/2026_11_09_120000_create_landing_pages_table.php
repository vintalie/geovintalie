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
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('country', 100);
            $table->string('neighborhood', 100)->nullable();
            $table->string('activity', 100)->nullable(); // ex: padaria, encanador, loja de roupas
            $table->string('meta_title', 255);
            $table->string('meta_description', 255);
            $table->string('h1', 255);
            $table->longText('content'); // corpo da pagina otimizada para SEO local
            $table->json('structured_data')->nullable(); // JSON-LD (LocalBusiness, etc.)
            $table->boolean('published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['city', 'state', 'country']);
            $table->index(['user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
