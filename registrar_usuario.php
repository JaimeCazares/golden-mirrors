<?php
$conexion = new mysqli("localhost", "root", "", "golden");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$usuario = "admin";  // cámbialo
$pass_plano = "123456"; // cámbialo
$pass_hash = password_hash($pass_plano, PASSWORD_DEFAULT);

$sql = "INSERT INTO usuarios (usuario, password) VALUES ('$usuario', '$pass_hash')";

if ($conexion->query($sql) === TRUE) {
    echo "Usuario creado correctamente.";
} else {
    echo "Error: " . $conexion->error;
}

$conexion->close();
?>
