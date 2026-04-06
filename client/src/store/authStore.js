import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  },

  register: async (data) => {
    try {
      await api.post('/auth/register', data);
      return true;
    } catch (error) {
      console.error('Register error', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false });
        return;
      }
      const res = await api.get('/user/profile');
      set({ user: res.data, isAuthenticated: true, loading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));
