const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacion.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Resumen
router.get('/:id/evaluacion/resumen', evaluacionController.getResumen);

// Evaluación del proyecto
router.get('/:id/evaluacion', evaluacionController.getEvaluacion);
router.post('/:id/evaluacion', evaluacionController.createOrUpdateEvaluacion);

// Encuestas
router.get('/:id/evaluacion/encuestas', evaluacionController.getEncuestas);
router.post('/:id/evaluacion/encuestas', evaluacionController.createEncuesta);
router.put('/evaluacion/encuestas/:id', evaluacionController.updateEncuesta);
router.delete('/evaluacion/encuestas/:id', evaluacionController.deleteEncuesta);

module.exports = router;
