<?php
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF);
header('Content-Type: application/json');
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

$conexion->query("
    CREATE TABLE IF NOT EXISTS crm_clientes (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        negocio      VARCHAR(150) NOT NULL,
        contacto     VARCHAR(150) DEFAULT '',
        telefono     VARCHAR(30)  DEFAULT '',
        ubicacion    VARCHAR(200) DEFAULT '',
        giro         VARCHAR(60)  DEFAULT 'otro',
        canal        VARCHAR(30)  DEFAULT 'whatsapp',
        estado       VARCHAR(30)  NOT NULL DEFAULT 'nuevo',
        satisfaccion TINYINT      DEFAULT NULL,
        precio       DECIMAL(10,2) DEFAULT NULL,
        anticipo     DECIMAL(10,2) DEFAULT NULL,
        proxima_fecha DATE        DEFAULT NULL,
        notas        LONGTEXT,
        checklist    LONGTEXT,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$CHECKLIST_DEFAULT = [
    ['texto' => 'Investigar el negocio (Google, redes, competencia)', 'hecho' => false],
    ['texto' => 'Preparar propuesta y cotización', 'hecho' => false],
    ['texto' => 'Enviar propuesta al cliente', 'hecho' => false],
    ['texto' => 'Dar seguimiento', 'hecho' => false],
    ['texto' => 'Cobrar anticipo', 'hecho' => false],
    ['texto' => 'Recibir logo, fotos y textos', 'hecho' => false],
    ['texto' => 'Entregar sitio para revisión', 'hecho' => false],
    ['texto' => 'Entrega final y cobro restante', 'hecho' => false],
];

$ESTADOS_VALIDOS = ['nuevo', 'propuesta', 'pensando', 'dudas', 'aprobado', 'rechazado', 'desarrollo', 'entregado'];

function clStr($v) {
    return is_scalar($v) ? (string)$v : '';
}

function clRow($r) {
    $r['notas'] = json_decode($r['notas'] ?: '[]', true);
    $r['checklist'] = json_decode($r['checklist'] ?: '[]', true);
    $r['satisfaccion'] = $r['satisfaccion'] !== null ? (int)$r['satisfaccion'] : null;
    $r['precio'] = $r['precio'] !== null ? (float)$r['precio'] : null;
    $r['anticipo'] = $r['anticipo'] !== null ? (float)$r['anticipo'] : null;
    return $r;
}

$accion = $_GET['accion'] ?? '';

// 1. OBTENER TODOS
if ($accion === 'obtener') {
    $out = [];
    $res = $conexion->query("SELECT * FROM crm_clientes ORDER BY updated_at DESC");
    if ($res) {
        while ($row = $res->fetch_assoc()) $out[] = clRow($row);
    }
    echo json_encode(['clientes' => $out]);
    exit;
}

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// 2. CREAR PROSPECTO
if ($accion === 'crear' && $data) {
    $negocio   = $conexion->real_escape_string(clStr($data['negocio'] ?? ''));
    $contacto  = $conexion->real_escape_string(clStr($data['contacto'] ?? ''));
    $telefono  = $conexion->real_escape_string(clStr($data['telefono'] ?? ''));
    $ubicacion = $conexion->real_escape_string(clStr($data['ubicacion'] ?? ''));
    $giro      = $conexion->real_escape_string(clStr($data['giro'] ?? 'otro'));
    $canal     = $conexion->real_escape_string(clStr($data['canal'] ?? 'whatsapp'));

    if ($negocio === '') {
        echo json_encode(['status' => 'error', 'message' => 'Falta el nombre del negocio']);
        exit;
    }

    $checklistJson = $conexion->real_escape_string(json_encode($CHECKLIST_DEFAULT));

    $conexion->query("INSERT INTO crm_clientes (negocio, contacto, telefono, ubicacion, giro, canal, estado, notas, checklist)
        VALUES ('$negocio', '$contacto', '$telefono', '$ubicacion', '$giro', '$canal', 'nuevo', '[]', '$checklistJson')");

    $id = $conexion->insert_id;
    $res = $conexion->query("SELECT * FROM crm_clientes WHERE id = $id");
    $row = $res->fetch_assoc();
    echo json_encode(['status' => 'ok', 'cliente' => clRow($row)]);
    exit;
}

// 3. ACTUALIZAR CAMPOS (parcial)
if ($accion === 'actualizar' && $data) {
    $id = intval($data['id'] ?? 0);
    if (!$id) { echo json_encode(['status' => 'error', 'message' => 'id inválido']); exit; }

    $campos = [];

    global $ESTADOS_VALIDOS;
    $texto = ['negocio', 'contacto', 'telefono', 'ubicacion', 'giro', 'canal', 'estado'];
    foreach ($texto as $c) {
        if (array_key_exists($c, $data)) {
            if ($c === 'estado' && !in_array($data[$c], $ESTADOS_VALIDOS, true)) continue;
            $v = $conexion->real_escape_string(clStr($data[$c]));
            $campos[] = "$c = '$v'";
        }
    }

    if (array_key_exists('satisfaccion', $data)) {
        $v = $data['satisfaccion'];
        $campos[] = $v === null ? "satisfaccion = NULL" : "satisfaccion = " . intval($v);
    }
    if (array_key_exists('precio', $data)) {
        $v = $data['precio'];
        $campos[] = ($v === null || $v === '') ? "precio = NULL" : "precio = " . floatval($v);
    }
    if (array_key_exists('anticipo', $data)) {
        $v = $data['anticipo'];
        $campos[] = ($v === null || $v === '') ? "anticipo = NULL" : "anticipo = " . floatval($v);
    }
    if (array_key_exists('proxima_fecha', $data)) {
        $v = $data['proxima_fecha'];
        $campos[] = ($v === null || $v === '') ? "proxima_fecha = NULL" : "proxima_fecha = '" . $conexion->real_escape_string(clStr($v)) . "'";
    }

    if (empty($campos)) { echo json_encode(['status' => 'ok']); exit; }

    $conexion->query("UPDATE crm_clientes SET " . implode(', ', $campos) . " WHERE id = $id");

    $res = $conexion->query("SELECT * FROM crm_clientes WHERE id = $id");
    $row = $res->fetch_assoc();
    echo json_encode(['status' => 'ok', 'cliente' => $row ? clRow($row) : null]);
    exit;
}

// 4. AGREGAR NOTA (bitácora)
if ($accion === 'agregar_nota' && $data) {
    $id = intval($data['id'] ?? 0);
    $texto = trim($data['texto'] ?? '');
    if (!$id || $texto === '') { echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']); exit; }

    $res = $conexion->query("SELECT notas FROM crm_clientes WHERE id = $id");
    if (!$res || $res->num_rows === 0) { echo json_encode(['status' => 'error', 'message' => 'No encontrado']); exit; }

    $row = $res->fetch_assoc();
    $notas = json_decode($row['notas'] ?: '[]', true);
    $notas[] = ['fecha' => date('Y-m-d H:i:s'), 'texto' => $texto];

    $notasJson = $conexion->real_escape_string(json_encode($notas, JSON_UNESCAPED_UNICODE));
    $conexion->query("UPDATE crm_clientes SET notas = '$notasJson' WHERE id = $id");

    echo json_encode(['status' => 'ok', 'notas' => $notas]);
    exit;
}

// 5. TOGGLE / EDITAR CHECKLIST
if ($accion === 'set_checklist' && $data) {
    $id = intval($data['id'] ?? 0);
    $checklist = $data['checklist'] ?? null;
    if (!$id || $checklist === null) { echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']); exit; }

    $checklistJson = $conexion->real_escape_string(json_encode($checklist, JSON_UNESCAPED_UNICODE));
    $conexion->query("UPDATE crm_clientes SET checklist = '$checklistJson' WHERE id = $id");

    echo json_encode(['status' => 'ok']);
    exit;
}

// 6. ELIMINAR
if ($accion === 'eliminar' && $data) {
    $id = intval($data['id'] ?? 0);
    if (!$id) { echo json_encode(['status' => 'error', 'message' => 'id inválido']); exit; }

    $conexion->query("DELETE FROM crm_clientes WHERE id = $id");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
