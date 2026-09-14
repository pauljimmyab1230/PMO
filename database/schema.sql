-- ============================================
-- SISTEMA DE GESTIÓN DE PROYECTOS PMO
-- Script de Base de Datos MySQL
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS pmo_database;
USE pmo_database;

-- ============================================
-- MÓDULO 1: USUARIOS Y SEGURIDAD
-- ============================================

CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             ENUM('admin','pmo','pm','equipo','sponsor','visor') NOT NULL,
    avatar_url      VARCHAR(500),
    activo          BOOLEAN DEFAULT TRUE,
    ultimo_acceso   TIMESTAMP NULL,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- MÓDULO 2: ORGANIZACIÓN
-- ============================================

CREATE TABLE areas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    director_id     INT,
    padre_id        INT,
    activo          BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (director_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (padre_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 3: CATÁLOGOS
-- ============================================

CREATE TABLE tipos_proyecto (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    activo          BOOLEAN DEFAULT TRUE
);

CREATE TABLE estados_proyecto (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    color           VARCHAR(7),
    orden           INT,
    es_estado_final BOOLEAN DEFAULT FALSE
);

CREATE TABLE categorias_costo (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    tipo            ENUM('capex','opex') NOT NULL,
    activo          BOOLEAN DEFAULT TRUE
);

CREATE TABLE roles_proyecto (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    tarifa_hora     DECIMAL(8,2),
    activo          BOOLEAN DEFAULT TRUE
);

CREATE TABLE niveles_marco_logico (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL,
    nivel_numero    INT NOT NULL,
    descripcion     TEXT
);

-- ============================================
-- MÓDULO 4: PROYECTO
-- ============================================

CREATE TABLE proyectos (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    nombre                  VARCHAR(200) NOT NULL,
    codigo                  VARCHAR(20) UNIQUE NOT NULL,
    descripcion             TEXT,
    tipo_id                 INT,
    estado_id               INT,
    area_id                 INT,
    sponsor_id              INT,
    pm_id                   INT,
    
    -- Fechas
    fecha_solicitud         DATE,
    fecha_aprobacion        DATE,
    fecha_inicio_planeada   DATE,
    fecha_fin_planeada      DATE,
    fecha_inicio_real       DATE,
    fecha_fin_real          DATE,
    
    -- Presupuesto
    presupuesto_planeado    DECIMAL(15,2),
    presupuesto_real        DECIMAL(15,2) DEFAULT 0,
    
    -- Descripción
    justificacion           TEXT,
    objetivogeneral         TEXT,
    objetivospecificos      TEXT,
    alcance_general         TEXT,
    alcance_exclusiones     TEXT,
    
    -- Metadatos
    creado_por              INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tipo_id) REFERENCES tipos_proyecto(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_id) REFERENCES estados_proyecto(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (sponsor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (pm_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 5: STAKEHOLDERS
-- ============================================

CREATE TABLE stakeholders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    nombre              VARCHAR(200) NOT NULL,
    organisation        VARCHAR(200),
    cargo               VARCHAR(100),
    email               VARCHAR(150),
    telefono            VARCHAR(30),
    nivel_poder         INT CHECK (nivel_poder BETWEEN 1 AND 5),
    nivel_interes       INT CHECK (nivel_interes BETWEEN 1 AND 5),
    expectativas        TEXT,
    actitud             ENUM('apoyador','neutral','detractor'),
    estrategia_gestion  TEXT,
    responsable_id      INT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 6: ANÁLISIS DE VIABILIDAD
-- ============================================

CREATE TABLE analisis_viabilidad (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    tipo                ENUM('tecnica','economica','operativa','legal','ambiental'),
    justificacion       TEXT,
    es_viable           BOOLEAN,
    condiciones         TEXT,
    evaluado_por        INT,
    fecha_evaluacion    DATE,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 7: ACTA DE CONSTITUCIÓN
-- ============================================

CREATE TABLE acta_constitucion (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    version                 INT DEFAULT 1,
    resumen_ejecutivo       TEXT,
    necesidad_negocio       TEXT,
    alcance_alto_nivel      TEXT,
    hitos_principales       JSON,
    supuestos_clave         TEXT,
    restricciones           TEXT,
    riesgos_principales     TEXT,
    presupuesto_estimado    DECIMAL(15,2),
    fecha_inicio_estimada   DATE,
    fecha_fin_estimada      DATE,
    aprobado_por            INT,
    fecha_aprobacion        DATE,
    estado                  ENUM('borrador','aprobado','rechazado') DEFAULT 'borrador',
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 8: MARCO LÓGICO
-- ============================================

CREATE TABLE marco_logico (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    nivel_id                INT,
    codigo                  VARCHAR(20),
    descripcion             TEXT NOT NULL,
    indicador               TEXT,
    meta                    TEXT,
    metodo_verificacion     TEXT,
    supuestos               TEXT,
    avance_porcentaje       DECIMAL(5,2) DEFAULT 0,
    avance_fecha            DATE,
    padre_id                INT,
    orden                   INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (nivel_id) REFERENCES niveles_marco_logico(id) ON DELETE SET NULL,
    FOREIGN KEY (padre_id) REFERENCES marco_logico(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 9: WBS (ESTRUCTURA DE DESGLOSE)
-- ============================================

CREATE TABLE wbs (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    codigo              VARCHAR(50) NOT NULL,
    nombre              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    nivel               INT NOT NULL,
    padre_id            INT,
    responsable_id      INT,
    fecha_inicio        DATE,
    fecha_fin           DATE,
    duracion_dias       INT,
    costo_estimado      DECIMAL(12,2),
    costo_real          DECIMAL(12,2) DEFAULT 0,
    estado              ENUM('pendiente','en_progreso','completado','cancelado') DEFAULT 'pendiente',
    avance              DECIMAL(5,2) DEFAULT 0,
    es_hito             BOOLEAN DEFAULT FALSE,
    orden               INT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (padre_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE dependencias_wbs (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    actividad_origen_id     INT NOT NULL,
    actividad_destino_id    INT NOT NULL,
    tipo_dependencia        ENUM('fin-inicio','inicio-inicio','fin-fin','inicio-fin') DEFAULT 'fin-inicio',
    dias_ajuste             INT DEFAULT 0,
    FOREIGN KEY (actividad_origen_id) REFERENCES wbs(id) ON DELETE CASCADE,
    FOREIGN KEY (actividad_destino_id) REFERENCES wbs(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 10: CRONOGRAMA
-- ============================================

CREATE TABLE linea_base_cronograma (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    fecha_corte         DATE NOT NULL,
    version             INT NOT NULL,
    aprobado_por        INT,
    fecha_aprobacion    DATE,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE cronograma_snapshot (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    linea_base_id           INT NOT NULL,
    wbs_id                  INT NOT NULL,
    fecha_inicio_planeada   DATE,
    fecha_fin_planeada      DATE,
    duracion_planeada       INT,
    es_critico              BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (linea_base_id) REFERENCES linea_base_cronograma(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 11: PRESUPUESTO
-- ============================================

CREATE TABLE presupuesto (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    wbs_id              INT,
    categoria_id        INT,
    descripcion         VARCHAR(200),
    cantidad            DECIMAL(10,2),
    unidad              VARCHAR(50),
    costo_unitario      DECIMAL(12,2),
    costo_total         DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
    monto_aprobado      DECIMAL(12,2),
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias_costo(id) ON DELETE SET NULL
);

CREATE TABLE linea_base_costos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id     INT NOT NULL,
    fecha_corte     DATE NOT NULL,
    version         INT NOT NULL,
    bac_total       DECIMAL(15,2) NOT NULL,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE costos_reales (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id     INT NOT NULL,
    presupuesto_id  INT,
    fecha           DATE NOT NULL,
    monto           DECIMAL(12,2) NOT NULL,
    descripcion     TEXT,
    comprobante     VARCHAR(100),
    registrado_por  INT,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (presupuesto_id) REFERENCES presupuesto(id) ON DELETE SET NULL,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE distribucion_costos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    presupuesto_id  INT NOT NULL,
    periodo         VARCHAR(20),
    monto_planeado  DECIMAL(12,2),
    monto_real      DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (presupuesto_id) REFERENCES presupuesto(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 12: RECURSOS
-- ============================================

CREATE TABLE asignacion_recursos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    usuario_id          INT,
    wbs_id              INT,
    rol_id              INT,
    porcentaje          DECIMAL(5,2),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    horas_planeadas     DECIMAL(8,2),
    horas_reales        DECIMAL(8,2) DEFAULT 0,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (rol_id) REFERENCES roles_proyecto(id) ON DELETE SET NULL
);

CREATE TABLE calendario_proyecto (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id     INT NOT NULL,
    fecha           DATE NOT NULL,
    es_laborable    BOOLEAN DEFAULT TRUE,
    motivo          VARCHAR(200),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 13: CALIDAD
-- ============================================

CREATE TABLE plan_calidad (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    nombre                  VARCHAR(200),
    estandares              TEXT,
    criterios_aceptacion    TEXT,
    responsable_id          INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE checklists_calidad (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    plan_calidad_id     INT NOT NULL,
    nombre              VARCHAR(200) NOT NULL,
    wbs_id              INT,
    completado          BOOLEAN DEFAULT FALSE,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_calidad_id) REFERENCES plan_calidad(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL
);

CREATE TABLE checklist_items (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id        INT NOT NULL,
    descripcion         TEXT NOT NULL,
    cumple              BOOLEAN,
    observaciones       TEXT,
    verificado_por      INT,
    fecha_verificacion  DATE,
    FOREIGN KEY (checklist_id) REFERENCES checklists_calidad(id) ON DELETE CASCADE,
    FOREIGN KEY (verificado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE no_conformidades (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    wbs_id                  INT,
    descripcion             TEXT NOT NULL,
    gravedad                ENUM('leve','moderada','grave','critica'),
    causa_raiz              TEXT,
    accion_correctiva       TEXT,
    responsable_id          INT,
    fecha_deteccion         DATE,
    fecha_cierre            DATE,
    estado                  ENUM('abierta','en_proceso','cerrada') DEFAULT 'abierta',
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 14: COMUNICACIONES
-- ============================================

CREATE TABLE matriz_comunicaciones (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    tipo_comunicacion   VARCHAR(100),
    contenido           TEXT,
    audiencia           VARCHAR(200),
    frecuencia          VARCHAR(50),
    medio               VARCHAR(100),
    responsable_id      INT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE reuniones (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    titulo              VARCHAR(200) NOT NULL,
    fecha               DATE NOT NULL,
    hora_inicio         TIME,
    hora_fin            TIME,
    lugar               VARCHAR(200),
    convocado_por       INT,
    acta                TEXT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (convocado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE asistencia_reunion (
    reunion_id          INT NOT NULL,
    usuario_id          INT NOT NULL,
    asistio             BOOLEAN,
    PRIMARY KEY (reunion_id, usuario_id),
    FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 15: RIESGOS
-- ============================================

CREATE TABLE riesgos (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    codigo                  VARCHAR(20),
    titulo                  VARCHAR(200) NOT NULL,
    descripcion             TEXT,
    probabilidad            INT CHECK (probabilidad BETWEEN 1 AND 5),
    impacto                 INT CHECK (impacto BETWEEN 1 AND 5),
    nivel_riesgo            INT GENERATED ALWAYS AS (probabilidad * impacto) STORED,
    categoria               VARCHAR(20),
    tipo_impacto            VARCHAR(50),
    tipo_respuesta          ENUM('mitigar','transferir','aceptar','evitar'),
    plan_respuesta          TEXT,
    responsable_id          INT,
    estado                  ENUM('identificado','en_seguimiento','materializado','cerrado') DEFAULT 'identificado',
    fecha_identificacion    DATE,
    fecha_cierre            DATE,
    probabilidad_residual   INT,
    impacto_residual        INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 16: ADQUISICIONES
-- ============================================

CREATE TABLE proveedores (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    ruc_nit         VARCHAR(30),
    email           VARCHAR(150),
    telefono        VARCHAR(30),
    direccion       TEXT,
    calificacion    DECIMAL(3,2),
    activo          BOOLEAN DEFAULT TRUE,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contratos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    proveedor_id        INT,
    numero              VARCHAR(50) UNIQUE NOT NULL,
    tipo                ENUM('precio_fijo','tiempo_y_materiales','costo_reembolsable','lump_sum'),
    monto_total         DECIMAL(15,2),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    estado              ENUM('borrador','activo','finalizado','cancelado') DEFAULT 'borrador',
    descripcion         TEXT,
    archivo_url         VARCHAR(500),
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

CREATE TABLE entregas_proveedor (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    contrato_id         INT NOT NULL,
    descripcion         TEXT NOT NULL,
    fecha_entrega       DATE,
    monto               DECIMAL(12,2),
    estado              ENUM('pendiente','entregado','aprobado','rechazado') DEFAULT 'pendiente',
    observaciones       TEXT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 17: EJECUCIÓN
-- ============================================

CREATE TABLE equipos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id     INT NOT NULL,
    nombre          VARCHAR(100),
    leader_id       INT,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (leader_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE miembros_equipo (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id           INT NOT NULL,
    usuario_id          INT,
    rol_en_equipo       VARCHAR(100),
    fecha_ingreso       DATE,
    fecha_salida        DATE,
    horas_semanales     DECIMAL(5,2),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE registro_actividades (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    wbs_id                  INT,
    fecha                   DATE NOT NULL,
    actividad_realizada     TEXT,
    avance_porcentaje       DECIMAL(5,2),
    horas_trabajadas        DECIMAL(6,2),
    registrado_por          INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE entregables (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    wbs_id                  INT,
    nombre                  VARCHAR(200) NOT NULL,
    descripcion             TEXT,
    fecha_entrega_planeada  DATE,
    fecha_entrega_real      DATE,
    estado                  ENUM('pendiente','en_progreso','entregado','aprobado','rechazado') DEFAULT 'pendiente',
    aprobado_por            INT,
    archivo_url             VARCHAR(500),
    observaciones           TEXT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE issues (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    wbs_id              INT,
    titulo              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    prioridad           ENUM('baja','media','alta','critica'),
    estado              ENUM('abierto','en_proceso','resuelto','cerrado') DEFAULT 'abierto',
    responsable_id      INT,
    fecha_deteccion     DATE,
    fecha_resolucion    DATE,
    solucion            TEXT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE bitacora (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    fecha               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo                ENUM('evento','decision','acuerdo','problema','avance'),
    descripcion         TEXT NOT NULL,
    autor_id            INT,
    visible_sponsor     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 18: MONITOREO Y CONTROL
-- ============================================

CREATE TABLE hitos (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    wbs_id                  INT,
    nombre                  VARCHAR(200) NOT NULL,
    fecha_planeada          DATE,
    fecha_real              DATE,
    criterio_aceptacion     TEXT,
    estado                  ENUM('pendiente','alcanzado','retrasado','cancelado') DEFAULT 'pendiente',
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (wbs_id) REFERENCES wbs(id) ON DELETE SET NULL
);

CREATE TABLE reportes_estado (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    fecha                   DATE NOT NULL,
    periodo                 VARCHAR(50),
    avance_fisico           DECIMAL(5,2),
    avance_financiero       DECIMAL(5,2),
    resumen_logros          TEXT,
    proximos_pasos          TEXT,
    problemas_actuales      TEXT,
    riesgos_criticos        TEXT,
    requiere_decision       BOOLEAN,
    generado_por            INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE indicadores (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    nombre                  VARCHAR(200) NOT NULL,
    formula                 TEXT,
    meta                    DECIMAL(10,2),
    unidad                  VARCHAR(50),
    frecuencia_medicion     VARCHAR(50),
    responsable_id          INT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE valores_indicador (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    indicador_id        INT NOT NULL,
    periodo             VARCHAR(20),
    valor_planeado      DECIMAL(10,2),
    valor_real          DECIMAL(10,2),
    fecha_medicion      DATE,
    FOREIGN KEY (indicador_id) REFERENCES indicadores(id) ON DELETE CASCADE
);

CREATE TABLE valor_ganado (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    periodo             VARCHAR(20) NOT NULL,
    pv                  DECIMAL(15,2),
    ev                  DECIMAL(15,2),
    ac                  DECIMAL(15,2),
    bac                 DECIMAL(15,2),
    spi                 DECIMAL(6,3) GENERATED ALWAYS AS (CASE WHEN pv > 0 THEN ev/pv END) STORED,
    cpi                 DECIMAL(6,3) GENERATED ALWAYS AS (CASE WHEN ac > 0 THEN ev/ac END) STORED,
    eac                 DECIMAL(15,2),
    etc                 DECIMAL(15,2),
    vac                 DECIMAL(15,2),
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- ============================================
-- MÓDULO 19: CONTROL DE CAMBIOS
-- ============================================

CREATE TABLE solicitudes_cambio (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    codigo                  VARCHAR(20),
    titulo                  VARCHAR(200) NOT NULL,
    descripcion             TEXT NOT NULL,
    justificacion           TEXT,
    impacto_alcance         TEXT,
    impacto_tiempo          TEXT,
    impacto_costo           DECIMAL(12,2),
    impacto_calidad         TEXT,
    solicitado_por          INT,
    fecha_solicitud         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado                  ENUM('solicitado','evaluado','aprobado','rechazado','implementado') DEFAULT 'solicitado',
    decidido_por            INT,
    fecha_decision          DATE,
    motivo_decision         TEXT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (decidido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE historial_cambios (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT NOT NULL,
    tabla_afectada          VARCHAR(100),
    registro_id             INT,
    campo                   VARCHAR(100),
    valor_anterior          TEXT,
    valor_nuevo             TEXT,
    cambiado_por            INT,
    fecha_cambio            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    solicitud_cambio_id     INT,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (solicitud_cambio_id) REFERENCES solicitudes_cambio(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 20: CIERRE
-- ============================================

CREATE TABLE cierre_proyecto (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT UNIQUE NOT NULL,
    alcance_completado      BOOLEAN,
    documentacion_entregada BOOLEAN,
    contratos_cerrados      BOOLEAN,
    activos_transferidos    BOOLEAN,
    lecciones_registradas   BOOLEAN,
    cerrado_por             INT,
    fecha_cierre            DATE,
    motivo_cierre           ENUM('exitoso','parcial','cancelado'),
    observaciones           TEXT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE cierre_financiero (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id             INT UNIQUE NOT NULL,
    presupuesto_total       DECIMAL(15,2),
    gasto_total             DECIMAL(15,2),
    ahorro_generado         DECIMAL(15,2),
    sobrecosto              DECIMAL(15,2),
    contratos_cerrados      INT,
    pagos_pendientes        INT,
    balance_final           TEXT,
    aprobado_por            INT,
    fecha_cierre            DATE,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE transferencia_activos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    activo              VARCHAR(200),
    descripcion         TEXT,
    area_destino        INT,
    responsable         INT,
    fecha_transferencia DATE,
    recibido_por        INT,
    estado              ENUM('pendiente','transferido','verificado') DEFAULT 'pendiente',
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (area_destino) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (recibido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ============================================
-- MÓDULO 21: EVALUACIÓN
-- ============================================

CREATE TABLE lecciones_aprendidas (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    categoria           ENUM('que_fue_bien','que_fue_malo','mejora_sugerida'),
    titulo              VARCHAR(200) NOT NULL,
    descripcion         TEXT NOT NULL,
    recomendacion       TEXT,
    registrador_por     INT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (registrador_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE evaluacion_proyecto (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id                 INT UNIQUE NOT NULL,
    alcance_cumplido            DECIMAL(5,2),
    tiempo_cumplido             DECIMAL(5,2),
    costo_cumplido              DECIMAL(5,2),
    calidad_cumplida            DECIMAL(5,2),
    impacto_esperado            TEXT,
    impacto_real                TEXT,
    beneficiarios_alcanzados    INT,
    beneficiarios_esperados     INT,
    satisfaccion_sponsor        INT CHECK (satisfaccion_sponsor BETWEEN 1 AND 5),
    satisfaccion_equipo         INT CHECK (satisfaccion_equipo BETWEEN 1 AND 5),
    satisfaccion_beneficiarios  INT CHECK (satisfaccion_beneficiarios BETWEEN 1 AND 5),
    calificacion                ENUM('excelente','bueno','aceptable','deficiente','fallido'),
    lecciones_clave             TEXT,
    recomendaciones             TEXT,
    evaluado_por                INT,
    fecha_evaluacion            DATE,
    creado_en                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE encuestas_beneficiarios (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id         INT NOT NULL,
    pregunta            TEXT NOT NULL,
    tipo_respuesta      ENUM('escala','si_no','abierta'),
    respuesta_promedio  DECIMAL(5,2),
    total_respuestas    INT,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX idx_proyectos_estado ON proyectos(estado_id);
CREATE INDEX idx_proyectos_pm ON proyectos(pm_id);
CREATE INDEX idx_proyectos_sponsor ON proyectos(sponsor_id);
CREATE INDEX idx_wbs_proyecto ON wbs(proyecto_id);
CREATE INDEX idx_wbs_padre ON wbs(padre_id);
CREATE INDEX idx_marco_logico_proyecto ON marco_logico(proyecto_id);
CREATE INDEX idx_riesgos_proyecto ON riesgos(proyecto_id);
CREATE INDEX idx_costos_reales_proyecto ON costos_reales(proyecto_id);
CREATE INDEX idx_registro_actividades_proyecto ON registro_actividades(proyecto_id);
CREATE INDEX idx_entregables_proyecto ON entregables(proyecto_id);
CREATE INDEX idx_stakeholders_proyecto ON stakeholders(proyecto_id);
CREATE INDEX idx_issues_proyecto ON issues(proyecto_id);
CREATE INDEX idx_bitacora_proyecto ON bitacora(proyecto_id);
