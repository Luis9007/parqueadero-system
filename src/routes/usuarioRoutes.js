const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAutenticacion, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de Administrador
router.use(verificarAutenticacion);
router.use(verificarRol('Administrador'));

router.get('/', usuarioController.listarUsuarios);
router.get('/roles', usuarioController.listarRoles);
router.get('/:id', usuarioController.obtenerUsuario);
router.post('/', usuarioController.crearUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.patch('/:id/password', usuarioController.cambiarPassword);

module.exports = router;