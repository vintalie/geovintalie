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
        Schema::table('chat_messages', function (Blueprint $table) {
            // Campos de anexo de arquivo (compartilhamento de arquivos - Escopo B6)
            $table->string('file_path')->nullable()->after('body');
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('file_mime')->nullable()->after('file_name');
            $table->unsignedInteger('file_size')->nullable()->after('file_mime');

            $table->index('file_path');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropIndex(['file_path']);
            $table->dropColumn([
                'file_path',
                'file_name',
                'file_mime',
                'file_size',
            ]);
        });
    }
};
