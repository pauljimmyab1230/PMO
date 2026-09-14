const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const riesgosController = require('../controllers/riesgos.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/riesgos/:id - Obtener un riesgo
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], riesgosController.getById);

// PUT /api/riesgos/:id - Actualizar riesgo
router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('titulo').notEmpty().withMessage('Title required'),
  validate
], riesgosController.update);

// DELETE /api/riesgos/:id - Eliminar riesgo
router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], riesgosController.delete);

module.exports = router;
