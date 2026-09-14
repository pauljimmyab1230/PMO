import api from './api';
import { ApiResponse } from '../types';

export interface CierreProyecto {
  id: number; proyecto_id: number;
  alcance_completado: boolean; documentacion_entregada: boolean;
  contratos_cerrados: boolean; activos_transferidos: boolean;
  lecciones_registradas: boolean; motivo_cierre?: string;
  observaciones?: string; cerrado_por?: number; cerrado_por_nombre?: string;
  fecha_cierre?: string;
}

export interface Leccion {
  id: number; proyecto_id: number;
  categoria: 'que_fue_bien' | 'que_fue_malo' | 'mejora_sugerida';
  titulo: string; descripcion: string; recomendacion?: string;
  registrador_por?: number; registrador_nombre?: string; fecha_registro?: string;
}

export interface Transferencia {
  id: number; proyecto_id: number;
  activo: string; descripcion?: string;
  area_destino?: number; area_destino_nombre?: string;
  responsable?: number; responsable_nombre?: string;
  recibido_por?: number; recibido_por_nombre?: string;
  fecha_transferencia?: string; estado: string;
}

export interface CierreFinanciero {
  id: number; proyecto_id: number;
  presupuesto_total: number; gasto_total: number;
  ahorro_generado: number; sobrecosto: number;
  contratos_cerrados: number; pagos_pendientes: number;
  balance_final?: string; aprobado_por?: number;
  aprobado_por_nombre?: string; fecha_cierre?: string;
}

const num = (v: any) => parseFloat(v) || 0;

export const cierreService = {
  // Checklist
  getCierre: async (projectId: number): Promise<ApiResponse<CierreProyecto | null>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/cierre`);
    return response.data;
  },
  saveCierre: async (projectId: number, data: Partial<CierreProyecto>): Promise<ApiResponse<CierreProyecto>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/cierre`, data);
    return response.data;
  },

  // Lecciones
  getLecciones: async (projectId: number): Promise<ApiResponse<Leccion[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/lecciones`);
    return { ...response.data, data: response.data.data || [] };
  },
  createLeccion: async (projectId: number, data: Partial<Leccion>): Promise<ApiResponse<Leccion>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/lecciones`, data);
    return response.data;
  },
  updateLeccion: async (id: number, data: Partial<Leccion>): Promise<ApiResponse<Leccion>> => {
    const response = await api.put<any>(`/cierre/lecciones/${id}`, data);
    return response.data;
  },
  deleteLeccion: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/cierre/lecciones/${id}`)).data,

  // Transferencias
  getTransferencias: async (projectId: number): Promise<ApiResponse<Transferencia[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/transferencias`);
    return { ...response.data, data: response.data.data || [] };
  },
  createTransferencia: async (projectId: number, data: Partial<Transferencia>): Promise<ApiResponse<Transferencia>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/transferencias`, data);
    return response.data;
  },
  updateTransferenciaStatus: async (id: number, estado: string): Promise<ApiResponse<Transferencia>> => {
    const response = await api.put<any>(`/cierre/transferencias/${id}/status`, { estado });
    return response.data;
  },
  deleteTransferencia: async (id: number): Promise<ApiResponse<void>> => (await api.delete(`/cierre/transferencias/${id}`)).data,

  // Cierre Financiero
  getCierreFinanciero: async (projectId: number): Promise<ApiResponse<CierreFinanciero | null>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/cierre-financiero`);
    return response.data;
  },
  saveCierreFinanciero: async (projectId: number, data: Partial<CierreFinanciero>): Promise<ApiResponse<CierreFinanciero>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/cierre-financiero`, {
      ...data, presupuesto_total: num(data.presupuesto_total), gasto_total: num(data.gasto_total),
      ahorro_generado: num(data.ahorro_generado), sobrecosto: num(data.sobrecosto),
      contratos_cerrados: num(data.contratos_cerrados), pagos_pendientes: num(data.pagos_pendientes)
    });
    return response.data;
  },

  // Utilities
  getUsers: async (projectId: number): Promise<ApiResponse<any[]>> => (await api.get<any>(`/proyectos/${projectId}/cierre/users`)).data,
  getAreas: async (projectId: number): Promise<ApiResponse<any[]>> => (await api.get<any>(`/proyectos/${projectId}/cierre/areas`)).data
};
