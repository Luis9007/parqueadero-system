-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS parqueadero_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_db;

-- Tabla ROLES
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla USUARIOS
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla TIPOS_VEHICULO
CREATE TABLE tipos_vehiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    capacidad_total INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ESPACIOS
CREATE TABLE espacios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo_vehiculo_id INT NOT NULL,
    disponible TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id)
);

-- Tabla TARIFAS
CREATE TABLE tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo_cobro ENUM('POR_MINUTO', 'POR_HORA', 'POR_DIA', 'FRACCION') NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id)
);

-- Tabla REGISTROS
CREATE TABLE registros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL,
    tipo_vehiculo_id INT NOT NULL,
    espacio_id INT NOT NULL,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME NULL,
    minutos_totales INT NULL,
    tarifa_id INT NOT NULL,
    valor_calculado DECIMAL(10, 2) NULL,
    descuento DECIMAL(10, 2) DEFAULT 0,
    valor_final DECIMAL(10, 2) NULL,
    estado ENUM('EN_CURSO', 'FINALIZADO') DEFAULT 'EN_CURSO',
    usuario_entrada_id INT NOT NULL,
    usuario_salida_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id),
    FOREIGN KEY (espacio_id) REFERENCES espacios(id),
    FOREIGN KEY (tarifa_id) REFERENCES tarifas(id),
    FOREIGN KEY (usuario_entrada_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_salida_id) REFERENCES usuarios(id)
);

-- Tabla TICKETS
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registro_id INT NOT NULL UNIQUE,
    codigo_ticket VARCHAR(50) NOT NULL UNIQUE,
    email_cliente VARCHAR(100) NULL,
    enviado_email TINYINT(1) DEFAULT 0,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registro_id) REFERENCES registros(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_registros_placa ON registros(placa);
CREATE INDEX idx_registros_estado ON registros(estado);
CREATE INDEX idx_registros_entrada ON registros(fecha_hora_entrada);
CREATE INDEX idx_espacios_disponible ON espacios(disponible);
CREATE INDEX idx_tarifas_activo ON tarifas(activo);