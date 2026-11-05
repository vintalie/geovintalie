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
        Schema::create('google_business_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('google_account_id')->nullable();
            $table->string('google_account_name')->nullable();
            $table->text('access_token_encrypted')->nullable();
            $table->text('refresh_token_encrypted')->nullable();
            $table->string('token_type', 50)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('scopes', 500)->nullable();
            $table->json('profile_data')->nullable();
            $table->timestamps();

            $table->unique('user_id', 'unique_google_business_token_per_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('google_business_tokens');
    }
};
