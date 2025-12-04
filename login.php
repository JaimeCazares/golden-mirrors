<?php
session_start();

$conexion = new mysqli("localhost", "root", "", "golden");

if ($conexion->connect_error) {
    die("Error conexión DB");
}

$usuario = isset($_POST["usuario"]) ? $_POST["usuario"] : "";
$password = isset($_POST["password"]) ? $_POST["password"] : "";


$sql = "SELECT * FROM usuarios WHERE usuario = '$usuario' LIMIT 1";
$resultado = $conexion->query($sql);

if ($resultado->num_rows === 1) {
    $user = $resultado->fetch_assoc();

    if ($password === $user["password"]) {  // <-- comparación directa
        $_SESSION["usuario"] = $usuario;
        echo "OK";
    } else {
        echo "Contraseña incorrecta";
    }
} else {
    echo "El usuario no existe";
}
