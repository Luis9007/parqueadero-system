// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).json({ 
        error: 'No autorizado. Debe iniciar sesión.' 
    });
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.session || !req.session.usuario) {
            return res.status(401).json({ 
                error: 'No autorizado. Debe iniciar sesión.' 
            });
        }

        const rolUsuario = req.session.usuario.rol;
        
        if (rolesPermitidos.includes(rolUsuario)) {
            return next();
        }

        return res.status(403).json({ 
            error: 'Acceso denegado. No tiene permisos suficientes.' 
        });
    };
};

module.exports = {
    verificarAutenticacion,
    verificarRol
};