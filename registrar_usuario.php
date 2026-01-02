<?php
$conexion = new mysqli("localhost", "root", "", "golden");

$usuario = "admin";
$pass_plano = "1234";

$sql = "INSERT INTO usuarios (usuario, password) VALUES ('$usuario', '$pass_plano')";

$conexion->query($sql);

echo "Usuario creado simple.";
?>
