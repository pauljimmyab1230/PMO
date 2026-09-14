const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const monitoreoController = require('../controllers/monitoreo.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

// Dashboard
router.get('/:id/monitoreo/dashboard', monitoreoController.getDashboard);

// Valor Ganado
router.get('/:id/monitoreo/valor-ganado', monitoreoController.getValorGanado);
router.post('/:id/monitoreo/valor-ganado', [body('periodo').notEmpty(), body('pv').isFloat(), body('ev').isFloat(), body('ac').isFloat(), validate], monitoreoController.createValorGanado);
router.delete('/valor-ganado/:id', monitoreoController.deleteValorGanado);

// Indicadores
router.get('/:id/monitoreo/indicadores', monitoreoController.getIndicadores);
router.post('/:id/monitoreo/indicadores', [body('nombre').notEmpty(), validate], monitoreoController.createIndicador);
router.put('/indicadores/:id', monitoreoController.updateIndicador);
router.delete('/indicadores/:id', monitoreoController.deleteIndicador);

// Control de Cambios
router.get('/:id/monitoreo/cambios', monitoreoController.getCambios);
router.post('/:id/monitoreo/cambios', [body('titulo').notEmpty(), validate], monitoreoController.createCambio);
router.put('/cambios/:id', monitoreoController.updateCambio);
router.put('/cambios/:id/status', monitoreoController.updateCambioStatus);
router.delete('/cambios/:id', monitoreoController.deleteCambio);

// Users
router.get('/:id/monitoreo/users', monitoreoController.getUsers);

module.exports = router;
