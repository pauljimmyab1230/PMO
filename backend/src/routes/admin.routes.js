const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticateToken);

// Usuarios (solo admin)
router.get('/admin/usuarios', adminController.getUsuarios);
router.post('/admin/usuarios', [authorizeRoles('admin'), body('nombre').notEmpty(), body('email').isEmail(), body('password').isLength({min:6}), validate], adminController.createUsuario);
router.put('/admin/usuarios/:id', [authorizeRoles('admin'), body('nombre').notEmpty(), body('email').isEmail(), validate], adminController.updateUsuario);
router.delete('/admin/usuarios/:id', authorizeRoles('admin'), adminController.deleteUsuario);

// Áreas
router.get('/admin/areas', adminController.getAreas);
router.post('/admin/areas', [authorizeRoles('admin','pmo'), body('nombre').notEmpty(), validate], adminController.createArea);
router.put('/admin/areas/:id', [authorizeRoles('admin','pmo'), body('nombre').notEmpty(), validate], adminController.updateArea);
router.delete('/admin/areas/:id', authorizeRoles('admin'), adminController.deleteArea);

// Catálogos
router.get('/admin/tipos-proyecto', adminController.getTiposProyecto);
router.post('/admin/tipos-proyecto', [authorizeRoles('admin'), body('nombre').notEmpty(), validate], adminController.createTipoProyecto);
router.put('/admin/tipos-proyecto/:id', authorizeRoles('admin'), adminController.updateTipoProyecto);
router.delete('/admin/tipos-proyecto/:id', authorizeRoles('admin'), adminController.deleteTipoProyecto);

router.get('/admin/categorias-costo', adminController.getCategoriasCosto);
router.post('/admin/categorias-costo', [authorizeRoles('admin'), body('nombre').notEmpty(), body('tipo').notEmpty(), validate], adminController.createCategoriaCosto);
router.put('/admin/categorias-costo/:id', authorizeRoles('admin'), adminController.updateCategoriaCosto);
router.delete('/admin/categorias-costo/:id', authorizeRoles('admin'), adminController.deleteCategoriaCosto);

router.get('/admin/roles-proyecto', adminController.getRolesProyecto);
router.post('/admin/roles-proyecto', [authorizeRoles('admin'), body('nombre').notEmpty(), validate], adminController.createRolProyecto);
router.put('/admin/roles-proyecto/:id', authorizeRoles('admin'), adminController.updateRolProyecto);
router.delete('/admin/roles-proyecto/:id', authorizeRoles('admin'), adminController.deleteRolProyecto);

router.get('/admin/estados-proyecto', adminController.getEstadosProyecto);
router.post('/admin/estados-proyecto', [authorizeRoles('admin'), body('nombre').notEmpty(), validate], adminController.createEstadoProyecto);
router.put('/admin/estados-proyecto/:id', authorizeRoles('admin'), adminController.updateEstadoProyecto);
router.delete('/admin/estados-proyecto/:id', authorizeRoles('admin'), adminController.deleteEstadoProyecto);

module.exports = router;
