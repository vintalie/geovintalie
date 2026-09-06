<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use App\Models\State;
use App\Models\Country;
use App\Models\City;
use App\Models\Neighborhood;

class NeighborhoodSeeder extends Seeder
{
    public function run(): void
    {
        // Verifica se o país existe (já criado na outra seed)
        $country = Country::first();
        if (!$country) {
            $this->command->error('País "Brasil" não encontrado. Execute primeiro a seed de estados/cidades.');
            return;
        }

        $this->command->info('Baixando JSON...');
        $response = Http::get('https://raw.githubusercontent.com/RonaldTheodoro/Estados-Cidades-e-Bairros/refs/heads/master/data.json');
        
        if (!$response->successful()) {
            $this->command->error('Falha ao baixar o arquivo JSON. Status: ' . $response->status());
            return;
        }

        $data = $response->json();
        if (empty($data)) {
            $this->command->error('JSON vazio ou inválido.');
            return;
        }

        $this->command->info('JSON baixado com sucesso. Processando...');
        $total = 0;

        foreach ($data as $uf => $cidades) {
            // Busca o estado pela sigla
            $state = State::where('abbreviation', $uf)
                          ->where('country_id', $country->id)
                          ->first();

            if (!$state) {
                $this->command->warn("Estado {$uf} não encontrado no banco. Pulando...");
                continue;
            }

            $this->command->line("Processando estado: {$uf}");

            foreach ($cidades as $cidadeNome => $bairros) {
                // Busca a cidade
                $city = City::where('name', $cidadeNome)
                            ->where('state_id', $state->id)
                            ->first();

                if (!$city) {
                    $this->command->warn("  Cidade {$cidadeNome} não encontrada no estado {$uf}. Pulando...");
                    continue;
                }

                $this->command->line("  Cidade: {$cidadeNome} - " . count($bairros) . " bairros");

                foreach ($bairros as $bairroNome) {
                    // Cria apenas se não existir (evita duplicidade)
                    $neighborhood = Neighborhood::firstOrCreate([
                        'name' => $bairroNome,
                        'city_id' => $city->id,
                    ]);

                    if ($neighborhood->wasRecentlyCreated) {
                        $total++;
                    }
                }
            }
        }

        $this->command->info("Importação concluída! {$total} novos bairros criados.");
    }
}