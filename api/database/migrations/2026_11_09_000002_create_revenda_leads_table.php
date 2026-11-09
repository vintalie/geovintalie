<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Run the migrations. */
    public function up(): void
    {
        Schema::create('revenda_leads', function (Blueprint $table) {
            $table->id();
            // Lojista que manifestou interesse em revenda (nullable para leads anonimos futuros).
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nome_empresa');
            $table->string('cnpj')->unique();
            $table->string('contato_nome');
            $table->string('contato_email');
            $table->string('contato_telefone')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado')->nullable();
            $table->string('segmento')->nullable();
            $table->text('mensagem')->nullable();
            $table->string('status')->default('novo'); // novo | em_analise | contatado | fechado | recusado
            $table->text('notas_internas')->nullable(); // visivel apenas para a industria
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /** Reverse the migrations. */
    public function down(): void
    {
        Schema::dropIfExists('revenda_leads');
    }
};
