const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const marcoLogicoController = require('../controllers/marco-logico.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/marco-logico/niveles - Obtener niveles
router.get('/niveles', marcoLogicoController.getLevels);

// GET /api/marco-logico/:id - Obtener un elemento
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], marcoLogicoController.getById);

// PUT /api/marco-logico/:id - Actualizar elemento
router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('nivel_id').isInt().withMessage('Level ID required'),
  body('descripcion').notEmpty().withMessage('Description required'),
  validate
], marcoLogicoController.update);

// PUT /api/marco-logico/:id/progress - Actualizar avance
router.put('/:id/progress', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('avance_porcentaje').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  validate
], marcoLogicoController.updateProgress);

// DELETE /api/marco-logico/:id - Eliminar elemento
router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], marcoLogicoController.delete);

module.exports = router;
