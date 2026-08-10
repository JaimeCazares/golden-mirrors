<?php
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF); // PHP 8.1+ lanza excepciones por defecto; este archivo asume que query() solo devuelve false en error
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Días marcados en verde del calendario de AT&T (uno por fecha)
$conexion->query("
    CREATE TABLE IF NOT EXISTS att_dias (
        fecha        DATE NOT NULL PRIMARY KEY,
        seleccionado TINYINT(1) NOT NULL DEFAULT 1,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

function attFechaValida($f) {
    return is_string($f) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $f) === 1;
}

// GET: lista de fechas actualmente marcadas
if ($accion === 'obtener') {
    $res = $conexion->query("SELECT fecha FROM att_dias WHERE seleccionado = 1");
    $out = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $out[] = $row['fecha'];
    }
    echo json_encode($out);
    exit;
}

// POST: marcar/desmarcar un día puntual
if ($accion === 'guardar') {
    $fecha = $input['fecha'] ?? '';
    $seleccionado = intval($input['seleccionado'] ?? 0);

    if (!attFechaValida($fecha)) {
        echo json_encode(['error' => 'Fecha inválida']);
        exit;
    }

    $fecha = $conexion->real_escape_string($fecha);

    $conexion->query("
        INSERT INTO att_dias (fecha, seleccionado)
        VALUES ('$fecha', $seleccionado)
        ON DUPLICATE KEY UPDATE seleccionado = $seleccionado
    ");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
