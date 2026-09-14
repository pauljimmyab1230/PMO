const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos
router.get('/', projectController.getAll);

// GET /api/proyectos/:id
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], projectController.getById);

// GET /api/proyectos/:id/dashboard
router.get('/:id/dashboard', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], projectController.getDashboard);

// POST /api/proyectos
router.post('/', [
  body('nombre').notEmpty().withMessage('Project name required'),
  validate
], projectController.create);

// PUT /api/proyectos/:id
router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('nombre').notEmpty().withMessage('Project name required'),
  validate
], projectController.update);

// DELETE /api/proyectos/:id
router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], projectController.delete);

// PUT /api/proyectos/:id/estado
router.put('/:id/estado', [
  param('id').isInt().withMessage('ID must be an integer'),
  body('estado_id').isInt().withMessage('State ID required'),
  validate
], projectController.updateState);

module.exports = router;
