import api from './api';
import { ApiResponse } from '../types';

export interface PortafolioDashboard {
  total: number;
  byStatus: { estado: string; total: number; color: string }[];
  presupuesto: { total_planeado: number; total_real: number; total_gastado: number };
  issues: { total_abiertos: number };
  riesgos: { criticos: number };
  byArea: { area: string; total: number }[];
  proximosVencer: any[];
  ultimosProyectos: any[];
}

export interface PortafolioProject {
  id: number; codigo: string; nombre: string;
  estado_nombre: string; estado_color: string;
  tipo_nombre?: string; sponsor_nombre?: string;
  pm_nombre?: string; area_nombre?: string;
  fecha_inicio_planeada?: string; fecha_fin_planeada?: string;
  presupuesto_planeado?: number;
  issues_abiertos: number; riesgos_criticos: number;
  avance_wbs?: number;
}

export const portafolioService = {
  getDashboard: async (): Promise<ApiResponse<PortafolioDashboard>> => {
    const response = await api.get<any>('/portafolio/dashboard');
    return response.data;
  },

  getProjects: async (): Promise<ApiResponse<PortafolioProject[]>> => {
    const response = await api.get<any>('/portafolio/projects');
    return { ...response.data, data: response.data.data || [] };
  },

  getStatsByPM: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<any>('/portafolio/stats-by-pm');
    return { ...response.data, data: response.data.data || [] };
  }
};
