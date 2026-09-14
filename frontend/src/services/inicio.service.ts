import api from './api';
import { ApiResponse } from '../types';

export interface Charter {
  id: number; proyecto_id: number;
  resumen_ejecutivo?: string; necesidad_negocio?: string;
  alcance_alto_nivel?: string; hitos_principales?: any[];
  supuestos_clave?: string; restricciones?: string;
  riesgos_principales?: string; presupuesto_estimado?: number;
  fecha_inicio_estimada?: string; fecha_fin_estimada?: string;
  estado: string; aprobado_por?: number; aprobado_por_nombre?: string;
  fecha_aprobacion?: string;
}

export interface Stakeholder {
  id: number; proyecto_id: number;
  nombre: string; organisation?: string; cargo?: string;
  email?: string; telefono?: string;
  nivel_poder: number; nivel_interes: number;
  expectativas?: string; actitud: string;
  estrategia_gestion?: string; responsable_id?: number;
  responsable_nombre?: string;
}

export interface Viabilidad {
  id: number; proyecto_id: number;
  tipo: string; justificacion?: string;
  es_viable: boolean; condiciones?: string;
  evaluado_por?: number; evaluado_por_nombre?: string;
  fecha_evaluacion?: string;
}

export const inicioService = {
  // Charter
  getCharter: async (projectId: number): Promise<ApiResponse<Charter | null>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/inicio/charter`);
    return response.data;
  },
  saveCharter: async (projectId: number, data: Partial<Charter>): Promise<ApiResponse<Charter>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/inicio/charter`, data);
    return response.data;
  },
  approveCharter: async (projectId: number): Promise<ApiResponse<Charter>> => {
    const response = await api.put<any>(`/proyectos/${projectId}/inicio/charter/approve`);
    return response.data;
  },

  // Stakeholders
  getStakeholders: async (projectId: number): Promise<ApiResponse<Stakeholder[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/inicio/stakeholders`);
    return { ...response.data, data: response.data.data || [] };
  },
  createStakeholder: async (projectId: number, data: Partial<Stakeholder>): Promise<ApiResponse<Stakeholder>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/inicio/stakeholders`, data);
    return response.data;
  },
  updateStakeholder: async (id: number, data: Partial<Stakeholder>): Promise<ApiResponse<Stakeholder>> => {
    const response = await api.put<any>(`/inicio/stakeholders/${id}`, data);
    return response.data;
  },
  deleteStakeholder: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/inicio/stakeholders/${id}`)).data,

  // Viabilidad
  getViabilidad: async (projectId: number): Promise<ApiResponse<Viabilidad[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/inicio/viabilidad`);
    return { ...response.data, data: response.data.data || [] };
  },
  createViabilidad: async (projectId: number, data: Partial<Viabilidad>): Promise<ApiResponse<Viabilidad>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/inicio/viabilidad`, data);
    return response.data;
  },
  updateViabilidad: async (id: number, data: Partial<Viabilidad>): Promise<ApiResponse<Viabilidad>> => {
    const response = await api.put<any>(`/inicio/viabilidad/${id}`, data);
    return response.data;
  },
  deleteViabilidad: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/inicio/viabilidad/${id}`)).data,

  // Users
  getUsers: async (projectId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/inicio/users`);
    return response.data;
  }
};
