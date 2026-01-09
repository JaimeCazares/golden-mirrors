<?php
require_once __DIR__ . '/../conexion.php';

header('Content-Type: application/json');

$monto = intval($_POST['monto'] ?? 0);

if ($monto <= 0) {
    echo json_encode(["ok" => false]);
    exit;
}

/* 🔎 Ver si ya existe cupón */
$check = $conexion->prepare(
    "SELECT folio FROM cupones WHERE monto = ? LIMIT 1"
);
$check->bind_param("i", $monto);
$check->execute();
$res = $check->get_result();

if ($row = $res->fetch_assoc()) {
    // 👉 Ya existe → devolver folio existente
    echo json_encode([
        "ok" => true,
        "folio" => $row['folio']
    ]);
    exit;
}

/* 📌 Nuevo folio */
$res = $conexion->query("SELECT MAX(folio) AS max_folio FROM cupones");
$row = $res->fetch_assoc();
$folio = ($row['max_folio'] ?? 0) + 1;

/* 💾 Guardar cupón */
$stmt = $conexion->prepare(
    "INSERT INTO cupones (monto, folio) VALUES (?, ?)"
);
$stmt->bind_param("ii", $monto, $folio);
$stmt->execute();

/* ✅ RESPUESTA CORRECTA */
echo json_encode([
    "ok" => true,
    "folio" => $folio
]);
