import axios from 'axios';

// Use relative URL in browser to trigger Next.js rewrites and avoid Mixed Content (HTTPS -> HTTP).
// Use direct backend URL on the server (SSR) since Node.js has no Mixed Content restrictions.
const isServer = typeof window === 'undefined';
const baseURL = isServer ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') : '';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token (if available)
api.interceptors.request.use(
  (config) => {
    // Check if running in browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized globally
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          
          // Only redirect if we are not already on the login page
          // This prevents an infinite refresh loop when login fails with a 401
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getMediaUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') : '';
  
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
