const bcrypt = require('bcrypt');
const db = require('../config/database');

// Listar usuarios
const listarUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            `SELECT 
                u.id, u.nombre, u.email, u.activo, u.fecha_creacion,
                r.nombre as rol
            FROM usuarios u
            INNER JOIN roles r ON u.rol_id = r.id
            ORDER BY u.fecha_creacion DESC`
        );

        res.json(usuarios);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

// Obtener usuario por ID
const obtenerUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [usuarios] = await db.query(
            `SELECT 
                u.id, u.nombre, u.email, u.rol_id, u.activo, u.fecha_creacion,
                r.nombre as rol
            FROM usuarios u
            INNER JOIN roles r ON u.rol_id = r.id
            WHERE u.id = ?`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuarios[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

// Crear usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;

        if (!nombre || !email || !password || !rol_id) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el email ya existe
        const [existente] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existente.length > 0) {
            return res.status(400).json({ 
                error: 'El email ya está registrado' 
            });
        }

        // Encriptar contraseña
        const password_hash = await bcrypt.hash(password, 10);

        const [resultado] = await db.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) 
            VALUES (?, ?, ?, ?, 1)`,
            [nombre, email, password_hash, rol_id]
        );

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol_id, activo } = req.body;

        // Verificar si el email ya existe en otro usuario
        const [existente] = await db.query(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [email, id]
        );

        if (existente.length > 0) {
            return res.status(400).json({ 
                error: 'El email ya está registrado por otro usuario' 
            });
        }

        const [resultado] = await db.query(
            `UPDATE usuarios 
            SET nombre = ?, email = ?, rol_id = ?, activo = ?
            WHERE id = ?`,
            [nombre, email, rol_id, activo, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password_actual, password_nuevo } = req.body;

        if (!password_actual || !password_nuevo) {
            return res.status(400).json({ 
                error: 'Contraseña actual y nueva son requeridas' 
            });
        }

        // Obtener usuario
        const [usuarios] = await db.query(
            'SELECT password_hash FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const passwordValido = await bcrypt.compare(password_actual, usuarios[0].password_hash);

        if (!passwordValido) {
            return res.status(401).json({ 
                error: 'Contraseña actual incorrecta' 
            });
        }

        // Encriptar nueva contraseña
        const password_hash = await bcrypt.hash(password_nuevo, 10);

        await db.query(
            'UPDATE usuarios SET password_hash = ? WHERE id = ?',
            [password_hash, id]
        );

        res.json({ mensaje: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
};

// Listar roles
const listarRoles = async (req, res) => {
    try {
        const [roles] = await db.query(
            'SELECT id, nombre, descripcion FROM roles ORDER BY nombre'
        );

        res.json(roles);
    } catch (error) {
        console.error('Error al listar roles:', error);
        res.status(500).json({ error: 'Error al listar roles' });
    }
};

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword,
    listarRoles
};