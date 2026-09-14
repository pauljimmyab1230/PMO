const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const riesgosController = require('../controllers/riesgos.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/proyectos/:id/riesgos - Obtener riesgos
router.get('/:id/riesgos', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], riesgosController.getByProject);

// GET /api/proyectos/:id/riesgos/summary - Resumen
router.get('/:id/riesgos/summary', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], riesgosController.getSummary);

// GET /api/proyectos/:id/riesgos/heatmap - Matriz de calor
router.get('/:id/riesgos/heatmap', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], riesgosController.getHeatmap);

// GET /api/proyectos/:id/riesgos/users - Usuarios
router.get('/:id/riesgos/users', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], riesgosController.getUsers);

// POST /api/proyectos/:id/riesgos - Crear riesgo
router.post('/:id/riesgos', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('titulo').notEmpty().withMessage('Title required'),
  validate
], riesgosController.create);

module.exports = router;
