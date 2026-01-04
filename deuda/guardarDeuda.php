<?php
require "conexion.php";

$nombre = $_POST['nombre'];
$pagada = $_POST['pagada'];

$sql = "UPDATE deudas_estado SET pagada=? WHERE nombre=?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("is", $pagada, $nombre);
$stmt->execute();

echo "OK";
