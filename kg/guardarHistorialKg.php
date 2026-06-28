<?php
// Configuración de errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once "../conexion.php";
header('Content-Type: application/json');

// 1. Validar que se recibió el peso
if (!isset($_POST['peso']) || empty($_POST['peso'])) {
    echo json_encode(["ok" => false, "error" => "No se recibió el valor del peso."]);
    exit;
}

$peso  = floatval($_POST['peso']);
$fecha = date("Y-m-d");

// 2. Determinar el número de semana: se usa la enviada por el usuario, o si no llega, se calcula automáticamente
if (isset($_POST['semana']) && $_POST['semana'] !== '') {
    $semana = intval($_POST['semana']);
} else {
    $res = $conexion->query("SELECT MAX(semana) as ultima FROM peso_historial");
    $row = $res->fetch_assoc();
    $semana = ($row && $row['ultima'] !== null) ? intval($row['ultima']) + 1 : 0;
}

/**
 * Función para procesar y mover las imágenes
 */
function guardarFoto($campo)
{
    if (!isset($_FILES[$campo]) || $_FILES[$campo]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $dir = __DIR__ . "/../uploads/peso/";
    // Crear carpeta si no existe
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $ext = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
    // Nombre único para evitar sobrescribir archivos
    $nombre = time() . "_" . $campo . "_" . uniqid() . "." . $ext;

    if (move_uploaded_file($_FILES[$campo]['tmp_name'], $dir . $nombre)) {
        return "uploads/peso/" . $nombre;
    }

    return null;
}

// 3. Procesar las tres fotos
$f1 = guardarFoto("foto_frente");
$f2 = guardarFoto("foto_lado");
$f3 = guardarFoto("foto_atras");

// 4. Preparar la inserción en la base de datos
// Asegúrate de que los nombres de las columnas coincidan con tu tabla
$sql = "INSERT INTO peso_historial (peso, fecha, semana, foto_frente, foto_lado, foto_atras) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);

if ($stmt) {
    $stmt->bind_param("dsisss", $peso, $fecha, $semana, $f1, $f2, $f3);

    if ($stmt->execute()) {
        echo json_encode([
            "ok" => true,
            "semana_guardada" => $semana,
            "mensaje" => "Registro guardado exitosamente"
        ]);
    } else {
        echo json_encode(["ok" => false, "error" => "Error al ejecutar: " . $conexion->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["ok" => false, "error" => "Error al preparar la consulta: " . $conexion->error]);
}

$conexion->close();
