// Función para mostrar alertas centradas con animación
function mostrarAlerta(mensaje, tipo = 'error', callback = null) {
    let icon;
    switch(tipo) {
        case 'success':
            icon = 'success';
            break;
        case 'warning':
            icon = 'warning';
            break;
        case 'info':
            icon = 'info';
            break;
        default:
            icon = 'error';
    }

    Swal.fire({
        icon: icon,
        title: mensaje,
        showConfirmButton: true,
        confirmButtonText: 'Aceptar',
        showClass: {
            popup: 'swal2-show swal2-animate__animated swal2-animate__fadeInDown'
        },
        hideClass: {
            popup: 'swal2-hide swal2-animate__animated swal2-animate__fadeOutUp'
        },
        backdrop: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(() => {
        if (callback) callback();
    });
}

// Manejar el formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando sesión...';
    
    const formData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso: alerta centrada con animación
            mostrarAlerta('¡Inicio de sesión exitoso!', 'success', () => {
                if (data.usuario.rol === 'Administrador') {
                    window.location.href = '/dashboard-admin.html';
                } else {
                    window.location.href = '/dashboard-operario.html';
                }
            });
        } else {
            // Credenciales inválidas o error del servidor
            mostrarAlerta(data.error || 'Error al iniciar sesión', 'error', () => {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar Sesión';
            });
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión con el servidor', 'error', () => {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        });
    }
});

