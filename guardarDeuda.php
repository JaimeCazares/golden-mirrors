<?php
$conexion = new mysqli("localhost", "root", "", "apuestas");

if ($conexion->connect_error) {
    die("Error: " . $conexion->connect_error);
}

$nombre = $_POST['nombre'];
$pagada = $_POST['pagada'];

$sql = "UPDATE deudas_estado SET pagada=? WHERE nombre=?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("is", $pagada, $nombre);
$stmt->execute();

echo "OK";
