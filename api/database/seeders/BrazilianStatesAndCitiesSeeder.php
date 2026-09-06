<?php

namespace Database\Seeders;

use App\Models\Neighborhood;
use App\Models\Street;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportStreetsByNeighborhoodSeeder extends Seeder
{
    protected Client $client;

    protected array $endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.private.coffee/api/interpreter',
    ];

    protected string $progressFile = 'import_streets_progress.json';

    protected int $delay = 2;

    public function run(): void
    {
        $this->client = new Client([
            'timeout' => 180,
            'connect_timeout' => 30,
        ]);

        $progress = $this->getProgress();

        $lastNeighborhoodId = $progress['last_neighborhood_id'] ?? 0;

        $neighborhoods = Neighborhood::with([
            'city.state.country'
        ])
            ->where('id', '>', $lastNeighborhoodId)
            ->orderBy('id')
            ->get();

        if ($neighborhoods->isEmpty()) {
            $this->command->info(
                'Todos os bairros já foram processados.'
            );

            return;
        }

        $this->command->info(
            "Iniciando importação de ruas para {$neighborhoods->count()} bairros."
        );

        foreach ($neighborhoods as $neighborhood) {

            $this->command->newLine();

            $this->command->info(
                "=============================================="
            );

            $this->command->info(
                "Processando bairro: {$neighborhood->name}"
            );

            $this->command->info(
                "ID do bairro: {$neighborhood->id}"
            );

            $city = $neighborhood->city;

            if (!$city) {
                $this->command->warn(
                    'Bairro sem cidade associada. Pulando.'
                );

                $this->saveProgress($neighborhood->id);

                continue;
            }

            $state = $city->state;

            if (!$state) {
                $this->command->warn(
                    "Cidade {$city->name} sem estado associado. Pulando."
                );

                $this->saveProgress($neighborhood->id);

                continue;
            }

            $this->command->line(
                "Cidade: {$city->name}"
            );

            $this->command->line(
                "Estado: {$state->abbreviation}"
            );

            /*
             * Busca as ruas do bairro no OpenStreetMap.
             */
            $streets = $this->getStreetsByNeighborhood(
                $neighborhood->name,
                $city->name,
                $state->abbreviation
            );

            if (empty($streets)) {

                $this->command->warn(
                    "Nenhuma rua encontrada para {$neighborhood->name}."
                );

                $this->saveProgress($neighborhood->id);

                sleep($this->delay);

                continue;
            }

            /*
             * Remove duplicidades pelo nome.
             */
            $streets = collect($streets)
                ->filter(function ($street) {
                    return !empty($street['name']);
                })
                ->unique(function ($street) {
                    return mb_strtolower(
                        trim($street['name'])
                    );
                })
                ->values();

            $this->command->info(
                "Ruas encontradas: {$streets->count()}"
            );

            /*
             * Monta os registros para inserção.
             */
            $insert = [];

            foreach ($streets as $street) {

                $name = trim($street['name']);

                if ($name === '') {
                    continue;
                }

                $insert[] = [
                    'name' => $name,
                    'neighborhood_id' => $neighborhood->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            /*
             * Insere as ruas evitando duplicidade.
             */
            if (!empty($insert)) {

                Street::upsert(
                    $insert,
                    [
                        'name',
                        'neighborhood_id',
                    ],
                    [
                        'updated_at',
                    ]
                );

                $this->command->info(
                    "✓ {$streets->count()} ruas associadas ao bairro."
                );
            }

            /*
             * Salva o progresso.
             */
            $this->saveProgress(
                $neighborhood->id
            );

            sleep($this->delay);
        }

        $this->command->newLine();

        $this->command->info(
            '=============================================='
        );

        $this->command->info(
            'Importação de ruas concluída!'
        );

        $this->clearProgress();
    }

    /**
     * Busca as ruas pertencentes ao bairro.
     */
    protected function getStreetsByNeighborhood(
        string $neighborhoodName,
        string $cityName,
        string $stateAbbreviation
    ): array {

        $neighborhoodName = $this->escapeOverpass(
            $neighborhoodName
        );

        $cityName = $this->escapeOverpass(
            $cityName
        );

        $stateAbbreviation = $this->escapeOverpass(
            $stateAbbreviation
        );

        /*
         * Primeiro tenta encontrar uma área OSM
         * correspondente ao bairro.
         */
        $query = <<<OVERPASS
[out:json][timeout:120];

area
    ["name"="$neighborhoodName"]
    ["place"~"suburb|neighbourhood"];

way(area)
    ["highway"]
    ["name"];

out tags;
OVERPASS;

        $result = $this->executeOverpassQuery(
            $query
        );

        if (!empty($result)) {
            return $result;
        }

        /*
         * Segunda tentativa:
         * bairro cadastrado como boundary.
         */
        $query = <<<OVERPASS
[out:json][timeout:120];

area
    ["name"="$neighborhoodName"]
    ["boundary"="administrative"];

way(area)
    ["highway"]
    ["name"];

out tags;
OVERPASS;

        $result = $this->executeOverpassQuery(
            $query
        );

        if (!empty($result)) {
            return $result;
        }

        /*
         * Fallback:
         * procura endereços que tenham o bairro.
         */
        $query = <<<OVERPASS
[out:json][timeout:120];

area
    ["name"="$cityName"]
    ["boundary"="administrative"]
    ->.city;

(
    way(area.city)
        ["highway"]
        ["name"]
        ["addr:suburb"="$neighborhoodName"];

    way(area.city)
        ["highway"]
        ["name"]
        ["addr:neighbourhood"="$neighborhoodName"];
);

out tags;
OVERPASS;

        return $this->executeOverpassQuery(
            $query
        );
    }

    /**
     * Executa consulta no Overpass.
     */
    protected function executeOverpassQuery(
        string $query
    ): array {

        $lastError = null;

        foreach ($this->endpoints as $endpoint) {

            try {

                $this->command->line(
                    "Consultando: {$endpoint}"
                );

                $response = $this->client->get(
                    $endpoint,
                    [
                        'query' => [
                            'data' => $query,
                        ],

                        'headers' => [
                            'User-Agent' =>
                                'Laravel-Street-Importer/1.0',

                            'Accept' =>
                                'application/json',
                        ],

                        'timeout' => 180,
                    ]
                );

                $body = $response
                    ->getBody()
                    ->getContents();

                $data = json_decode(
                    $body,
                    true
                );

                if (
                    !is_array($data) ||
                    !isset($data['elements'])
                ) {
                    throw new \RuntimeException(
                        'Resposta inválida do Overpass.'
                    );
                }

                $streets = [];

                foreach ($data['elements'] as $element) {

                    if (
                        ($element['type'] ?? null) !== 'way'
                    ) {
                        continue;
                    }

                    $tags = $element['tags'] ?? [];

                    $name = $tags['name'] ?? null;

                    if (!$name) {
                        continue;
                    }

                    $key = mb_strtolower(
                        trim($name)
                    );

                    $streets[$key] = [
                        'name' => trim($name),
                        'osm_id' => $element['id'] ?? null,
                        'highway_type' =>
                            $tags['highway'] ?? null,
                    ];
                }

                $streets = array_values(
                    $streets
                );

                $this->command->line(
                    'Vias com nome encontradas: ' .
                    count($streets)
                );

                return $streets;

            } catch (GuzzleException $e) {

                $lastError = $e;

                $this->command->warn(
                    "Endpoint falhou: {$e->getMessage()}"
                );

                sleep(2);

                continue;

            } catch (\Throwable $e) {

                $lastError = $e;

                $this->command->warn(
                    "Erro: {$e->getMessage()}"
                );

                continue;
            }
        }

        Log::error(
            'Todos os endpoints Overpass falharam.',
            [
                'error' => $lastError?->getMessage(),
            ]
        );

        $this->command->error(
            'Todos os endpoints Overpass falharam.'
        );

        return [];
    }

    /**
     * Escapa caracteres especiais do Overpass.
     */
    protected function escapeOverpass(
        string $value
    ): string {

        return str_replace(
            [
                '\\',
                '"',
            ],
            [
                '\\\\',
                '\\"',
            ],
            $value
        );
    }

    /**
     * Recupera o progresso.
     */
    protected function getProgress(): array
    {
        if (!Storage::exists($this->progressFile)) {
            return [
                'last_neighborhood_id' => 0,
            ];
        }

        $content = Storage::get(
            $this->progressFile
        );

        $progress = json_decode(
            $content,
            true
        );

        return is_array($progress)
            ? $progress
            : [
                'last_neighborhood_id' => 0,
            ];
    }

    /**
     * Salva o progresso.
     */
    protected function saveProgress(
        int $neighborhoodId
    ): void {

        Storage::put(
            $this->progressFile,
            json_encode(
                [
                    'last_neighborhood_id' =>
                        $neighborhoodId,
                ],
                JSON_PRETTY_PRINT
            )
        );
    }

    /**
     * Limpa o progresso.
     */
    protected function clearProgress(): void
    {
        if (Storage::exists($this->progressFile)) {
            Storage::delete(
                $this->progressFile
            );
        }
    }
}