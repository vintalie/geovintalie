import axios from 'axios';
import { getBaseUrl } from '@/lib/api-base';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const base = getBaseUrl();
  if (base) {
    try {
      config.baseURL = new URL(base, config.baseURL ?? import.meta.env.VITE_API_URL).toString();
    } catch {
      config.baseURL = base;
    }
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Dispatch custom event so React components can handle redirect gracefully
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
