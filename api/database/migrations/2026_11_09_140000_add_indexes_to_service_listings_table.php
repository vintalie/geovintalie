<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Índices para suportar as consultas de busca do Escopo B2 (categoria,
     * localidade, avaliacao e preco) com desempenho em service_listings.
     */
    public function up(): void
    {
        Schema::table('service_listings', function (Blueprint $table) {
            $table->index('city', 'idx_service_listings_city');
            $table->index('state', 'idx_service_listings_state');
            $table->index('category_id', 'idx_service_listings_category_id');
            $table->index('is_active', 'idx_service_listings_is_active');
            $table->index('average_rating', 'idx_service_listings_average_rating');
            $table->index('price', 'idx_service_listings_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_listings', function (Blueprint $table) {
            $table->dropIndex('idx_service_listings_city');
            $table->dropIndex('idx_service_listings_state');
            $table->dropIndex('idx_service_listings_category_id');
            $table->dropIndex('idx_service_listings_is_active');
            $table->dropIndex('idx_service_listings_average_rating');
            $table->dropIndex('idx_service_listings_price');
        });
    }
};
