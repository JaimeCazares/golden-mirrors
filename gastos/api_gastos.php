<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

include '../conexion.php';

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

    $res = $conn->query("SELECT * FROM saldos");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $datos['saldos'][$row['tipo']] = $row['monto'];
        }
    }

    $res_hist = $conn->query("SELECT * FROM gastos_historial ORDER BY fecha DESC LIMIT 20");
    if ($res_hist) {
        while ($row = $res_hist->fetch_assoc()) {
            $datos['historial'][] = $row;
        }
    }

    echo json_encode($datos);
    exit;
}

$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// 2. REGISTRAR MOVIMIENTO
if ($accion == 'registrar' && $data) {
    $desc = $conn->real_escape_string($data['descripcion']);
    $monto = floatval($data['monto']);
    $metodo = $conn->real_escape_string($data['metodo']);
    $tipo = $conn->real_escape_string($data['tipo'] ?? 'gasto');

    // Insertar historial
    $conn->query("INSERT INTO gastos_historial (descripcion, monto, metodo, tipo) VALUES ('$desc', $monto, '$metodo', '$tipo')");
    $nuevo_id = $conn->insert_id; 

    // OBTENEMOS LA FECHA EXACTA RECIÉN CREADA EN LA BD
    $res_fecha = $conn->query("SELECT fecha FROM gastos_historial WHERE id = $nuevo_id");
    $fecha_registro = '';
    if ($res_fecha && $res_fecha->num_rows > 0) {
        $fecha_registro = $res_fecha->fetch_assoc()['fecha'];
    }

    // Sumar o restar saldo
    if ($tipo === 'ingreso') {
        $conn->query("UPDATE saldos SET monto = monto + $monto WHERE tipo = '$metodo'");
    } else {
        $conn->query("UPDATE saldos SET monto = monto - $monto WHERE tipo = '$metodo'");
    }

    // Devolvemos también la fecha
    echo json_encode(['status' => 'ok', 'id' => $nuevo_id, 'fecha' => $fecha_registro]);
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

// 4. ELIMINAR REGISTRO
if ($accion == 'eliminar' && $data) {
    $id = intval($data['id']);

    $res = $conn->query("SELECT monto, metodo, tipo FROM gastos_historial WHERE id = $id");
    if ($res && $res->num_rows > 0) {
        $gasto = $res->fetch_assoc();
        $monto = $gasto['monto'];
        $metodo = $gasto['metodo'];
        $tipo = $gasto['tipo'] ?? 'gasto'; 

        if ($tipo === 'ingreso') {
            $conn->query("UPDATE saldos SET monto = monto - $monto WHERE tipo = '$metodo'");
        } else {
            $conn->query("UPDATE saldos SET monto = monto + $monto WHERE tipo = '$metodo'");
        }

        $conn->query("DELETE FROM gastos_historial WHERE id = $id");
        echo json_encode(['status' => 'ok']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gasto no encontrado']);
    }
    exit;
}