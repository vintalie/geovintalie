<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;

class StockController extends Controller
{

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Product $product)
    {
        $stock = Stock::paginate(
            $request->input('per_page', 10)
        );
        return response()->json([
            'message' => 'Stock retrieved successfully',
            'stock' => $stock->with('product')
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $validated = request()->validate([
            'quantity' => 'required|integer|min:0',
        ]);
        $stock = $product->stock;
        $stock->update($validated);
        return response()->json([
            'message' => 'Stock updated successfully',
            'stock' => $stock
        ], 200);
    
        
    }

    /**
     * Update the specified resource in storage.
     * Essa rota atualiza o estoque somando ao inves de sobrescrever diferente da rota de edição
     */
    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);
        $stock->quantity = $stock->quantity + $request->input('quantity');
        $stock->update($validated);
        return response()->json([
            'message' => 'Stock updated successfully',
            'stock' => $stock
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        //
    }
}
