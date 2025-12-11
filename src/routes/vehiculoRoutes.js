const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { verificarAutenticacion, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Rutas accesibles para Operario y Administrador
router.get('/disponibilidad', vehiculoController.obtenerDisponibilidad);
router.post('/entrada', verificarRol('Operario', 'Administrador'), vehiculoController.registrarEntrada);
router.get('/buscar/:placa', vehiculoController.buscarVehiculo);
router.get('/en-curso', vehiculoController.listarVehiculosEnCurso);
router.get('/calcular-costo/:registro_id', vehiculoController.calcularCosto);
router.post('/salida', verificarRol('Operario', 'Administrador'), vehiculoController.registrarSalida);

module.exports = router;