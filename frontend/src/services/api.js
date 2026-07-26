import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// If you have an API Gateway running (e.g. at port 8080)
// const BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

// Or direct connections to microservices if running locally without gateway:
const authURL = import.meta.env.VITE_AUTH_SERVICE_URL;
const productURL = import.meta.env.VITE_PRODUCT_SERVICE_URL;
const inventoryURL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:4004/api/v1/inventory';

const cartURL = import.meta.env.VITE_CART_SERVICE_URL || 'http://localhost:4007/api/v1/cart';
const orderURL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:4005/api/v1/orders';
const paymentURL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4006/api/v1/payments';
const userURL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:4002/api/v1/users';
const notificationURL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:4009/api/v1/notifications';

const api = axios.create({
  // baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (data) => api.post(`${authURL}/login`, data),
  register: (data) => api.post(`${authURL}/register`, data),
  me: () => api.get(`${authURL}/me`),
  verifyEmail: (email, code) => api.post(`${authURL}/verify-email`, { email, code }),
  resendVerification: (email) => api.post(`${authURL}/resend-verification`, { email }),
  forgotPassword: (email) => api.post(`${authURL}/forgot-password`, { email }),
  resetPassword: (data) => api.post(`${authURL}/reset-password`, data),
};

export const productService = {
  getAll: () => api.get(productURL),
  getById: (id) => api.get(`${productURL}/${id}`),
  getBySlug: (slug) => api.get(`${productURL}/slug/${slug}`),
  create: (data) => api.post(productURL, data),
  update: (id, data) => api.patch(`${productURL}/${id}`, data),
  delete: (id) => api.delete(`${productURL}/${id}`),
};

export const cartService = {
  getCart: () => api.get(cartURL),
  addItem: (data) => api.post(`${cartURL}/items`, data),
  updateQuantity: (productId, data) => api.patch(`${cartURL}/items/${productId}`, data),
  removeItem: (productId) => api.delete(`${cartURL}/items/${productId}`),
  clearCart: () => api.delete(cartURL),
};

export const orderService = {
  checkout: (data) => api.post(`${orderURL}/checkout`, data),
  getMyOrders: () => api.get(`${orderURL}/mine`),
  getOrder: (id) => api.get(`${orderURL}/${id}`),
  getAllOrders: () => api.get(orderURL),
  updateStatus: (id, data) => api.patch(`${orderURL}/${id}/status`, data),
};

export const paymentService = {
  createPayment: (data) => api.post(paymentURL, data),
  verifyPayment: (id) => api.post(`${paymentURL}/${id}/verify`),
  processRefund: (id) => api.post(`${paymentURL}/${id}/refund`),
};

export const inventoryService = {
  get: (productId) => api.get(`${inventoryURL}/${productId}`),
  create: (data) => api.post(inventoryURL, data),
  adjust: (productId, data) => api.post(`${inventoryURL}/${productId}/adjust`, data),
};

export const userService = {
  getAll: () => api.get(userURL),
  getById: (id) => api.get(`${userURL}/${id}`),
  updateRole: (id, data) => api.patch(`${userURL}/${id}/role`, data),
  updateStatus: (id, data) => api.patch(`${userURL}/${id}/status`, data),
};

export const notificationService = {
  getAll: () => api.get(notificationURL),
  markRead: (id) => api.patch(`${notificationURL}/${id}/read`),
  markAllRead: () => api.patch(`${notificationURL}/read-all`),
  broadcast: (data) => api.post(`${notificationURL}/broadcast`, data),
};

export default api;
