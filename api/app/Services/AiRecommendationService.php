<?php

namespace App\Services;

use App\Models\ServiceCategory;
use App\Models\ServiceListing;
use Illuminate\Support\Facades\Http;

/**
 * Serviço de recomendação por IA (Escopo B3).
 *
 * Sugere uma categoria de serviço (e prestadores dessa categoria) a partir da
 * descricao livre do problema feita pelo cliente.
 *
 * Quando as credenciais de um provedor de IA estiverem configuradas
 * (services.ai_recommendation.endpoint + api_key), a chamada e feita ao provedor
 * externo. Em qualquer falha (timeout, nao configurado, resposta invalida) o
 * servico recai para uma heuristica local baseada em palavras-chave, de forma
 * que o fluxo funcione offline e em testes sem expor credenciais.
 */
class AiRecommendationService
{
    /** Palavras-chave (portugues) associadas a cada slug de categoria. */
    protected const KEYWORDS = [
        'encanador' => ['vazamento', 'cano', 'torneira', 'pia', 'vaso', 'sanitario', 'entupido', 'hidraulica', 'esgoto', 'chuveiro', 'desentupir'],
        'eletricista' => ['energia', 'tomada', 'fio', 'disjuntor', 'lampada', 'circuito', 'curto', 'rele', 'chave', 'eletrica', 'iluminacao'],
        'limpeza' => ['limpeza', 'faxina', 'arrumacao', 'limpar', 'domestica', 'residencial', 'comercial'],
        'jardineiro' => ['jardim', 'grama', 'planta', 'poda', 'paisagismo', 'arvore', 'jardineiro'],
        'pintor' => ['pintura', 'parede', 'pintar', 'pintor', 'tinta', 'reforma de parede'],
        'mecanico' => ['carro', 'veiculo', 'motor', 'freio', 'oleo', 'revisao', 'mecanica', 'automotiva'],
        'eletronicos' => ['celular', 'computador', 'notebook', 'tablet', 'eletronico', 'consertar aparelho'],
        'carpinteiro' => ['madeira', 'moveis', 'porta', 'janela', 'marcenaria', 'carpinteiro'],
        'pedreiro' => ['alvenaria', 'obra', 'parede de tijolo', 'cimento', 'pedreiro', 'reforma'],
        'faxineiro' => ['faxina', 'arrumacao', 'limpeza leve', 'domestica'],
    ];

    public function __construct(
        protected string $provider = 'heuristic',
        protected string $endpoint = '',
        protected string $apiKey = '',
        protected string $model = '',
        protected int $timeout = 5,
    ) {}

    public static function makeFromConfig(): self
    {
        $config = config('services.ai_recommendation', []);

        return new self(
            provider:     $config['provider'] ?? 'heuristic',
            endpoint:     $config['endpoint'] ?? '',
            apiKey:       $config['api_key'] ?? '',
            model:        $config['model'] ?? '',
            timeout:      (int) ($config['timeout'] ?? 5),
        );
    }

    /**
     * Sugere a categoria de servico mais adequada ao problema descrito.
     *
     * Retorna:
     *  ['category' => ServiceCategory|null,
     *   'suggested_category_name' => string|null,
     *   'confidence' => float,
     *   'providers' => Collection,
     *   'reason' => string,
     *   'ai_provider' => string]
     */
    public function suggest(string $problemDescription): array
    {
        $categories = ServiceCategory::all();

        $aiResult = $this->askAi($problemDescription, $categories);
        if ($aiResult !== null) {
            return $aiResult;
        }

        return $this->heuristic($problemDescription, $categories);
    }

    protected function askAi(string $problemDescription, \Illuminate\Database\Eloquent\Collection $categories): ?array
    {
        if ($this->provider === 'heuristic' || empty($this->endpoint) || empty($this->apiKey)) {
            return null;
        }

        try {
            $categoryList = $categories->map(fn ($c) => "- {$c->name} ({$c->slug}): {$c->description}")->implode("\n");

            $response = Http::timeout($this->timeout)->withToken($this->apiKey)->post($this->endpoint, [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Voce e um assistente que sugere a categoria de servico mais adequada a um problema. Responda apenas em JSON com as chaves: category_slug, confidence (0 a 100) e reason. Escolha entre as categorias disponiveis.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Problema: {$problemDescription}\n\nCategorias disponiveis:\n{$categoryList}",
                    ],
                ],
            ]);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            $slug = $data['category_slug'] ?? null;
            if (! $slug) {
                return null;
            }

            $category = $categories->firstWhere('slug', $slug);
            if (! $category) {
                $category = $categories->firstWhere('name', 'like', "%{$slug}%");
            }

            return [
                'category' => $category,
                'suggested_category_name' => $category?->name ?? null,
                'confidence' => (float) ($data['confidence'] ?? 0),
                'providers' => $category?->listings()
                    ->where('is_active', true)
                    ->orderByDesc('average_rating')
                    ->limit(5)
                    ->get() ?? collect(),
                'reason' => $data['reason'] ?? 'Sugestao gerada por IA.',
                'ai_provider' => $this->provider,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function heuristic(string $problemDescription, \Illuminate\Database\Eloquent\Collection $categories): array
    {
        $text = mb_strtolower($problemDescription);

        $bestCategory = null;
        $bestScore = 0;
        $bestMatched = 0;

        foreach ($categories as $category) {
            $keywords = self::KEYWORDS[$category->slug] ?? [];
            $matched = 0;
            foreach ($keywords as $keyword) {
                if (mb_str_contains($text, mb_strtolower($keyword))) {
                    $matched++;
                }
            }
            if ($matched > $bestScore) {
                $bestCategory = $category;
                $bestScore = $matched;
                $bestMatched = $matched;
            }
        }

        $totalKeywords = $bestCategory ? count(self::KEYWORDS[$bestCategory->slug] ?? []) : 0;
        $confidence = $bestScore > 0 && $totalKeywords > 0
            ? (float) round(min(95, 50 + ($bestScore / $totalKeywords) * 45), 2)
            : 0.0;

        return [
            'category' => $bestCategory,
            'suggested_category_name' => $bestCategory?->name,
            'confidence' => $confidence,
            'providers' => $bestCategory?->listings()
                ->where('is_active', true)
                ->orderByDesc('average_rating')
                ->limit(5)
                ->get() ?? collect(),
            'reason' => $bestScore > 0
                ? "Palavras-chave encontradas: {$bestScore} correspondencia(s) na categoria {$bestCategory->name}."
                : 'Nenhuma palavra-chave relevante encontrada. Categoria nao sugerida.',
            'ai_provider' => 'heuristic',
        ];
    }

    public function providersOfCategory(ServiceCategory $category): \Illuminate\Database\Eloquent\Collection
    {
        return $category->listings()
            ->where('is_active', true)
            ->orderByDesc('average_rating')
            ->limit(5)
            ->get();
    }
}
