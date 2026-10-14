import axios from 'axios';
import { Platform } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';

const BASE_URL = 'https://the-lens-hut-backend-freelance.vercel.app/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically attach stored JWT token to all outgoing requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[Mobile Axios Interceptor] Failed to read token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap data and normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data) {
      return Promise.resolve(error.response.data);
    }
    return Promise.resolve({
      success: false,
      message: error.message || 'Network error: Server is unreachable',
      errorCode: 'NETWORK_ERROR',
    });
  }
);

export { api, BASE_URL };
export default api;
