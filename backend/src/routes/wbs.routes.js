const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const wbsController = require('../controllers/wbs.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos/:id/wbs - Obtener WBS jerárquico
router.get('/:id/wbs', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], wbsController.getByProject);

// GET /api/proyectos/:id/wbs/flat - Obtener WBS plano
router.get('/:id/wbs/flat', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], wbsController.getByProjectFlat);

// GET /api/proyectos/:id/wbs/summary - Resumen del WBS
router.get('/:id/wbs/summary', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], wbsController.getSummary);

// GET /api/proyectos/:id/wbs/critical-path - Ruta crítica
router.get('/:id/wbs/critical-path', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], wbsController.getCriticalPath);

// POST /api/proyectos/:id/wbs - Crear elemento
router.post('/:id/wbs', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('nombre').notEmpty().withMessage('Name required'),
  validate
], wbsController.create);

module.exports = router;
