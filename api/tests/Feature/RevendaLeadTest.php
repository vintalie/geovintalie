<?php

namespace Tests\Feature;

use App\Models\RevendaLead;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RevendaLeadTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Escopo A6 - Lead de revenda (lojista -> industria) ------------ */

    public function test_lojista_cria_lead_de_revenda_retorna_201(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);
        $lojista = User::factory()->create([
            'email' => 'lojista.revenda@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        $token = $this->obterTokenDoUsuario($lojista);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/revenda-leads", [
                'nome_empresa' => 'Loja Teste Revenda',
                'cnpj' => '11.222.333/0001-44',
                'contato_nome' => 'Maria Contato',
                'contato_email' => 'maria@lojateste.com',
                'contato_telefone' => '(11) 99999-9999',
                'cidade' => 'Sao Paulo',
                'estado' => 'SP',
                'segmento' => 'Decoracao',
                'mensagem' => 'Tenho interesse em revender produtos da industria.',
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'nome_empresa' => 'Loja Teste Revenda',
            'cnpj' => '11.222.333/0001-44',
            'status' => 'novo',
        ]);
        $this->assertDatabaseHas('revenda_leads', [
            'cnpj' => '11.222.333/0001-44',
            'user_id' => $lojista->id,
            'status' => RevendaLead::STATUS_NOVO,
        ]);
    }

    public function test_cnpj_duplicado_nao_e_aceito_retorna_422(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);
        $lojista = User::factory()->create([
            'email' => 'lojista.dup@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        RevendaLead::create([
            'user_id' => $lojista->id,
            'nome_empresa' => 'Loja Existente',
            'cnpj' => '33.444.555/0001-66',
            'contato_nome' => 'Joao',
            'contato_email' => 'joao@loja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);

        $token = $this->obterTokenDoUsuario($lojista);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/revenda-leads", [
                'nome_empresa' => 'Loja Duplicada',
                'cnpj' => '33.444.555/0001-66',
                'contato_nome' => 'Outro',
                'contato_email' => 'outro@loja.com',
            ])
            ->assertStatus(422);
    }

    public function test_industria_lista_todos_os_leads_retorna_200(): void
    {
        $tipoInd = UserType::firstOrCreate(['nome' => 'industry'], ['nome' => 'industry']);
        $tipoRet = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);

        $industria = User::factory()->create([
            'email' => 'industria@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoInd->id,
        ]);
        $lojista1 = User::factory()->create([
            'email' => 'lojista.um@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);
        $lojista2 = User::factory()->create([
            'email' => 'lojista.dois@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);

        RevendaLead::create([
            'user_id' => $lojista1->id,
            'nome_empresa' => 'Loja Um',
            'cnpj' => '11.111.111/0001-11',
            'contato_nome' => 'Contato Um',
            'contato_email' => 'um@loja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);
        RevendaLead::create([
            'user_id' => $lojista2->id,
            'nome_empresa' => 'Loja Dois',
            'cnpj' => '22.222.222/0001-22',
            'contato_nome' => 'Contato Dois',
            'contato_email' => 'dois@loja.com',
            'status' => RevendaLead::STATUS_CONTATADO,
        ]);

        $token = $this->obterTokenDoUsuario($industria);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/v2/revenda-leads");

        $response->assertStatus(200);
        $data = $response->json('leads.data');
        $this->assertCount(2, $data);
    }

    public function test_loja_lista_apenas_seus_proprios_leads(): void
    {
        $tipoRet = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);

        $lojista = User::factory()->create([
            'email' => 'lojista.próprio@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);
        $outro = User::factory()->create([
            'email' => 'lojista.outro@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);

        RevendaLead::create([
            'user_id' => $lojista->id,
            'nome_empresa' => 'Minha Loja',
            'cnpj' => '44.444.444/0001-44',
            'contato_nome' => 'Eu',
            'contato_email' => 'eu@minhaloja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);
        RevendaLead::create([
            'user_id' => $outro->id,
            'nome_empresa' => 'Loja do Outro',
            'cnpj' => '55.555.555/0001-55',
            'contato_nome' => 'Outro',
            'contato_email' => 'outro@outro.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);

        $token = $this->obterTokenDoUsuario($lojista);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/v2/revenda-leads");

        $response->assertStatus(200);
        $data = $response->json('leads.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Minha Loja', $data[0]['nome_empresa']);
    }

    public function test_filtrar_leads_por_status(): void
    {
        $tipoInd = UserType::firstOrCreate(['nome' => 'industry'], ['nome' => 'industry']);
        $tipoRet = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);

        $industria = User::factory()->create([
            'email' => 'industria.filtro@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoInd->id,
        ]);
        $lojista = User::factory()->create([
            'email' => 'lojista.filtro@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);

        RevendaLead::create([
            'user_id' => $lojista->id,
            'nome_empresa' => 'Loja Novo',
            'cnpj' => '66.666.666/0001-66',
            'contato_nome' => 'Novo',
            'contato_email' => 'novo@loja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);
        RevendaLead::create([
            'user_id' => $lojista->id,
            'nome_empresa' => 'Loja Contatado',
            'cnpj' => '77.777.777/0001-77',
            'contato_nome' => 'Contatado',
            'contato_email' => 'contatado@loja.com',
            'status' => RevendaLead::STATUS_CONTATADO,
        ]);

        $token = $this->obterTokenDoUsuario($industria);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/v2/revenda-leads?status=" . RevendaLead::STATUS_CONTATADO);

        $response->assertStatus(200);
        $data = $response->json('leads.data');
        $this->assertCount(1, $data);
        $this->assertEquals(RevendaLead::STATUS_CONTATADO, $data[0]['status']);
    }

    public function test_industria_atualiza_status_do_lead_retorna_200(): void
    {
        $tipoInd = UserType::firstOrCreate(['nome' => 'industry'], ['nome' => 'industry']);
        $tipoRet = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);

        $industria = User::factory()->create([
            'email' => 'industria.upd@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoInd->id,
        ]);
        $lojista = User::factory()->create([
            'email' => 'lojista.upd@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);

        $lead = RevendaLead::create([
            'user_id' => $lojista->id,
            'nome_empresa' => 'Loja Atualizacao',
            'cnpj' => '88.888.888/0001-88',
            'contato_nome' => 'Upd',
            'contato_email' => 'upd@loja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);

        $token = $this->obterTokenDoUsuario($industria);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->put("{$this->base}/v2/revenda-leads/{$lead->id}", [
                'status' => RevendaLead::STATUS_CONTATADO,
                'notas_internas' => 'Cliente em analise de credito.',
            ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => RevendaLead::STATUS_CONTATADO]);
        $this->assertDatabaseHas('revenda_leads', [
            'id' => $lead->id,
            'status' => RevendaLead::STATUS_CONTATADO,
            'notas_internas' => 'Cliente em analise de credito.',
        ]);
    }

    public function test_loja_nao_pode_atualizar_status_de_outro_lead_retorna_403(): void
    {
        $tipoRet = UserType::firstOrCreate(['nome' => 'retailer'], ['nome' => 'retailer']);

        $lojista = User::factory()->create([
            'email' => 'lojista.noupd@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);
        $outro = User::factory()->create([
            'email' => 'lojista.outro.noupd@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoRet->id,
        ]);

        $lead = RevendaLead::create([
            'user_id' => $outro->id,
            'nome_empresa' => 'Loja Protegida',
            'cnpj' => '99.999.999/0001-99',
            'contato_nome' => 'Protegido',
            'contato_email' => 'protegido@loja.com',
            'status' => RevendaLead::STATUS_NOVO,
        ]);

        $token = $this->obterTokenDoUsuario($lojista);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->put("{$this->base}/v2/revenda-leads/{$lead->id}", [
                'status' => RevendaLead::STATUS_FECHADO,
            ])
            ->assertStatus(403);
    }

    public function test_endpoints_sem_token_retornam_401(): void
    {
        $this->post("{$this->base}/v2/revenda-leads", [
            'nome_empresa' => 'Loja',
            'cnpj' => '12.345.678/0001-12',
            'contato_nome' => 'X',
            'contato_email' => 'x@x.com',
        ])->assertStatus(401);

        $this->get("{$this->base}/v2/revenda-leads")->assertStatus(401);
    }

    /* Helpers ----------------------------------------------------------- */

    private function obterTokenDoUsuario(User $user): string
    {
        $login = $this->post("{$this->base}/login", [
            'email' => $user->email,
            'password' => 'senha123',
        ]);
        $login->assertStatus(200);
        return $login->json('token');
    }
}
