const db = require('../config/database');

// Obtener disponibilidad de cupos
const obtenerDisponibilidad = async (req, res) => {
    try {
        const [tipos] = await db.query(`
            SELECT 
                tv.id,
                tv.nombre,
                tv.capacidad_total,
                COUNT(CASE WHEN e.disponible = 1 THEN 1 END) as disponibles,
                COUNT(CASE WHEN e.disponible = 0 THEN 1 END) as ocupados
            FROM tipos_vehiculo tv
            LEFT JOIN espacios e ON tv.id = e.tipo_vehiculo_id
            GROUP BY tv.id, tv.nombre, tv.capacidad_total
        `);

        res.json(tipos);
    } catch (error) {
        console.error('Error al obtener disponibilidad:', error);
        res.status(500).json({ error: 'Error al consultar disponibilidad' });
    }
};

// Registrar entrada de vehículo
const registrarEntrada = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { placa, tipo_vehiculo_id } = req.body;
        const usuario_id = req.session.usuario.id;

        if (!placa || !tipo_vehiculo_id) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Placa y tipo de vehículo son requeridos' 
            });
        }

        // Verificar si el vehículo ya está dentro
        const [vehiculosEnCurso] = await connection.query(
            'SELECT id FROM registros WHERE placa = ? AND estado = "EN_CURSO"',
            [placa.toUpperCase()]
        );

        if (vehiculosEnCurso.length > 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Este vehículo ya se encuentra en el parqueadero' 
            });
        }

        // Buscar espacio disponible
        const [espaciosDisponibles] = await connection.query(
            'SELECT id, codigo FROM espacios WHERE tipo_vehiculo_id = ? AND disponible = 1 LIMIT 1',
            [tipo_vehiculo_id]
        );

        if (espaciosDisponibles.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'No hay espacios disponibles para este tipo de vehículo' 
            });
        }

        const espacio = espaciosDisponibles[0];

        // Obtener tarifa activa
        const [tarifas] = await connection.query(
            'SELECT id FROM tarifas WHERE tipo_vehiculo_id = ? AND activo = 1 LIMIT 1',
            [tipo_vehiculo_id]
        );

        if (tarifas.length === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'No hay tarifa configurada para este tipo de vehículo' 
            });
        }

        const tarifa_id = tarifas[0].id;

        // Registrar entrada
        const fecha_hora_entrada = new Date();
        const [resultado] = await connection.query(
            `INSERT INTO registros 
            (placa, tipo_vehiculo_id, espacio_id, fecha_hora_entrada, tarifa_id, estado, usuario_entrada_id) 
            VALUES (?, ?, ?, ?, ?, 'EN_CURSO', ?)`,
            [placa.toUpperCase(), tipo_vehiculo_id, espacio.id, fecha_hora_entrada, tarifa_id, usuario_id]
        );

        // Marcar espacio como ocupado
        await connection.query(
            'UPDATE espacios SET disponible = 0 WHERE id = ?',
            [espacio.id]
        );

        await connection.commit();

        res.json({
            mensaje: 'Entrada registrada exitosamente',
            registro: {
                id: resultado.insertId,
                placa: placa.toUpperCase(),
                espacio: espacio.codigo,
                fecha_hora_entrada: fecha_hora_entrada
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar entrada:', error);
        res.status(500).json({ error: 'Error al registrar entrada' });
    } finally {
        connection.release();
    }
};

// Buscar vehículo por placa
const buscarVehiculo = async (req, res) => {
    try {
        const { placa } = req.params;

        const [registros] = await db.query(
            `SELECT 
                r.id, r.placa, r.fecha_hora_entrada, r.estado,
                tv.nombre as tipo_vehiculo,
                e.codigo as espacio
            FROM registros r
            INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
            INNER JOIN espacios e ON r.espacio_id = e.id
            WHERE r.placa = ? AND r.estado = 'EN_CURSO'`,
            [placa.toUpperCase()]
        );

        if (registros.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontró vehículo con esa placa en el parqueadero' 
            });
        }

        res.json(registros[0]);
    } catch (error) {
        console.error('Error al buscar vehículo:', error);
        res.status(500).json({ error: 'Error al buscar vehículo' });
    }
};

// Listar vehículos en curso
const listarVehiculosEnCurso = async (req, res) => {
    try {
        const [registros] = await db.query(
            `SELECT 
                r.id, r.placa, r.fecha_hora_entrada,
                tv.nombre as tipo_vehiculo,
                e.codigo as espacio,
                TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) as minutos_transcurridos
            FROM registros r
            INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
            INNER JOIN espacios e ON r.espacio_id = e.id
            WHERE r.estado = 'EN_CURSO'
            ORDER BY r.fecha_hora_entrada DESC`
        );

        res.json(registros);
    } catch (error) {
        console.error('Error al listar vehículos:', error);
        res.status(500).json({ error: 'Error al listar vehículos' });
    }
};

