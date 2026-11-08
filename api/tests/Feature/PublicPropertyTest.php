<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Country;
use App\Models\Neighborhood;
use App\Models\Product;
use App\Models\Property;
use App\Models\State;
use App\Models\Street;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPropertyTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2/public/properties';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    private function criarCadeiaEndereco(): array
    {
        $pais = Country::create(['name' => 'Brasil']);
        $estado = State::create(['name' => 'São Paulo', 'abbreviation' => 'SP', 'country_id' => $pais->id]);
        $cidade = City::create(['name' => 'São Paulo', 'state_id' => $estado->id]);
        $bairro = Neighborhood::create(['name' => 'Jardins', 'city_id' => $cidade->id]);
        $rua = Street::create(['name' => 'Rua dos Publicos', 'neighborhood_id' => $bairro->id]);

        return compact('pais', 'estado', 'cidade', 'bairro', 'rua');
    }

    private function criarUsuarioProprietario(): User
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        return User::create([
            'name' => 'Proprietario Publico',
            'email' => 'proprietario.publico@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
    }

    /** Vitrine publica --------------------------------------------------- */

    public function test_listar_propriedades_publicas_sem_autenticacao_retorna_200(): void
    {
        $endereco = $this->criarCadeiaEndereco();
        $usuario = $this->criarUsuarioProprietario();

        Property::create([
            'name' => 'Loja Vitrine 1',
            'n_property' => '101',
            'street_id' => $endereco['rua']->id,
            'user_id' => $usuario->id,
            'latitude' => -23.5505,
            'longitude' => -46.6333,
        ]);

        Property::create([
            'name' => 'Loja Vitrine 2',
            'n_property' => '102',
            'street_id' => $endereco['rua']->id,
            'user_id' => $usuario->id,
        ]);

        // Sem token: endpoint publico deve responder 200.
        $this->get($this->base)
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'meta'])
            ->assertJsonCount(2, 'data');
    }

    public function test_listar_propriedades_publicas_filtra_por_cidade_estado_pais(): void
    {
        $endereco = $this->criarCadeiaEndereco();
        $usuario = $this->criarUsuarioProprietario();

        Property::create([
            'name' => 'Loja SP',
            'street_id' => $endereco['rua']->id,
            'user_id' => $usuario->id,
        ]);

        $outro = $this->criarCadeiaEndereco();
        $outro['estado']->update(['name' => 'Minas Gerais']);
        Property::create([
            'name' => 'Loja MG',
            'street_id' => Street::create(['name' => 'Rua Outra', 'neighborhood_id' => $outro['bairro']->id])->id,
            'user_id' => $usuario->id,
        ]);

        $this->get($this->base . '?city=Sao Paulo')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->get($this->base . '?state=Minas Gerais')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->get($this->base . '?country=Brasil')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_obter_propriedade_publica_por_id_retorna_dados_completos(): void
    {
        $endereco = $this->criarCadeiaEndereco();
        $usuario = $this->criarUsuarioProprietario();
        $propriedade = Property::create([
            'name' => 'Loja Detalhe',
            'n_property' => '201',
            'complement' => 'Sala 10',
            'contact1_email' => 'loja@teste.com',
            'contact2_email' => 'contato@teste.com',
            'number1' => '+5511999990000',
            'street_id' => $endereco['rua']->id,
            'user_id' => $usuario->id,
            'latitude' => -23.5505,
            'longitude' => -46.6333,
        ]);
        Product::create([
            'name' => 'Produto Vitrine',
            'tipo' => 'geral',
            'price' => 19.90,
            'disabled' => false,
            'user_id' => $usuario->id,
            'property_id' => $propriedade->id,
        ]);

        $this->get("{$this->base}/{$propriedade->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $propriedade->id, 'name' => 'Loja Detalhe'])
            ->assertJsonFragment(['address' => 'Rua dos Publicos', 'city' => 'São Paulo', 'state' => 'São Paulo', 'country' => 'Brasil'])
            ->assertJsonFragment(['owner_name' => 'Proprietario Publico', 'owner_tipo' => 'user'])
            ->assertJsonStructure(['data' => ['id', 'name', 'products']]);
    }

    public function test_propriedade_publica_inexistente_retorna_404(): void
    {
        $this->get("{$this->base}/999999")->assertStatus(404);
    }
}
