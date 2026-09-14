const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const recursosController = require('../controllers/recursos.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

// GET /api/proyectos/:id/recursos
router.get('/:id/recursos', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], recursosController.getByProject);

// GET /api/proyectos/:id/recursos/summary
router.get('/:id/recursos/summary', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], recursosController.getSummary);

// GET /api/proyectos/:id/recursos/users
router.get('/:id/recursos/users', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], recursosController.getUsers);

// GET /api/proyectos/:id/recursos/roles
router.get('/:id/recursos/roles', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], recursosController.getRoles);

// GET /api/proyectos/:id/recursos/wbs
router.get('/:id/recursos/wbs', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  validate
], recursosController.getWBSActivities);

// POST /api/proyectos/:id/recursos
router.post('/:id/recursos', [
  param('id').isInt().withMessage('Project ID must be an integer'),
  body('usuario_id').isInt().withMessage('User ID required'),
  validate
], recursosController.create);

module.exports = router;
