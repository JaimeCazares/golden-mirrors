<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once "../conexion.php";

if (!isset($_POST['peso'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Peso no recibido"]);
    exit;
}

$peso  = floatval($_POST['peso']);
$fecha = date("Y-m-d");

/* ===============================
   CALCULAR SEMANA
================================ */
$res = $conexion->query(
    "SELECT fecha FROM peso_historial ORDER BY fecha ASC LIMIT 1"
);

if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $fechaInicial = new DateTime($row['fecha']);
} else {
    $fechaInicial = new DateTime($fecha);
}

$fechaActual = new DateTime($fecha);
$dias   = $fechaInicial->diff($fechaActual)->days;
$semana = floor($dias / 7);

/* ===============================
   FUNCIÓN GUARDAR FOTO
================================ */
function guardarFoto($campo) {
    if (empty($_FILES[$campo]['name'])) {
        return null;
    }

    $dir = "../uploads/peso/";
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $nombre = time() . "_" . $campo . "_" . basename($_FILES[$campo]['name']);
    $ruta   = $dir . $nombre;

    if (!move_uploaded_file($_FILES[$campo]['tmp_name'], $ruta)) {
        return null;
    }

    return "uploads/peso/" . $nombre;
}

$fotoFrente = guardarFoto("foto_frente");
$fotoLado   = guardarFoto("foto_lado");
$fotoAtras  = guardarFoto("foto_atras");

/* ===============================
   INSERTAR
================================ */
$stmt = $conexion->prepare(
    "INSERT INTO peso_historial
    (peso, fecha, semana, foto_frente, foto_lado, foto_atras)
    VALUES (?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "dsisss",
    $peso,
    $fecha,
    $semana,
    $fotoFrente,
    $fotoLado,
    $fotoAtras
);

$stmt->execute();

echo json_encode(["ok" => true]);
