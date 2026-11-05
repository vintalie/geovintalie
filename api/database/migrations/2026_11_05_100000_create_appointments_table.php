<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            // Cliente (usuario que solicita o servico)
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            // Prestador de servico (ServiceProvider, Escopo B1/B2)
            $table->foreignId('provider_id')->constrained('service_providers')->onDelete('cascade');
            $table->date('date')->nullable(false);     // data do agendamento
            $table->time('time')->nullable(false);     // hora do agendamento
            $table->string('status', 30)->default('pendente'); // pendente|confirmado|recusado|concluido|cancelado
            $table->decimal('valor', 10, 2)->nullable(); // valor negociado/cobrado
            $table->text('observacoes')->nullable();    // observacoes do cliente/prestador
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['date', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
