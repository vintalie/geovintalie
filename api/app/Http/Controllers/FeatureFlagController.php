<?php

namespace App\Http\Controllers;

use App\Models\FeatureFlag;
use Illuminate\Http\Request;

class FeatureFlagController extends Controller
{
    public function index(Request $request)
    {
        $flags = FeatureFlag::all();

        return response()->json([
            'data' => $flags->map(function ($flag) {
                return [
                    'name' => $flag->name,
                    'description' => $flag->description,
                    'enabled' => $flag->enabled,
                    'rollout_percentage' => $flag->rollout_percentage,
                    'is_enabled' => FeatureFlag::isEnabled($flag->name),
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

        $flag = FeatureFlag::where('name', $name)->first();
        if (!$flag) {
            abort(404, 'Feature flag nao encontrada.');
        }

        $flag->update($request->only(['enabled', 'rollout_percentage']));

        return response()->json([
            'name' => $flag->name,
            'enabled' => $flag->enabled,
            'rollout_percentage' => $flag->rollout_percentage,
            'is_enabled' => FeatureFlag::isEnabled($flag->name),
        ]);
    }
}
