// Variables globales
let registroActual = null;

// Verificar autenticación al cargar la página
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }
        const data = await response.json();
        document.getElementById('userName').textContent = data.usuario.nombre;
        document.getElementById('userRole').textContent = data.usuario.rol;
        
        // Si es administrador, mostrar botón adicional
        if (data.usuario.rol === 'Administrador') {
            const navbarUser = document.querySelector('.navbar-user');
            const btnAdmin = document.createElement('button');
            btnAdmin.className = 'btn btn-primary btn-sm';
            btnAdmin.textContent = 'Panel Admin';
            btnAdmin.onclick = () => window.location.href = '/dashboard-admin.html';
            navbarUser.insertBefore(btnAdmin, navbarUser.lastElementChild);
        }
    } catch (error) {
        window.location.href = '/login.html';
    }
}

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
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

// Cargar disponibilidad
async function cargarDisponibilidad() {
    try {
        const response = await fetch('/api/vehiculos/disponibilidad');
        const tipos = await response.json();
        
        tipos.forEach(tipo => {
            let statElement;
            if (tipo.nombre === 'Sedan') {
                statElement = document.getElementById('statSedanes');
            } else if (tipo.nombre === 'Camioneta') {
                statElement = document.getElementById('statCamionetas');
            } else if (tipo.nombre === 'Moto') {
                statElement = document.getElementById('statMotos');
            }
            
            if (statElement) {
                statElement.querySelector('.stat-value').textContent = 
                    `${tipo.disponibles}/${tipo.capacidad_total}`;
            }
        });
    } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
    }
}

