import api from './api';
import { ApiResponse } from '../types';

export interface WBSItem {
  id: number;
  proyecto_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  padre_id?: number;
  responsable_id?: number;
  responsable_nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion_dias?: number;
  costo_estimado: number;
  costo_real: number;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  avance: number;
  es_hito: boolean;
  orden: number;
  children?: WBSItem[];
}

export interface WBSUser {
  id: number;
  nombre: string;
  email: string;
}

export interface WBSSummary {
  nivel: number;
  total: number;
  completados: number;
  en_progreso: number;
  pendientes: number;
  avance_promedio: number;
  costo_total_estimado: number;
  costo_total_real: number;
}

// Función para convertir strings a números
const convertWBSItem = (item: any): WBSItem => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  nivel: Number(item.nivel),
  padre_id: item.padre_id ? Number(item.padre_id) : undefined,
  responsable_id: item.responsable_id ? Number(item.responsable_id) : undefined,
  duracion_dias: item.duracion_dias ? Number(item.duracion_dias) : undefined,
  costo_estimado: parseFloat(item.costo_estimado) || 0,
  costo_real: parseFloat(item.costo_real) || 0,
  avance: parseFloat(item.avance) || 0,
  es_hito: Boolean(item.es_hito),
  orden: Number(item.orden) || 0,
  children: item.children ? item.children.map(convertWBSItem) : []
});

const convertUser = (item: any): WBSUser => ({
  id: Number(item.id),
  nombre: item.nombre,
  email: item.email
});

const convertSummary = (item: any): WBSSummary => ({
  nivel: Number(item.nivel),
  total: Number(item.total),
  completados: Number(item.completados),
  en_progreso: Number(item.en_progreso),
  pendientes: Number(item.pendientes),
  avance_promedio: parseFloat(item.avance_promedio) || 0,
  costo_total_estimado: parseFloat(item.costo_total_estimado) || 0,
  costo_total_real: parseFloat(item.costo_total_real) || 0
});

export const wbsService = {
  // Obtener WBS jerárquico
  getByProject: async (projectId: number): Promise<ApiResponse<WBSItem[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/proyectos/${projectId}/wbs`);
    return {
      ...response.data,
      data: response.data.data.map(convertWBSItem)
    };
  },

  // Obtener WBS plano
  getByProjectFlat: async (projectId: number): Promise<ApiResponse<WBSItem[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/proyectos/${projectId}/wbs/flat`);
    return {
      ...response.data,
      data: response.data.data.map(convertWBSItem)
    };
  },

  // Obtener resumen
  getSummary: async (projectId: number): Promise<ApiResponse<WBSSummary[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/proyectos/${projectId}/wbs/summary`);
    return {
      ...response.data,
      data: response.data.data.map(convertSummary)
    };
  },

  // Obtener ruta crítica
  getCriticalPath: async (projectId: number): Promise<ApiResponse<WBSItem[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/proyectos/${projectId}/wbs/critical-path`);
    return {
      ...response.data,
      data: response.data.data.map(convertWBSItem)
    };
  },

  // Obtener usuarios
  getUsers: async (): Promise<ApiResponse<WBSUser[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/wbs/users');
    return {
      ...response.data,
      data: response.data.data.map(convertUser)
    };
  },

  // Obtener un elemento
  getById: async (id: number): Promise<ApiResponse<WBSItem>> => {
    const response = await api.get<ApiResponse<any>>(`/wbs/${id}`);
    return {
      ...response.data,
      data: convertWBSItem(response.data.data)
    };
  },

  // Crear elemento
  create: async (projectId: number, item: Partial<WBSItem>): Promise<ApiResponse<WBSItem>> => {
    const response = await api.post<ApiResponse<any>>(`/proyectos/${projectId}/wbs`, item);
    return {
      ...response.data,
      data: convertWBSItem(response.data.data)
    };
  },

  // Actualizar elemento
  update: async (id: number, item: Partial<WBSItem>): Promise<ApiResponse<WBSItem>> => {
    const response = await api.put<ApiResponse<any>>(`/wbs/${id}`, item);
    return {
      ...response.data,
      data: convertWBSItem(response.data.data)
    };
  },

  // Actualizar avance
  updateProgress: async (id: number, avance: number, estado: string): Promise<ApiResponse<WBSItem>> => {
    const response = await api.put<ApiResponse<any>>(`/wbs/${id}/progress`, { avance, estado });
    return {
      ...response.data,
      data: convertWBSItem(response.data.data)
    };
  },

  // Eliminar elemento
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/wbs/${id}`);
    return response.data;
  }
};
