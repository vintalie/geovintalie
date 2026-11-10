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
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_new_user_roles',
                'description' => 'Habilitar novos papéis de usuário (consumer, retailer, provider, industry) (Escopo C1)',
                'enabled' => false,
                'rollout_percentage' => 0,
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
            // Módulos R3 (A e B) — começam desligados por padrão. Só devem ser
            // ativados pelo administrador quando o módulo estiver pronto para release.
            [
                'name' => 'ff_b2_busca_filtros',
                'description' => 'Habilitar busca com filtros (categoria, localização, avaliação, preço) (Escopo B2)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_b3_recomendacao_ia',
                'description' => 'Habilitar recomendação por IA a partir da descrição do problema (Escopo B3)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_a4_landing_seo',
                'description' => 'Habilitar geração automática de sites/landing pages otimizadas para SEO local (Escopo A4)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_a5_relatorios',
                'description' => 'Habilitar relatórios de inteligência — mapas de calor oferta × demanda (Escopo A5)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
            [
                'name' => 'ff_a6_quero_revender',
                'description' => 'Habilitar módulo "Quero Revender" — leads B2B indústria → lojista (Escopo A6)',
                'enabled' => false,
                'rollout_percentage' => 0,
            ],
        ];

        foreach ($flags as $flag) {
            FeatureFlag::firstOrCreate(['name' => $flag['name']], $flag);
        }
    }
}
