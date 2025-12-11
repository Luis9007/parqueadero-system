USE parqueadero_db;

-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Operario', 'Registrar entradas y salidas de vehículos');

-- Insertar usuarios 
-- NOTA: Estos usuarios se crearán con password temporal "temporal123"
-- Debes cambiar las contraseñas desde el panel de administrador después del primer login
INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) VALUES
('Administrador Principal', 'admin@parqueadero.com', '$2b$10$XqZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1, 1),
('Operario 1', 'operario1@parqueadero.com', '$2b$10$XqZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 2, 1),
('Operario 2', 'operario2@parqueadero.com', '$2b$10$XqZ9Z9Z9Z9Z9Z9Z9Z9Z9Z.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 2, 1);

-- IMPORTANTE: Los hashes anteriores NO son válidos. 
-- Ejecuta el script generar-hash.js para obtener un hash real y reemplázalo aquí,
-- O usa la OPCIÓN 3 para crear usuarios desde el código.

-- Insertar tipos de vehículo
INSERT INTO tipos_vehiculo (nombre, descripcion, capacidad_total) VALUES
('Sedan', 'Vehículo tipo sedán', 15),
('Camioneta', 'Vehículo tipo camioneta o SUV', 15),
('Moto', 'Motocicleta', 15);

-- Insertar espacios para autos (30 espacios: 15 sedán + 15 camioneta)
-- Espacios para Sedán
INSERT INTO espacios (codigo, tipo_vehiculo_id, disponible)
SELECT CONCAT('A-S-', LPAD(num, 2, '0')), 1, 1
FROM (
    SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- Espacios para Camioneta
INSERT INTO espacios (codigo, tipo_vehiculo_id, disponible)
SELECT CONCAT('A-C-', LPAD(num, 2, '0')), 2, 1
FROM (
    SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- Espacios para Motos (15 espacios)
INSERT INTO espacios (codigo, tipo_vehiculo_id, disponible)
SELECT CONCAT('M-', LPAD(num, 2, '0')), 3, 1
FROM (
    SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- Insertar tarifas iniciales
INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio, fecha_fin) VALUES
(1, 'Tarifa Sedán por Hora', 'POR_HORA', 3000.00, 1, '2024-01-01', NULL),
(2, 'Tarifa Camioneta por Hora', 'POR_HORA', 4000.00, 1, '2024-01-01', NULL),
(3, 'Tarifa Moto por Hora', 'POR_HORA', 2000.00, 1, '2024-01-01', NULL);