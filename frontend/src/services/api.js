import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// If you have an API Gateway running (e.g. at port 8080)
// const BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

// Or direct connections to microservices if running locally without gateway:
const authURL = import.meta.env.VITE_AUTH_SERVICE_URL;
const productURL = import.meta.env.VITE_PRODUCT_SERVICE_URL;
const inventoryURL = import.meta.env.VITE_INVENTORY_SERVICE_URL;

const cartURL = import.meta.env.VITE_CART_SERVICE_URL || 'http://localhost:4007/api/v1/cart';

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
};

export const productService = {
  getAll: () => api.get(productURL),
  getById: (id) => api.get(`${productURL}/${id}`),
  getBySlug: (slug) => api.get(`${productURL}/slug/${slug}`),
};

export const cartService = {
  getCart: () => api.get(cartURL),
  addItem: (data) => api.post(`${cartURL}/items`, data),
  updateQuantity: (productId, data) => api.patch(`${cartURL}/items/${productId}`, data),
  removeItem: (productId) => api.delete(`${cartURL}/items/${productId}`),
  clearCart: () => api.delete(cartURL),
};

export default api;
