const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const marcoLogicoController = require('../controllers/marco-logico.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos/:id/marco-logico - Obtener marco lógico jerárquico
router.get('/:id/marco-logico', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], marcoLogicoController.getByProject);

// GET /api/proyectos/:id/marco-logico/flat - Obtener marco lógico plano
router.get('/:id/marco-logico/flat', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], marcoLogicoController.getByProjectFlat);

// GET /api/proyectos/:id/marco-logico/summary - Resumen del marco lógico
router.get('/:id/marco-logico/summary', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], marcoLogicoController.getSummary);

// POST /api/proyectos/:id/marco-logico - Crear elemento
router.post('/:id/marco-logico', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('nivel_id').isInt().withMessage('Level ID required'),
  body('descripcion').notEmpty().withMessage('Description required'),
  validate
], marcoLogicoController.create);

module.exports = router;
