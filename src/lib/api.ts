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
      // Ensure error.response.data exists as an object so we can safely inject messages
      if (!error.response.data || typeof error.response.data !== 'object') {
        error.response.data = {};
      }

      const status = error.response.status;

      // Handle 401 Unauthorized globally
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          
          // Only redirect if we are not already on the login page
          // This prevents an infinite refresh loop when login fails with a 401
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      // Handle 413 Payload Too Large (often returned by Nginx or AWS before hitting backend)
      else if (status === 413) {
        error.response.data.message = 'The file is too large. Please keep uploads under 15MB.';
      }
      // Handle 403 Forbidden (RBAC permissions)
      else if (status === 403) {
        error.response.data.message = error.response.data.message || 'You do not have permission to perform this action.';
      }
      // Handle 429 Too Many Requests (auth endpoint rate limiting)
      else if (status === 429) {
        error.response.data.message =
          error.response.data.message || 'Too many attempts. Please wait a few minutes and try again.';
      }
      // Handle 500+ Server Errors
      else if (status >= 500) {
        error.response.data.message = 'The server encountered a problem. Please try again later.';
      }
    } else if (error.request) {
      // Network error (no response received from server)
      error.response = { 
        data: { 
          message: 'Network error. Please check your internet connection.' 
        } 
      };
    }
    return Promise.reject(error);
  }
);

/**
 * Resolves a stored media path (e.g. `/uploads/photo.jpg`) into a URL the browser can load.
 *
 * Always returns a *relative* URL. Unlike the axios instance above, this value is never
 * fetched by Node — it only ever lands in `src`, `href` or `background-image`, which the
 * browser resolves against its own origin, where the `/uploads/:path*` rewrite in
 * next.config.ts forwards it to the backend.
 *
 * Deliberately does NOT branch on `typeof window`. Doing so emitted the backend's absolute
 * URL during SSR and a relative one on the client, which React reports as a hydration
 * mismatch — and React does not patch up mismatched attributes, so the server's URL sticks.
 * In production that left every image pointing at the *visitor's* own localhost:8080.
 *
 * Absolute URLs (e.g. an S3/CDN bucket) are already loadable and pass through untouched.
 */
export const getMediaUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  return url.startsWith('/') ? url : `/${url}`;
};

export default api;
