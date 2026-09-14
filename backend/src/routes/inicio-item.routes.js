const express = require('express');
const router = express.Router();
const inicioController = require('../controllers/inicio.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Stakeholders
router.put('/stakeholders/:id', inicioController.updateStakeholder);
router.delete('/stakeholders/:id', inicioController.deleteStakeholder);

// Viabilidad
router.put('/viabilidad/:id', inicioController.updateViabilidad);
router.delete('/viabilidad/:id', inicioController.deleteViabilidad);

module.exports = router;
