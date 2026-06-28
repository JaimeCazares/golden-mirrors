<?php
require_once "../conexion.php";

$res = $conexion->query(
    "SELECT * FROM peso_historial ORDER BY semana DESC"
);

$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
