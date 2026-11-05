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
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            // Cliente da conversa
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            // Prestador da conversa
            $table->foreignId('provider_id')->constrained('service_providers')->onDelete('cascade');
            // Agendamento ao qual a conversa esta vinculada (opcional)
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');
            $table->timestamps();

            // Uma conversa por par cliente x prestador (opcionalmente por agendamento)
            $table->unique(['client_id', 'provider_id', 'appointment_id']);

            $table->index(['client_id', 'provider_id']);
            $table->index('appointment_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_conversations');
    }
};
