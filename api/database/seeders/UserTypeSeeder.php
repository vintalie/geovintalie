<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserType;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['nome' => 'admin'],
            ['nome' => 'user'],
            ['nome' => 'public'],
            ['nome' => 'consumidor'],
            ['nome' => 'lojista'],
            ['nome' => 'prestador'],
            ['nome' => 'indústria'],
        ];

        foreach ($roles as $role) {
            UserType::firstOrCreate(['nome' => $role['nome']], $role);
        }
    }
}
