<?php
file_put_contents(__DIR__ . '/debug.txt', "ENTRO\n", FILE_APPEND);

require_once __DIR__ . '/../session_init.php';

if (!isset($_SESSION['usuario'])) {
    http_response_code(403);
    exit;
}


/* =========================
   CONEXIÓN SEGÚN ENTORNO
   ========================= */
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    $conexion = new mysqli(
        "localhost",
        "root",
        "",
        "golden",
        3307
    );
} else {
    $conexion = new mysqli(
        "localhost",
        "u717657264_golden",
        "Jaimecazares7.",
        "u717657264_golden",
        3306
    );
}

if ($conexion->connect_error) {
    http_response_code(500);
    exit;
}

/* =========================
   GUARDAR AHORRO
   ========================= */
$usuario  = $_SESSION['usuario'];
$monto    = intval($_POST['monto'] ?? 0);
$marcadas = intval($_POST['marcadas'] ?? 0);

$sql = "UPDATE ahorro 
        SET marcadas = ? 
        WHERE usuario = ? AND monto = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("isi", $marcadas, $usuario, $monto);
$stmt->execute();

echo "OK";
