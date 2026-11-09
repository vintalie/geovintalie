<?php

namespace App\Services;

use Illuminate\Support\Str;

class LandingPageGenerationService
{
    /**
     * Gera o conteudo completo de uma landing page otimizada para SEO local.
     *
     * @param array $data {
     *     title?: string,
     *     slug?: string,
     *     city: string,
     *     state: string,
     *     country: string,
     *     neighborhood?: string,
     *     activity?: string,
     * }
     * @return array{
     *     title: string,
     *     slug: string,
     *     city: string,
     *     state: string,
     *     country: string,
     *     neighborhood: string|null,
     *     activity: string,
     *     meta_title: string,
     *     meta_description: string,
     *     h1: string,
     *     content: string,
     *     structured_data: array
     * }
     */
    public function generate(array $data): array
    {
        $city = $data['city'] ?? '';
        $state = $data['state'] ?? '';
        $country = $data['country'] ?? '';
        $neighborhood = $data['neighborhood'] ?? null;
        $activity = $data['activity'] ?? 'comercio local';
        $title = $data['title'] ?? "{$activity} em {$city}";

        $slug = Str::slug($data['slug'] ?? "{$activity}-{$city}-{$state}");

        $local = $neighborhood ? "{$neighborhood}, {$city}" : $city;
        $metaTitle = "{$activity} em {$city} - {$state}, {$country} | GeoVintalie";
        $metaDescription = "Encontre {$activity} em {$local} com atendimento proximo a você. Servicos e produtos locais cadastrados no GeoVintalie em {$state}, {$country}.";
        $h1 = "{$activity} em {$city}";

        $content = $this->buildContent($title, $activity, $local, $city, $state, $country, $neighborhood);

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $title,
            'description' => $metaDescription,
            'url' => null, // preenchido pelo controller com a URL canonica da pagina
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => $city,
                'addressRegion' => $state,
                'addressCountry' => $country,
            ],
        ];

        if ($neighborhood) {
            $structuredData['address']['addressLocality'] = $neighborhood;
        }

        return compact(
            'title',
            'slug',
            'city',
            'state',
            'country',
            'neighborhood',
            'activity',
            'metaTitle',
            'metaDescription',
            'h1',
            'content',
            'structuredData'
        );
    }

    private function buildContent(
        string $title,
        string $activity,
        string $local,
        string $city,
        string $state,
        string $country,
        ?string $neighborhood
    ): string {
        $bairroTrecho = $neighborhood ? "no bairro {$neighborhood}" : '';
        $cidadeEstado = "{$city}, {$state}";

        return <<<HTML
<h1>{$title}</h1>
<p>Procurando por <strong>{$activity}</strong> em {$local}? Conheça as melhores opções de {$activity} em {$cidadeEstado}, {$country}, com foco no atendimento local e proximidade ao seu negócio.</p>

<h2>Por que escolher {$activity} em {$city}?</h2>
<p>O {$activity} local em {$local} oferece atendimento personalizado, produtos de qualidade e a confiança do comércio próximo a você. Seja para consumo próprio ou revenda, os estabelecimentos de {$activity} na região de {$cidadeEstado} estão prontos para atendê-lo.</p>

<h2>Como encontrar {$activity} perto de você</h2>
<ol>
    <li>Busque por {$activity} na cidade de {$city} {$bairroTrecho}.</li>
    <li>Compare endereços, telefones e horários de funcionamento dos estabelecimentos cadastrados.</li>
    <li>Entre em contato diretamente com o lojista ou prestador de {$activity} da sua região.</li>
</ol>

<h2>Cadastre seu {$activity} no GeoVintalie</h2>
<p>Donos de {$activity} em {$cidadeEstado} podem cadastrar gratuitamente seu estabelecimento no GeoVintalie e aparecer para clientes que buscam {$activity} em {$state} e em todo o {$country}. Aumente a visibilidade do seu comércio local com uma landing page otimizada para SEO local.</p>

<footer>
    <p>GeoVintalie - Comércio local no mapa. {$city}, {$state}, {$country}.</p>
</footer>
HTML;
    }
}
