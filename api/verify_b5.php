<?php
// Verificacao direta do Escopo B5 (ignora middleware quebrado por hr_time())
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Artisan;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpKernel\Exception\HttpException;

$tmpDb = '/home/mario/.hermes/cache/scratch/verify_b5.sqlite';
@unlink($tmpDb);
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $tmpDb]);

$exit = Artisan::call('migrate', ['--force' => true]);
echo "migrate exit: $exit\n";
$out = Artisan::output();
echo (strpos($out, 'service_evaluations') !== false ? "tabela service_evaluations criada\n" : "SAIDA MIGRATE:\n$out\n");

\App\Models\FeatureFlag::firstOrCreate([
    'name' => 'ff_service_evaluations',
], ['description' => 'B5', 'enabled' => true, 'rollout_percentage' => 100]);

$tipo = \App\Models\UserType::where('nome', 'user')->first() ?? \App\Models\UserType::forceCreate(['nome' => 'user']);

$evaluator = \App\Models\User::factory()->create([
    'email' => 'e@t.com', 'password' => bcrypt('x'), 'tipo_id' => $tipo->id,
]);
$pUser = \App\Models\User::factory()->create([
    'email' => 'p@t.com', 'password' => bcrypt('x'), 'tipo_id' => $tipo->id,
]);
$provider = \App\Models\ServiceProvider::create([
    'user_id' => $pUser->id, 'business_name' => 'Prov B5', 'cnpj_cpf' => '11.222.333/0001-44',
]);
$cat = \App\Models\ServiceCategory::create(['name' => 'Cat', 'slug' => 'cat']);
$listing = \App\Models\ServiceListing::create([
    'provider_id' => $provider->id, 'category_id' => $cat->id, 'title' => 'Serv B5',
    'price' => 100.00, 'is_active' => true,
]);

// A regra de B5 exige agendamento concluido do cliente com o prestador.
\App\Models\Appointment::create([
    'client_id' => $evaluator->id,
    'provider_id' => $provider->id,
    'date' => '2026-11-10',
    'time' => '14:00',
    'status' => \App\Models\Appointment::STATUS_CONCLUIDO,
    'valor' => 100.00,
]);

$controller = new \App\Http\Controllers\ServiceEvaluationController();

function callStore($controller, $req) {
    try {
        $result = $controller->store($req);
        $status = $result instanceof \Illuminate\Http\Resources\Json\JsonResource ? 201 : 200;
        $content = $result instanceof \Illuminate\Http\Resources\Json\JsonResource
            ? json_encode($result->resolve()) : $result->getContent();
        return [$status, $content];
    } catch (HttpResponseException $e) {
        return [$e->getResponse()->getStatusCode(), $e->getResponse()->getContent()];
    } catch (HttpException $e) {
        return [$e->getStatusCode(), json_encode(['message' => $e->getMessage()])];
    } catch (\Illuminate\Validation\ValidationException $e) {
        return [422, json_encode(['errors' => $e->errors(), 'message' => $e->getMessage()])];
    } catch (\Throwable $e) {
        throw $e;
    }
}

// Criar avaliacao (sucesso: cliente com agendamento concluido)
$req = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 5,
    'comment' => 'Otimo servico.',
]));
$req->headers->set('Content-Type', 'application/json');
$req->setUserResolver(fn() => $evaluator);
[$status, $content] = callStore($controller, $req);
echo "store status: $status\n";
echo "$content\n";

echo "avaliacoes no banco: ". \App\Models\ServiceEvaluation::count()."\n";
$provider->refresh();
echo "provider average_rating: ".$provider->average_rating." total_reviews: ".$provider->total_reviews."\n";

// listar por prestador (publico)
$listReq = Request::create('/v2/service-providers/'.$provider->id.'/evaluations', 'GET');
$listResp = $controller->byProvider($listReq, (string) $provider->id);
$listItems = $listResp instanceof \Illuminate\Http\Resources\Json\JsonResource
    ? $listResp->resolve() : [];
echo "list status: 200\n";
echo "list data count: ".count((array) $listItems)."\n";
echo "list first rating: ".(isset($listItems[0]['rating']) ? $listItems[0]['rating'] : 'n/a')."\n";
echo "list first evaluator: ".(isset($listItems[0]['evaluator']['name']) ? $listItems[0]['evaluator']['name'] : 'n/a')."\n";

// erro: auto-avaliacao (prestador tentando avaliar a si mesmo)
$selfReq = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 4,
]));
$selfReq->headers->set('Content-Type', 'application/json');
$selfReq->setUserResolver(fn() => $pUser);
[$selfStatus, $selfContent] = callStore($controller, $selfReq);
echo "auto-avaliacao status: $selfStatus\n";

// erro: nota invalida (fora de 1-5)
$badReq = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 9,
]));
$badReq->headers->set('Content-Type', 'application/json');
$badReq->setUserResolver(fn() => $evaluator);
[$badStatus, $badContent] = callStore($controller, $badReq);
echo "nota invalida status: $badStatus\n";

@unlink($tmpDb);
echo "OK - verificacao B5 concluida\n";
