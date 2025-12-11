const bcrypt = require('bcrypt');
const db = require('../config/database');

// Iniciar sesión
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario por email
        const [usuarios] = await db.query(
            `SELECT u.*, r.nombre as rol 
             FROM usuarios u 
             INNER JOIN roles r ON u.rol_id = r.id 
             WHERE u.email = ?`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        const usuario = usuarios[0];

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(403).json({ 
                error: 'Usuario inactivo. Contacte al administrador.' 
            });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Crear sesión
        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            rol_id: usuario.rol_id
        };

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error al iniciar sesión' 
        });
    }
};

// Cerrar sesión
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Error al cerrar sesión' 
            });
        }
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
};

// Obtener usuario actual
const obtenerUsuarioActual = (req, res) => {
    if (req.session && req.session.usuario) {
        res.json({ usuario: req.session.usuario });
    } else {
        res.status(401).json({ error: 'No hay sesión activa' });
    }
};

module.exports = {
    login,
    logout,
    obtenerUsuarioActual
};