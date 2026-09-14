const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ejecucionController = require('../controllers/ejecucion.controller');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

// Summary
router.get('/:id/ejecucion/summary', ejecucionController.getSummary);

// Utilities
router.get('/:id/ejecucion/users', ejecucionController.getUsers);
router.get('/:id/ejecucion/wbs', ejecucionController.getWBSActivities);

// Issues
router.get('/:id/issues', ejecucionController.getIssues);
router.post('/:id/issues', [body('titulo').notEmpty(), validate], ejecucionController.createIssue);
router.get('/:id/issues/summary', ejecucionController.getIssuesSummary);

// Entregables
router.get('/:id/entregables', ejecucionController.getEntregables);
router.post('/:id/entregables', [body('nombre').notEmpty(), validate], ejecucionController.createEntregable);

// Bitácora
router.get('/:id/bitacora', ejecucionController.getBitacora);
router.post('/:id/bitacora', [body('descripcion').notEmpty(), validate], ejecucionController.createBitacora);

// Actividades
router.get('/:id/actividades', ejecucionController.getActividades);
router.post('/:id/actividades', [body('actividad_realizada').notEmpty(), validate], ejecucionController.createActividad);

module.exports = router;
