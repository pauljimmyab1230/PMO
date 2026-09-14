-- ============================================
-- DATOS INICIALES - SISTEMA PMO
-- ============================================

USE pmo_database;

-- ============================================
-- ESTADOS DE PROYECTO
-- ============================================

INSERT INTO estados_proyecto (nombre, color, orden, es_estado_final) VALUES
('Borrador', '#6B7280', 1, FALSE),
('En Revisión', '#F59E0B', 2, FALSE),
('Aprobado', '#10B981', 3, FALSE),
('Activo', '#3B82F6', 4, FALSE),
('Pausado', '#EF4444', 5, FALSE),
('Cerrado', '#8B5CF6', 6, TRUE),
('Cancelado', '#6B7280', 7, TRUE);

-- ============================================
-- TIPOS DE PROYECTO
-- ============================================

INSERT INTO tipos_proyecto (nombre, descripcion) VALUES
('Inversión', 'Proyectos de inversión en infraestructura o tecnología'),
('Mejora', 'Proyectos de mejora de procesos o productividad'),
('Mantenimiento', 'Proyectos de mantenimiento correctivo o preventivo'),
('Desarrollo', 'Proyectos de desarrollo de productos o servicios'),
('Investigación', 'Proyectos de investigación y desarrollo');

-- ============================================
-- CATEGORÍAS DE COSTO
-- ============================================

INSERT INTO categorias_costo (nombre, tipo) VALUES
('Mano de Obra', 'opex'),
('Materiales', 'capex'),
('Equipamiento', 'capex'),
('Software', 'capex'),
('Infraestructura', 'capex'),
('Subcontratación', 'opex'),
('Capacitación', 'opex'),
('Contingencias', 'opex');

-- ============================================
-- NIVELES MARCO LÓGICO
-- ============================================

INSERT INTO niveles_marco_logico (nombre, nivel_numero, descripcion) VALUES
('Fin', 1, 'Objetivo general del proyecto'),
('Resultado', 2, 'Productos o entregables principales'),
('Actividad', 3, 'Acciones para alcanzar resultados'),
('Insumo', 4, 'Recursos necesarios');

-- ============================================
-- ROLES DE PROYECTO
-- ============================================

INSERT INTO roles_proyecto (nombre, tarifa_hora) VALUES
('Project Manager', 85.00),
('Analista Senior', 70.00),
('Analista Junior', 45.00),
('Desarrollador Senior', 75.00),
('Desarrollador Junior', 50.00),
('Tester', 55.00),
('Diseñador UX', 65.00),
('Administrador de Base de Datos', 70.00);

-- ============================================
-- USUARIO ADMIN INICIAL
-- Password: admin123
-- ============================================

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'admin');

-- ============================================
-- ÁREAS DE EJEMPLO
-- ============================================

INSERT INTO areas (nombre, descripcion) VALUES
('Tecnología e Informática', 'Departamento de sistemas y tecnología'),
('Recursos Humanos', 'Gestión de talento humano'),
('Finanzas', 'Departamento financiero'),
('Operaciones', 'Operaciones principales'),
('Gerencia General', 'Dirección estratégica');

-- ============================================
-- PROVEEDORES DE EJEMPLO
-- ============================================

INSERT INTO proveedores (nombre, ruc_nit, email, telefono) VALUES
('Tech Solutions SAC', '20123456789', 'contacto@techsolutions.com', '+51 1 234 5678'),
('Consultora Global SA', '20987654321', 'info@consultoraglobal.com', '+51 1 987 6543'),
('Software Factory SRL', '20567891234', 'ventas@softwarefactory.com', '+51 1 456 7890');

