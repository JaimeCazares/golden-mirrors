<?php
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF); // PHP 8.1+ lanza excepciones por defecto; este archivo asume que query() solo devuelve false en error
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Un registro por partido: fecha de captura (automática, hoy) + turno (mañana/tarde,
// cuál de las 2 capturas diarias) + fecha/hora del partido (cuándo se juega, para
// poder armar la evolución de momios desde que sale publicado hasta el día del
// encuentro) + casa de apuestas + equipos + momios 1X2 (formato americano, con signo).
$conexion->query("
    CREATE TABLE IF NOT EXISTS momios_registros (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        fecha            DATE NOT NULL,
        turno            ENUM('manana','tarde') NOT NULL,
        fecha_partido    DATE NULL,
        hora_partido     TIME NULL,
        casa_apuestas    VARCHAR(50) NULL,
        equipo_local     VARCHAR(100) NOT NULL,
        equipo_visitante VARCHAR(100) NOT NULL,
        momio_local      DECIMAL(7,2) DEFAULT NULL,
        momio_empate     DECIMAL(7,2) DEFAULT NULL,
        momio_visitante  DECIMAL(7,2) DEFAULT NULL,
        notas            VARCHAR(255) DEFAULT NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fecha (fecha),
        INDEX idx_fecha_partido (fecha_partido)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Migración idempotente para instalaciones ya existentes (la tabla pudo haberse
// creado antes de que existieran estas columnas).
function mmAsegurarColumna($conexion, $nombre, $definicion) {
    $res = $conexion->query("SHOW COLUMNS FROM momios_registros LIKE '$nombre'");
    if ($res && $res->num_rows === 0) {
        $conexion->query("ALTER TABLE momios_registros ADD COLUMN $nombre $definicion");
    }
}
mmAsegurarColumna($conexion, 'fecha_partido', 'DATE NULL AFTER turno');
mmAsegurarColumna($conexion, 'hora_partido', 'TIME NULL AFTER fecha_partido');
mmAsegurarColumna($conexion, 'casa_apuestas', 'VARCHAR(50) NULL AFTER hora_partido');

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

function mmFechaValida($f) {
    return is_string($f) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $f) === 1;
}

function mmHoraValida($h) {
    return is_string($h) && preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $h) === 1;
}

function mmDecimalONull($v) {
    if ($v === null || $v === '') return null;
    return is_numeric($v) ? (float)$v : null;
}

// Arma el INSERT de un registro; regresa true/false. Usada por 'guardar' y 'guardar_lote'.
function mmInsertarRegistro($conexion, $turno, $r) {
    $equipoLocal     = trim($r['equipo_local'] ?? '');
    $equipoVisitante = trim($r['equipo_visitante'] ?? '');
    $fechaPartido    = $r['fecha_partido'] ?? '';

    if (!mmFechaValida($fechaPartido) || $equipoLocal === '' || $equipoVisitante === '') {
        return false;
    }

    $fechaPartido    = $conexion->real_escape_string($fechaPartido);
    $turnoEsc        = $conexion->real_escape_string($turno);
    $equipoLocal     = $conexion->real_escape_string($equipoLocal);
    $equipoVisitante = $conexion->real_escape_string($equipoVisitante);
    $notas           = $conexion->real_escape_string(trim($r['notas'] ?? ''));
    $casaApuestas    = $conexion->real_escape_string(trim($r['casa_apuestas'] ?? ''));

    $horaPartido    = mmHoraValida($r['hora_partido'] ?? '') ? "'" . $conexion->real_escape_string($r['hora_partido']) . "'" : 'NULL';
    $casaApuestasSql = $casaApuestas === '' ? 'NULL' : "'$casaApuestas'";

    $momioLocal     = mmDecimalONull($r['momio_local']     ?? null);
    $momioEmpate    = mmDecimalONull($r['momio_empate']    ?? null);
    $momioVisitante = mmDecimalONull($r['momio_visitante'] ?? null);

    $momioLocalSql     = $momioLocal     === null ? 'NULL' : $momioLocal;
    $momioEmpateSql    = $momioEmpate    === null ? 'NULL' : $momioEmpate;
    $momioVisitanteSql = $momioVisitante === null ? 'NULL' : $momioVisitante;

    return $conexion->query("
        INSERT INTO momios_registros
            (fecha, turno, fecha_partido, hora_partido, casa_apuestas, equipo_local, equipo_visitante, momio_local, momio_empate, momio_visitante, notas)
        VALUES
            (CURDATE(), '$turnoEsc', '$fechaPartido', $horaPartido, $casaApuestasSql, '$equipoLocal', '$equipoVisitante', $momioLocalSql, $momioEmpateSql, $momioVisitanteSql, '$notas')
    ");
}

// GET: lista de registros, opcionalmente filtrada por rango de fechas de captura
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
        SELECT id, fecha, turno, fecha_partido, hora_partido, casa_apuestas, equipo_local, equipo_visitante,
               momio_local, momio_empate, momio_visitante, notas
        FROM momios_registros
        $where
        ORDER BY fecha DESC, turno ASC, fecha_partido ASC, hora_partido ASC, id DESC
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

// POST: guardar un nuevo registro de momios (entrada manual)
if ($accion === 'guardar') {
    $turno = $input['turno'] ?? '';
    if (!in_array($turno, ['manana', 'tarde'], true)) {
        echo json_encode(['error' => 'Turno inválido']);
        exit;
    }

    $ok = mmInsertarRegistro($conexion, $turno, $input);

    if (!$ok) {
        echo json_encode(['error' => 'Datos inválidos o error al guardar']);
        exit;
    }
    echo json_encode(['status' => 'ok', 'id' => $conexion->insert_id]);
    exit;
}

// POST: guardar varios registros de un jalón (confirmación masiva tras extraer de imágenes)
if ($accion === 'guardar_lote') {
    $turno     = $input['turno'] ?? '';
    $registros = $input['registros'] ?? [];

    if (!in_array($turno, ['manana', 'tarde'], true) || !is_array($registros) || !count($registros)) {
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $guardados = 0;
    $omitidos  = 0;
    foreach ($registros as $r) {
        if (is_array($r) && mmInsertarRegistro($conexion, $turno, $r)) {
            $guardados++;
        } else {
            $omitidos++;
        }
    }

    echo json_encode(['status' => 'ok', 'guardados' => $guardados, 'omitidos' => $omitidos]);
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
