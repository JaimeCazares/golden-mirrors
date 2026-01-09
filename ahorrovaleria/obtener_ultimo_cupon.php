<?php
require_once __DIR__ . '/../conexion.php';

$res = $conn->query(
  "SELECT folio FROM cupones ORDER BY id DESC LIMIT 1"
);

if ($row = $res->fetch_assoc()) {
  echo json_encode($row);
} else {
  echo json_encode(["folio" => null]);
}
