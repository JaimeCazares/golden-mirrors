<?php
error_reporting(0);
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Tabla de comidas
$conexion->query("
    CREATE TABLE IF NOT EXISTS nutricion_log (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        fecha      DATE NOT NULL,
        nombre     VARCHAR(200) NOT NULL,
        calorias   DECIMAL(8,1) DEFAULT 0,
        proteina   DECIMAL(8,1) DEFAULT 0,
        carbos     DECIMAL(8,1) DEFAULT 0,
        grasa      DECIMAL(8,1) DEFAULT 0,
        fibra      DECIMAL(8,1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Tabla de actividad diaria (Mi Band)
$conexion->query("
    CREATE TABLE IF NOT EXISTS nutricion_actividad (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        fecha    DATE NOT NULL UNIQUE,
        calorias INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

// GET: obtener entradas + actividad del día
if ($accion === 'obtener') {
    $fecha = $conexion->real_escape_string($_GET['fecha'] ?? date('Y-m-d'));

    $res = $conexion->query("
        SELECT id, nombre, calorias, proteina, carbos, grasa, fibra
        FROM nutricion_log
        WHERE fecha = '$fecha'
        ORDER BY created_at ASC
    ");
    $entradas = [];
    while ($row = $res->fetch_assoc()) $entradas[] = $row;

    $resAct = $conexion->query("SELECT calorias FROM nutricion_actividad WHERE fecha = '$fecha'");
    $miband = 0;
    if ($resAct && $resAct->num_rows > 0) {
        $miband = intval($resAct->fetch_assoc()['calorias']);
    }

    echo json_encode(['entradas' => $entradas, 'miband' => $miband]);
    exit;
}

// POST: agregar comida
if ($accion === 'agregar') {
    $fecha    = $conexion->real_escape_string($input['fecha']  ?? date('Y-m-d'));
    $nombre   = $conexion->real_escape_string($input['nombre'] ?? '');
    $calorias = floatval($input['calorias'] ?? 0);
    $proteina = floatval($input['proteina'] ?? 0);
    $carbos   = floatval($input['carbos']   ?? 0);
    $grasa    = floatval($input['grasa']    ?? 0);
    $fibra    = floatval($input['fibra']    ?? 0);

    if (!$nombre) { echo json_encode(['error' => 'Nombre requerido']); exit; }

    $conexion->query("
        INSERT INTO nutricion_log (fecha, nombre, calorias, proteina, carbos, grasa, fibra)
        VALUES ('$fecha', '$nombre', $calorias, $proteina, $carbos, $grasa, $fibra)
    ");
    echo json_encode(['status' => 'ok', 'id' => $conexion->insert_id]);
    exit;
}

// POST: guardar actividad Mi Band (upsert)
if ($accion === 'guardar_miband') {
    $fecha    = $conexion->real_escape_string($input['fecha'] ?? date('Y-m-d'));
    $calorias = intval($input['calorias'] ?? 0);

    $conexion->query("
        INSERT INTO nutricion_actividad (fecha, calorias)
        VALUES ('$fecha', $calorias)
        ON DUPLICATE KEY UPDATE calorias = $calorias
    ");
    echo json_encode(['status' => 'ok']);
    exit;
}

// POST: eliminar comida
if ($accion === 'eliminar') {
    $id = intval($input['id'] ?? 0);
    if ($id > 0) {
        $conexion->query("DELETE FROM nutricion_log WHERE id = $id");
        echo json_encode(['status' => 'ok']);
    } else {
        echo json_encode(['error' => 'ID inválido']);
    }
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
