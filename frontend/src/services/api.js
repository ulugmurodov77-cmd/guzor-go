import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('guzor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('guzor_token');
      localStorage.removeItem('guzor_user');
      if (!window.location.pathname.includes('/kirish')) {
        window.location.href = '/kirish';
      }
    }
    return Promise.reject(err);
  }
);

export const getError = (e) => e?.response?.data?.message || 'Xatolik yuz berdi';