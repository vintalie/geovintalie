<?php

namespace Tests\Feature;

use App\Models\FeatureFlag;
use App\Models\LandingPage;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2/landing-pages';
    private string $flag = 'ff_a4_landing_seo';

    private function autenticar(): array
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $user = User::factory()->create([
            'email'    => 'landingpage@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id'  => $tipo->id,
        ]);

        $token = JWTAuth::fromUser($user);
        auth()->guard('api')->setUser($user);

        return ['user' => $user, 'token' => $token];
    }

    protected function setUp(): void
    {
        parent::setUp();

        FeatureFlag::create([
            'name'               => $this->flag,
            'enabled'            => true,
            'rollout_percentage' => 100,
        ]);
    }

    /** Autenticação ----------------------------------------------------- */

    public function test_listar_sem_autenticacao_retorna_401(): void
    {
        $this->get("{$this->base}")->assertStatus(401);
    }

    public function test_criar_sem_autenticacao_retorna_401(): void
    {
        $this->post("{$this->base}", ['title' => 'X'])->assertStatus(401);
    }

    /** Geração (Escopo A4) --------------------------------------------- */

    public function test_criar_landing_page_gera_conteudo_seo_local_e_publica(): void
    {
        $dados = $this->autenticar();

        $payload = [
            'title'     => 'Minha Loja de Materiais',
            'city'      => 'São Paulo',
            'state'     => 'SP',
            'country'   => 'Brasil',
            'activity'  => 'comercio de materiais de construção',
            'content'   => '<p>Conteúdo inicial.</p>',
        ];

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", $payload)
            ->assertStatus(201)
            ->assertJsonFragment(['message' => 'Landing page gerada com sucesso.']);

        $page = LandingPage::first();

        $this->assertNotNull($page);
        $this->assertSame($dados['user']->id, $page->user_id);
        $this->assertSame('São Paulo', $page->city);
        $this->assertSame('SP', $page->state);
        $this->assertSame('Brasil', $page->country);
        $this->assertSame('comercio de materiais de construção em São Paulo - SP, Brasil | GeoVintalie', $page->meta_title);
        $this->assertStringStartsWith('Encontre comercio de materiais de construção em São Paulo', $page->meta_description);
        $this->assertSame('comercio de materiais de construção em São Paulo', $page->h1);
        $this->assertStringContainsString('<h1>Minha Loja de Materiais</h1>', $page->content);
        $this->assertTrue($page->published);
        $this->assertNotNull($page->published_at);
        $this->assertSame('https://schema.org', $page->structured_data['@context'] ?? null);
        $this->assertSame('LocalBusiness', $page->structured_data['@type'] ?? null);
        $this->assertSame('Minha Loja de Materiais', $page->structured_data['name'] ?? null);
    }

    public function test_slug_eh_gerado_a_partir_da_cidade_estado_atividade(): void
    {
        $dados = $this->autenticar();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Qualquer Título',
                'city'    => 'Rio de Janeiro',
                'state'   => 'RJ',
                'country' => 'Brasil',
                'activity' => 'pizzaria',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('landing_pages', [
            'slug' => 'pizzaria-rio-de-janeiro-rj',
            'city' => 'Rio de Janeiro',
        ]);
    }

    public function test_slug_nao_colide_entre_geracoes_iguais(): void
    {
        $dados = $this->autenticar();

        $base = 'comercio-de-materiais-de-construcao-sao-paulo-sp';

        LandingPage::create([
            'user_id' => $dados['user']->id,
            'title'   => 'Primeira',
            'slug'    => $base,
            'city'    => 'São Paulo',
            'state'   => 'SP',
            'country' => 'Brasil',
            'activity' => 'comercio de materiais de construção',
            'content' => 'a',
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Segunda',
                'city'    => 'São Paulo',
                'state'   => 'SP',
                'country' => 'Brasil',
                'activity' => 'comercio de materiais de construção',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('landing_pages', ['slug' => $base]);
        $this->assertDatabaseHas('landing_pages', ['slug' => $base . '-1']);
    }

    public function test_listar_landing_pages_do_usuario(): void
    {
        $dados = $this->autenticar();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Loja Um',
                'city'    => 'São Paulo',
                'state'   => 'SP',
                'country' => 'Brasil',
                'activity' => 'livraria',
            ])
            ->assertStatus(201);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->get("{$this->base}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['title' => 'Loja Um', 'city' => 'São Paulo']);
    }

    public function test_atualizar_landing_page_do_dono(): void
    {
        $dados = $this->autenticar();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Título Antigo',
                'city'    => 'São Paulo',
                'state'   => 'SP',
                'country' => 'Brasil',
                'activity' => 'livraria',
            ])
            ->assertStatus(201);

        $page = LandingPage::first();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->put("{$this->base}/{$page->id}", ['title' => 'Título Novo', 'h1' => 'Novo H1'])
            ->assertStatus(200)
            ->assertJsonFragment(['title' => 'Título Novo', 'h1' => 'Novo H1']);

        $this->assertDatabaseHas('landing_pages', ['id' => $page->id, 'title' => 'Título Novo']);
    }

    public function test_nao_pode_atualizar_landing_page_de_outro_usuario(): void
    {
        $dados = $this->autenticar();

        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $outro = User::factory()->create([
            'email'    => 'outro@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id'  => $tipo->id,
        ]);

        $page = LandingPage::create([
            'user_id' => $outro->id,
            'title'   => 'Do Outro',
            'slug'    => 'do-outro',
            'city'    => 'São Paulo',
            'state'   => 'SP',
            'country' => 'Brasil',
            'activity' => 'livraria',
            'content' => 'x',
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->put("{$this->base}/{$page->id}", ['title' => 'Invasao'])
            ->assertStatus(403);

        $this->assertDatabaseHas('landing_pages', ['id' => $page->id, 'title' => 'Do Outro']);
    }

    public function test_excluir_landing_page_do_dono(): void
    {
        $dados = $this->autenticar();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Para Excluir',
                'city'    => 'São Paulo',
                'state'   => 'SP',
                'country' => 'Brasil',
                'activity' => 'livraria',
            ])
            ->assertStatus(201);

        $page = LandingPage::first();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->delete("{$this->base}/{$page->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('landing_pages', ['id' => $page->id]);
    }

    /** Página pública por slug ----------------------------------------- */

    public function test_pagina_publica_por_slug_retorna_sem_autenticacao(): void
    {
        $dados = $this->autenticar();

        LandingPage::create([
            'user_id'       => $dados['user']->id,
            'title'         => 'Página Pública',
            'slug'          => 'minha-loja-sp',
            'city'          => 'São Paulo',
            'state'         => 'SP',
            'country'       => 'Brasil',
            'activity'      => 'livraria',
            'content'       => '<p>Público</p>',
            'published'     => true,
            'published_at'  => now(),
        ]);

        LandingPage::create([
            'user_id'    => $dados['user']->id,
            'title'      => 'Rascunho',
            'slug'       => 'rascunho-sp',
            'city'       => 'São Paulo',
            'state'      => 'SP',
            'country'    => 'Brasil',
            'activity'   => 'livraria',
            'content'    => '<p>Rascunho</p>',
            'published'  => false,
        ]);

        $this->get("/api/v2/landing-pages/minha-loja-sp")
            ->assertStatus(200)
            ->assertJsonFragment(['title' => 'Página Pública']);

        $this->get("/api/v2/landing-pages/rascunho-sp")->assertStatus(404);
        $this->get("/api/v2/landing-pages/nao-existe")->assertStatus(404);
    }

    /** Feature flag ------------------------------------------------------ */

    public function test_rotas_bloqueadas_quando_flag_esta_desligada(): void
    {
        FeatureFlag::where('name', $this->flag)->update(['enabled' => false]);

        $dados = $this->autenticar();

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->post("{$this->base}", [
                'title'   => 'Bloqueada',
                'city'    => 'São Paulo',
                'state'   => 'SP',
                'country' => 'Brasil',
                'activity' => 'livraria',
            ])
            ->assertStatus(403);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->get("{$this->base}")
            ->assertStatus(403);

        // A página pública continua acessível (não depende da feature flag do painel)
        LandingPage::create([
            'user_id'    => $dados['user']->id,
            'title'      => 'Público',
            'slug'       => 'publico-sp',
            'city'       => 'São Paulo',
            'state'      => 'SP',
            'country'    => 'Brasil',
            'activity'   => 'livraria',
            'content'    => 'x',
            'published'  => true,
            'published_at' => now(),
        ]);
        $this->get("/api/v2/landing-pages/publico-sp")->assertStatus(200);
    }
}
