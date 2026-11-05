<?php

namespace App\Http\Controllers;

use App\Models\ServiceListing;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;

class ServiceSearchController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceListing::with('provider.user', 'category')
            ->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->string('city') . '%');
        }
        if ($request->has('state')) {
            $query->where('state', 'like', '%' . $request->string('state') . '%');
        }
        if ($request->has('min_rating')) {
            $query->where('average_rating', '>=', $request->float('min_rating'));
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->float('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->float('max_price'));
        }
        if ($request->has('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->string('q') . '%')
                    ->orWhere('description', 'like', '%' . $request->string('q') . '%');
            });
        }

        $limit = $request->integer('limit') ?? 20;
        $results = $query->paginate($limit);

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'from' => $results->firstItem(),
                'to' => $results->lastItem(),
            ],
        ]);
    }
}
