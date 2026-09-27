<?php
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF); // PHP 8.1+ lanza excepciones por defecto; este archivo asume que query() solo devuelve false en error
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Un registro por partido: fecha + turno (mañana 6am / tarde 7pm) + equipos + momios 1X2
$conexion->query("
    CREATE TABLE IF NOT EXISTS momios_registros (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        fecha            DATE NOT NULL,
        turno            ENUM('manana','tarde') NOT NULL,
        equipo_local     VARCHAR(100) NOT NULL,
        equipo_visitante VARCHAR(100) NOT NULL,
        momio_local      DECIMAL(6,2) DEFAULT NULL,
        momio_empate     DECIMAL(6,2) DEFAULT NULL,
        momio_visitante  DECIMAL(6,2) DEFAULT NULL,
        notas            VARCHAR(255) DEFAULT NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fecha (fecha)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

function mmFechaValida($f) {
    return is_string($f) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $f) === 1;
}

function mmDecimalONull($v) {
    if ($v === null || $v === '') return null;
    return is_numeric($v) ? (float)$v : null;
}

// GET: lista de registros, opcionalmente filtrada por rango de fechas
if ($accion === 'listar') {
    $desde = $_GET['desde'] ?? '';
    $hasta = $_GET['hasta'] ?? '';

    if (mmFechaValida($desde) && mmFechaValida($hasta)) {
        $desde = $conexion->real_escape_string($desde);
        $hasta = $conexion->real_escape_string($hasta);
        $where = "WHERE fecha BETWEEN '$desde' AND '$hasta'";
    } else {
        $where = '';
    }

    $res = $conexion->query("
        SELECT id, fecha, turno, equipo_local, equipo_visitante,
               momio_local, momio_empate, momio_visitante, notas
        FROM momios_registros
        $where
        ORDER BY fecha DESC, turno ASC, id DESC
    ");

    $out = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row['momio_local']      = $row['momio_local']      !== null ? (float)$row['momio_local']      : null;
        $row['momio_empate']     = $row['momio_empate']     !== null ? (float)$row['momio_empate']     : null;
        $row['momio_visitante']  = $row['momio_visitante']  !== null ? (float)$row['momio_visitante']  : null;
        $out[] = $row;
    }
    echo json_encode($out);
    exit;
}

// POST: guardar un nuevo registro de momios
if ($accion === 'guardar') {
    $fecha            = $input['fecha'] ?? '';
    $turno            = $input['turno'] ?? '';
    $equipoLocal      = trim($input['equipo_local'] ?? '');
    $equipoVisitante  = trim($input['equipo_visitante'] ?? '');

    if (!mmFechaValida($fecha) || !in_array($turno, ['manana', 'tarde'], true) || $equipoLocal === '' || $equipoVisitante === '') {
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $fecha           = $conexion->real_escape_string($fecha);
    $turno           = $conexion->real_escape_string($turno);
    $equipoLocal     = $conexion->real_escape_string($equipoLocal);
    $equipoVisitante = $conexion->real_escape_string($equipoVisitante);
    $notas           = $conexion->real_escape_string(trim($input['notas'] ?? ''));

    $momioLocal     = mmDecimalONull($input['momio_local'] ?? null);
    $momioEmpate    = mmDecimalONull($input['momio_empate'] ?? null);
    $momioVisitante = mmDecimalONull($input['momio_visitante'] ?? null);

    $momioLocalSql     = $momioLocal     === null ? 'NULL' : $momioLocal;
    $momioEmpateSql    = $momioEmpate    === null ? 'NULL' : $momioEmpate;
    $momioVisitanteSql = $momioVisitante === null ? 'NULL' : $momioVisitante;

    $ok = $conexion->query("
        INSERT INTO momios_registros
            (fecha, turno, equipo_local, equipo_visitante, momio_local, momio_empate, momio_visitante, notas)
        VALUES
            ('$fecha', '$turno', '$equipoLocal', '$equipoVisitante', $momioLocalSql, $momioEmpateSql, $momioVisitanteSql, '$notas')
    ");

    if (!$ok) {
        echo json_encode(['error' => 'Error al guardar']);
        exit;
    }
    echo json_encode(['status' => 'ok', 'id' => $conexion->insert_id]);
    exit;
}

// POST: eliminar un registro por id
if ($accion === 'eliminar') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['error' => 'Id inválido']);
        exit;
    }
    $conexion->query("DELETE FROM momios_registros WHERE id = $id");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
