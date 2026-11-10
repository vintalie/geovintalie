<?php

namespace Tests\Unit;

use App\Models\FeatureFlag;
use App\Services\FeatureFlagService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeatureFlagServiceTest extends TestCase
{
    use RefreshDatabase;

    private function service(): FeatureFlagService
    {
        return app(FeatureFlagService::class);
    }

    public function test_flag_desconhecida_esta_desabilitada(): void
    {
        $this->assertFalse($this->service()->isEnabled('ff_nao_existe'));
    }

    public function test_flag_desligada_esta_desabilitada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_off',
            'description' => 'desligada',
            'enabled' => false,
            'rollout_percentage' => 100,
        ]);

        $this->assertFalse($this->service()->isEnabled('ff_off'));
    }

    public function test_flag_ligada_em_100_esta_habilitada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_on',
            'description' => 'ligada',
            'enabled' => true,
            'rollout_percentage' => 100,
        ]);

        $this->assertTrue($this->service()->isEnabled('ff_on'));
    }

    public function test_flag_ligada_com_rollout_zero_esta_desabilitada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_zero',
            'description' => 'zero',
            'enabled' => true,
            'rollout_percentage' => 0,
        ]);

        $this->assertFalse($this->service()->isEnabled('ff_zero'));
    }

    public function test_liberacao_percentual_eh_determinista(): void
    {
        FeatureFlag::create([
            'name' => 'ff_parcial',
            'description' => 'parcial',
            'enabled' => true,
            'rollout_percentage' => 50,
        ]);

        $service = $this->service();
        $primeira = $service->isEnabled('ff_parcial');
        $segunda = $service->isEnabled('ff_parcial');

        $this->assertSame($primeira, $segunda);
    }

    public function test_enabled_names_retorna_apenas_flags_ligadas(): void
    {
        FeatureFlag::create([
            'name' => 'ff_ativa',
            'description' => 'ativa',
            'enabled' => true,
            'rollout_percentage' => 100,
        ]);
        FeatureFlag::create([
            'name' => 'ff_inativa',
            'description' => 'inativa',
            'enabled' => false,
            'rollout_percentage' => 0,
        ]);

        $this->assertSame(['ff_ativa'], $this->service()->enabledNames());
    }
}
