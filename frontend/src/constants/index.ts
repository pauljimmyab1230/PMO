/**
 * Constantes del sistema PMO
 */

// Estados del Proyecto
export const PROJECT_STATES = {
  DRAFT: 'Borrador',
  IN_REVIEW: 'En Revisión',
  APPROVED: 'Aprobado',
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
} as const;

// Niveles de Riesgo
export const RISK_LEVELS = {
  LOW: { min: 1, max: 6, label: 'Bajo', color: 'green' },
  MEDIUM: { min: 7, max: 12, label: 'Medio', color: 'yellow' },
  HIGH: { min: 13, max: 19, label: 'Alto', color: 'orange' },
  CRITICAL: { min: 20, max: 25, label: 'Crítico', color: 'red' },
} as const;

// Estados de Actividad
export const ACTIVITY_STATES = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_progreso',
  COMPLETED: 'completado',
  CANCELLED: 'cancelado',
} as const;

// Estados de Entregable
export const DELIVERABLE_STATES = {
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_progreso',
  DELIVERED: 'entregado',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
} as const;

// Categorías de Costo
export const COST_CATEGORIES = {
  MANPOWER: 'Mano de Obra',
  MATERIALS: 'Materiales',
  EQUIPMENT: 'Equipamiento',
  SOFTWARE: 'Software',
  INFRASTRUCTURE: 'Infraestructura',
  SUBCONTRACTING: 'Subcontratación',
  TRAINING: 'Capacitación',
  CONTINGENCIES: 'Contingencias',
} as const;

// Tipos de Respuesta a Riesgos
export const RISK_RESPONSES = {
  MITIGATE: 'mitigar',
  TRANSFER: 'transferir',
  ACCEPT: 'aceptar',
  AVOID: 'evitar',
} as const;

// Moneda
export const CURRENCY = {
  SYMBOL: 'S/',
  CODE: 'PEN',
  LOCALE: 'es-PE',
} as const;

// Paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Colores por Estado
export const STATE_COLORS: Record<string, string> = {
  'Borrador': 'slate',
  'En Revisión': 'amber',
  'Aprobado': 'blue',
  'Activo': 'emerald',
  'Pausado': 'yellow',
  'Cerrado': 'violet',
  'Cancelado': 'red',
};

// Colores por Nivel de Riesgo
export const RISK_COLORS: Record<number, string> = {
  1: 'green', 2: 'green', 3: 'green', 4: 'green', 5: 'green',
  6: 'green', 7: 'yellow', 8: 'yellow', 9: 'yellow', 10: 'yellow',
  11: 'yellow', 12: 'yellow', 13: 'orange', 14: 'orange', 15: 'orange',
  16: 'orange', 17: 'orange', 18: 'orange', 19: 'orange',
  20: 'red', 21: 'red', 22: 'red', 23: 'red', 24: 'red', 25: 'red',
};
