<?php
error_reporting(0);
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Plan/suplementos/actividad de cada día (un registro por fecha)
$conexion->query("
    CREATE TABLE IF NOT EXISTS nutricion_dias (
        fecha             DATE NOT NULL PRIMARY KEY,
        plan_json         LONGTEXT,
        suplementos_json  LONGTEXT,
        miband            INT DEFAULT 0,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Metas/BMR vigentes a partir de una fecha (histórico, no se modifica retroactivamente)
$conexion->query("
    CREATE TABLE IF NOT EXISTS nutricion_metas (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        fecha       DATE NOT NULL UNIQUE,
        bmr         INT DEFAULT 0,
        kcal        INT DEFAULT 0,
        prot        INT DEFAULT 0,
        carbs       INT DEFAULT 0,
        grasas      INT DEFAULT 0,
        fibra       INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

$DEFAULT_METAS = ['bmr' => 2500, 'kcal' => 1900, 'prot' => 180, 'carbs' => 160, 'grasas' => 60, 'fibra' => 35];

// GET: fecha más vieja con datos (plan/suplementos/miband o metas guardadas)
if ($accion === 'obtener_fecha_inicio') {
    $res = $conexion->query("
        SELECT MIN(fecha) AS fecha FROM (
            SELECT fecha FROM nutricion_dias
            UNION
            SELECT fecha FROM nutricion_metas
        ) t
    ");
    $fecha = ($res && $res->num_rows > 0) ? $res->fetch_assoc()['fecha'] : null;
    echo json_encode(['fecha' => $fecha]);
    exit;
}

// GET: datos del día (plan + suplementos + miband)
if ($accion === 'obtener_dia') {
    $fecha = $conexion->real_escape_string($_GET['fecha'] ?? date('Y-m-d'));

    $res = $conexion->query("SELECT plan_json, suplementos_json, miband FROM nutricion_dias WHERE fecha = '$fecha'");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        echo json_encode([
            'plan'         => $row['plan_json'] ? json_decode($row['plan_json']) : null,
            'suplementos'  => $row['suplementos_json'] ? json_decode($row['suplementos_json']) : [],
            'miband'       => intval($row['miband']),
        ]);
    } else {
        echo json_encode(['plan' => null, 'suplementos' => [], 'miband' => 0]);
    }
    exit;
}

// POST: guardar (upsert) los datos del día
if ($accion === 'guardar_dia') {
    $fecha       = $conexion->real_escape_string($input['fecha'] ?? date('Y-m-d'));
    $plan        = $conexion->real_escape_string(json_encode($input['plan']        ?? []));
    $suplementos = $conexion->real_escape_string(json_encode($input['suplementos'] ?? []));
    $miband      = intval($input['miband'] ?? 0);

    $conexion->query("
        INSERT INTO nutricion_dias (fecha, plan_json, suplementos_json, miband)
        VALUES ('$fecha', '$plan', '$suplementos', $miband)
        ON DUPLICATE KEY UPDATE plan_json = '$plan', suplementos_json = '$suplementos', miband = $miband
    ");
    echo json_encode(['status' => 'ok']);
    exit;
}

// GET: metas vigentes para una fecha (la más reciente con fecha <= la solicitada)
if ($accion === 'obtener_metas') {
    $fecha = $conexion->real_escape_string($_GET['fecha'] ?? date('Y-m-d'));

    $res = $conexion->query("
        SELECT bmr, kcal, prot, carbs, grasas, fibra
        FROM nutricion_metas
        WHERE fecha <= '$fecha'
        ORDER BY fecha DESC
        LIMIT 1
    ");
    if ($res && $res->num_rows > 0) {
        echo json_encode($res->fetch_assoc());
    } else {
        echo json_encode($DEFAULT_METAS);
    }
    exit;
}

// POST: guardar metas vigentes a partir de hoy (no toca fechas pasadas)
if ($accion === 'guardar_metas') {
    $fecha  = $conexion->real_escape_string(date('Y-m-d'));
    $bmr    = intval($input['bmr']    ?? 0);
    $kcal   = intval($input['kcal']   ?? 0);
    $prot   = intval($input['prot']   ?? 0);
    $carbs  = intval($input['carbs']  ?? 0);
    $grasas = intval($input['grasas'] ?? 0);
    $fibra  = intval($input['fibra']  ?? 0);

    $conexion->query("
        INSERT INTO nutricion_metas (fecha, bmr, kcal, prot, carbs, grasas, fibra)
        VALUES ('$fecha', $bmr, $kcal, $prot, $carbs, $grasas, $fibra)
        ON DUPLICATE KEY UPDATE bmr=$bmr, kcal=$kcal, prot=$prot, carbs=$carbs, grasas=$grasas, fibra=$fibra
    ");
    echo json_encode(['status' => 'ok', 'fecha' => $fecha]);
    exit;
}

// POST: guardar solo actividad Mi Band del día
if ($accion === 'guardar_miband') {
    $fecha   = $conexion->real_escape_string($input['fecha'] ?? date('Y-m-d'));
    $miband  = intval($input['miband'] ?? 0);

    $conexion->query("
        INSERT INTO nutricion_dias (fecha, miband)
        VALUES ('$fecha', $miband)
        ON DUPLICATE KEY UPDATE miband = $miband
    ");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
