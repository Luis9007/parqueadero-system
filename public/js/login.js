// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'error') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    container.innerHTML = '';
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
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
            // Login exitoso
            mostrarAlerta('¡Inicio de sesión exitoso!', 'success');
            
            // Redirigir según el rol
            setTimeout(() => {
                if (data.usuario.rol === 'Administrador') {
                    window.location.href = '/dashboard-admin.html';
                } else {
                    window.location.href = '/dashboard-operario.html';
                }
            }, 500);
        } else {
            mostrarAlerta(data.error || 'Error al iniciar sesión', 'error');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión con el servidor', 'error');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
    }
});