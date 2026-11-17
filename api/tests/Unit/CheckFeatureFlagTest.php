<?php

namespace Tests\Unit;

use App\Models\FeatureFlag;
use App\Http\Middleware\CheckFeatureFlag;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class CheckFeatureFlagTest extends TestCase
{
    public function test_middleware_bloqueia_flag_desligada_com_403(): void
    {
        FeatureFlag::create([
            'name' => 'ff_mw_off',
            'description' => 'off',
            'enabled' => false,
            'rollout_percentage' => 0,
        ]);

        $middleware = new CheckFeatureFlag();
        $request = Request::create('/api/v2/qualquer-coisa');
        $next = fn (Request $req) => response('ok', Response::HTTP_OK);

        $response = $middleware->handle($request, $next, 'ff_mw_off');

        $this->assertSame(Response::HTTP_FORBIDDEN, $response->getStatusCode());
        $this->assertStringContainsString('ff_mw_off', $response->getContent());
    }

    public function test_middleware_libera_flag_ligada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_mw_on',
            'description' => 'on',
            'enabled' => true,
            'rollout_percentage' => 100,
        ]);

        $middleware = new CheckFeatureFlag();
        $request = Request::create('/api/v2/qualquer-coisa');
        $next = fn (Request $req) => response('ok', Response::HTTP_OK);

        $response = $middleware->handle($request, $next, 'ff_mw_on');

        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
        $this->assertSame('ok', $response->getContent());
    }
}
