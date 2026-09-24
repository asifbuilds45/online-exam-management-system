import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('oems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized if not on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('oems_token');
        localStorage.removeItem('oems_user');
      }
    }
    return Promise.reject(error);
  }
);
