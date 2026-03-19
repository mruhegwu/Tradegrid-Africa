'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, ordersAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Product {
  id: string;
  name: string;
  price: number;
  minOrderQty: number;
  location: string;
  category: string;
  description?: string;
}

interface Order {
  id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentSent: boolean;
  goodsDelivered: boolean;
  createdAt: string;
  product: Product;
  buyer: { id: string; name: string; email: string };
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', minOrderQty: '', location: '', category: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();

  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'SUPPLIER') { router.push('/marketplace'); return; }
  }, [user, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsRes, ordersRes] = await Promise.all([
        productsAPI.getMine(),
        ordersAPI.getMine(),
      ]);
      setProducts(prodsRes.data);
      setOrders(ordersRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await productsAPI.create(formData);
      setShowAddProduct(false);
      setFormData({ name: '', description: '', price: '', minOrderQty: '', location: '', category: '' });
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      fetchData();
    } catch {
      alert('Failed to update order status');
    }
  };

  const handleMarkDelivery = async (orderId: string) => {
    try {
      await ordersAPI.markDelivery(orderId);
      fetchData();
    } catch {
      alert('Failed to mark delivery');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">{user?.name}</p>
            </div>
            {user?.verified && (
              <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                ✓ Verified Supplier
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Products', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-600' },
            { label: 'Pending Orders', value: pendingOrders.length, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-50 text-green-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['products', 'orders'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'orders' && orders.length > 0 && `(${orders.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                + Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-semibold text-gray-700 mb-1">No products yet</h3>
                <p className="text-gray-400 text-sm mb-4">Add your first product to start receiving orders</p>
                <button onClick={() => setShowAddProduct(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">Min: {product.minOrderQty}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">📍 {product.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-700">No orders yet</h3>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here when buyers place them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.product.name}</h3>
                        <p className="text-sm text-gray-500">From: {order.buyer.name} ({order.buyer.email})</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div><span className="text-gray-400">Qty</span><div className="font-medium">{order.quantity}</div></div>
                      <div><span className="text-gray-400">Total</span><div className="font-medium text-green-600">₦{order.totalAmount.toLocaleString()}</div></div>
                      <div><span className="text-gray-400">Payment</span><div className={`font-medium ${order.paymentSent ? 'text-green-600' : 'text-gray-400'}`}>{order.paymentSent ? 'Received' : 'Pending'}</div></div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleOrderStatus(order.id, 'ACCEPTED')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
                            Accept
                          </button>
                          <button onClick={() => handleOrderStatus(order.id, 'REJECTED')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100">
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === 'ACCEPTED' && order.paymentSent && !order.goodsDelivered && (
                        <button onClick={() => handleMarkDelivery(order.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h2>
            {formError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <form onSubmit={handleAddProduct} className="space-y-4">
              {[
                { key: 'name', label: 'Product Name', placeholder: 'e.g., Industrial Steel Pipes', type: 'text' },
                { key: 'description', label: 'Description', placeholder: 'Brief product description', type: 'text' },
                { key: 'price', label: 'Unit Price (₦)', placeholder: '45000', type: 'number' },
                { key: 'minOrderQty', label: 'Minimum Order Quantity', placeholder: '50', type: 'number' },
                { key: 'location', label: 'Location', placeholder: 'Lagos, Nigeria', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Select category</option>
                  {['Construction Materials', 'Textiles', 'Agricultural Products', 'Electronics', 'Food & Beverages', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddProduct(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                  {formLoading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