-- ============================================
-- USUARIOS DE EJEMPLO
-- Password para todos: password123
-- ============================================

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('María García', 'maria.garcia@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'pmo'),
('Carlos López', 'carlos.lopez@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'pm'),
('Ana Martínez', 'ana.martinez@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'sponsor'),
('Juan Rodríguez', 'juan.rodriguez@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'equipo'),
('Laura Sánchez', 'laura.sanchez@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'equipo'),
('Pedro Hernández', 'pedro.hernandez@sistema.com', '$2a$10$c1TvV4iH3s6Kr7gHwadogu/E1L8JtI/LvOsadHW1CcHuJBFL0ypeK', 'visor');

-- ============================================
-- PROYECTO DE EJEMPLO
-- ============================================

INSERT INTO proyectos (
    nombre, codigo, descripcion, tipo_id, estado_id, sponsor_id, pm_id, area_id,
    fecha_solicitud, fecha_inicio_planeada, fecha_fin_planeada,
    presupuesto_planeado, justificacion, objetivogeneral, alcance_general,
    creado_por
) VALUES (
    'Sistema de Gestión de Proyectos PMO',
    'PRY-2026-001',
    'Implementar una plataforma web para la gestión integral de proyectos siguiendo estándares PMBOK y marco lógico',
    4, -- Desarrollo
    4, -- Activo
    4, -- Ana Martínez (sponsor)
    3, -- Carlos López (pm)
    1, -- Tecnología
    CURDATE(),
    '2026-09-15',
    '2027-03-15',
    50000.00,
    'La empresa necesita estandarizar la gestión de proyectos para mejorar la eficiencia y reducir sobrecostos',
    'Implementar un sistema que permita gestionar el ciclo de vida completo de proyectos',
    'Sistema web con módulos de PMO, marco lógico, WBS, cronograma, presupuesto, riesgos y reportes',
    1 -- admin
);

-- ============================================
-- STAKEHOLDERS DEL PROYECTO
-- ============================================

INSERT INTO stakeholders (proyecto_id, nombre, organisation, cargo, nivel_poder, nivel_interes, actitud, estrategia_gestion) VALUES
(1, 'Gerente General', 'Gerencia General', 'Máxima autoridad', 5, 3, 'apoyador', 'Mantener informado mensualmente'),
(1, 'Jefe de PMO', 'PMO', 'Supervisora de proyectos', 4, 5, 'apoyador', 'Involucrar en todas las decisiones'),
(1, 'Usuarios Finales', 'Operaciones', 'Usuarios del sistema', 2, 5, 'neutral', 'Capacitar y obtener feedback'),
(1, 'Equipo de TI', 'Tecnología', 'Desarrolladores', 3, 4, 'apoyador', 'Asignar recursos adecuados');

-- ============================================
-- ACTA DE CONSTITUCIÓN
-- ============================================

INSERT INTO acta_constitucion (
    proyecto_id, resumen_ejecutivo, necesidad_negocio, alcance_alto_nivel,
    hitos_principales, supuestos_clave, presupuesto_estimado,
    fecha_inicio_estimada, fecha_fin_estimada, aprobado_por, fecha_aprobacion, estado
) VALUES (
    1,
    'Sistema web para gestión integral de proyectos con estándares PMBOK',
    'Falta de estandarización genera retrasos del 30% y sobrecostos del 25%',
    'Módulos: PMO, marco lógico, WBS, cronograma, presupuesto, riesgos, reportes',
    '[{"nombre":"Análisis de requerimientos","fecha":"2026-10-15"},{"nombre":"Diseño aprobado","fecha":"2026-11-15"},{"nombre":"Desarrollo completo","fecha":"2027-02-15"},{"nombre":"Implementación","fecha":"2027-03-15"}]',
    'Compromiso de la dirección y disponibilidad de recursos',
    50000.00,
    '2026-09-15',
    '2027-03-15',
    4, -- Ana Martínez
    CURDATE(),
    'aprobado'
);

-- ============================================
-- MARCO LÓGICO
-- ============================================

-- FIN
INSERT INTO marco_logico (proyecto_id, nivel_id, codigo, descripcion, indicador, meta, supuestos, orden) VALUES
(1, 1, '1', 'Mejorar la eficiencia en la gestión de proyectos', '% reducción en sobrecostos y retrasos', '30% en 12 meses', 'Compromiso de la dirección', 1);

-- RESULTADOS
INSERT INTO marco_logico (proyecto_id, nivel_id, codigo, descripcion, indicador, meta, padre_id, orden) VALUES
(1, 2, '2.1', 'Sistema web implementado y operativo', '% funcionalidades operativas', '100%', 1, 1),
(1, 2, '2.2', 'Equipo de usuarios capacitado', '% usuarios certificados', '90%', 1, 2),
(1, 2, '2.3', 'Procesos de gestión estandarizados', '# procesos documentados', '15', 1, 3);

-- ACTIVIDADES
INSERT INTO marco_logico (proyecto_id, nivel_id, codigo, descripcion, padre_id, orden) VALUES
(1, 3, '3.1.1', 'Análisis de requerimientos', 2, 1),
(1, 3, '3.1.2', 'Diseño del sistema', 2, 2),
(1, 3, '3.1.3', 'Desarrollo', 2, 3),
(1, 3, '3.1.4', 'Pruebas', 2, 4),
(1, 3, '3.1.5', 'Implementación', 2, 5);

-- ============================================
-- WBS DEL PROYECTO
-- ============================================

-- Nivel 1: Proyecto
INSERT INTO wbs (proyecto_id, codigo, nombre, nivel, orden) VALUES
(1, '1.0', 'Sistema de Gestión de Proyectos PMO', 1, 1);

-- Nivel 2: Entregables
INSERT INTO wbs (proyecto_id, codigo, nombre, nivel, padre_id, orden) VALUES
(1, '1.1', 'Gestión de Alcance', 2, 1, 1),
(1, '1.2', 'Gestión de Tiempo', 2, 1, 2),
(1, '1.3', 'Gestión de Costos', 2, 1, 3),
(1, '1.4', 'Gestión de Calidad', 2, 1, 4);

-- Nivel 3: Paquetes de trabajo
INSERT INTO wbs (proyecto_id, codigo, nombre, nivel, padre_id, responsable_id, fecha_inicio, fecha_fin, duracion_dias, costo_estimado, estado) VALUES
(1, '1.1.1', 'Análisis de Requerimientos', 3, 2, 5, '2026-09-15', '2026-10-15', 30, 5000.00, 'completado'),
(1, '1.1.2', 'Diseño del Sistema', 3, 2, 5, '2026-10-16', '2026-11-15', 30, 6000.00, 'en_progreso'),
(1, '1.1.3', 'Desarrollo', 3, 2, 6, '2026-11-16', '2027-02-15', 90, 25000.00, 'pendiente'),
(1, '1.1.4', 'Pruebas', 3, 2, 7, '2027-02-16', '2027-03-15', 30, 4000.00, 'pendiente');

-- ============================================
-- PRESUPUESTO
-- ============================================

INSERT INTO presupuesto (proyecto_id, wbs_id, categoria_id, descripcion, cantidad, unidad, costo_unitario, monto_aprobado) VALUES
(1, 4, 1, 'Desarrollador Senior', 320, 'horas', 75.00, 24000.00),
(1, 4, 1, 'Diseñador UX', 160, 'horas', 60.00, 9600.00),
(1, 5, 2, 'Licencia base de datos', 1, 'unidad', 3000.00, 3000.00),
(1, 6, 3, 'Servidor producción', 6, 'meses', 500.00, 3000.00),
(1, 7, 7, 'Capacitación usuarios', 40, 'horas', 50.00, 2000.00);

-- ============================================
-- RIESGOS
-- ============================================

INSERT INTO riesgos (proyecto_id, codigo, titulo, descripcion, probabilidad, impacto, tipo_respuesta, plan_respuesta, responsable_id, estado) VALUES
(1, 'R-001', 'Retraso en entregas del proveedor', 'Posible retraso en la entrega de componentes externos', 4, 5, 'mitigar', 'Incluir penalidades en contrato y tener proveedores alternativos', 3, 'identificado'),
(1, 'R-002', 'Cambio de requerimientos', 'Solicitudes de cambios durante el desarrollo', 5, 4, 'mitigar', 'Proceso formal de control de cambios con Evaluación de impacto', 3, 'identificado'),
(1, 'R-003', 'Rotación de personal clave', 'Salida de miembros del equipo técnico', 3, 5, 'mitigar', 'Documentación completa y capacitación cruzada', 3, 'en_seguimiento'),
(1, 'R-004', 'Problemas técnicos inesperados', 'Errores técnicos que impacten el cronograma', 3, 4, 'aceptar', 'Contingencia de tiempo y recursos', 3, 'identificado');

-- ============================================
-- ASIGNACIÓN DE RECURSOS
-- ============================================

INSERT INTO asignacion_recursos (proyecto_id, usuario_id, wbs_id, rol_id, porcentaje, fecha_inicio, fecha_fin, horas_planeadas) VALUES
(1, 6, 4, 4, 100.00, '2026-11-16', '2027-02-15', 320),
(1, 7, 4, 7, 50.00, '2026-10-16', '2027-02-15', 160),
(1, 5, 5, 2, 30.00, '2026-09-15', '2026-11-15', 80);

-- ============================================
-- HITOS
-- ============================================

INSERT INTO hitos (proyecto_id, nombre, fecha_planeada, criterio_aceptacion, estado) VALUES
(1, 'Aprobación del Proyecto', '2026-09-10', 'Firma del acta de constitución', 'alcanzado'),
(1, 'Análisis Completado', '2026-10-15', 'Documento de requerimientos aprobado', 'alcanzado'),
(1, 'Diseño Aprobado', '2026-11-15', 'Diseño técnico validado', 'pendiente'),
(1, 'Desarrollo Completo', '2027-02-15', 'Todas las funcionalidades implementadas', 'pendiente'),
(1, 'Go-Live', '2027-03-15', 'Sistema en producción', 'pendiente');

-- ============================================
-- COMUNICACIONES
-- ============================================

INSERT INTO matriz_comunicaciones (proyecto_id, tipo_comunicacion, contenido, audiencia, frecuencia, medio, responsable_id) VALUES
(1, 'Reporte de Estado', 'Avance físico y financiero del proyecto', 'Sponsor, PMO', 'Semanal', 'Email + Reunión', 3),
(1, 'Reunión de Seguimiento', 'Revisión de actividades y problemas', 'Equipo del proyecto', 'Semanal', 'Reunión presencial', 3),
(1, 'Dashboard Ejecutivo', 'Indicadores clave del proyecto', 'Gerencia', 'Mensual', 'Plataforma web', 3);

-- ============================================
-- PLAN DE CALIDAD
-- ============================================

INSERT INTO plan_calidad (proyecto_id, nombre, estandares, criterios_aceptacion, responsable_id) VALUES
(1, 'Plan de Calidad del Sistema', 
 'ISO 9001:2015, Estándares de código limpio', 
 'Código sin errores críticos, documentación completa, pruebas unitarias > 80%', 
 3);

-- ============================================
-- LECCIONES APRENDIDAS (parciales)
-- ============================================

INSERT INTO lecciones_aprendidas (proyecto_id, categoria, titulo, descripcion, recomendacion, registrador_por) VALUES
(1, 'que_fue_bien', 'Sesiones de Kick-off efectivas', 'La reunión inicial con stakeholders clarificó expectativas desde el inicio', 'Siempre realizar sesiones de alineación al inicio del proyecto', 3),
(1, 'mejora_sugerida', 'Mayor detalle en estimaciones', 'Algunas estimaciones subestimaron la complejidad técnica', 'Incluir análisis de complejidad en la planificación', 3);
