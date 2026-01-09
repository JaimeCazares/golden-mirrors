<?php
require_once __DIR__ . '/../conexion.php';

$monto = intval($_POST['monto'] ?? 0);

if ($monto <= 0) {
    exit;
}

// 🔎 Ver si ya existe cupón para este monto
$check = $conexion->query("
  SELECT id 
  FROM cupones 
  WHERE monto = $monto
  LIMIT 1
");

if ($check && $check->num_rows > 0) {
    exit; // ya existe → no duplicar
}

// 📌 Obtener siguiente folio
$res = $conexion->query("SELECT MAX(folio) AS max_folio FROM cupones");
$row = $res->fetch_assoc();
$folio = ($row['max_folio'] ?? 0) + 1;

// 💾 Guardar cupón
$conexion->query("
  INSERT INTO cupones (monto, folio)
  VALUES ($monto, $folio)
");
