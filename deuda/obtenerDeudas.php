<?php
require "conexion.php";

$resultado = $conexion->query("SELECT nombre, pagada FROM deudas_estado");

$deudas = [];

while ($fila = $resultado->fetch_assoc()) {
    $deudas[$fila["nombre"]] = $fila["pagada"];
}

echo json_encode($deudas);
