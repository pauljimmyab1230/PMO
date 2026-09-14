import api from './api';
import { ApiResponse } from '../types';

export interface MarcoLogicoItem {
  id: number;
  proyecto_id: number;
  nivel_id: number;
  nivel_nombre?: string;
  nivel_numero?: number;
  codigo: string;
  descripcion: string;
  indicador?: string;
  meta?: string;
  metodo_verificacion?: string;
  supuestos?: string;
  avance_porcentaje: number;
  avance_fecha?: string;
  padre_id?: number;
  orden: number;
  children?: MarcoLogicoItem[];
}

export interface MarcoLogicoLevel {
  id: number;
  nombre: string;
  nivel_numero: number;
  descripcion: string;
}

export interface MarcoLogicoSummary {
  nivel: string;
  total: number;
  completados: number;
  avance_promedio: number;
}

// Función para convertir strings a números
const convertNumericFields = (item: any): MarcoLogicoItem => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  nivel_id: Number(item.nivel_id),
  nivel_numero: item.nivel_numero ? Number(item.nivel_numero) : undefined,
  avance_porcentaje: parseFloat(item.avance_porcentaje) || 0,
  padre_id: item.padre_id ? Number(item.padre_id) : undefined,
  orden: Number(item.orden) || 0,
  children: item.children ? item.children.map(convertNumericFields) : []
});

const convertLevels = (item: any): MarcoLogicoLevel => ({
  ...item,
  id: Number(item.id),
  nivel_numero: Number(item.nivel_numero)
});

export const marcoLogicoService = {
  // Obtener marco lógico jerárquico
  getByProject: async (projectId: number): Promise<ApiResponse<MarcoLogicoItem[]>> => {
    const response = await api.get<ApiResponse<any[]>>(`/proyectos/${projectId}/marco-logico`);
    return {
      ...response.data,
      data: response.data.data.map(convertNumericFields)
    };
  },

  // Obtener marco lógico plano
  getByProjectFlat: async (projectId: number): Promise<ApiResponse<MarcoLogicoItem[]>> => {
    const response = await api.get<ApiResponse<MarcoLogicoItem[]>>(`/proyectos/${projectId}/marco-logico/flat`);
    return response.data;
  },

  // Obtener resumen
  getSummary: async (projectId: number): Promise<ApiResponse<MarcoLogicoSummary[]>> => {
    const response = await api.get<ApiResponse<MarcoLogicoSummary[]>>(`/proyectos/${projectId}/marco-logico/summary`);
    return response.data;
  },

  // Obtener niveles
  getLevels: async (): Promise<ApiResponse<MarcoLogicoLevel[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/marco-logico/niveles');
    return {
      ...response.data,
      data: response.data.data.map(convertLevels)
    };
  },

  // Obtener un elemento
  getById: async (id: number): Promise<ApiResponse<MarcoLogicoItem>> => {
    const response = await api.get<ApiResponse<MarcoLogicoItem>>(`/marco-logico/${id}`);
    return response.data;
  },

  // Crear elemento
  create: async (projectId: number, item: Partial<MarcoLogicoItem>): Promise<ApiResponse<MarcoLogicoItem>> => {
    const response = await api.post<ApiResponse<MarcoLogicoItem>>(`/proyectos/${projectId}/marco-logico`, item);
    return response.data;
  },

  // Actualizar elemento
  update: async (id: number, item: Partial<MarcoLogicoItem>): Promise<ApiResponse<MarcoLogicoItem>> => {
    const response = await api.put<ApiResponse<MarcoLogicoItem>>(`/marco-logico/${id}`, item);
    return response.data;
  },

  // Actualizar avance
  updateProgress: async (id: number, avance_porcentaje: number): Promise<ApiResponse<MarcoLogicoItem>> => {
    const response = await api.put<ApiResponse<MarcoLogicoItem>>(`/marco-logico/${id}/progress`, { avance_porcentaje });
    return response.data;
  },

  // Eliminar elemento
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/marco-logico/${id}`);
    return response.data;
  }
};
