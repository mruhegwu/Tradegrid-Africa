'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI, reviewsAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Order {
  id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentSent: boolean;
  goodsDelivered: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    location: string;
  };
  supplier: { id: string; name: string; email: string };
  buyer: { id: string; name: string; email: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ orderId: string; supplierId: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    if (!user) { router.push('/auth/login'); }
  }, [user, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getMine();
      setOrders(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleMarkPayment = async (orderId: string) => {
    try {
      await ordersAPI.markPayment(orderId);
      fetchOrders();
    } catch {
      alert('Failed to mark payment');
    }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await reviewsAPI.create({
        supplierId: reviewModal.supplierId,
        rating,
        comment,
        orderId: reviewModal.orderId,
      });
      setReviewModal(null);
      setComment('');
      setRating(5);
    } catch {
      alert('Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  const statusDescriptions: Record<string, string> = {
    PENDING: 'Waiting for supplier to accept',
    ACCEPTED: 'Supplier accepted. Send payment to proceed.',
    COMPLETED: 'Transaction complete!',
    REJECTED: 'Order was rejected by supplier',
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'BUYER' ? 'My Orders' : 'Order Management'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your trade orders</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Browse the marketplace to find products and place orders</p>
            <button onClick={() => router.push('/marketplace')} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{order.product.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {user?.role === 'BUYER' 
                        ? `Supplier: ${order.supplier.name}` 
                        : `Buyer: ${order.buyer.name}`}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4">{statusDescriptions[order.status]}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Quantity</div>
                    <div className="font-semibold text-gray-900">{order.quantity} units</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Amount</div>
                    <div className="font-semibold text-green-600">₦{order.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Payment</div>
                    <div className={`font-semibold text-sm ${order.paymentSent ? 'text-green-600' : 'text-gray-400'}`}>
                      {order.paymentSent ? '✓ Sent' : 'Pending'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Delivery</div>
                    <div className={`font-semibold text-sm ${order.goodsDelivered ? 'text-green-600' : 'text-gray-400'}`}>
                      {order.goodsDelivered ? '✓ Delivered' : 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Escrow Progress */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="text-xs font-medium text-blue-700 mb-2">Escrow Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${order.status !== 'PENDING' && order.status !== 'REJECTED' ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.paymentSent ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.goodsDelivered ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Order</span>
                    <span>Payment</span>
                    <span>Delivery</span>
                    <span>Complete</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.role === 'BUYER' && order.status === 'ACCEPTED' && !order.paymentSent && (
                    <button
                      onClick={() => handleMarkPayment(order.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      💳 Mark Payment Sent
                    </button>
                  )}
                  {order.status === 'COMPLETED' && user?.role === 'BUYER' && (
                    <button
                      onClick={() => setReviewModal({ orderId: order.id, supplierId: order.supplier.id })}
                      className="bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100"
                    >
                      ⭐ Leave Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Leave a Review</h2>
            <p className="text-gray-500 text-sm mb-6">Share your experience with this supplier</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share details about your experience..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-medium">
                Cancel
              </button>
              <button onClick={handleReview} disabled={reviewLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
