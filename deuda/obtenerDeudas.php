<?php
require __DIR__ . "/../conexion.php";

$resultado = $conexion->query("SELECT id, pagada FROM deudas_estado");

$deudas = [];

while ($fila = $resultado->fetch_assoc()) {
    $deudas[$fila["id"]] = $fila["pagada"];
}

echo json_encode($deudas);
