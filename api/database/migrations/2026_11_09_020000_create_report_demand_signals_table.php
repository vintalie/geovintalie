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
        Schema::create('report_demand_signals', function (Blueprint $table) {
            $table->id();
            $table->string('category', 100)->nullable()->index('report_demand_category_idx');
            $table->string('signal_type', 50)->index('report_demand_signal_idx'); // search, appointment, evaluation, view
            $table->unsignedInteger('weight')->default(1); // intensidade do sinal de demanda
            $table->unsignedBigInteger('property_id')->nullable()->index('report_demand_property_idx'); // loja de referencia
            $table->string('city', 100)->nullable()->index('report_demand_city_idx');
            $table->string('state', 2)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('recorded_at')->index('report_demand_recorded_idx');
            $table->timestamps();

            $table->foreign('property_id')
                ->references('id')
                ->on('properties')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_demand_signals');
    }
};
