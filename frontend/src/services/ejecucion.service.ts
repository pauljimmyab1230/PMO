import api from './api';
import { ApiResponse } from '../types';

export interface Issue {
  id: number;
  proyecto_id: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  responsable_id?: number;
  responsable_nombre?: string;
  wbs_id?: number;
  wbs_codigo?: string;
  solucion?: string;
  fecha_deteccion?: string;
  fecha_resolucion?: string;
}

export interface Entregable {
  id: number;
  proyecto_id: number;
  nombre: string;
  descripcion?: string;
  wbs_id?: number;
  wbs_codigo?: string;
  fecha_entrega_planeada?: string;
  fecha_entrega_real?: string;
  estado: 'pendiente' | 'en_progreso' | 'entregado' | 'aprobado' | 'rechazado';
  aprobado_por?: number;
  aprobado_por_nombre?: string;
  observaciones?: string;
}

export interface BitacoraEntry {
  id: number;
  proyecto_id: number;
  tipo: 'evento' | 'decision' | 'acuerdo' | 'problema' | 'avance';
  descripcion: string;
  autor_id?: number;
  autor_nombre?: string;
  visible_sponsor: boolean;
  fecha: string;
}

export interface Actividad {
  id: number;
  proyecto_id: number;
  wbs_id?: number;
  fecha: string;
  actividad_realizada: string;
  avance_porcentaje: number;
  horas_trabajadas: number;
  registrado_por?: number;
  registrado_nombre?: string;
  wbs_codigo?: string;
  wbs_nombre?: string;
}

export interface EjecucionSummary {
  issues: { total: number; abiertos: number };
  entregables: { total: number; aprobados: number };
  actividades: { total: number; en_progreso: number };
  bitacora: { total: number };
}

const convertIssue = (item: any): Issue => ({ ...item, id: Number(item.id) });
const convertEntregable = (item: any): Entregable => ({ ...item, id: Number(item.id) });
const convertBitacora = (item: any): BitacoraEntry => ({ ...item, id: Number(item.id), visible_sponsor: Boolean(item.visible_sponsor) });

export const ejecucionService = {
  // Summary
  getSummary: async (projectId: number): Promise<ApiResponse<EjecucionSummary>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/ejecucion/summary`);
    return response.data;
  },

  // Issues
  getIssues: async (projectId: number): Promise<ApiResponse<Issue[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/issues`);
    return { ...response.data, data: (response.data.data || []).map(convertIssue) };
  },
  createIssue: async (projectId: number, item: Partial<Issue>): Promise<ApiResponse<Issue>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/issues`, item);
    return { ...response.data, data: convertIssue(response.data.data) };
  },
  updateIssue: async (id: number, item: Partial<Issue>): Promise<ApiResponse<Issue>> => {
    const response = await api.put<any>(`/ejecucion/issues/${id}`, item);
    return { ...response.data, data: convertIssue(response.data.data) };
  },
  deleteIssue: async (id: number): Promise<ApiResponse<void>> => {
    return (await api.delete(`/ejecucion/issues/${id}`)).data;
  },

  // Entregables
  getEntregables: async (projectId: number): Promise<ApiResponse<Entregable[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/entregables`);
    return { ...response.data, data: (response.data.data || []).map(convertEntregable) };
  },
  createEntregable: async (projectId: number, item: Partial<Entregable>): Promise<ApiResponse<Entregable>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/entregables`, item);
    return { ...response.data, data: convertEntregable(response.data.data) };
  },
  updateEntregable: async (id: number, item: Partial<Entregable>): Promise<ApiResponse<Entregable>> => {
    const response = await api.put<any>(`/ejecucion/entregables/${id}`, item);
    return { ...response.data, data: convertEntregable(response.data.data) };
  },
  deleteEntregable: async (id: number): Promise<ApiResponse<void>> => {
    return (await api.delete(`/ejecucion/entregables/${id}`)).data;
  },

  // Bitácora
  getBitacora: async (projectId: number): Promise<ApiResponse<BitacoraEntry[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/bitacora`);
    return { ...response.data, data: (response.data.data || []).map(convertBitacora) };
  },
  createBitacora: async (projectId: number, item: Partial<BitacoraEntry>): Promise<ApiResponse<BitacoraEntry>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/bitacora`, item);
    return { ...response.data, data: convertBitacora(response.data.data) };
  },
  deleteBitacora: async (id: number): Promise<ApiResponse<void>> => {
    return (await api.delete(`/ejecucion/bitacora/${id}`)).data;
  },

  // Issues - update status only
  updateIssueStatus: async (id: number, estado: string): Promise<ApiResponse<Issue>> => {
    const response = await api.put<any>(`/ejecucion/issues/${id}/status`, { estado });
    return { ...response.data, data: convertIssue(response.data.data) };
  },

  // Entregables - update status only
  updateEntregableStatus: async (id: number, estado: string, observaciones?: string): Promise<ApiResponse<Entregable>> => {
    const response = await api.put<any>(`/ejecucion/entregables/${id}/status`, { estado, observaciones });
    return { ...response.data, data: convertEntregable(response.data.data) };
  },

  // Actividades
  getActividades: async (projectId: number): Promise<ApiResponse<Actividad[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/actividades`);
    return { ...response.data, data: (response.data.data || []).map((item: any) => ({ ...item, id: Number(item.id) })) };
  },
  createActividad: async (projectId: number, item: Partial<Actividad>): Promise<ApiResponse<Actividad>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/actividades`, item);
    return { ...response.data, data: { ...response.data.data, id: Number(response.data.data.id) } };
  },
  deleteActividad: async (id: number): Promise<ApiResponse<void>> => {
    return (await api.delete(`/ejecucion/actividades/${id}`)).data;
  },

  // Utilities
  getUsers: async (projectId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/ejecucion/users`);
    return response.data;
  },
  getWBSActivities: async (projectId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/ejecucion/wbs`);
    return response.data;
  }
};
