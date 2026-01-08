<?php
require __DIR__ . "/../conexion.php";

$id = $_POST['id'];
$pagada = $_POST['pagada'];

$sql = "UPDATE deudas_estado SET pagada=? WHERE id=?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("ii", $pagada, $id);
$stmt->execute();

echo "OK";
