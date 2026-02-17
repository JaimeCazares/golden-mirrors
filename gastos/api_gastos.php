<?php
// Muestra errores si los hay (solo para pruebas)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// IMPORTANTE: Verifica que esta ruta sea correcta. 
// Si conexion.php está en la carpeta raíz (GOLDEN), esto está bien.
include '../conexion.php';

// Verificamos si la variable de conexión se llama $conn, $conexion o $mysqli
if (!isset($conn)) {
    if (isset($conexion)) $conn = $conexion;
    elseif (isset($mysqli)) $conn = $mysqli;
    else {
        die(json_encode(["error" => "No se encontró la variable de conexión en conexion.php"]));
    }
}

if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión: " . $conn->connect_error]));
}

$accion = $_GET['accion'] ?? '';

// 1. OBTENER DATOS
if ($accion == 'obtener') {
    $datos = ['saldos' => [], 'historial' => []];

    // Sacar saldos
    $res = $conn->query("SELECT * FROM saldos");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $datos['saldos'][$row['tipo']] = $row['monto'];
        }
    }

    // Sacar historial
    $res_hist = $conn->query("SELECT * FROM gastos_historial ORDER BY fecha DESC LIMIT 20");
    if ($res_hist) {
        while ($row = $res_hist->fetch_assoc()) {
            $datos['historial'][] = $row;
        }
    }

    echo json_encode($datos);
    exit;
}

// Leer el cuerpo JSON para las siguientes acciones
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// 2. REGISTRAR GASTO
if ($accion == 'registrar' && $data) {
    $desc = $conn->real_escape_string($data['descripcion']);
    $monto = floatval($data['monto']);
    $metodo = $conn->real_escape_string($data['metodo']);

    // Insertar historial
    $conn->query("INSERT INTO gastos_historial (descripcion, monto, metodo) VALUES ('$desc', $monto, '$metodo')");

    // Restar saldo
    $conn->query("UPDATE saldos SET monto = monto - $monto WHERE tipo = '$metodo'");

    echo json_encode(['status' => 'ok']);
    exit;
}

// 3. EDITAR SALDO
if ($accion == 'editar_saldo' && $data) {
    $tipo = $conn->real_escape_string($data['tipo']);
    $nuevo_monto = floatval($data['monto']);

    $conn->query("UPDATE saldos SET monto = $nuevo_monto WHERE tipo = '$tipo'");
    echo json_encode(['status' => 'ok']);
    exit;
}
