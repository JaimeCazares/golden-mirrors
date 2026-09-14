<?php
// 🔐 SESIÓN UNIFICADA
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443;
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => $https]);
session_start();


/* =========================
   CONEXIÓN SEGÚN ENTORNO
   ========================= */
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    // 🔹 XAMPP
    $conexion = new mysqli(
        "127.0.0.1",
        "root",
        "",
        "golden",
        3307
    );
} else {
    // 🔹 HOSTINGER — credenciales reales solo en el servidor
    $cfg = require __DIR__ . '/golden.config.local.php';
    $conexion = new mysqli($cfg['host'], $cfg['user'], $cfg['pass'], $cfg['db'], $cfg['port']);
}

if ($conexion->connect_error) {
    die("Error conexión DB");
}

/* =========================
   LOGIN
   ========================= */

$usuario  = strtolower(trim($_POST["usuario"] ?? ""));
$password = trim($_POST["password"] ?? "");

if ($usuario === "" || $password === "") {
    echo "Datos incompletos";
    exit;
}

// Rol de cada cuenta (son solo dos, no hace falta columna aparte en la BD)
$roles = [
    'vale'  => ['rol' => 'novia', 'destino' => 'AHORRO'],
    'admin' => ['rol' => 'admin', 'destino' => 'INDEX'],
];

$sql = "SELECT * FROM usuarios WHERE usuario = ? LIMIT 1";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $user = $resultado->fetch_assoc();

    if (isset($roles[$usuario]) && password_verify($password, $user['password_hash'])) {
        $_SESSION["usuario"] = $usuario;
        $_SESSION["rol"]     = $roles[$usuario]['rol'];
        echo $roles[$usuario]['destino'];
        exit;
    }

    // ❌ Credenciales incorrectas
    echo "Usuario o contraseña incorrectos";
    exit;
} else {
    echo "El usuario no existe";
}
