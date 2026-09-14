const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
], authController.login);

// POST /api/auth/register
router.post('/register', [
  body('nombre').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  validate
], authController.register);

// GET /api/auth/me
router.get('/me', authenticateToken, authController.getMe);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

module.exports = router;
