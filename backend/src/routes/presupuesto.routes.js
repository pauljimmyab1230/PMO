const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const presupuestoController = require('../controllers/presupuesto.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos/:id/presupuesto - Obtener presupuesto
router.get('/:id/presupuesto', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], presupuestoController.getByProject);

// GET /api/proyectos/:id/presupuesto/summary - Resumen del presupuesto
router.get('/:id/presupuesto/summary', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], presupuestoController.getSummary);

// GET /api/proyectos/:id/presupuesto/real-costs - Obtener gastos reales
router.get('/:id/presupuesto/real-costs', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], presupuestoController.getRealCosts);

// GET /api/proyectos/:id/presupuesto/categories - Obtener categorías
router.get('/:id/presupuesto/categories', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], presupuestoController.getCategories);

// GET /api/proyectos/:id/presupuesto/wbs-activities - Obtener actividades WBS
router.get('/:id/presupuesto/wbs-activities', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], presupuestoController.getWBSActivities);

// POST /api/proyectos/:id/presupuesto - Crear elemento
router.post('/:id/presupuesto', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('categoria_id').isInt().withMessage('Category ID required'),
  body('descripcion').notEmpty().withMessage('Description required'),
  validate
], presupuestoController.create);

// POST /api/proyectos/:id/presupuesto/real-costs - Registrar gasto real
router.post('/:id/presupuesto/real-costs', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('fecha').isISO8601().withMessage('Date required'),
  body('monto').isFloat({ min: 0.01 }).withMessage('Amount required'),
  validate
], presupuestoController.addRealCost);

module.exports = router;
