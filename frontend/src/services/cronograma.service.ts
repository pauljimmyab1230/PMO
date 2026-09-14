import api from './api';
import { ApiResponse } from '../types';

export interface GanttActivity {
  id: number;
  codigo: string;
  nombre: string;
  nivel: number;
  padre_id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_dias?: number;
  avance: number;
  estado: string;
  es_hito: boolean;
  responsable_id?: number;
  responsable_nombre?: string;
}

export interface GanttDependency {
  fromId: number;
  toId: number;
  type: string;
}

export interface GanttMilestone {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  avance: number;
  estado: string;
}

export interface GanttData {
  activities: GanttActivity[];
  dependencies: GanttDependency[];
  milestones: GanttMilestone[];
  projectStart: string;
  projectEnd: string;
}

export interface CronogramaStats {
  total_actividades: number;
  completadas: number;
  en_progreso: number;
  pendientes: number;
  avance_promedio: number;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_total: number;
  diasTranscurridos: number;
  diasRestantes: number;
  porcentajeTiempo: string;
}

const convertActivity = (item: any): GanttActivity => ({
  ...item,
  id: Number(item.id),
  nivel: Number(item.nivel),
  padre_id: item.padre_id ? Number(item.padre_id) : undefined,
  duracion_dias: item.duracion_dias ? Number(item.duracion_dias) : undefined,
  avance: parseFloat(item.avance) || 0,
  es_hito: Boolean(item.es_hito),
  responsable_id: item.responsable_id ? Number(item.responsable_id) : undefined
});

const convertStats = (item: any): CronogramaStats => ({
  total_actividades: Number(item.total_actividades),
  completadas: Number(item.completadas),
  en_progreso: Number(item.en_progreso),
  pendientes: Number(item.pendientes),
  avance_promedio: parseFloat(item.avance_promedio) || 0,
  fecha_inicio: item.fecha_inicio,
  fecha_fin: item.fecha_fin,
  duracion_total: Number(item.duracion_total) || 0,
  diasTranscurridos: Number(item.diasTranscurridos),
  diasRestantes: Number(item.diasRestantes),
  porcentajeTiempo: item.porcentajeTiempo
});

export const cronogramaService = {
  // Obtener datos para Gantt
  getGanttData: async (projectId: number): Promise<ApiResponse<GanttData>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/cronograma`);
    return {
      ...response.data,
      data: {
        ...response.data.data,
        activities: response.data.data.activities.map(convertActivity)
      }
    };
  },

  // Obtener estadísticas
  getStats: async (projectId: number): Promise<ApiResponse<CronogramaStats>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/cronograma/stats`);
    return {
      ...response.data,
      data: convertStats(response.data.data)
    };
  },

  // Agregar dependencia
  addDependency: async (projectId: number, from: number, to: number, type: string = 'fin-inicio'): Promise<ApiResponse<any>> => {
    const response = await api.post(`/proyectos/${projectId}/cronograma/dependencies`, {
      actividad_origen_id: from,
      actividad_destino_id: to,
      tipo_dependencia: type
    });
    return response.data;
  },

  // Actualizar fechas
  updateDates: async (activityId: number, fecha_inicio: string, fecha_fin: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/cronograma/activities/${activityId}/dates`, {
      fecha_inicio,
      fecha_fin
    });
    return response.data;
  },

  // Eliminar dependencia
  deleteDependency: async (dependencyId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/cronograma/dependencies/${dependencyId}`);
    return response.data;
  }
};
