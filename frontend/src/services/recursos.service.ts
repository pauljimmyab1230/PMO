import api from './api';
import { ApiResponse } from '../types';

export interface Recurso {
  id: number;
  proyecto_id: number;
  usuario_id: number;
  wbs_id?: number;
  rol_id?: number;
  porcentaje: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  horas_planeadas: number;
  horas_reales: number;
  usuario_nombre?: string;
  usuario_email?: string;
  rol_nombre?: string;
  tarifa_hora?: number;
  wbs_codigo?: string;
  wbs_nombre?: string;
}

export interface RecursoUser {
  id: number;
  nombre: string;
  email: string;
}

export interface RecursoRole {
  id: number;
  nombre: string;
  tarifa_hora: number;
}

export interface RecursoSummary {
  byUser: { id: number; nombre: string; rol: string; asignaciones: number; total_porcentaje: number; total_horas: number }[];
  byRole: { rol: string; personas: number; total_horas: number; costo_total: number }[];
  stats: { total_personas: number; total_asignaciones: number; total_horas: number; horas_reales: number; promedio_dedicacion: number };
}

export interface WBSActivity {
  id: number;
  codigo: string;
  nombre: string;
}

const convert = (item: any): Recurso => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  usuario_id: Number(item.usuario_id),
  wbs_id: item.wbs_id ? Number(item.wbs_id) : undefined,
  rol_id: item.rol_id ? Number(item.rol_id) : undefined,
  porcentaje: parseFloat(item.porcentaje) || 0,
  horas_planeadas: parseFloat(item.horas_planeadas) || 0,
  horas_reales: parseFloat(item.horas_reales) || 0,
  tarifa_hora: item.tarifa_hora ? parseFloat(item.tarifa_hora) : undefined
});

export const recursosService = {
  getByProject: async (projectId: number): Promise<ApiResponse<Recurso[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/recursos`);
    const data = response.data?.data || [];
    return { ...response.data, data: Array.isArray(data) ? data.map(convert) : [] };
  },

  getSummary: async (projectId: number): Promise<ApiResponse<RecursoSummary>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/recursos/summary`);
    return response.data;
  },

  getUsers: async (projectId: number): Promise<ApiResponse<RecursoUser[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/recursos/users`);
    const data = response.data?.data || [];
    return { ...response.data, data: Array.isArray(data) ? data : [] };
  },

  getRoles: async (projectId: number): Promise<ApiResponse<RecursoRole[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/recursos/roles`);
    const data = response.data?.data || [];
    return { ...response.data, data: Array.isArray(data) ? data : [] };
  },

  getWBSActivities: async (projectId: number): Promise<ApiResponse<WBSActivity[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/recursos/wbs`);
    const data = response.data?.data || [];
    return { ...response.data, data: Array.isArray(data) ? data : [] };
  },

  create: async (projectId: number, item: Partial<Recurso>): Promise<ApiResponse<Recurso>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/recursos`, item);
    return { ...response.data, data: convert(response.data.data) };
  },

  update: async (id: number, item: Partial<Recurso>): Promise<ApiResponse<Recurso>> => {
    const response = await api.put<any>(`/recursos/${id}`, item);
    return { ...response.data, data: convert(response.data.data) };
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/recursos/${id}`);
    return response.data;
  }
};
