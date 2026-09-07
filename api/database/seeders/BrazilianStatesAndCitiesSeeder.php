<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use App\Models\State;
use App\Models\Country;
use App\Models\City;

class BrazilianStatesAndCitiesSeeder extends Seeder
{
    public function run()
    {
        // 1. Buscar o JSON da URL
        $response = Http::get('https://gist.githubusercontent.com/letanure/3012978/raw');
        $data = $response->json();

        // 2. Verificar se os dados vieram corretamente
        if (!isset($data['estados']) || !is_array($data['estados'])) {
            $this->command->error('Formato do JSON inválido.');
            return;
        }

        // 3. Percorrer cada estado
        
        $country = Country::firstOrCreate([
            'name' => 'Brasil'
        ]);
        
        foreach ($data['estados'] as $estadoData) {
            // Criar o estado
            $state = State::create([
                'abbreviation' => $estadoData['sigla'],
                'name'         => $estadoData['nome'],
                'country_id'   => $country->id
            ]);

            // Percorrer as cidades e criar cada uma
            foreach ($estadoData['cidades'] as $cidadeNome) {
                City::create([
                    'state_id' => $state->id,
                    'name'     => $cidadeNome,
                ]);
            }
        }

        $this->command->info('Estados e cidades importados com sucesso!');
    }
}