<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

$conexion = new mysqli(
    "auth-db526.hstgr.io",
    "u717657264_dorado",
    "Cazares710.",
    "u717657264_golden"
);


if ($conexion->connect_error) {
    die("Error conexión DB");
}

$usuario  = isset($_POST["usuario"]) ? $_POST["usuario"] : "";
$password = isset($_POST["password"]) ? $_POST["password"] : "";

$sql = "SELECT * FROM usuarios WHERE usuario = ? LIMIT 1";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $usuario);
$stmt->execute();

$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $user = $resultado->fetch_assoc();

    // Comparación directa (como lo tienes ahora)
    if ($password === $user["password"]) {
        $_SESSION["usuario"] = $usuario;
        echo "OK";
    } else {
        echo "Contraseña incorrecta";
    }
} else {
    echo "El usuario no existe";
}
