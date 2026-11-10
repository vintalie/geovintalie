<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FeatureFlag;

class FeatureFlagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flags = [
            [
                'name' => 'ff_o2o_locator',
                'description' => 'Habilitar localizador de produtos próximos (Escopo A1)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_service_providers',
                'description' => 'Habilitar cadastro de prestadores de serviço (Escopo B1)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_service_search',
                'description' => 'Habilitar busca com filtros de serviço (Escopo B2)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_new_user_roles',
                'description' => 'Habilitar gerenciamento de novos papéis de usuário (consumer, retailer, provider, industry) (Escopo C1)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_lgpd_consent',
                'description' => 'Habilitar fluxo de consentimento LGPD (Escopo C3)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_service_evaluations',
                'description' => 'Habilitar sistema de avaliacoes mutuas cliente-prestador (Escopo B5)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_appointment',
                'description' => 'Habilitar agendamentos de servico (Escopo B4)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_chat',
                'description' => 'Habilitar chat interno cliente-prestador (Escopo B4)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_reviews',
                'description' => 'Habilitar avaliacoes mutuas cliente-prestador (Escopo B5)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
            [
                'name' => 'ff_agendamentos_chat',
                'description' => 'Habilitar agendamentos e chat interno (Escopo B4)',
                'enabled' => true,
                'rollout_percentage' => 100,
            ],
        ];

        foreach ($flags as $flag) {
            FeatureFlag::firstOrCreate(['name' => $flag['name']], $flag);
        }
    }
}
