# ============================================
# DOCUMENTACIÓN COMPLETA
# SISTEMA DE GESTIÓN DE PROYECTOS PMO
# ============================================
# Versión: 2.0
# Fecha: 2026-09-10
# Estado: ✅ 100% IMPLEMENTADO
# ============================================

## ÍNDICE

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Ciclo de Vida del Proyecto](#3-ciclo-de-vida-del-proyecto)
4. [Módulos del Sistema](#4-módulos-del-sistema)
5. [Base de Datos](#5-base-de-datos)
6. [API REST](#6-api-rest)
7. [Seguridad](#7-seguridad)
8. [Instalación](#8-instalación)
9. [Credenciales de Prueba](#9-credenciales-de-prueba)

---

## 1. VISIÓN GENERAL

### 1.1 Descripción
Sistema web para la gestión integral de proyectos siguiendo estándares **PMBOK** y **marco lógico**, cubriendo las 6 fases del ciclo de vida del proyecto.

### 1.2 Objetivo
Proporcionar una plataforma completa para que las organizaciones puedan:
- Planificar proyectos de manera estructurada
- Ejecutar actividades controladamente
- Monitorear avances con indicadores reales
- Cerrar proyectos con documentación completa
- Evaluar resultados e impacto

### 1.3 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React + TypeScript | 18+ |
| Estilos | Tailwind CSS | 3.x |
| Backend | Node.js + Express | 18+ |
| Base de Datos | MySQL | 8.x |
| Autenticación | JWT + bcrypt | - |
| Seguridad | Helmet + Rate Limiting | - |

### 1.4 Características Principales

- ✅ Ciclo de vida completo (Inicio → Evaluación)
- ✅ 13 módulos funcionales
- ✅ 120+ endpoints API
- ✅ 53 tablas de base de datos
- ✅ Autenticación JWT con refresh tokens
- ✅ Rate limiting para seguridad
- ✅ Moneda S/ (Soles peruanos)
- ✅ Dark mode
- ✅ Responsive

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO                                  │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND                               │   │
│  │              React + TypeScript + Tailwind                │   │
│  │                                                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Dashboard│ │Proyectos│ │Portafolio│ │Config   │       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       │           │           │           │              │   │
│  │       └───────────┴───────────┴───────────┘              │   │
│  │                         │                                │   │
│  │                    Services API                           │   │
│  └─────────────────────────┼────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     BACKEND                               │   │
│  │              Node.js + Express + JWT                      │   │
│  │                                                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  Auth   │ │Projects │ │  WBS    │ │  Riesgos│       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       │           │           │           │              │   │
│  │       └───────────┴───────────┴───────────┘              │   │
│  │                         │                                │   │
│  │                    Controllers                            │   │
│  └─────────────────────────┼────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   BASE DE DATOS                          │   │
│  │                    MySQL                                  │   │
│  │                    53 tablas                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Estructura de Archivos

```
E:\PMO\
├── backend/                    # API REST
│   ├── src/
│   │   ├── config/            # Configuración BD
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── middleware/        # Auth, validación
│   │   ├── routes/            # Endpoints API
│   │   ├── utils/             # Logger, helpers
│   │   └── server.js          # Entry point
│   └── package.json
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas/vistas
│   │   ├── services/          # Llamadas API
│   │   ├── store/             # Estado global
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Helpers
│   │   └── App.tsx            # Entry point
│   └── package.json
├── database/                   # Scripts SQL
│   ├── schema.sql             # 53 tablas
│   └── seed.sql               # Datos iniciales
└── docs/                       # Documentación
```

---

## 3. LÓGICA DE NEGOCIO

### 3.1 Flujo General

```
USUARIO → FRONTEND → BACKEND → BASE DATOS → RESPUESTA
```

### 3.2 Lógica por Fase

| Fase | Flujo Principal |
|------|-----------------|
| **Inicio** | Crear Charter → Identificar Stakeholders → Analizar Viabilidad → Aprobar |
| **Planificación** | Definir Marco Lógico → Crear WBS → Asignar Fechas → Asignar Costos → Identificar Riesgos |
| **Ejecución** | Registrar Avances → Controlar Issues → Documentar Entregables |
| **Monitoreo** | Revisar Dashboard → Analizar Valor Ganado → Evaluar KPIs |
| **Cierre** | Verificar Checklist → Documentar Lecciones → Cerrar Financieramente |
| **Evaluación** | Evaluar Medios/Fines → Aplicar Encuestas → Calificar |

### 3.3 Estados del Proyecto

```
BORRADOR → EN REVISIÓN → APROBADO → ACTIVO → CERRADO
                                    ↓
                                PAUSADO
                                    ↓
                                CANCELADO
```

### 3.4 Cálculos Clave

| Fórmula | Descripción |
|---------|-------------|
| `SPI = EV / PV` | Índice de Agenda |
| `CPI = EV / AC` | Índice de Costo |
| `nivel_riesgo = prob × impacto` | Nivel de Riesgo |
| `costo_total = cant × costo_unit` | Costo Total |

### 3.5 Permisos por Rol

| Módulo | Admin | PMO | PM | Equipo | Sponsor |
|--------|-------|-----|-----|--------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Portafolio | ✓ | ✓ | ✓ | ✗ | ✓ |
| Inicio | ✓ | ✓ | ✓ | ✗ | ✓ |
| Planificación | ✓ | ✓ | ✓ | ✗ | ✗ |
| Ejecución | ✓ | ✓ | ✓ | ✓ | ✗ |
| Monitoreo | ✓ | ✓ | ✓ | ✗ | ✓ |
| Cierre | ✓ | ✓ | ✓ | ✗ | ✓ |
| Evaluación | ✓ | ✓ | ✓ | ✗ | ✓ |
| Administración | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 4. CICLO DE VIDA DEL PROYECTO

El sistema implementa las **6 fases del ciclo de vida PMBOK**:

```
┌─────────┐    ┌─────────────┐    ┌───────────┐
│  INICIO │───▶│PLANIFICACIÓN│───▶│ EJECUCIÓN │
└─────────┘    └─────────────┘    └─────┬─────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              ┌──────────┐       ┌──────────┐       ┌──────────┐
              │MONITOREO │◀─────▶│  CIERRE  │       │EVALUACIÓN│
              └──────────┘       └──────────┘       └──────────┘
```

---

## 5. MÓDULOS DEL SISTEMA

### 4.1 INICIO
**Objetivo:** Definir y autorizar el proyecto

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Acta de Constitución | Documento formal que autoriza el proyecto | `acta_constitucion` |
| Stakeholders | Personas/instituciones interesadas | `stakeholders` |
| Análisis de Viabilidad | Evaluación técnica, económica, operativa | `analisis_viabilidad` |

### 4.2 PLANIFICACIÓN
**Objetivo:** Definir CÓMO se ejecutará el proyecto

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Marco Lógico | Matriz de objetivos e indicadores | `marco_logico` |
| WBS | Estructura de desglose del trabajo | `wbs` |
| Cronograma | Diagrama de Gantt | `wbs` + `dependencias_wbs` |
| Presupuesto | Desglose de costos | `presupuesto` |
| Riesgos | Identificación y planes de respuesta | `riesgos` |
| Recursos | Asignación de personas | `asignacion_recursos` |

### 4.3 EJECUCIÓN
**Objetivo:** Realizar el trabajo planificado

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Issues | Problemas y bloqueadores | `issues` |
| Entregables | Productos terminados | `entregables` |
| Bitácora | Registro de eventos | `bitacora` |
| Actividades | Control diario de avances | `registro_actividades` |

### 4.4 MONITOREO Y CONTROL
**Objetivo:** Seguir el avance y corregir desviaciones

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Dashboard | Vista consolidada de avance | Consultas |
| Valor Ganado | Análisis SPI, CPI, EAC | `valor_ganado` |
| Indicadores | KPIs del proyecto | `indicadores` |
| Control de Cambios | Gestión formal de cambios | `solicitudes_cambio` |

### 4.5 CIERRE
**Objetivo:** Formalizar la terminación

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Checklist | Verificación de entregables | `cierre_proyecto` |
| Lecciones | Conocimiento generado | `lecciones_aprendidas` |
| Transferencias | Entrega a operaciones | `transferencia_activos` |
| Cierre Financiero | Liquidación final | `cierre_financiero` |

### 4.6 EVALUACIÓN
**Objetivo:** Medir impacto y resultados

| Componente | Descripción | Tabla BD |
|------------|-------------|----------|
| Evaluación | Medios y fines | `evaluacion_proyecto` |
| Encuestas | Satisfacción beneficiarios | `encuestas_beneficiarios` |

### 4.7 GLOBALES

| Módulo | Descripción |
|--------|-------------|
| **Portafolio PMO** | Dashboard consolidado de todos los proyectos |
| **Administración** | Usuarios, Áreas, Catálogos, Estados |

---

## 6. BASE DE DATOS

### 5.1 Estadísticas
- **Total tablas:** 53
- **Relaciones FK:** 45+
- **Índices:** 15+

### 5.2 Diagrama de Relaciones

```
usuarios ──┐
           ├─── proyectos ───┬─── marco_logico
areas ─────┘                 ├─── wbs
                             ├─── presupuesto
                             ├─── riesgos
                             ├─── issues
                             ├─── entregables
                             ├─── bitacora
                             ├─── valor_ganado
                             ├─── indicadores
                             ├─── solicitudes_cambio
                             └─── cierre_proyecto
```

---

## 7. API REST

### 6.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/auth/refresh` | Refrescar token |

### 6.2 Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos` | Listar proyectos |
| GET | `/api/proyectos/:id` | Obtener proyecto |
| POST | `/api/proyectos` | Crear proyecto |
| PUT | `/api/proyectos/:id` | Actualizar proyecto |
| DELETE | `/api/proyectos/:id` | Eliminar proyecto |
| GET | `/api/proyectos/:id/dashboard` | Dashboard del proyecto |

### 6.3 Inicio

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/inicio/charter` | Obtener charter |
| POST | `/api/proyectos/:id/inicio/charter` | Guardar charter |
| PUT | `/api/proyectos/:id/inicio/charter/approve` | Aprobar charter |
| GET | `/api/proyectos/:id/inicio/stakeholders` | Listar stakeholders |
| POST | `/api/proyectos/:id/inicio/stakeholders` | Crear stakeholder |
| PUT | `/api/inicio/stakeholders/:id` | Actualizar stakeholder |
| DELETE | `/api/inicio/stakeholders/:id` | Eliminar stakeholder |
| GET | `/api/proyectos/:id/inicio/viabilidad` | Listar viabilidad |
| POST | `/api/proyectos/:id/inicio/viabilidad` | Crear viabilidad |
| PUT | `/api/inicio/viabilidad/:id` | Actualizar viabilidad |
| DELETE | `/api/inicio/viabilidad/:id` | Eliminar viabilidad |

### 6.4 Marco Lógico

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/marco-logico` | Obtener árbol jerárquico |
| POST | `/api/proyectos/:id/marco-logico` | Crear elemento |
| PUT | `/api/marco-logico/:id` | Actualizar elemento |
| DELETE | `/api/marco-logico/:id` | Eliminar elemento |

### 6.5 WBS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/wbs` | Obtener árbol WBS |
| POST | `/api/proyectos/:id/wbs` | Crear elemento |
| PUT | `/api/wbs/:id` | Actualizar elemento |
| DELETE | `/api/wbs/:id` | Eliminar elemento |

### 6.6 Presupuesto

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/presupuesto` | Obtener presupuesto |
| POST | `/api/proyectos/:id/presupuesto` | Crear ítem |
| PUT | `/api/presupuesto/:id` | Actualizar ítem |
| DELETE | `/api/presupuesto/:id` | Eliminar ítem |
| GET | `/api/proyectos/:id/presupuesto/summary` | Resumen |
| GET | `/api/proyectos/:id/presupuesto/real-costs` | Gastos reales |
| POST | `/api/proyectos/:id/presupuesto/real-costs` | Registrar gasto |

### 6.7 Riesgos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/riesgos` | Listar riesgos |
| POST | `/api/proyectos/:id/riesgos` | Crear riesgo |
| PUT | `/api/riesgos/:id` | Actualizar riesgo |
| DELETE | `/api/riesgos/:id` | Eliminar riesgo |
| GET | `/api/proyectos/:id/riesgos/heatmap` | Matriz de calor |

### 6.8 Ejecución

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/issues` | Listar issues |
| POST | `/api/proyectos/:id/issues` | Crear issue |
| PUT | `/api/ejecucion/issues/:id` | Actualizar issue |
| PUT | `/api/ejecucion/issues/:id/status` | Cambiar estado |
| GET | `/api/proyectos/:id/entregables` | Listar entregables |
| POST | `/api/proyectos/:id/entregables` | Crear entregable |
| PUT | `/api/ejecucion/entregables/:id` | Actualizar entregable |
| GET | `/api/proyectos/:id/bitacora` | Listar bitácora |
| POST | `/api/proyectos/:id/bitacora` | Crear entrada |

### 6.9 Monitoreo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/monitoreo/dashboard` | Dashboard |
| GET | `/api/proyectos/:id/monitoreo/valor-ganado` | Valor ganado |
| POST | `/api/proyectos/:id/monitoreo/valor-ganado` | Registrar período |
| GET | `/api/proyectos/:id/monitoreo/indicadores` | Listar indicadores |
| POST | `/api/proyectos/:id/monitoreo/indicadores` | Crear indicador |
| GET | `/api/proyectos/:id/monitoreo/cambios` | Listar cambios |
| POST | `/api/proyectos/:id/monitoreo/cambios` | Crear cambio |
| PUT | `/api/monitoreo/cambios/:id/status` | Cambiar estado |

### 6.10 Cierre

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/cierre` | Obtener checklist |
| POST | `/api/proyectos/:id/cierre` | Guardar checklist |
| GET | `/api/proyectos/:id/lecciones` | Listar lecciones |
| POST | `/api/proyectos/:id/lecciones` | Crear lección |
| PUT | `/api/cierre/lecciones/:id` | Actualizar lección |
| GET | `/api/proyectos/:id/transferencias` | Listar transferencias |
| POST | `/api/proyectos/:id/transferencias` | Crear transferencia |
| GET | `/api/proyectos/:id/cierre-financiero` | Obtener cierre financiero |
| POST | `/api/proyectos/:id/cierre-financiero` | Guardar cierre financiero |

### 6.11 Evaluación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos/:id/evaluacion` | Obtener evaluación |
| POST | `/api/proyectos/:id/evaluacion` | Guardar evaluación |
| GET | `/api/proyectos/:id/evaluacion/resumen` | Resumen |
| GET | `/api/proyectos/:id/evaluacion/encuestas` | Listar encuestas |
| POST | `/api/proyectos/:id/evaluacion/encuestas` | Crear encuesta |

### 6.12 Portafolio

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/portafolio/dashboard` | Dashboard global |
| GET | `/api/portafolio/projects` | Todos los proyectos |
| GET | `/api/portafolio/stats-by-pm` | Estadísticas por PM |

### 6.13 Administración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/usuarios` | Listar usuarios |
| POST | `/api/admin/usuarios` | Crear usuario |
| PUT | `/api/admin/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/admin/usuarios/:id` | Eliminar usuario |
| GET | `/api/admin/areas` | Listar áreas |
| POST | `/api/admin/areas` | Crear área |
| GET | `/api/admin/tipos-proyecto` | Listar tipos |
| GET | `/api/admin/categorias-costo` | Listar categorías |
| GET | `/api/admin/roles-proyecto` | Listar roles |
| GET | `/api/admin/estados-proyecto` | Listar estados |

---

## 8. SEGURIDAD

### 7.1 Autenticación
- **JWT Access Token:** 24 horas
- **JWT Refresh Token:** 7 días
- **Auto-refresh:** Implementado en frontend

### 7.2 Autorización
- **Roles:** admin, pmo, pm, equipo, sponsor, visor
- **Permisos:** Por módulo según rol

### 7.3 Rate Limiting
- **Login:** 5 intentos por 15 minutos
- **General:** 100 requests por 15 minutos

### 7.4 Protección
- **Helmet:** Headers de seguridad HTTP
- **Bcrypt:** Passwords hasheados (10 rounds)
- **CORS:** Orígenes configurables

---

## 9. INSTALACIÓN

### 8.1 Prerequisitos
- Node.js 18+
- MySQL 8+
- npm o yarn

### 8.2 Base de Datos
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 8.3 Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar credenciales
npm run dev
```

### 8.4 Frontend
```bash
cd frontend
npm install
npm run dev
```

### 8.5 Acceso
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

---

## 10. CREDENCIALES DE PRUEBA

| Campo | Valor |
|-------|-------|
| Email | admin@sistema.com |
| Contraseña | admin123 |

---

## 11. MEJORAS FUTURAS

| Prioridad | Mejora |
|-----------|--------|
| 🟡 Baja | Paginación en listados |
| 🟡 Baja | Documentación OpenAPI |
| 🟡 Baja | Exportación PDF/Excel |
| 🟡 Baja | Gráficos con Chart.js |
| 🟡 Baja | Responsive móvil |

---

**Documentación completada:** 2026-09-10
**Repositorio:** https://github.com/pauljimmyab1230/PMO.git

