const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const marcoLogicoRoutes = require('./routes/marco-logico.routes');
const marcoLogicoItemRoutes = require('./routes/marco-logico-item.routes');
const wbsRoutes = require('./routes/wbs.routes');
const wbsItemRoutes = require('./routes/wbs-item.routes');
const cronogramaRoutes = require('./routes/cronograma.routes');
const presupuestoRoutes = require('./routes/presupuesto.routes');
const presupuestoItemRoutes = require('./routes/presupuesto-item.routes');
const riesgosRoutes = require('./routes/riesgos.routes');
const riesgosItemRoutes = require('./routes/riesgos-item.routes');
const recursosRoutes = require('./routes/recursos.routes');
const recursosItemRoutes = require('./routes/recursos-item.routes');
const ejecucionRoutes = require('./routes/ejecucion.routes');
const ejecucionItemRoutes = require('./routes/ejecucion-item.routes');
const monitoreoRoutes = require('./routes/monitoreo.routes');
const cierreRoutes = require('./routes/cierre.routes');
const evaluacionRoutes = require('./routes/evaluacion.routes');
const inicioRoutes = require('./routes/inicio.routes');
const inicioItemRoutes = require('./routes/inicio-item.routes');
const portafolioRoutes = require('./routes/portafolio.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes - Agrupadas por módulo
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/proyectos', projectRoutes);
app.use('/api/proyectos', marcoLogicoRoutes);
app.use('/api/proyectos', wbsRoutes);
app.use('/api/proyectos', cronogramaRoutes);
app.use('/api/proyectos', presupuestoRoutes);
app.use('/api/proyectos', riesgosRoutes);
app.use('/api/proyectos', recursosRoutes);
app.use('/api/proyectos', ejecucionRoutes);
app.use('/api/proyectos', monitoreoRoutes);
app.use('/api/proyectos', cierreRoutes);
app.use('/api/proyectos', evaluacionRoutes);
app.use('/api/proyectos', inicioRoutes);

// Rutas para elementos individuales
app.use('/api/marco-logico', marcoLogicoItemRoutes);
app.use('/api/wbs', wbsItemRoutes);
app.use('/api/cronograma', cronogramaRoutes);
app.use('/api/presupuesto', presupuestoItemRoutes);
app.use('/api/riesgos', riesgosItemRoutes);
app.use('/api/recursos', recursosItemRoutes);
app.use('/api/ejecucion', ejecucionItemRoutes);
app.use('/api/monitoreo', monitoreoRoutes);
app.use('/api/cierre', cierreRoutes);
app.use('/api/evaluacion', evaluacionRoutes);
app.use('/api/inicio', inicioItemRoutes);
app.use('/api', portafolioRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
