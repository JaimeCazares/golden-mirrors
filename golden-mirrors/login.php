<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

$conexion = new mysqli(
    "localhost",                // ✅ HOST CORRECTO
    "u717657264_golden",         // ✅ USUARIO MYSQL
    "Cazares710.",               // ✅ CONTRASEÑA
    "u717657264_golden"          // ✅ BASE DE DATOS
);

if ($conexion->connect_error) {
    die("Error conexión DB: " . $conexion->connect_error);
}

$usuario  = $_POST["usuario"] ?? "";
$password = $_POST["password"] ?? "";

$sql = "SELECT * FROM usuarios WHERE usuario = ? LIMIT 1";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $user = $resultado->fetch_assoc();

    if ($password === $user["password"]) {
        $_SESSION["usuario"] = $usuario;
        echo "OK";
    } else {
        echo "Contraseña incorrecta";
    }
} else {
    echo "El usuario no existe";
}