// Calcular costo de salida
const calcularCosto = async (req, res) => {
    try {
        const { registro_id } = req.params;

        const [registros] = await db.query(
            `SELECT 
                r.id, r.placa, r.fecha_hora_entrada, r.tarifa_id,
                tv.nombre as tipo_vehiculo,
                e.codigo as espacio,
                t.tipo_cobro, t.valor as valor_tarifa,
                TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) as minutos_totales
            FROM registros r
            INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
            INNER JOIN espacios e ON r.espacio_id = e.id
            INNER JOIN tarifas t ON r.tarifa_id = t.id
            WHERE r.id = ? AND r.estado = 'EN_CURSO'`,
            [registro_id]
        );

        if (registros.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontró el registro o ya está finalizado' 
            });
        }

        const registro = registros[0];
        let valor_calculado = 0;

        // Calcular según tipo de cobro
        switch (registro.tipo_cobro) {
            case 'POR_MINUTO':
                valor_calculado = registro.minutos_totales * registro.valor_tarifa;
                break;
            case 'POR_HORA':
                const horas = Math.ceil(registro.minutos_totales / 60);
                valor_calculado = horas * registro.valor_tarifa;
                break;
            case 'POR_DIA':
                const dias = Math.ceil(registro.minutos_totales / (24 * 60));
                valor_calculado = dias * registro.valor_tarifa;
                break;
            case 'FRACCION':
                // Fracción de 15 minutos
                const fracciones = Math.ceil(registro.minutos_totales / 15);
                valor_calculado = fracciones * registro.valor_tarifa;
                break;
        }

        res.json({
            ...registro,
            valor_calculado: parseFloat(valor_calculado.toFixed(2)),
            fecha_hora_salida_estimada: new Date()
        });

    } catch (error) {
        console.error('Error al calcular costo:', error);
        res.status(500).json({ error: 'Error al calcular costo' });
    }
};

// Registrar salida
const registrarSalida = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { registro_id, descuento } = req.body;
        const usuario_id = req.session.usuario.id;
        const descuentoAplicar = descuento || 0;

        // Obtener información del registro
        const [registros] = await connection.query(
            `SELECT 
                r.*, 
                t.tipo_cobro, t.valor as valor_tarifa,
                TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) as minutos_totales
            FROM registros r
            INNER JOIN tarifas t ON r.tarifa_id = t.id
            WHERE r.id = ? AND r.estado = 'EN_CURSO'`,
            [registro_id]
        );

        if (registros.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                error: 'No se encontró el registro o ya está finalizado' 
            });
        }

        const registro = registros[0];
        let valor_calculado = 0;

        // Calcular costo
        switch (registro.tipo_cobro) {
            case 'POR_MINUTO':
                valor_calculado = registro.minutos_totales * registro.valor_tarifa;
                break;
            case 'POR_HORA':
                const horas = Math.ceil(registro.minutos_totales / 60);
                valor_calculado = horas * registro.valor_tarifa;
                break;
            case 'POR_DIA':
                const dias = Math.ceil(registro.minutos_totales / (24 * 60));
                valor_calculado = dias * registro.valor_tarifa;
                break;
            case 'FRACCION':
                const fracciones = Math.ceil(registro.minutos_totales / 15);
                valor_calculado = fracciones * registro.valor_tarifa;
                break;
        }

        const valor_final = Math.max(0, valor_calculado - descuentoAplicar);
        const fecha_hora_salida = new Date();

        // Actualizar registro
        await connection.query(
            `UPDATE registros 
            SET fecha_hora_salida = ?, 
                minutos_totales = ?,
                valor_calculado = ?,
                descuento = ?,
                valor_final = ?,
                estado = 'FINALIZADO',
                usuario_salida_id = ?
            WHERE id = ?`,
            [fecha_hora_salida, registro.minutos_totales, valor_calculado, descuentoAplicar, valor_final, usuario_id, registro_id]
        );

        // Liberar espacio
        await connection.query(
            'UPDATE espacios SET disponible = 1 WHERE id = ?',
            [registro.espacio_id]
        );

        // Generar ticket
        const codigo_ticket = `TKT-${Date.now()}-${registro_id}`;
        await connection.query(
            'INSERT INTO tickets (registro_id, codigo_ticket, fecha_emision) VALUES (?, ?, ?)',
            [registro_id, codigo_ticket, fecha_hora_salida]
        );

        await connection.commit();

        res.json({
            mensaje: 'Salida registrada exitosamente',
            ticket: {
                codigo: codigo_ticket,
                placa: registro.placa,
                fecha_hora_entrada: registro.fecha_hora_entrada,
                fecha_hora_salida: fecha_hora_salida,
                minutos_totales: registro.minutos_totales,
                valor_calculado: parseFloat(valor_calculado.toFixed(2)),
                descuento: parseFloat(descuentoAplicar.toFixed(2)),
                valor_final: parseFloat(valor_final.toFixed(2))
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al registrar salida:', error);
        res.status(500).json({ error: 'Error al registrar salida' });
    } finally {
        connection.release();
    }
};

module.exports = {
    obtenerDisponibilidad,
    registrarEntrada,
    buscarVehiculo,
    listarVehiculosEnCurso,
    calcularCosto,
    registrarSalida
};