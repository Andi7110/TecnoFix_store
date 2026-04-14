<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuentas_transferencia', function (Blueprint $table): void {
            $table->id();
            $table->string('bank_name', 120)->nullable();
            $table->string('account_number', 120)->nullable();
            $table->string('owner_name', 160)->nullable();
            $table->string('owner_type', 20)->default('Natural');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuentas_transferencia');
    }
};
