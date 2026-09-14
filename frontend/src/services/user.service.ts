import api from './api';
import { User, ApiResponse } from '../types';

export const userService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>('/usuarios');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(`/usuarios/${id}`);
    return response.data;
  },

  create: async (user: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/usuarios', user);
    return response.data;
  },

  update: async (id: number, user: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/usuarios/${id}`, user);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/usuarios/${id}`);
    return response.data;
  }
};
