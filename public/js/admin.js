// Variables globales
let tarifaEditando = null;
let usuarioEditando = null;

// Verificar autenticación
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();
        
        if (data.usuario.rol !== 'Administrador') {
            window.location.href = '/dashboard-operario.html';
            return;
        }
        
        document.getElementById('userName').textContent = data.usuario.nombre;
        document.getElementById('userRole').textContent = data.usuario.rol;
    } catch (error) {
        window.location.href = '/login.html';
    }
}

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
});

// Mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    container.innerHTML = '';
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

// Mostrar secciones
function mostrarSeccion(seccion) {
    document.getElementById('seccionTarifas').classList.add('hidden');
    document.getElementById('seccionUsuarios').classList.add('hidden');
    
    if (seccion === 'tarifas') {
        document.getElementById('seccionTarifas').classList.remove('hidden');
        cargarTarifas();
    } else if (seccion === 'usuarios') {
        document.getElementById('seccionUsuarios').classList.remove('hidden');
        cargarUsuarios();
    }
}

// Cargar disponibilidad
async function cargarDisponibilidad() {
    try {
        const response = await fetch('/api/vehiculos/disponibilidad');
        const tipos = await response.json();
        
        tipos.forEach(tipo => {
            if (tipo.nombre === 'Sedan') {
                document.getElementById('statSedanes').textContent = `${tipo.disponibles}/${tipo.capacidad_total}`;
            } else if (tipo.nombre === 'Camioneta') {
                document.getElementById('statCamionetas').textContent = `${tipo.disponibles}/${tipo.capacidad_total}`;
            } else if (tipo.nombre === 'Moto') {
                document.getElementById('statMotos').textContent = `${tipo.disponibles}/${tipo.capacidad_total}`;
            }
        });
    } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
    }
}

// ============= GESTIÓN DE TARIFAS =============

