const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const wbsController = require('../controllers/wbs.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/wbs/users - Obtener usuarios para asignar
router.get('/users', wbsController.getUsers);

// GET /api/wbs/:id - Obtener un elemento
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], wbsController.getById);

// PUT /api/wbs/:id - Actualizar elemento
router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('nombre').notEmpty().withMessage('Name required'),
  validate
], wbsController.update);

// PUT /api/wbs/:id/progress - Actualizar avance
router.put('/:id/progress', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('avance').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  validate
], wbsController.updateProgress);

// DELETE /api/wbs/:id - Eliminar elemento
router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], wbsController.delete);

module.exports = router;
