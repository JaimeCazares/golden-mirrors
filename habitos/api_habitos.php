<?php
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF); // PHP 8.1+ lanza excepciones por defecto; este archivo asume que query() solo devuelve false en error
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Estado de hábitos de cada día (un registro por fecha, JSON con {habitoId: true/false})
$conexion->query("
    CREATE TABLE IF NOT EXISTS habitos_dias (
        fecha      DATE NOT NULL PRIMARY KEY,
        datos_json LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

function hbFechaValida($f) {
    return is_string($f) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $f) === 1;
}

// GET: mapa fecha => {habitoId: bool} para un rango de fechas (inclusive)
if ($accion === 'obtener_rango') {
    $desde = $_GET['desde'] ?? '';
    $hasta = $_GET['hasta'] ?? '';

    if (!hbFechaValida($desde) || !hbFechaValida($hasta)) {
        echo json_encode([]);
        exit;
    }

    $desde = $conexion->real_escape_string($desde);
    $hasta = $conexion->real_escape_string($hasta);

    $res = $conexion->query("SELECT fecha, datos_json FROM habitos_dias WHERE fecha BETWEEN '$desde' AND '$hasta'");
    $out = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $out[$row['fecha']] = $row['datos_json'] ? json_decode($row['datos_json']) : new stdClass();
    }
    echo json_encode($out);
    exit;
}

// POST: guardar (upsert) el estado completo de hábitos de una fecha
if ($accion === 'guardar_dia') {
    $fecha = $input['fecha'] ?? '';

    if (!hbFechaValida($fecha)) {
        echo json_encode(['error' => 'Fecha inválida']);
        exit;
    }

    $fecha = $conexion->real_escape_string($fecha);
    $datos = $conexion->real_escape_string(json_encode($input['datos'] ?? []));

    $conexion->query("
        INSERT INTO habitos_dias (fecha, datos_json)
        VALUES ('$fecha', '$datos')
        ON DUPLICATE KEY UPDATE datos_json = '$datos'
    ");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
