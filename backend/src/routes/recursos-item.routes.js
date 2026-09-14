const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const recursosController = require('../controllers/recursos.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], recursosController.getById);

router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], recursosController.update);

router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validate
], recursosController.delete);

module.exports = router;
