import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Products
export const productsAPI = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  getMine: () => api.get('/products/mine'),
  create: (data: unknown) => api.post('/products', data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders
export const ordersAPI = {
  create: (data: { productId: string; quantity: number }) => api.post('/orders', data),
  getMine: () => api.get('/orders/mine'),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  markPayment: (id: string) => api.patch(`/orders/${id}/payment`, {}),
  markDelivery: (id: string) => api.patch(`/orders/${id}/delivery`, {}),
};

// Reviews
export const reviewsAPI = {
  create: (data: { supplierId: string; rating: number; comment: string; orderId?: string }) =>
    api.post('/reviews', data),
  getForSupplier: (supplierId: string) => api.get(`/reviews/supplier/${supplierId}`),
};
