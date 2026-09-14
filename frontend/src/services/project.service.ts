import api from './api';
import { Project, ProjectDashboard, ApiResponse } from '../types';

export const projectService = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    const response = await api.get<ApiResponse<Project[]>>('/proyectos');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Project>> => {
    const response = await api.get<ApiResponse<Project>>(`/proyectos/${id}`);
    return response.data;
  },

  create: async (project: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>('/proyectos', project);
    return response.data;
  },

  update: async (id: number, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.put<ApiResponse<Project>>(`/proyectos/${id}`, project);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/proyectos/${id}`);
    return response.data;
  },

  updateState: async (id: number, estado_id: number): Promise<ApiResponse<Project>> => {
    const response = await api.put<ApiResponse<Project>>(`/proyectos/${id}/estado`, { estado_id });
    return response.data;
  },

  getDashboard: async (id: number): Promise<ApiResponse<ProjectDashboard>> => {
    const response = await api.get<ApiResponse<ProjectDashboard>>(`/proyectos/${id}/dashboard`);
    return response.data;
  }
};
