import api from './api';
import { ApiResponse } from '../types';

export interface Riesgo {
  id: number;
  proyecto_id: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  probabilidad: number;
  impacto: number;
  nivel_riesgo: number;
  categoria?: string;
  tipo_impacto?: string;
  tipo_respuesta?: 'mitigar' | 'transferir' | 'aceptar' | 'evitar';
  plan_respuesta?: string;
  responsable_id?: number;
  responsable_nombre?: string;
  estado: 'identificado' | 'en_seguimiento' | 'materializado' | 'cerrado';
  fecha_identificacion?: string;
  fecha_cierre?: string;
  probabilidad_residual?: number;
  impacto_residual?: number;
}

export interface RiesgoSummary {
  byStatus: { estado: string; total: number }[];
  byLevel: { nivel: string; total: number }[];
  byCategory: { categoria: string; total: number; promedio: number }[];
  stats: {
    total_riesgos: number;
    promedio_nivel: number;
    identificados: number;
    en_seguimiento: number;
    materializados: number;
    cerrados: number;
  };
}

export interface HeatmapCell {
  probabilidad: number;
  impacto: number;
  nivel: number;
  riesgos: Riesgo[];
}

export interface RiesgoUser {
  id: number;
  nombre: string;
}

const convertRiesgo = (item: any): Riesgo => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  probabilidad: Number(item.probabilidad),
  impacto: Number(item.impacto),
  nivel_riesgo: Number(item.nivel_riesgo),
  responsable_id: item.responsable_id ? Number(item.responsable_id) : undefined
});

export const riesgosService = {
  // Obtener riesgos
  getByProject: async (projectId: number): Promise<ApiResponse<Riesgo[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/riesgos`);
    return {
      ...response.data,
      data: response.data.data.map(convertRiesgo)
    };
  },

  // Obtener resumen
  getSummary: async (projectId: number): Promise<ApiResponse<RiesgoSummary>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/riesgos/summary`);
    return response.data;
  },

  // Obtener heatmap
  getHeatmap: async (projectId: number): Promise<ApiResponse<{ matrix: HeatmapCell[], risks: Riesgo[] }>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/riesgos/heatmap`);
    return {
      ...response.data,
      data: {
        ...response.data.data,
        risks: response.data.data.risks.map(convertRiesgo)
      }
    };
  },

  // Obtener usuarios
  getUsers: async (projectId: number): Promise<ApiResponse<RiesgoUser[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/riesgos/users`);
    return response.data;
  },

  // Obtener un riesgo
  getById: async (id: number): Promise<ApiResponse<Riesgo>> => {
    const response = await api.get<any>(`/riesgos/${id}`);
    return {
      ...response.data,
      data: convertRiesgo(response.data.data)
    };
  },

  // Crear riesgo
  create: async (projectId: number, riesgo: Partial<Riesgo>): Promise<ApiResponse<Riesgo>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/riesgos`, riesgo);
    return {
      ...response.data,
      data: convertRiesgo(response.data.data)
    };
  },

  // Actualizar riesgo
  update: async (id: number, riesgo: Partial<Riesgo>): Promise<ApiResponse<Riesgo>> => {
    const response = await api.put<any>(`/riesgos/${id}`, riesgo);
    return {
      ...response.data,
      data: convertRiesgo(response.data.data)
    };
  },

  // Eliminar riesgo
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/riesgos/${id}`);
    return response.data;
  }
};