// Cargar tipos de vehículo para el select
async function cargarTiposVehiculo() {
    try {
        const response = await fetch('/api/tarifas/tipos-vehiculo');
        const tipos = await response.json();
        
        const select = document.getElementById('tipoVehiculoEntrada');
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

// Cargar vehículos en curso
async function cargarVehiculos() {
    try {
        const response = await fetch('/api/vehiculos/en-curso');
        const vehiculos = await response.json();
        
        const tbody = document.getElementById('vehiculosTableBody');
        
        if (vehiculos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay vehículos en el parqueadero</td></tr>';
            return;
        }
        
        tbody.innerHTML = vehiculos.map(v => {
            const horas = Math.floor(v.minutos_transcurridos / 60);
            const minutos = v.minutos_transcurridos % 60;
            const tiempo = `${horas}h ${minutos}m`;
            
            return `
                <tr>
                    <td><strong>${v.placa}</strong></td>
                    <td><span class="badge badge-primary">${v.tipo_vehiculo}</span></td>
                    <td>${v.espacio}</td>
                    <td>${new Date(v.fecha_hora_entrada).toLocaleString('es-CO')}</td>
                    <td>${tiempo}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="abrirSalida('${v.placa}')">
                            Registrar Salida
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar vehículos:', error);
    }
}

// Modal Entrada
function abrirModalEntrada() {
    document.getElementById('modalEntrada').classList.add('active');
    document.getElementById('formEntrada').reset();
}

function cerrarModalEntrada() {
    document.getElementById('modalEntrada').classList.remove('active');
}

document.getElementById('btnRegistrarEntrada').addEventListener('click', abrirModalEntrada);

document.getElementById('formEntrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        placa: document.getElementById('placaEntrada').value.toUpperCase(),
        tipo_vehiculo_id: parseInt(document.getElementById('tipoVehiculoEntrada').value)
    };
    
    try {
        const response = await fetch('/api/vehiculos/entrada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarAlerta(`✅ Entrada registrada: ${data.registro.placa} - Espacio: ${data.registro.espacio}`, 'success');
            cerrarModalEntrada();
            cargarDisponibilidad();
            cargarVehiculos();
        } else {
            mostrarAlerta(data.error, 'error');
        }
    } catch (error) {
        mostrarAlerta('Error al registrar entrada', 'error');
    }
});

// Modal Salida
function abrirModalSalida() {
    document.getElementById('modalSalida').classList.add('active');
    document.getElementById('formBuscarVehiculo').reset();
    document.getElementById('infoCobro').classList.add('hidden');
}

function cerrarModalSalida() {
    document.getElementById('modalSalida').classList.remove('active');
    registroActual = null;
}

function abrirSalida(placa) {
    abrirModalSalida();
    document.getElementById('placaSalida').value = placa;
    document.getElementById('formBuscarVehiculo').dispatchEvent(new Event('submit'));
}

document.getElementById('btnRegistrarSalida').addEventListener('click', abrirModalSalida);

document.getElementById('formBuscarVehiculo').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const placa = document.getElementById('placaSalida').value.toUpperCase();
    
    try {
        const response = await fetch(`/api/vehiculos/buscar/${placa}`);
        
        if (!response.ok) {
            const data = await response.json();
            mostrarAlerta(data.error, 'error');
            return;
        }
        
        const vehiculo = await response.json();
        
        // Calcular costo
        const responseCosto = await fetch(`/api/vehiculos/calcular-costo/${vehiculo.id}`);
        const costo = await responseCosto.json();
        
        registroActual = costo;
        
        // Mostrar información
        document.getElementById('infoPlaca').textContent = costo.placa;
        document.getElementById('infoTipo').textContent = costo.tipo_vehiculo;
        document.getElementById('infoEspacio').textContent = costo.espacio;
        document.getElementById('infoEntrada').textContent = new Date(costo.fecha_hora_entrada).toLocaleString('es-CO');
        document.getElementById('infoSalida').textContent = new Date(costo.fecha_hora_salida_estimada).toLocaleString('es-CO');
        
        const horas = Math.floor(costo.minutos_totales / 60);
        const minutos = costo.minutos_totales % 60;
        document.getElementById('infoTiempo').textContent = `${horas} horas ${minutos} minutos`;
        document.getElementById('infoValor').textContent = costo.valor_calculado.toLocaleString('es-CO');
        
        document.getElementById('infoCobro').classList.remove('hidden');
    } catch (error) {
        mostrarAlerta('Error al buscar vehículo', 'error');
    }
});

// Confirmar salida
async function confirmarSalida() {
    if (!registroActual) return;
    
    const descuento = parseFloat(document.getElementById('descuento').value) || 0;
    
    try {
        const response = await fetch('/api/vehiculos/salida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                registro_id: registroActual.id,
                descuento: descuento
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarAlerta('✅ Salida registrada exitosamente', 'success');
            cerrarModalSalida();
            mostrarTicket(data.ticket);
            cargarDisponibilidad();
            cargarVehiculos();
        } else {
            mostrarAlerta(data.error, 'error');
        }
    } catch (error) {
        mostrarAlerta('Error al registrar salida', 'error');
    }
}

// Modal Ticket
function mostrarTicket(ticket) {
    const modal = document.getElementById('modalTicket');
    const content = document.getElementById('ticketContent');
    
    const horas = Math.floor(ticket.minutos_totales / 60);
    const minutos = ticket.minutos_totales % 60;
    
    content.innerHTML = `
        <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border: 2px solid #2563eb; border-radius: 8px;">
            <!-- Encabezado -->
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px double #2563eb; padding-bottom: 15px;">
                <div style="font-size: 40px; margin-bottom: 10px;">🚗</div>
                <h2 style="margin: 0; color: #2563eb; font-size: 24px;">SISTEMA PARQUEADERO</h2>
                <p style="margin: 5px 0; font-weight: bold; font-size: 18px;">TICKET DE SALIDA</p>
                <p style="margin: 5px 0; font-size: 11px; color: #6b7280;">Código: ${ticket.codigo}</p>
                <p style="margin: 0; font-size: 11px; color: #6b7280;">Fecha: ${new Date(ticket.fecha_hora_salida).toLocaleDateString('es-CO', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
            </div>
            
            <!-- Información del Vehículo -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    📋 DATOS DEL VEHÍCULO
                </h3>
                <table style="width: 100%; font-size: 14px; line-height: 2;">
                    <tr>
                        <td style="color: #6b7280;"><strong>Placa:</strong></td>
                        <td style="text-align: right; font-weight: bold; font-size: 18px; color: #2563eb;">${ticket.placa}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Información de Tiempo -->
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid #bfdbfe; padding-bottom: 8px;">
                    ⏰ REGISTRO DE TIEMPOS
                </h3>
                <table style="width: 100%; font-size: 14px; line-height: 2.2;">
                    <tr>
                        <td style="color: #6b7280;"><strong>Hora Entrada:</strong></td>
                        <td style="text-align: right;">${new Date(ticket.fecha_hora_entrada).toLocaleString('es-CO', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280;"><strong>Hora Salida:</strong></td>
                        <td style="text-align: right;">${new Date(ticket.fecha_hora_salida).toLocaleString('es-CO', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}</td>
                    </tr>
                    <tr style="border-top: 1px solid #bfdbfe;">
                        <td style="color: #1f2937; padding-top: 8px;"><strong>Tiempo Total:</strong></td>
                        <td style="text-align: right; font-weight: bold; color: #2563eb; font-size: 16px; padding-top: 8px;">
                            ${horas} hora${horas !== 1 ? 's' : ''} ${minutos} minuto${minutos !== 1 ? 's' : ''}
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Información de Cobro -->
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; border-bottom: 2px solid #bbf7d0; padding-bottom: 8px;">
                    💰 DETALLE DE COBRO
                </h3>
                <table style="width: 100%; font-size: 14px; line-height: 2.2;">
                    <tr>
                        <td style="color: #6b7280;">Valor Calculado:</td>
                        <td style="text-align: right;">${ticket.valor_calculado.toLocaleString('es-CO')}</td>
                    </tr>
                    ${ticket.descuento > 0 ? `
                    <tr>
                        <td style="color: #dc2626;">Descuento Aplicado:</td>
                        <td style="text-align: right; color: #dc2626;">-${ticket.descuento.toLocaleString('es-CO')}</td>
                    </tr>
                    ` : ''}
                </table>
                
                <!-- Total a Pagar -->
                <div style="margin-top: 15px; padding-top: 15px; border-top: 3px double #10b981;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="font-size: 18px; font-weight: bold; color: #1f2937;">TOTAL A PAGAR:</td>
                            <td style="text-align: right; font-size: 28px; font-weight: bold; color: #10b981;">
                                ${ticket.valor_final.toLocaleString('es-CO')}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 2px dashed #d1d5db;">
                <p style="margin: 5px 0; font-size: 14px; font-weight: bold; color: #2563eb;">¡Gracias por utilizar nuestro servicio!</p>
                <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Sistema de Parqueadero - SENA</p>
                <p style="margin: 5px 0; font-size: 11px; color: #9ca3af;">
                    Impreso: ${new Date().toLocaleString('es-CO')}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 10px; color: #d1d5db;">
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                </p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function cerrarModalTicket() {
    document.getElementById('modalTicket').classList.remove('active');
}

function imprimirTicket() {
    window.print();
}

function descargarTicket() {
    // Crear una ventana nueva con solo el contenido del ticket
    const ticketHTML = document.getElementById('ticketContent').innerHTML;
    const ventana = window.open('', '', 'width=800,height=600');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket de Parqueadero</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    background: white;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${ticketHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 100);
                }
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

document.getElementById('btnVerVehiculos').addEventListener('click', cargarVehiculos);

// Inicializar
verificarAutenticacion();
cargarDisponibilidad();
cargarTiposVehiculo();
cargarVehiculos();

// Actualizar cada 30 segundos
setInterval(() => {
    cargarDisponibilidad();
    cargarVehiculos();
}, 30000);