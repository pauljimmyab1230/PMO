const express = require('express');
const router = express.Router();
const portafolioController = require('../controllers/portafolio.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/portafolio/dashboard', portafolioController.getDashboard);
router.get('/portafolio/projects', portafolioController.getProjects);
router.get('/portafolio/stats-by-pm', portafolioController.getStatsByPM);

module.exports = router;
