-- Tablas para el sistema admin de Golden Tech

CREATE TABLE IF NOT EXISTS `gt_clientes` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `numero_cliente` INT UNIQUE NOT NULL,
  `nombre`        VARCHAR(120) NOT NULL,
  `telefono`      VARCHAR(20)  NOT NULL,
  `creado_en`     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `gt_servicios` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `cliente_id`    INT NOT NULL,
  `tipo`          VARCHAR(100) NOT NULL,
  `descripcion`   TEXT,
  `fecha`         DATE NOT NULL,
  `costo`         DECIMAL(10,2) NOT NULL DEFAULT 0,
  `creado_en`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`cliente_id`) REFERENCES `gt_clientes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `gt_ahorro` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `concepto`      VARCHAR(200) NOT NULL,
  `tipo`          ENUM('ingreso','egreso') NOT NULL,
  `monto`         DECIMAL(10,2) NOT NULL,
  `fecha`         DATE NOT NULL,
  `notas`         TEXT,
  `creado_en`     DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
