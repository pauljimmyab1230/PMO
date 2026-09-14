const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cronogramaController = require('../controllers/cronograma.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos/:id/cronograma - Obtener datos para Gantt
router.get('/:id/cronograma', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], cronogramaController.getGanttData);

// GET /api/proyectos/:id/cronograma/stats - Obtener estadísticas
router.get('/:id/cronograma/stats', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], cronogramaController.getStats);

// POST /api/proyectos/:id/cronograma/dependencies - Agregar dependencia
router.post('/:id/cronograma/dependencies', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('actividad_origen_id').isInt().withMessage('Source activity ID required'),
  body('actividad_destino_id').isInt().withMessage('Target activity ID required'),
  validate
], cronogramaController.addDependency);

// PUT /api/cronograma/activities/:id/dates - Actualizar fechas
router.put('/activities/:id/dates', [
  param('id').isInt().withMessage('Activity ID must be an integer'),
  body('fecha_inicio').isISO8601().withMessage('Start date required'),
  body('fecha_fin').isISO8601().withMessage('End date required'),
  validate
], cronogramaController.updateDates);

// DELETE /api/cronograma/dependencies/:id - Eliminar dependencia
router.delete('/dependencies/:id', [
  param('id').isInt().withMessage('Dependency ID must be an integer'),
  validate
], cronogramaController.deleteDependency);

module.exports = router;
