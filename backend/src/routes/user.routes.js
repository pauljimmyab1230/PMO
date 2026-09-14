const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

// GET /api/usuarios
router.get('/', userController.getAll);

// GET /api/usuarios/:id
router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], userController.getById);

// POST /api/usuarios (admin only)
router.post('/', [
  authorizeRoles('admin'),
  body('nombre').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('rol').isIn(['admin', 'pmo', 'pm', 'equipo', 'sponsor', 'visor']).withMessage('Invalid role'),
  validate
], userController.create);

// PUT /api/usuarios/:id (admin only)
router.put('/:id', [
  authorizeRoles('admin'),
  param('id').isInt().withMessage('ID must be an integer'),
  body('nombre').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('rol').isIn(['admin', 'pmo', 'pm', 'equipo', 'sponsor', 'visor']).withMessage('Invalid role'),
  validate
], userController.update);

// DELETE /api/usuarios/:id (admin only)
router.delete('/:id', [
  authorizeRoles('admin'),
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], userController.delete);

module.exports = router;
