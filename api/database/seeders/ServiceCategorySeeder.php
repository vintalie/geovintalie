<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Eletricista',
                'slug' => 'eletricista',
                'description' => 'Serviços elétricos residenciais e comerciais',
                'icon' => 'zap',
            ],
            [
                'name' => 'Encanador',
                'slug' => 'encanador',
                'description' => 'Serviços de encanamento e hidráulica',
                'icon' => 'droplet',
            ],
            [
                'name' => 'Limpeza',
                'slug' => 'limpeza',
                'description' => 'Serviços de limpeza residencial e comercial',
                'icon' => 'sparkles',
            ],
            [
                'name' => 'Jardineiro',
                'slug' => 'jardineiro',
                'description' => 'Cuidados com jardins e áreas externas',
                'icon' => 'tree-pine',
            ],
            [
                'name' => 'Faxineiro',
                'slug' => 'faxineiro',
                'description' => 'Serviços de faxina e arrumação',
                'icon' => 'broom',
            ],
            [
                'name' => 'Pintor',
                'slug' => 'pintor',
                'description' => 'Serviços de pintura residencial e comercial',
                'icon' => 'palette',
            ],
            [
                'name' => 'Eletrônicos',
                'slug' => 'eletronicos',
                'description' => 'Conserto e instalação de aparelhos eletrônicos',
                'icon' => 'smartphone',
            ],
            [
                'name' => 'Mecânico',
                'slug' => 'mecanico',
                'description' => 'Serviços de mecânica automotiva',
                'icon' => 'wrench',
            ],
            [
                'name' => 'Carpinteiro',
                'slug' => 'carpinteiro',
                'description' => 'Trabalhos em madeira e marcenaria',
                'icon' => 'hammer',
            ],
            [
                'name' => 'Pedreiro',
                'slug' => 'pedreiro',
                'description' => 'Obras e reformas em alvenaria',
                'icon' => 'building-2',
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
