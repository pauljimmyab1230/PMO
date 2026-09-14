const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inicioController = require('../controllers/inicio.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

// Charter
router.get('/:id/inicio/charter', inicioController.getCharter);
router.post('/:id/inicio/charter', inicioController.createOrUpdateCharter);
router.put('/:id/inicio/charter/approve', inicioController.approveCharter);

// Stakeholders
router.get('/:id/inicio/stakeholders', inicioController.getStakeholders);
router.post('/:id/inicio/stakeholders', [body('nombre').notEmpty(), validate], inicioController.createStakeholder);

// Viabilidad
router.get('/:id/inicio/viabilidad', inicioController.getViabilidad);
router.post('/:id/inicio/viabilidad', [body('tipo').notEmpty(), validate], inicioController.createViabilidad);

// Users
router.get('/:id/inicio/users', inicioController.getUsers);

module.exports = router;