async function cargarTarifas() {
    try {
        const response = await fetch('/api/tarifas');
        const tarifas = await response.json();
        
        const tbody = document.getElementById('tarifasTableBody');
        
        if (tarifas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tarifas configuradas</td></tr>';
            return;
        }
        
        tbody.innerHTML = tarifas.map(t => `
            <tr>
                <td>${t.tipo_vehiculo}</td>
                <td>${t.nombre}</td>
                <td><span class="badge badge-primary">${t.tipo_cobro.replace('_', ' ')}</span></td>
                <td>$${parseFloat(t.valor).toLocaleString('es-CO')}</td>
                <td>
                    <span class="badge badge-${t.activo ? 'success' : 'danger'}">
                        ${t.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarTarifa(${t.id})">Editar</button>
                    ${t.activo ? 
                        `<button class="btn btn-danger btn-sm" onclick="desactivarTarifa(${t.id})">Desactivar</button>` : ''
                    }
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar tarifas:', error);
    }
}

async function cargarTiposVehiculo() {
    try {
        const response = await fetch('/api/tarifas/tipos-vehiculo');
        const tipos = await response.json();
        
        const select = document.getElementById('tipoVehiculo');
        select.innerHTML = '<option value="">Seleccione...</option>';
        
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id;
            option.textContent = tipo.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar tipos:', error);
    }
}

function abrirModalTarifa() {
    tarifaEditando = null;
    document.getElementById('modalTarifaTitulo').textContent = 'Nueva Tarifa';
    document.getElementById('formTarifa').reset();
    document.getElementById('tarifaId').value = '';
    
    // Fecha de inicio por defecto: hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').value = hoy;
    
    cargarTiposVehiculo();
    document.getElementById('modalTarifa').classList.add('active');
}

function cerrarModalTarifa() {
    document.getElementById('modalTarifa').classList.remove('active');
}

async function editarTarifa(id) {
    try {
        const response = await fetch(`/api/tarifas/${id}`);
        const tarifa = await response.json();
        
        tarifaEditando = tarifa;
        
        document.getElementById('modalTarifaTitulo').textContent = 'Editar Tarifa';
        document.getElementById('tarifaId').value = tarifa.id;
        document.getElementById('tipoVehiculo').value = tarifa.tipo_vehiculo_id;
        document.getElementById('nombreTarifa').value = tarifa.nombre;
        document.getElementById('tipoCobro').value = tarifa.tipo_cobro;
        document.getElementById('valorTarifa').value = tarifa.valor;
        document.getElementById('fechaInicio').value = tarifa.fecha_inicio;
        document.getElementById('fechaFin').value = tarifa.fecha_fin || '';
        
        await cargarTiposVehiculo();
        document.getElementById('tipoVehiculo').value = tarifa.tipo_vehiculo_id;
        
        document.getElementById('modalTarifa').classList.add('active');
    } catch (error) {
        mostrarAlerta('Error al cargar tarifa', 'error');
    }
}

document.getElementById('formTarifa').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        tipo_vehiculo_id: parseInt(document.getElementById('tipoVehiculo').value),
        nombre: document.getElementById('nombreTarifa').value,
        tipo_cobro: document.getElementById('tipoCobro').value,
        valor: parseFloat(document.getElementById('valorTarifa').value),
        fecha_inicio: document.getElementById('fechaInicio').value,
        fecha_fin: document.getElementById('fechaFin').value || null,
        activo: 1
    };
    
    try {
        const tarifaId = document.getElementById('tarifaId').value;
        const url = tarifaId ? `/api/tarifas/${tarifaId}` : '/api/tarifas';
        const method = tarifaId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarAlerta(`✅ Tarifa ${tarifaId ? 'actualizada' : 'creada'} exitosamente`, 'success');
            cerrarModalTarifa();
            cargarTarifas();
        } else {
            mostrarAlerta(data.error, 'error');
        }
    } catch (error) {
        mostrarAlerta('Error al guardar tarifa', 'error');
    }
});

async function desactivarTarifa(id) {
    if (!confirm('¿Está seguro de desactivar esta tarifa?')) return;
    
    try {
        const response = await fetch(`/api/tarifas/${id}/desactivar`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            mostrarAlerta('✅ Tarifa desactivada', 'success');
            cargarTarifas();
        }
    } catch (error) {
        mostrarAlerta('Error al desactivar tarifa', 'error');
    }
}

// ============= GESTIÓN DE USUARIOS =============

async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        const usuarios = await response.json();
        
        const tbody = document.getElementById('usuariosTableBody');
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay usuarios</td></tr>';
            return;
        }
        
        tbody.innerHTML = usuarios.map(u => `
            <tr>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="badge badge-primary">${u.rol}</span></td>
                <td>
                    <span class="badge badge-${u.activo ? 'success' : 'danger'}">
                        ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarUsuario(${u.id})">Editar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

async function cargarRoles() {
    try {
        const response = await fetch('/api/usuarios/roles');
        const roles = await response.json();
        
        const select = document.getElementById('rolUsuario');
        select.innerHTML = '<option value="">Seleccione...</option>';
        
        roles.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.id;
            option.textContent = rol.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar roles:', error);
    }
}

function abrirModalUsuario() {
    usuarioEditando = null;
    document.getElementById('modalUsuarioTitulo').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('passwordUsuario').required = true;
    document.getElementById('activoUsuario').checked = true;
    
    cargarRoles();
    document.getElementById('modalUsuario').classList.add('active');
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('active');
}

async function editarUsuario(id) {
    try {
        const response = await fetch(`/api/usuarios/${id}`);
        const usuario = await response.json();
        
        usuarioEditando = usuario;
        
        document.getElementById('modalUsuarioTitulo').textContent = 'Editar Usuario';
        document.getElementById('usuarioId').value = usuario.id;
        document.getElementById('nombreUsuario').value = usuario.nombre;
        document.getElementById('emailUsuario').value = usuario.email;
        document.getElementById('activoUsuario').checked = usuario.activo === 1;
        
        // Ocultar campo de contraseña en edición
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('passwordUsuario').required = false;
        
        await cargarRoles();
        document.getElementById('rolUsuario').value = usuario.rol_id;
        
        document.getElementById('modalUsuario').classList.add('active');
    } catch (error) {
        mostrarAlerta('Error al cargar usuario', 'error');
    }
}

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuarioId = document.getElementById('usuarioId').value;
    const formData = {
        nombre: document.getElementById('nombreUsuario').value,
        email: document.getElementById('emailUsuario').value,
        rol_id: parseInt(document.getElementById('rolUsuario').value),
        activo: document.getElementById('activoUsuario').checked ? 1 : 0
    };
    
    // Solo incluir password si es nuevo usuario
    if (!usuarioId) {
        formData.password = document.getElementById('passwordUsuario').value;
    }
    
    try {
        const url = usuarioId ? `/api/usuarios/${usuarioId}` : '/api/usuarios';
        const method = usuarioId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarAlerta(`✅ Usuario ${usuarioId ? 'actualizado' : 'creado'} exitosamente`, 'success');
            cerrarModalUsuario();
            cargarUsuarios();
        } else {
            mostrarAlerta(data.error, 'error');
        }
    } catch (error) {
        mostrarAlerta('Error al guardar usuario', 'error');
    }
});

// Inicializar
verificarAutenticacion();
cargarDisponibilidad();
cargarTarifas();

// Actualizar disponibilidad cada 30 segundos
setInterval(cargarDisponibilidad, 30000);