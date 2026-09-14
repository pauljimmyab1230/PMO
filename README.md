# PMO - Sistema de Gestión de Proyectos

Sistema web para la gestión integral de proyectos siguiendo estándares PMBOK y marco lógico.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de Datos**: MySQL
- **Autenticación**: JWT

## Prerequisitos

- Node.js 18+
- MySQL 8+
- npm o yarn

## Instalación

### 1. Base de Datos

```bash
# Crear la base de datos
mysql -u root -p < database/schema.sql

# Cargar datos iniciales
mysql -u root -p < database/seed.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Iniciar servidor
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Credenciales de Prueba

- **Email**: admin@sistema.com
- **Contraseña**: admin123

## Estructura del Proyecto

```
PMO/
├── backend/                    # API REST
│   ├── src/
│   │   ├── config/            # Configuración
│   │   ├── controllers/       # Controladores
│   │   ├── middleware/        # Middleware
│   │   ├── models/           # Modelos
│   │   ├── routes/           # Rutas
│   │   ├── services/         # Servicios
│   │   ├── utils/            # Utilidades
│   │   └── validators/       # Validaciones
│   └── package.json
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes
│   │   ├── pages/            # Páginas
│   │   ├── services/         # Servicios API
│   │   ├── store/            # Estado global
│   │   ├── types/            # Tipos TypeScript
│   │   └── utils/            # Utilidades
│   └── package.json
├── database/                   # Scripts SQL
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Módulos del Sistema

### 1. Inicio
- Acta de Constitución
- Stakeholders
- Análisis de Viabilidad

### 2. Planificación
- Marco Lógico
- WBS (Estructura de Desglose)
- Cronograma
- Presupuesto
- Recursos
- Calidad
- Comunicaciones
- Riesgos
- Adquisiciones

### 3. Ejecución
- Registro de Actividades
- Entregables
- Issues
- Bitácora
- Reuniones

### 4. Monitoreo y Control
- Dashboard de Avance
- Curva S (Valor Ganado)
- Indicadores
- Control de Cambios
- Reportes de Estado

### 5. Cierre
- Checklist de Cierre
- Lecciones Aprendidas
- Transferencia de Activos

### 6. Evaluación
- Evaluación de Medios/Fines
- Encuestas a Beneficiarios

## API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Usuarios
- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### Proyectos
- `GET /api/proyectos`
- `GET /api/proyectos/:id`
- `POST /api/proyectos`
- `PUT /api/proyectos/:id`
- `DELETE /api/proyectos/:id`
- `GET /api/proyectos/:id/dashboard`

## Licencia

MIT
