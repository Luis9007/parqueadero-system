🚂 Guía de Despliegue en Railway
Pasos para Desplegar
1. Crear cuenta en Railway

Ve a https://railway.app
Regístrate con GitHub (recomendado)

2. Crear nuevo proyecto

Click en "New Project"
Selecciona "Deploy from GitHub repo"
Conecta tu repositorio

3. Agregar MySQL

En tu proyecto, click en "+ New"
Selecciona "Database" → "Add MySQL"
Railway creará automáticamente la base de datos

4. Configurar Variables de Entorno
En el servicio de Node.js, ve a "Variables" y agrega:
NODE_ENV=production
PORT=3000
SESSION_SECRET=tu_clave_secreta_muy_larga_y_segura_123456789

DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
NOTA: Railway auto-completa las variables de MySQL si usas la sintaxis ${{MySQL.VARIABLE}}
5. Ejecutar Scripts de Base de Datos
Opción A - Desde Railway CLI:
bash# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Conectar a MySQL
railway connect MySQL

# Ejecutar scripts
source database/schema.sql;
source database/seed.sql;
Opción B - Desde TablePlus/MySQL Workbench:

Obtén las credenciales de MySQL en Railway
Conéctate usando TablePlus o MySQL Workbench
Ejecuta los archivos schema.sql y seed.sql

6. Crear Usuarios
Ejecutar el script de creación de usuarios:
bashrailway run node crear-usuarios.js
O crear manualmente desde el panel admin después del primer despliegue.
7. Deploy
Railway desplegará automáticamente. Obtén tu URL en la sección "Settings" → "Domains"
Variables de Entorno Requeridas
VariableDescripciónEjemploNODE_ENVModo de ejecuciónproductionPORTPuerto del servidor3000SESSION_SECRETClave para sesionesstring largo y aleatorioDB_HOSTHost de MySQLAutocompletado por RailwayDB_USERUsuario de MySQLAutocompletado por RailwayDB_PASSWORDPassword de MySQLAutocompletado por RailwayDB_NAMENombre de la BDAutocompletado por RailwayDB_PORTPuerto de MySQLAutocompletado por Railway
Credenciales por Defecto
Después de ejecutar seed.sql:

Admin: admin@parqueadero.com / password123
Operario: operario1@parqueadero.com / password123

⚠️ Cambia estas contraseñas inmediatamente en producción
Troubleshooting
Error de conexión a MySQL

Verifica que el servicio MySQL esté corriendo
Verifica las variables de entorno
Reinicia el servicio Node.js

Base de datos vacía

Ejecuta schema.sql y seed.sql
Verifica en Railway → MySQL → Query que las tablas existen

Sesiones no persisten

Verifica SESSION_SECRET en variables de entorno
Railway maneja HTTPS automáticamente, no necesitas configurar nada adicional

Monitoreo
Railway provee:

📊 Logs en tiempo real
📈 Métricas de uso
🔔 Alertas automáticas
🔄 Rollback automático si falla el deploy

Costos
Railway ofrece:

Plan Hobby: $5/mes + uso
500 horas gratis para nuevos usuarios
Base de datos MySQL incluida

Más info: https://railway.app/pricing