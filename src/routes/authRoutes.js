const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarAutenticacion } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.post('/logout', verificarAutenticacion, authController.logout);
router.get('/me', verificarAutenticacion, authController.obtenerUsuarioActual);

module.exports = router;