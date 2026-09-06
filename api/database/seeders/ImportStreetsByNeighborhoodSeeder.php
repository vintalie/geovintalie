<?php

namespace Database\Seeders;

use App\Models\Neighborhood;
use App\Models\Street;
use App\Models\City;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportStreetsByNeighborhoodSeeder extends Seeder
{
    protected $client;
    protected $endpoints = [
        'https://z.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass-api.de/api/interpreter',
        'https://overpass.private.coffee/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
    ];

    // Arquivo para salvar progresso
    protected $progressFile = 'import_streets_progress.json';

    // Delay entre requisições (segundos)
    protected $delay = 2;

    public function run()
    {
        $this->client = new Client([
            'timeout' => 60,
            'connect_timeout' => 30,
        ]);

        // Carregar progresso
        $progress = $this->getProgress();
        $lastNeighborhoodId = $progress['last_neighborhood_id'] ?? 0;

        // Buscar bairros a partir do último ID processado
        $neighborhoods = Neighborhood::where('id', '>', $lastNeighborhoodId)
            ->orderBy('id')
            ->get();

        if ($neighborhoods->isEmpty()) {
            $this->command->info("Todos os bairros já foram processados.");
            return;
        }

        $this->command->info("Iniciando importação de ruas para " . $neighborhoods->count() . " bairros.");

        foreach ($neighborhoods as $neighborhood) {
            $this->command->info("Processando bairro: {$neighborhood->name} (ID: {$neighborhood->id})");

            // Obter a cidade associada
            $city = $neighborhood->city;
            if (!$city) {
                $this->command->warn("  Bairro sem cidade associada. Pulando.");
                $this->saveProgress($neighborhood->id);
                continue;
            }

            // Obter bounding box da cidade
            $bbox = $this->getCityBbox($city);
            if (!$bbox) {
                $this->command->warn("  Não foi possível obter bbox para a cidade {$city->name}. Pulando.");
                $this->saveProgress($neighborhood->id);
                continue;
            }

            // Buscar ruas via Overpass com filtro addr:neighbourhood
            $streetsData = $this->getStreetsByNeighborhood($neighborhood->name, $bbox);

            if (empty($streetsData)) {
                $this->command->warn("  Nenhuma rua encontrada para o bairro {$neighborhood->name}.");
            } else {
                $count = 0;
                foreach ($streetsData as $streetInfo) {
                    if (empty($streetInfo['name'])) continue;
                    Street::firstOrCreate([
                        'name'             => $streetInfo['name'],
                        'neighborhood_id'  => $neighborhood->id,
                    ]);
                    $count++;
                }
                $this->command->info("  Importadas {$count} ruas para o bairro {$neighborhood->name}.");
            }

            // Salvar progresso
            $this->saveProgress($neighborhood->id);

            // Aguardar para respeitar rate limit
            sleep($this->delay);
        }

        $this->command->info("Importação concluída!");
        // Limpar progresso
        $this->clearProgress();
    }

    /**
     * Obtém a bounding box da cidade usando coordenadas (se disponíveis) ou Nominatim.
     */
    protected function getCityBbox($city)
    {
        // Se a cidade tiver latitude/longitude, usar com delta
        if (isset($city->latitude) && isset($city->longitude) && $city->latitude && $city->longitude) {
            $delta = 0.045;
            return [
                'min_lat' => $city->latitude - $delta,
                'max_lat' => $city->latitude + $delta,
                'min_lon' => $city->longitude - $delta,
                'max_lon' => $city->longitude + $delta,
            ];
        }

        // Fallback: usar Nominatim para obter bbox da cidade pelo nome
        try {
            $query = http_build_query([
                'q' => $city->name . ', ' . ($city->state->abbreviation ?? '') . ', Brazil',
                'format' => 'json',
                'limit' => 1,
            ]);

            $response = $this->client->get('https://nominatim.openstreetmap.org/search?' . $query, [
                'headers' => ['User-Agent' => 'Laravel Seeder (contato@seudominio.com)'],
                'timeout' => 30,
            ]);

            $data = json_decode($response->getBody(), true);
            if (!empty($data) && isset($data[0]['boundingbox'])) {
                $place = $data[0];
                return [
                    'min_lat' => (float)$place['boundingbox'][0],
                    'max_lat' => (float)$place['boundingbox'][1],
                    'min_lon' => (float)$place['boundingbox'][2],
                    'max_lon' => (float)$place['boundingbox'][3],
                ];
            }
        } catch (\Exception $e) {
            Log::warning("Nominatim falhou para {$city->name}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Busca ruas no Overpass filtrando por addr:neighbourhood e dentro da bbox.
     */
    protected function getStreetsByNeighborhood($neighborhoodName, $bbox)
    {
        $query = sprintf(
            '[out:json][timeout:90];
            (
              way["highway"]["addr:neighbourhood"="%s"](%f,%f,%f,%f);
            );
            out body;
            >;
            out skel qt;',
            addslashes($neighborhoodName),
            $bbox['min_lat'],
            $bbox['min_lon'],
            $bbox['max_lat'],
            $bbox['max_lon']
        );

        return $this->executeOverpassQuery($query);
    }

    /**
     * Executa uma query Overpass e retorna array de ruas.
     */
    protected function executeOverpassQuery($query)
    {
        $lastError = null;

        foreach ($this->endpoints as $endpoint) {
            try {
                $this->command->line("  Tentando endpoint: {$endpoint}");

                $response = $this->client->get($endpoint, [
                    'query' => ['data' => $query],
                    'headers' => [
                        'User-Agent' => 'LaravelSeeder/1.0 (contato@seudominio.com)',
                        'Accept' => 'application/json',
                        'Accept-Language' => 'en-US,en;q=0.9',
                    ],
                    'timeout' => 180,
                ]);

                $data = json_decode($response->getBody(), true);
                $totalElements = count($data['elements']);
                $this->command->line("  ✓ Overpass retornou {$totalElements} elementos.");

                $streets = [];
                foreach ($data['elements'] as $element) {
                    if ($element['type'] === 'way' && isset($element['tags']['highway'])) {
                        $name = $element['tags']['name'] ?? null;
                        if (empty($name)) continue;
                        $streets[] = [
                            'osm_id' => $element['id'],
                            'name' => $name,
                            'highway_type' => $element['tags']['highway'],
                            'tags' => $element['tags'],
                        ];
                    }
                }

                $this->command->line("  Vias com nome: " . count($streets));
                return $streets;

            } catch (ServerException $e) {
                $statusCode = $e->getResponse()->getStatusCode();
                $lastError = $e;
                $this->command->warn("  Endpoint {$endpoint} falhou (HTTP {$statusCode}): " . $e->getMessage());
                if (in_array($statusCode, [504, 502, 503])) {
                    continue;
                }
                if ($statusCode === 429) {
                    $this->command->warn("  Rate limit atingido. Aguardando 5 segundos...");
                    sleep(5);
                    continue;
                }
                continue;
            } catch (\Exception $e) {
                $lastError = $e;
                $this->command->warn("  Endpoint {$endpoint} falhou: " . $e->getMessage());
                continue;
            }
        }

        $this->command->error("  Todos os endpoints falharam. Último erro: " . ($lastError ? $lastError->getMessage() : 'Desconhecido'));
        Log::error("Overpass: todos os endpoints falharam para query: " . substr($query, 0, 200));
        return [];
    }

    /**
     * Obtém o progresso salvo.
     */
    protected function getProgress()
    {
        if (Storage::exists($this->progressFile)) {
            $content = Storage::get($this->progressFile);
            return json_decode($content, true) ?? ['last_neighborhood_id' => 0];
        }
        return ['last_neighborhood_id' => 0];
    }

    /**
     * Salva o progresso (ID do último bairro processado).
     */
    protected function saveProgress($neighborhoodId)
    {
        Storage::put($this->progressFile, json_encode(['last_neighborhood_id' => $neighborhoodId]));
    }

    /**
     * Limpa o arquivo de progresso após conclusão.
     */
    protected function clearProgress()
    {
        if (Storage::exists($this->progressFile)) {
            Storage::delete($this->progressFile);
        }
    }
}