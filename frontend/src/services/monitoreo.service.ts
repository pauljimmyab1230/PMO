import api from './api';
import { ApiResponse } from '../types';

export interface MonitoreoDashboard {
  project: any;
  wbs: { total: number; completadas: number; en_progreso: number; avance_promedio: number };
  presupuesto: { total: number; real: number };
  issues: { total: number; abiertos: number; criticos: number };
  riesgos: { total: number; criticos: number };
  entregables: { total: number; aprobados: number };
  tiempo: { diasTranscurridos: number; diasRestantes: number; porcentajeTiempo: string };
}

export interface ValorGanado {
  id: number; proyecto_id: number; periodo: string;
  pv: number; ev: number; ac: number; bac: number;
  spi?: number; cpi?: number;
  eac?: number; etc?: number; vac?: number;
}

export interface Indicador {
  id: number; proyecto_id: number; nombre: string; formula?: string;
  meta?: number; unidad?: string; frecuencia_medicion?: string;
  responsable_id?: number; responsable_nombre?: string;
}

export interface Cambio {
  id: number; proyecto_id: number; codigo: string; titulo: string;
  descripcion?: string; justificacion?: string;
  impacto_alcance?: string; impacto_tiempo?: string;
  impacto_costo?: number; impacto_calidad?: string;
  estado: string; solicitado_por?: number; solicitado_por_nombre?: string;
  decidido_por?: number; decidido_por_nombre?: string;
  fecha_solicitud?: string; fecha_decision?: string; motivo_decision?: string;
}

const num = (v: any) => parseFloat(v) || 0;

export const monitoreoService = {
  getDashboard: async (projectId: number): Promise<ApiResponse<MonitoreoDashboard>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/monitoreo/dashboard`);
    return response.data;
  },
  // Valor Ganado
  getValorGanado: async (projectId: number): Promise<ApiResponse<ValorGanado[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/monitoreo/valor-ganado`);
    return { ...response.data, data: (response.data.data || []).map((i: any) => ({ ...i, pv: num(i.pv), ev: num(i.ev), ac: num(i.ac), bac: num(i.bac) })) };
  },
  createValorGanado: async (projectId: number, item: Partial<ValorGanado>): Promise<ApiResponse<ValorGanado>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/monitoreo/valor-ganado`, item);
    return response.data;
  },
  deleteValorGanado: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/monitoreo/valor-ganado/${id}`)).data,
  // Indicadores
  getIndicadores: async (projectId: number): Promise<ApiResponse<Indicador[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/monitoreo/indicadores`);
    return { ...response.data, data: response.data.data || [] };
  },
  createIndicador: async (projectId: number, item: Partial<Indicador>): Promise<ApiResponse<Indicador>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/monitoreo/indicadores`, item);
    return response.data;
  },
  updateIndicador: async (id: number, item: Partial<Indicador>): Promise<ApiResponse<Indicador>> => {
    const response = await api.put<any>(`/monitoreo/indicadores/${id}`, item);
    return response.data;
  },
  deleteIndicador: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/monitoreo/indicadores/${id}`)).data,
  // Cambios
  getCambios: async (projectId: number): Promise<ApiResponse<Cambio[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/monitoreo/cambios`);
    return { ...response.data, data: response.data.data || [] };
  },
  createCambio: async (projectId: number, item: Partial<Cambio>): Promise<ApiResponse<Cambio>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/monitoreo/cambios`, item);
    return response.data;
  },
  updateCambio: async (id: number, item: Partial<Cambio>): Promise<ApiResponse<Cambio>> => {
    const response = await api.put<any>(`/monitoreo/cambios/${id}`, item);
    return response.data;
  },
  updateCambioStatus: async (id: number, estado: string, motivo?: string): Promise<ApiResponse<Cambio>> => {
    const response = await api.put<any>(`/monitoreo/cambios/${id}/status`, { estado, motivo_decision: motivo });
    return response.data;
  },
  deleteCambio: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/monitoreo/cambios/${id}`)).data,
  // Users
  getUsers: async (projectId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/monitoreo/users`);
    return response.data;
  }
};
