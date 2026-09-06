<?php

namespace Database\Seeders;


use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class create_types extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            DB::table('user_types')->insert([
            ['id' => 1, 'nome' => 'user', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nome' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'nome' => 'public', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
