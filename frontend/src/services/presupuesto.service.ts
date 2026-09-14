import api from './api';
import { ApiResponse } from '../types';

export interface PresupuestoItem {
  id: number;
  proyecto_id: number;
  wbs_id?: number;
  categoria_id: number;
  descripcion: string;
  cantidad: number;
  unidad: string;
  costo_unitario: number;
  costo_total: number;
  monto_aprobado: number;
  categoria_nombre?: string;
  categoria_tipo?: string;
  wbs_codigo?: string;
  wbs_nombre?: string;
}

export interface PresupuestoCategory {
  id: number;
  nombre: string;
  tipo: string;
  monto_aprobado: number;
  monto_estimado: number;
}

export interface PresupuestoSummary {
  byCategory: PresupuestoCategory[];
  totals: {
    total_aprobado: number;
    total_estimado: number;
    total_items: number;
  };
  realCosts: {
    total_real: number;
  };
  projectBudget: number;
}

export interface RealCost {
  id: number;
  proyecto_id: number;
  presupuesto_id?: number;
  fecha: string;
  monto: number;
  descripcion: string;
  comprobante?: string;
  registrado_por?: number;
  presupuesto_descripcion?: string;
  categoria_nombre?: string;
  registrado_por_nombre?: string;
}

export interface WBSActivity {
  id: number;
  codigo: string;
  nombre: string;
  nivel: number;
}

const convertItem = (item: any): PresupuestoItem => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  wbs_id: item.wbs_id ? Number(item.wbs_id) : undefined,
  categoria_id: Number(item.categoria_id),
  cantidad: parseFloat(item.cantidad) || 0,
  costo_unitario: parseFloat(item.costo_unitario) || 0,
  costo_total: parseFloat(item.costo_total) || 0,
  monto_aprobado: parseFloat(item.monto_aprobado) || 0
});

const convertRealCost = (item: any): RealCost => ({
  ...item,
  id: Number(item.id),
  proyecto_id: Number(item.proyecto_id),
  presupuesto_id: item.presupuesto_id ? Number(item.presupuesto_id) : undefined,
  monto: parseFloat(item.monto) || 0
});

const convertActivity = (item: any): WBSActivity => ({
  id: Number(item.id),
  codigo: item.codigo,
  nombre: item.nombre,
  nivel: Number(item.nivel)
});

export const presupuestoService = {
  // Obtener presupuesto
  getByProject: async (projectId: number): Promise<ApiResponse<PresupuestoItem[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/presupuesto`);
    return {
      ...response.data,
      data: response.data.data.map(convertItem)
    };
  },

  // Obtener resumen
  getSummary: async (projectId: number): Promise<ApiResponse<PresupuestoSummary>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/presupuesto/summary`);
    return response.data;
  },

  // Obtener gastos reales
  getRealCosts: async (projectId: number): Promise<ApiResponse<RealCost[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/presupuesto/real-costs`);
    return {
      ...response.data,
      data: response.data.data.map(convertRealCost)
    };
  },

  // Obtener categorías
  getCategories: async (projectId: number): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/presupuesto/categories`);
    return response.data;
  },

  // Obtener actividades WBS
  getWBSActivities: async (projectId: number): Promise<ApiResponse<WBSActivity[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/presupuesto/wbs-activities`);
    return {
      ...response.data,
      data: response.data.data.map(convertActivity)
    };
  },

  // Crear elemento
  create: async (projectId: number, item: Partial<PresupuestoItem>): Promise<ApiResponse<PresupuestoItem>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/presupuesto`, item);
    return {
      ...response.data,
      data: convertItem(response.data.data)
    };
  },

  // Actualizar elemento
  update: async (id: number, item: Partial<PresupuestoItem>): Promise<ApiResponse<PresupuestoItem>> => {
    const response = await api.put<any>(`/presupuesto/${id}`, item);
    return {
      ...response.data,
      data: convertItem(response.data.data)
    };
  },

  // Eliminar elemento
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/presupuesto/${id}`);
    return response.data;
  },

  // Registrar gasto real
  addRealCost: async (projectId: number, cost: Partial<RealCost>): Promise<ApiResponse<RealCost>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/presupuesto/real-costs`, cost);
    return {
      ...response.data,
      data: convertRealCost(response.data.data)
    };
  },

  // Eliminar gasto real
  deleteRealCost: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/presupuesto/real-costs/${id}`);
    return response.data;
  }
};
