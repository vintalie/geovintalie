<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\FeatureFlagService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeatureFlagController extends Controller
{
    public function __construct(private FeatureFlagService $flags) {}

    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->flags->all()->map(function ($flag) {
                return [
                    'name' => $flag->name,
                    'description' => $flag->description,
                    'enabled' => $flag->enabled,
                    'rollout_percentage' => $flag->rollout_percentage,
                    'is_enabled' => $this->flags->isEnabled($flag->name),
                ];
            }),
        ]);
    }

    public function update(Request $request, string $name)
    {
        $request->validate([
            'enabled' => 'sometimes|boolean',
            'rollout_percentage' => 'sometimes|integer|min:0|max:100',
        ]);

        try {
            $flag = $this->flags->update(
                $name,
                $request->only(['enabled', 'rollout_percentage'])
            );
        } catch (ModelNotFoundException $e) {
            abort(404, 'Feature flag nao encontrada.');
        }

        return response()->json([
            'name' => $flag->name,
            'enabled' => $flag->enabled,
            'rollout_percentage' => $flag->rollout_percentage,
            'is_enabled' => $this->flags->isEnabled($flag->name),
        ], Response::HTTP_OK);
    }
}
