export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'pmo' | 'pm' | 'equipo' | 'sponsor' | 'visor';
  activo: boolean;
  ultimo_acceso?: string;
  creado_en: string;
}

export interface Project {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  tipo_id?: number;
  estado_id?: number;
  area_id?: number;
  sponsor_id?: number;
  pm_id?: number;
  fecha_solicitud?: string;
  fecha_aprobacion?: string;
  fecha_inicio_planeada?: string;
  fecha_fin_planeada?: string;
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  presupuesto_planeado?: number;
  presupuesto_real?: number;
  justificacion?: string;
  objetivogeneral?: string;
  alcance_general?: string;
  estado_nombre?: string;
  tipo_nombre?: string;
  sponsor_nombre?: string;
  pm_nombre?: string;
  area_nombre?: string;
  creado_en: string;
}

export interface Stakeholder {
  id: number;
  proyecto_id: number;
  nombre: string;
  organisation?: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  nivel_poder: number;
  nivel_interes: number;
  expectativas?: string;
  actitud: 'apoyador' | 'neutral' | 'detractor';
  estrategia_gestion?: string;
}

export interface WBS {
  id: number;
  proyecto_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  padre_id?: number;
  responsable_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion_dias?: number;
  costo_estimado?: number;
  costo_real?: number;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  avance: number;
  es_hito: boolean;
  orden?: number;
  children?: WBS[];
}

export interface Risk {
  id: number;
  proyecto_id: number;
  codigo?: string;
  titulo: string;
  descripcion?: string;
  probabilidad: number;
  impacto: number;
  nivel_riesgo?: number;
  categoria?: string;
  tipo_respuesta?: 'mitigar' | 'transferir' | 'aceptar' | 'evitar';
  plan_respuesta?: string;
  responsable_id?: number;
  estado: 'identificado' | 'en_seguimiento' | 'materializado' | 'cerrado';
}

export interface BudgetItem {
  id: number;
  proyecto_id: number;
  wbs_id?: number;
  categoria_id?: number;
  descripcion?: string;
  cantidad?: number;
  unidad?: string;
  costo_unitario?: number;
  costo_total?: number;
  monto_aprobado?: number;
}

export interface Deliverable {
  id: number;
  proyecto_id: number;
  wbs_id?: number;
  nombre: string;
  descripcion?: string;
  fecha_entrega_planeada?: string;
  fecha_entrega_real?: string;
  estado: 'pendiente' | 'en_progreso' | 'entregado' | 'aprobado' | 'rechazado';
}

export interface Issue {
  id: number;
  proyecto_id: number;
  titulo: string;
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  responsable_id?: number;
  fecha_deteccion?: string;
}

export interface ProjectDashboard {
  project: Project;
  wbs: {
    total_actividades: number;
    completadas: number;
    en_progreso: number;
    avance_promedio: number;
  };
  budget: {
    presupuesto_total: number;
    gasto_real: number;
  };
  risks: {
    total_riesgos: number;
    criticos: number;
    activos: number;
  };
  issues: {
    total_issues: number;
    abiertos: number;
    criticos: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
