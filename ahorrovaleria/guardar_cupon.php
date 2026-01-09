<?php
require_once __DIR__ . '/../conexion.php';

/* obtener último folio */
$res = $conn->query("SELECT MAX(folio) AS ultimo FROM cupones");
$row = $res->fetch_assoc();
$folio = ($row['ultimo'] ?? 0) + 1;

/* datos */
$monto = intval($_POST['monto']);

/* guardar */
$stmt = $conn->prepare(
  "INSERT INTO cupones (folio, monto) VALUES (?, ?)"
);
$stmt->bind_param("ii", $folio, $monto);
$stmt->execute();

echo json_encode([
  "folio" => $folio
]);
