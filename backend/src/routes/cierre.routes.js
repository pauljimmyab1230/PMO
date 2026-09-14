const express = require('express');
const router = express.Router();
const cierreController = require('../controllers/cierre.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Checklist de cierre
router.get('/:id/cierre', cierreController.getCierre);
router.post('/:id/cierre', cierreController.createOrUpdateCierre);

// Lecciones aprendidas
router.get('/:id/lecciones', cierreController.getLecciones);
router.post('/:id/lecciones', cierreController.createLeccion);
router.put('/lecciones/:id', cierreController.updateLeccion);
router.delete('/lecciones/:id', cierreController.deleteLeccion);

// Transferencia de activos
router.get('/:id/transferencias', cierreController.getTransferencias);
router.post('/:id/transferencias', cierreController.createTransferencia);
router.put('/transferencias/:id/status', cierreController.updateTransferenciaStatus);
router.delete('/transferencias/:id', cierreController.deleteTransferencia);

// Cierre financiero
router.get('/:id/cierre-financiero', cierreController.getCierreFinanciero);
router.post('/:id/cierre-financiero', cierreController.createOrUpdateCierreFinanciero);

// Utilities
router.get('/:id/cierre/users', cierreController.getUsers);
router.get('/:id/cierre/areas', cierreController.getAreas);

module.exports = router;
