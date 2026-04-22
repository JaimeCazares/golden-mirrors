<?php
// 🔐 SESIÓN UNIFICADA
session_start();


/* =========================
   CONEXIÓN SEGÚN ENTORNO
   ========================= */
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    // 🔹 XAMPP
    $conexion = new mysqli(
        "localhost",
        "root",
        "",
        "golden",
        3306
    );
} else {
    // 🔹 HOSTINGER
    $conexion = new mysqli(
        "localhost",
        "u717657264_golden",
        "Jaimecazares7.",
        "u717657264_golden",
        3306
    );
}

if ($conexion->connect_error) {
    die("Error conexión DB");
}

/* =========================
   LOGIN
   ========================= */

$usuario  = $_POST["usuario"] ?? "";
$password = $_POST["password"] ?? "";

if ($usuario === "" || $password === "") {
    echo "Datos incompletos";
    exit;
}

$sql = "SELECT * FROM usuarios WHERE usuario = ? LIMIT 1";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {

    $user = $resultado->fetch_assoc();

    // NORMALIZAR
    $usuario = strtolower(trim($usuario));
    $password = trim($password);

    // 🔐 VALE
    if ($usuario === 'vale' && $password === 'vale') {

        $_SESSION["usuario"] = 'vale';
        $_SESSION["rol"] = 'novia';
        echo "AHORRO";
        exit;
    }

    // 🔐 ADMIN
    if ($usuario === 'admin' && $password === 'abc') {

        $_SESSION["usuario"] = 'admin';
        $_SESSION["rol"] = 'admin';
        echo "INDEX";
        exit;
    }

    // ❌ Credenciales incorrectas
    echo "Usuario o contraseña incorrectos";
    exit;
} else {
    echo "El usuario no existe";
}
