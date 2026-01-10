<?php
ini_set('display_errors', 0);
require_once "../conexion.php";
header('Content-Type: application/json');

if (!isset($_POST['peso']) || empty($_POST['peso'])) {
    echo json_encode(["ok" => false, "error" => "No se recibió el peso"]);
    exit;
}

$peso  = floatval($_POST['peso']);
$fecha = date("Y-m-d");

$res = $conexion->query("SELECT MAX(semana) as ultima FROM peso_historial");
$row = $res->fetch_assoc();
$semana = ($row['ultima'] !== null) ? intval($row['ultima']) + 1 : 0;

function guardarFoto($campo) {
    if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] !== UPLOAD_ERR_OK) return null;
    $dir = "../uploads/peso/";
    if (!is_dir($dir)) mkdir($dir, 0777, true);
    $ext = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
    $nombre = time() . "_" . $campo . "_" . uniqid() . "." . $ext;
    if (move_uploaded_file($_FILES[$campo]['tmp_name'], $dir . $nombre)) return "uploads/peso/" . $nombre;
    return null;
}

$f1 = guardarFoto("foto_frente"); $f2 = guardarFoto("foto_lado"); $f3 = guardarFoto("foto_atras");

$stmt = $conexion->prepare("INSERT INTO peso_historial (peso, fecha, semana, foto_frente, foto_lado, foto_atras) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("dsisss", $peso, $fecha, $semana, $f1, $f2, $f3);

if ($stmt->execute()) echo json_encode(["ok" => true, "semana_guardada" => $semana]);
else echo json_encode(["ok" => false, "error" => $conexion->error]);

$stmt->close(); $conexion->close();