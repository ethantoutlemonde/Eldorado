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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('firstname');
            $table->string('lastname');
            $table->string('wallet')->unique(); // Adresse du wallet
            $table->string('id_card')->unique(); // Ajout de la colonne idCard
            $table->boolean('is_admin')->default(false); // Ajout de la colonne is_admin
            $table->boolean('status')->default(false); // Ajout de la colonne status
            $table->timestamps();
        });

        // Suppression des autres tables associées à l'authentification classique
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

