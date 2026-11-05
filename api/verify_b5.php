<?php
// Verificacao direta do Escopo B5 (ignora middleware quebrado por hr_time())
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Artisan;
use Illuminate\Http\Request;

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

$controller = new \App\Http\Controllers\ServiceEvaluationController();
$req->setUserResolver(fn() => $evaluator);

$req = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 5,
    'comment' => 'Otimo servico.',
]));
$req->headers->set('Content-Type', 'application/json');
$resp = $controller->store($req);
echo "store status: ".$resp->getStatusCode()."\n";
echo $resp->getContent()."\n";

echo "avaliacoes no banco: ". \App\Models\ServiceEvaluation::count()."\n";
$provider->refresh();
echo "provider average_rating: ".$provider->average_rating." total_reviews: ".$provider->total_reviews."\n";

// listar por prestador
$listReq = Request::create('/v2/service-providers/'.$provider->id.'/evaluations', 'GET');
$listResp = $controller->byProvider($listReq, (string) $provider->id);
echo "list status: ".$listResp->getStatusCode()."\n";
$data = json_decode($listResp->getContent(), true);
echo "list data count: ".count($data['data'] ?? [])."\n";
echo "list first rating: ".($data['data'][0]['rating'] ?? 'n/a')."\n";
echo "list first evaluator: ".($data['data'][0]['evaluator']['name'] ?? 'n/a')."\n";

// erro: auto-avaliacao
$selfReq->setUserResolver(fn() => $pUser);
$selfReq = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 4,
]));
$selfReq->headers->set('Content-Type', 'application/json');
$selfResp = $controller->store($selfReq);
echo "auto-avaliacao status: ".$selfResp->getStatusCode()."\n";

// erro: nota invalida
$req->setUserResolver(fn() => $evaluator);
$badReq = Request::create('/v2/service-evaluations', 'POST', [], [], [], [], json_encode([
    'service_listing_id' => $listing->id,
    'service_provider_id' => $provider->id,
    'rating' => 9,
]));
$badReq->headers->set('Content-Type', 'application/json');
$badResp = $controller->store($badReq);
echo "nota invalida status: ".$badResp->getStatusCode()."\n";

@unlink($tmpDb);
echo "OK - verificacao B5 concluida\n";
