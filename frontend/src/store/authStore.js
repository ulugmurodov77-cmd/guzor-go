import { create } from 'zustand';
import { api } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem('guzor_user') || 'null'),
  token: localStorage.getItem('guzor_token') || null,
  loading: false,

  login: async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password });
    localStorage.setItem('guzor_token', data.token);
    localStorage.setItem('guzor_user', JSON.stringify(data.user));
    connectSocket(data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('guzor_token', data.token);
    localStorage.setItem('guzor_user', JSON.stringify(data.user));
    connectSocket(data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () => {
    localStorage.removeItem('guzor_token');
    localStorage.removeItem('guzor_user');
    disconnectSocket();
    set({ user: null, token: null });
  },

  init: () => {
    const token = localStorage.getItem('guzor_token');
    if (token) connectSocket(token);
  },
}));