import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (nombre: string, email: string, password: string, rol?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { nombre, email, password, rol });
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ success: boolean; data: { accessToken: string; refreshToken: string } }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  }
};
