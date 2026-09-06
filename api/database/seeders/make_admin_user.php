<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class make_admin_user extends Seeder
{
    public function run(): void
    {
        // Verifica se já existe um admin com este email
        $user = User::where('email', 'admin@example.com')->first();

        if (!$user) {
            User::create([
                'name' => 'Administrador',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'), // Troque pela senha desejada
                'tipo_id' => 2, // Define o tipo_id como 2 (admin)
            ]);

            $this->command->info('Usuário administrador criado com sucesso!');
        } else {
            $this->command->info('Usuário administrador já existe.');
        }
    }
}