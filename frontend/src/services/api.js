import axios from 'axios';

// Create a base axios instance pointing to our API Gateway (or local proxy)
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to inject the JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // We will manage this via Redux and local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Trigger logout flow if token is expired
      // store.dispatch(logout());
      console.warn('Unauthorized. Token might be expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
