const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/tarifaController');
const { verificarAutenticacion, verificarRol } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// Rutas de consulta (Operario y Administrador)
router.get('/', tarifaController.listarTarifas);
router.get('/tipos-vehiculo', tarifaController.listarTiposVehiculo);
router.get('/:id', tarifaController.obtenerTarifa);

// Rutas de gestión (solo Administrador)
router.post('/', verificarRol('Administrador'), tarifaController.crearTarifa);
router.put('/:id', verificarRol('Administrador'), tarifaController.actualizarTarifa);
router.patch('/:id/desactivar', verificarRol('Administrador'), tarifaController.desactivarTarifa);

module.exports = router;