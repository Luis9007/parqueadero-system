🚗 Sistema Web para Control de Parqueadero
Sistema completo para gestión de parqueadero con capacidad para 30 autos (15 sedanes + 15 camionetas) y 15 motos. Funciona 24/7 con tarifas diferenciadas por tipo de vehículo.
📋 Características Principales

✅ Registro de entrada/salida de vehículos
✅ Control de cupos en tiempo real
✅ Cálculo automático de tarifas
✅ Gestión de usuarios con roles (Administrador/Operario)
✅ Generación de tickets
✅ Sistema de descuentos
✅ Interfaz responsive
✅ Integración con WhatsApp

🛠️ Tecnologías Utilizadas
Backend

Node.js v16 o superior
Express v4.18.2
MySQL 8.0 o superior
bcrypt para encriptación de contraseñas
express-session para manejo de sesiones

Frontend

HTML5
CSS3 (diseño moderno y responsive)
JavaScript (Vanilla JS)

📦 Instalación
1. Clonar o descargar el proyecto
bashgit clone <url-repositorio>
cd parqueadero-system
2. Instalar dependencias
bashnpm install
3. Configurar la base de datos
Opción A: Usando MySQL Workbench o phpMyAdmin

Crear una base de datos llamada parqueadero_db
Ejecutar el archivo database/schema.sql
Ejecutar el archivo database/seed.sql

Opción B: Usando línea de comandos
bashmysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
4. Configurar variables de entorno
Crear un archivo .env en la raíz del proyecto:
envPORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=parqueadero_db
DB_PORT=3306

SESSION_SECRET=tu_clave_secreta_muy_segura
5. Iniciar el servidor
Modo desarrollo:
bashnpm run dev
Modo producción:
bashnpm start
El servidor estará disponible en http://localhost:3000
👥 Usuarios de Prueba
Administrador

Email: admin@parqueadero.com
Contraseña: password123

Operario

Email: operario1@parqueadero.com
Contraseña: password123

⚠️ IMPORTANTE: Cambiar estas contraseñas en producción.
📱 Funcionalidades por Rol
Operario

Registrar entrada de vehículos
Registrar salida y cobro
Ver vehículos en el parqueadero
Consultar disponibilidad de cupos
Generar tickets

Administrador

Todo lo del operario +
Gestionar tarifas
Crear/editar/desactivar tarifas
Gestionar usuarios
Crear/editar usuarios
Asignar roles

🗄️ Estructura de la Base de Datos
Tablas principales:

roles - Roles del sistema
usuarios - Usuarios del sistema
tipos_vehiculo - Tipos de vehículos (Sedán, Camioneta, Moto)
espacios - Espacios físicos del parqueadero
tarifas - Configuración de tarifas
registros - Entradas y salidas de vehículos
tickets - Tickets generados

📊 Tipos de Cobro
El sistema soporta 4 tipos de cobro:

POR_MINUTO - Cobra por cada minuto
POR_HORA - Cobra por hora completa (redondea hacia arriba)
POR_DIA - Cobra por día completo
FRACCION - Cobra por fracciones de 15 minutos

🚀 Despliegue en Vercel
1. Preparar el proyecto
Crear archivo vercel.json en la raíz:
json{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
2. Configurar base de datos
Opciones recomendadas:

PlanetScale (MySQL compatible)
Railway (incluye MySQL)
Heroku ClearDB
AWS RDS

3. Desplegar en Vercel
bash# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
4. Variables de entorno en Vercel
Ir a Project Settings > Environment Variables y agregar:

DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
SESSION_SECRET

🔐 Seguridad
✅ Contraseñas encriptadas con bcrypt (10 rounds)
✅ Sesiones seguras con express-session
✅ Validación de datos en backend
✅ Control de acceso por roles
✅ Protección contra SQL injection (prepared statements)
🌐 API Endpoints
Autenticación

POST /api/auth/login - Iniciar sesión
POST /api/auth/logout - Cerrar sesión
GET /api/auth/me - Usuario actual

Vehículos

GET /api/vehiculos/disponibilidad - Cupos disponibles
POST /api/vehiculos/entrada - Registrar entrada
GET /api/vehiculos/buscar/:placa - Buscar vehículo
GET /api/vehiculos/en-curso - Listar vehículos dentro
GET /api/vehiculos/calcular-costo/:id - Calcular costo
POST /api/vehiculos/salida - Registrar salida

Tarifas (Solo Administrador)

GET /api/tarifas - Listar tarifas
POST /api/tarifas - Crear tarifa
PUT /api/tarifas/:id - Actualizar tarifa
PATCH /api/tarifas/:id/desactivar - Desactivar tarifa

Usuarios (Solo Administrador)

GET /api/usuarios - Listar usuarios
POST /api/usuarios - Crear usuario
PUT /api/usuarios/:id - Actualizar usuario
GET /api/usuarios/roles - Listar roles

📝 Notas Importantes

Actualización de contraseñas: El hash de bcrypt en seed.sql es de ejemplo. Para producción, generar nuevos hashes:

javascriptconst bcrypt = require('bcrypt');
const hash = await bcrypt.hash('tu_password', 10);
console.log(hash);

WhatsApp: Actualizar el número de teléfono en los archivos HTML:

dashboard-operario.html
dashboard-admin.html


Tarifas iniciales: El sistema viene con tarifas de ejemplo:

Sedán: $3,000/hora
Camioneta: $4,000/hora
Moto: $2,000/hora


Capacidad: Para cambiar la capacidad del parqueadero, actualizar:

Tabla tipos_vehiculo (campo capacidad_total)
Generar más espacios en la tabla espacios



🐛 Solución de Problemas
Error de conexión a MySQL

Verificar que MySQL esté corriendo
Verificar credenciales en .env
Verificar que el puerto sea el correcto (3306 por defecto)

Sesiones no persisten

Verificar que SESSION_SECRET esté configurado
En producción, usar un almacenamiento de sesiones persistente (Redis, MongoDB)

No se muestran los cupos

Verificar que existan registros en la tabla espacios
Ejecutar seed.sql si faltan datos

📞 Soporte
Para dudas o problemas:

Email: soporte@parqueadero.com
WhatsApp: +57 300 123 4567