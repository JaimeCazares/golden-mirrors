<?php
$conexion = new mysqli("localhost", "root", "", "apuestas");

if ($conexion->connect_error) {
    die("Error: " . $conexion->connect_error);
}

$resultado = $conexion->query("SELECT nombre, pagada FROM deudas_estado");

$deudas = [];

while ($fila = $resultado->fetch_assoc()) {
    $deudas[$fila["nombre"]] = $fila["pagada"];
}

echo json_encode($deudas);
