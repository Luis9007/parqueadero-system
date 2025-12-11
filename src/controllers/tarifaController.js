const db = require('../config/database');

// Listar todas las tarifas
const listarTarifas = async (req, res) => {
    try {
        const [tarifas] = await db.query(
            `SELECT 
                t.id, t.nombre, t.tipo_cobro, t.valor, t.activo, 
                t.fecha_inicio, t.fecha_fin,
                tv.nombre as tipo_vehiculo
            FROM tarifas t
            INNER JOIN tipos_vehiculo tv ON t.tipo_vehiculo_id = tv.id
            ORDER BY t.activo DESC, t.fecha_inicio DESC`
        );

        res.json(tarifas);
    } catch (error) {
        console.error('Error al listar tarifas:', error);
        res.status(500).json({ error: 'Error al listar tarifas' });
    }
};

// Obtener tarifa por ID
const obtenerTarifa = async (req, res) => {
    try {
        const { id } = req.params;

        const [tarifas] = await db.query(
            `SELECT 
                t.*, 
                tv.nombre as tipo_vehiculo
            FROM tarifas t
            INNER JOIN tipos_vehiculo tv ON t.tipo_vehiculo_id = tv.id
            WHERE t.id = ?`,
            [id]
        );

        if (tarifas.length === 0) {
            return res.status(404).json({ error: 'Tarifa no encontrada' });
        }

        res.json(tarifas[0]);
    } catch (error) {
        console.error('Error al obtener tarifa:', error);
        res.status(500).json({ error: 'Error al obtener tarifa' });
    }
};

// Crear nueva tarifa
const crearTarifa = async (req, res) => {
    try {
        const { tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio, fecha_fin } = req.body;

        if (!tipo_vehiculo_id || !nombre || !tipo_cobro || !valor || !fecha_inicio) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos excepto fecha_fin' 
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO tarifas 
            (tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio, fecha_fin, activo) 
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [tipo_vehiculo_id, nombre, tipo_cobro, valor, fecha_inicio, fecha_fin || null]
        );

        res.status(201).json({
            mensaje: 'Tarifa creada exitosamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear tarifa:', error);
        res.status(500).json({ error: 'Error al crear tarifa' });
    }
};

// Actualizar tarifa
const actualizarTarifa = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo_cobro, valor, fecha_inicio, fecha_fin, activo } = req.body;

        const [resultado] = await db.query(
            `UPDATE tarifas 
            SET nombre = ?, tipo_cobro = ?, valor = ?, fecha_inicio = ?, fecha_fin = ?, activo = ?
            WHERE id = ?`,
            [nombre, tipo_cobro, valor, fecha_inicio, fecha_fin || null, activo, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarifa no encontrada' });
        }

        res.json({ mensaje: 'Tarifa actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar tarifa:', error);
        res.status(500).json({ error: 'Error al actualizar tarifa' });
    }
};

// Desactivar tarifa
const desactivarTarifa = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'UPDATE tarifas SET activo = 0 WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarifa no encontrada' });
        }

        res.json({ mensaje: 'Tarifa desactivada exitosamente' });

    } catch (error) {
        console.error('Error al desactivar tarifa:', error);
        res.status(500).json({ error: 'Error al desactivar tarifa' });
    }
};

// Listar tipos de vehículo
const listarTiposVehiculo = async (req, res) => {
    try {
        const [tipos] = await db.query(
            'SELECT id, nombre, descripcion FROM tipos_vehiculo ORDER BY nombre'
        );

        res.json(tipos);
    } catch (error) {
        console.error('Error al listar tipos de vehículo:', error);
        res.status(500).json({ error: 'Error al listar tipos de vehículo' });
    }
};

module.exports = {
    listarTarifas,
    obtenerTarifa,
    crearTarifa,
    actualizarTarifa,
    desactivarTarifa,
    listarTiposVehiculo
};