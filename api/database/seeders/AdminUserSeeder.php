<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'id' => '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // Adresse Ethereum unique
            'nom' => 'Didrit',
            'prenom' => 'Ben',
            'date_naissance' => '2003-01-01',
            'statut' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
