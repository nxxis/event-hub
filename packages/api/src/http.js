import axios from 'axios';

const apiBase =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:4000/api';

const http = axios.create({
  baseURL: apiBase,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // notify global network activity (increment)
  try {
    if (typeof window !== 'undefined') {
      window.__activeNetworkRequests = (window.__activeNetworkRequests || 0) + 1;
      window.dispatchEvent(new CustomEvent('network:count', { detail: { count: window.__activeNetworkRequests } }));
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// decrement on response or error
http.interceptors.response.use(
  (response) => {
    try {
      if (typeof window !== 'undefined') {
        window.__activeNetworkRequests = Math.max(0, (window.__activeNetworkRequests || 1) - 1);
        window.dispatchEvent(new CustomEvent('network:count', { detail: { count: window.__activeNetworkRequests } }));
      }
    } catch (e) {}
    return response;
  },
  (error) => {
    try {
      if (typeof window !== 'undefined') {
        window.__activeNetworkRequests = Math.max(0, (window.__activeNetworkRequests || 1) - 1);
        window.dispatchEvent(new CustomEvent('network:count', { detail: { count: window.__activeNetworkRequests } }));
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);

export default http;
