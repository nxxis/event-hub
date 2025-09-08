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
  return config;
});

export default http;
