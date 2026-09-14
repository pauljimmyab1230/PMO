import api from './api';
import { ApiResponse } from '../types';

export interface Evaluacion {
  id: number; proyecto_id: number;
  alcance_cumplido?: number; tiempo_cumplido?: number;
  costo_cumplido?: number; calidad_cumplida?: number;
  impacto_esperado?: string; impacto_real?: string;
  beneficiarios_alcanzados?: number; beneficiarios_esperados?: number;
  satisfaccion_sponsor?: number; satisfaccion_equipo?: number;
  satisfaccion_beneficiarios?: number;
  calificacion?: string; lecciones_clave?: string; recomendaciones?: string;
  evaluado_por?: number; evaluado_por_nombre?: string; fecha_evaluacion?: string;
}

export interface Encuesta {
  id: number; proyecto_id: number;
  pregunta: string; tipo_respuesta: string;
  respuesta_promedio: number; total_respuestas: number;
}

export interface ResumenEvaluacion {
  project: any;
  marcoLogico: { total: number; cumplidos: number };
  wbs: { total: number; completadas: number };
  presupuesto: { total: number; real: number };
  entregables: { total: number; aprobados: number };
  lecciones: { total: number };
}

export const evaluacionService = {
  // Resumen
  getResumen: async (projectId: number): Promise<ApiResponse<ResumenEvaluacion>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/evaluacion/resumen`);
    return response.data;
  },

  // Evaluación
  getEvaluacion: async (projectId: number): Promise<ApiResponse<Evaluacion | null>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/evaluacion`);
    return response.data;
  },
  saveEvaluacion: async (projectId: number, data: Partial<Evaluacion>): Promise<ApiResponse<Evaluacion>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/evaluacion`, data);
    return response.data;
  },

  // Encuestas
  getEncuestas: async (projectId: number): Promise<ApiResponse<Encuesta[]>> => {
    const response = await api.get<any>(`/proyectos/${projectId}/evaluacion/encuestas`);
    return { ...response.data, data: response.data.data || [] };
  },
  createEncuesta: async (projectId: number, data: Partial<Encuesta>): Promise<ApiResponse<Encuesta>> => {
    const response = await api.post<any>(`/proyectos/${projectId}/evaluacion/encuestas`, data);
    return response.data;
  },
  updateEncuesta: async (id: number, data: Partial<Encuesta>): Promise<ApiResponse<Encuesta>> => {
    const response = await api.put<any>(`/evaluacion/encuestas/${id}`, data);
    return response.data;
  },
  deleteEncuesta: async (id: number): Promise<ApiResponse<void>> => {
    return (await api.delete(`/evaluacion/encuestas/${id}`)).data;
  }
};
