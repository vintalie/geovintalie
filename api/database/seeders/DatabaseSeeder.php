<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            create_types::class,   // primeiro
        ]);
        // User::factory(10)->create();
        
        User::factory()->create([
            'name' => 'Test User',
            'tipo_id' => 1, 
            'email' => 'test@example.com',
        ]);
    }
}
