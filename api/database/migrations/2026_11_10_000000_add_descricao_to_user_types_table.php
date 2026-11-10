<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Adiciona descricao aos papéis (user_types) para o escopo C1. */
    public function up(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            $table->string('descricao')->nullable()->after('nome');
        });
    }

    /** Reverse the migrations. */
    public function down(): void
    {
        Schema::table('user_types', function (Blueprint $table) {
            $table->dropColumn('descricao');
        });
    }
};
