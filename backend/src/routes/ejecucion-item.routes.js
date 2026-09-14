const express = require('express');
const router = express.Router();
const ejecucionController = require('../controllers/ejecucion.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Issues
router.put('/issues/:id', ejecucionController.updateIssue);
router.put('/issues/:id/status', ejecucionController.updateIssueStatus);
router.delete('/issues/:id', ejecucionController.deleteIssue);

// Entregables
router.put('/entregables/:id', ejecucionController.updateEntregable);
router.put('/entregables/:id/status', ejecucionController.updateEntregableStatus);
router.delete('/entregables/:id', ejecucionController.deleteEntregable);

// Bitácora
router.delete('/bitacora/:id', ejecucionController.deleteBitacora);

// Actividades
router.delete('/actividades/:id', ejecucionController.deleteActividad);

module.exports = router;
