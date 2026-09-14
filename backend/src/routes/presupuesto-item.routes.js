const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const presupuestoController = require('../controllers/presupuesto.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/presupuesto/:id - Obtener un elemento
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], presupuestoController.getById);

// PUT /api/presupuesto/:id - Actualizar elemento
router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('categoria_id').notEmpty().withMessage('Category ID required'),
  body('descripcion').notEmpty().withMessage('Description required'),
  validate
], presupuestoController.update);

// DELETE /api/presupuesto/:id - Eliminar elemento
router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], presupuestoController.delete);

// DELETE /api/presupuesto/real-costs/:id - Eliminar gasto real
router.delete('/real-costs/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], presupuestoController.deleteRealCost);

module.exports = router;
