<?php
require_once __DIR__ . '/../session_init.php';

if (!isset($_SESSION['usuario'])) {
    http_response_code(403);
    exit;
}

/* =========================
   CONEXIÓN SEGÚN ENTORNO
   ========================= */
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    $conexion = new mysqli("localhost", "root", "", "golden", 3307);
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

$usuario  = $_SESSION['usuario'];
$monto    = intval($_POST['monto'] ?? 0);
$marcadas = intval($_POST['marcadas'] ?? 0);

/* INSERT O UPDATE */
$sql = "
INSERT INTO ahorro (usuario, monto, marcadas)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE marcadas = VALUES(marcadas)
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("sii", $usuario, $monto, $marcadas);
$stmt->execute();

echo "OK";
