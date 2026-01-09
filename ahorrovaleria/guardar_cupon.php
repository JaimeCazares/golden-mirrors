<?php
require_once __DIR__ . '/../conexion.php';

header('Content-Type: application/json');

$monto = intval($_POST['monto'] ?? 0);

if ($monto <= 0) {
    echo json_encode(["folio" => null]);
    exit;
}

/* buscar si ya existe */
$stmt = $conexion->prepare(
    "SELECT folio FROM cupones WHERE monto = ? LIMIT 1"
);
$stmt->bind_param("i", $monto);
$stmt->execute();
$res = $stmt->get_result();

if ($row = $res->fetch_assoc()) {
    echo json_encode(["folio" => $row['folio']]);
    exit;
}

/* crear nuevo */
$res = $conexion->query("SELECT MAX(folio) AS max FROM cupones");
$row = $res->fetch_assoc();
$folio = ($row['max'] ?? 0) + 1;

$stmt = $conexion->prepare(
    "INSERT INTO cupones (monto, folio) VALUES (?, ?)"
);
$stmt->bind_param("ii", $monto, $folio);
$stmt->execute();

echo json_encode(["folio" => $folio]);
