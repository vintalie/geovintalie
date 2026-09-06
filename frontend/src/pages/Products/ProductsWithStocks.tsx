import React, { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStocks,
  createStock,
  updateStock,
  deleteStock,
} from '../../api/location';
import type { Products, Stocks } from '../../types';

type ProductsFormData = Omit<Products, 'id' | 'created_at' | 'updated_at' | 'stock'>;
type StocksFormData = Omit<Stocks, 'id' | 'created_at' | 'updated_at' | 'product_id' | 'property_id'>;

const ProductsWithStocks: React.FC = () => {
  // Estados para produtos
  const [products, setProducts] = useState<Products[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Estados para estoques
  const [stocks, setStocks] = useState<Stocks[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // Estados para modais de produto
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Products | null>(null);
  const [productForm, setProductForm] = useState<Partial<ProductsFormData>>({
    name: '',
    tipo: '',
    price: '',
    img_main: '',
    img_cover: '',
    html: '',
    disabled: false,
    user_id: 1, // price padrão, ajuste conforme seu sistema
    property_id: 1, // price padrão, ajuste conforme seu sistema
  });

  // Estados para modais de estoque
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stocks | null>(null);
  const [stockForm, setStockForm] = useState<Partial<StocksFormData>>({
    value: 0,
    color: '',
    size: '',
    q_type: '',
  });

  // Carregar produtos ao montar
  useEffect(() => {
    fetchProducts();
  }, []);

  // Carregar estoques quando o produto selecionado mudar
  useEffect(() => {
    if (selectedProductId) {
      fetchStocks(selectedProductId);
    } else {
      setStocks([]);
    }
  }, [selectedProductId]);

  // ---- Funções de Produto ----
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const response = await getProducts();
      // Ajuste conforme a estrutura da resposta (verifique no seu backend)
      const data = response.data.products?.data ?? response.data.products ?? [];
      setProducts(data);
    } catch (error) {
      console.error(error);
      setProductError('Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
      } else {
        await createProduct(productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', tipo: '', price: '', img_main: '', img_cover: '', html: '', disabled: false, user_id: 1, property_id: 1 });
      await fetchProducts();
      // Se o produto selecionado foi alterado, recarregar estoques?
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await deleteProduct(id);
      await fetchProducts();
      if (selectedProductId === id) setSelectedProductId(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir produto');
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      tipo: product.tipo,
      price: product.price,
      img_main: product.img_main,
      img_cover: product.img_cover,
      html: product.html,
      disabled: product.disabled,
      user_id: product.user_id,
      property_id: product.property_id,
    });
    setShowProductModal(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', tipo: '', price: '', img_main: '', img_cover: '', html: '', disabled: false, user_id: 1, property_id: 1 });
    setShowProductModal(true);
  };

  // ---- Funções de Estoque ----
  const fetchStocks = async (productId: number) => {
    setLoadingStocks(true);
    setStockError(null);
    try {
      const response = await getStocks(productId);
      const data = response.data.stock?.data ?? response.data.stock ?? [];
      setStocks(data);
    } catch (error) {
      console.error(error);
      setStockError('Erro ao carregar estoques');
    } finally {
      setLoadingStocks(false);
    }
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      if (editingStock) {
        await updateStock(selectedProductId, editingStock.id, stockForm);
      } else {
        await createStock(selectedProductId, stockForm);
      }
      setShowStockModal(false);
      setEditingStock(null);
      setStockForm({ value: 0, color: '', size: '', q_type: '' });
      await fetchStocks(selectedProductId);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar estoque');
    }
  };

  const handleDeleteStock = async (stockId: number) => {
    if (!selectedProductId) return;
    if (!window.confirm('Tem certeza que deseja excluir este estoque?')) return;
    try {
      await deleteStock(selectedProductId, stockId);
      await fetchStocks(selectedProductId);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir estoque');
    }
  };

  const openEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setStockForm({
      value: stock.value,
      color: stock.color,
      size: stock.size,
      q_type: stock.q_type,
    });
    setShowStockModal(true);
  };

  const openNewStock = () => {
    setEditingStock(null);
    setStockForm({ value: 0, color: '', size: '', q_type: '' });
    setShowStockModal(true);
  };

  // ---- Renderização ----
  return (
    <div className="flex h-full gap-4">
      {/* Painel esquerdo - Produtos */}
      <div className="w-1/2 border-r pr-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produtos</h2>
          <button
            onClick={openNewProduct}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Novo Produto
          </button>
        </div>

        {loadingProducts && <p>Carregando...</p>}
        {productError && <p className="text-red-500">{productError}</p>}
        {!loadingProducts && !productError && products.length === 0 && (
          <p className="text-gray-500">Nenhum produto cadastrado.</p>
        )}

        <ul className="space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className={`p-3 rounded cursor-pointer transition-colors border ${
                selectedProductId === product.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-transparent'
              }`}
            >
              <div
                className="flex justify-between items-center"
                onClick={() => setSelectedProductId(product.id)}
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">Tipo: {product.tipo}</div>
                  <div className="text-sm text-gray-600">Valor: {product.price}</div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditProduct(product)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Painel direito - Estoques */}
      <div className="w-1/2 pl-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Estoques {selectedProductId ? `de ${products.find(p => p.id === selectedProductId)?.name || ''}` : ''}
          </h2>
          {selectedProductId && (
            <button
              onClick={openNewStock}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Novo Estoque
            </button>
          )}
        </div>

        {!selectedProductId ? (
          <p className="text-gray-500">Selecione um produto para ver seus estoques.</p>
        ) : loadingStocks ? (
          <p>Carregando estoques...</p>
        ) : stockError ? (
          <p className="text-red-500">{stockError}</p>
        ) : stocks.length === 0 ? (
          <p className="text-gray-500">Este produto não possui estoques.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Valor</th>
                <th className="py-2 px-4 border">Cor</th>
                <th className="py-2 px-4 border">Tamanho</th>
                <th className="py-2 px-4 border">Tipo</th>
                <th className="py-2 px-4 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">{stock.value}</td>
                  <td className="py-2 px-4 border text-center">{stock.color}</td>
                  <td className="py-2 px-4 border text-center">{stock.size}</td>
                  <td className="py-2 px-4 border text-center">{stock.q_type}</td>
                  <td className="py-2 px-4 border text-center">
                    <button
                      onClick={() => openEditStock(stock)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteStock(stock.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSaveProduct}>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Tipo"
                  value={productForm.tipo || ''}
                  onChange={(e) => setProductForm({ ...productForm, tipo: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={productForm.price || ''}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Imagem Principal (URL)"
                  value={productForm.img_main || ''}
                  onChange={(e) => setProductForm({ ...productForm, img_main: e.target.value })}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Imagem Capa (URL)"
                  value={productForm.img_cover || ''}
                  onChange={(e) => setProductForm({ ...productForm, img_cover: e.target.value })}
                  className="w-full border p-2 rounded"
                />
                <textarea
                  placeholder="HTML (descrição)"
                  value={productForm.html || ''}
                  onChange={(e) => setProductForm({ ...productForm, html: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={productForm.disabled || false}
                    onChange={(e) => setProductForm({ ...productForm, disabled: e.target.checked })}
                  />
                  Desabilitado
                </label>
                {/* Campos ocultos ou fixos: user_id e property_id - ajuste conforme necessário */}
                <input type="hidden" value={productForm.user_id || 1} />
                <input type="hidden" value={productForm.property_id || 1} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Estoque */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingStock ? 'Editar Estoque' : 'Novo Estoque'}
            </h3>
            <form onSubmit={handleSaveStock}>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Valor"
                  value={stockForm.value ?? 0}
                  onChange={(e) => setStockForm({ ...stockForm, value: parseInt(e.target.value) || 0 })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Cor"
                  value={stockForm.color || ''}
                  onChange={(e) => setStockForm({ ...stockForm, color: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Tamanho"
                  value={stockForm.size || ''}
                  onChange={(e) => setStockForm({ ...stockForm, size: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Tipo de Quantidade (ex: un, kg)"
                  value={stockForm.q_type || ''}
                  onChange={(e) => setStockForm({ ...stockForm, q_type: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsWithStocks;