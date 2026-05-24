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
        Schema::create('clients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('email', 150);
            $table->string('postal_code', 8);
            $table->string('street', 150);
            $table->string('street_number', 20);
            $table->string('complement', 100)->nullable();
            $table->string('neighborhood', 100);
            $table->string('city', 100);
            $table->char('state', 2);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'email']);
            $table->index(['user_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
