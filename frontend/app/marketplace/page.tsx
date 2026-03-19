'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, ordersAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minOrderQty: number;
  location: string;
  category: string;
  supplier: { id: string; name: string; verified: boolean };
}

const CATEGORIES = ['All', 'Construction Materials', 'Textiles', 'Agricultural Products', 'Electronics', 'Food & Beverages'];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getUser() : null;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (location) params.location = location;
      const res = await productsAPI.getAll(params);
      setProducts(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, category, location]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOrder = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!selectedProduct) return;
    if (quantity < selectedProduct.minOrderQty) {
      setOrderError(`Minimum order is ${selectedProduct.minOrderQty} units`);
      return;
    }
    setOrderLoading(true);
    setOrderError('');
    try {
      await ordersAPI.create({ productId: selectedProduct.id, quantity });
      setOrderSuccess('Order placed successfully!');
      setTimeout(() => {
        setSelectedProduct(null);
        setOrderSuccess('');
        router.push('/orders');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setOrderError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Marketplace</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-48"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">��</div>
            <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
            <p className="text-gray-400 mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{products.length} products found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                    {product.supplier.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🏭</span>
                      <span>{product.supplier.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📍</span>
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📦</span>
                      <span>Min. order: {product.minOrderQty} units</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-xs">/unit</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) { router.push('/auth/login'); return; }
                        if (user.role !== 'BUYER') return;
                        setSelectedProduct(product);
                        setQuantity(product.minOrderQty);
                        setOrderError('');
                        setOrderSuccess('');
                      }}
                      disabled={user?.role === 'SUPPLIER'}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {user?.role === 'SUPPLIER' ? 'Your Platform' : 'Order Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Place Order</h2>
            <p className="text-gray-500 text-sm mb-6">{selectedProduct.name} from {selectedProduct.supplier.name}</p>
            
            {orderSuccess && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
                ✓ {orderSuccess}
              </div>
            )}
            {orderError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {orderError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Min: {selectedProduct.minOrderQty})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min={selectedProduct.minOrderQty}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Unit price</span>
                <span>₦{selectedProduct.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">₦{(selectedProduct.price * quantity).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                disabled={orderLoading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {orderLoading ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
