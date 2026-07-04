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

// 3. ¿Ya existe un registro para esa semana? (permite editar: re-subir fotos o corregir el peso)
$existente = null;
$resExistente = $conexion->prepare("SELECT id, foto_frente, foto_lado, foto_atras FROM peso_historial WHERE semana = ? ORDER BY id ASC LIMIT 1");
$resExistente->bind_param("i", $semana);
$resExistente->execute();
$rowExistente = $resExistente->get_result()->fetch_assoc();
if ($rowExistente) $existente = $rowExistente;
$resExistente->close();

// 4. Procesar las tres fotos. Si no se sube una nueva y ya había una foto guardada
// para esa semana, se conserva la anterior en vez de borrarla.
$f1 = guardarFoto("foto_frente") ?? ($existente['foto_frente'] ?? null);
$f2 = guardarFoto("foto_lado")   ?? ($existente['foto_lado']   ?? null);
$f3 = guardarFoto("foto_atras")  ?? ($existente['foto_atras']  ?? null);

// 5. Insertar (semana nueva) o actualizar (edición de una semana ya guardada)
if ($existente) {
    $sql  = "UPDATE peso_historial SET peso = ?, fecha = ?, foto_frente = ?, foto_lado = ?, foto_atras = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    if ($stmt) $stmt->bind_param("dssssi", $peso, $fecha, $f1, $f2, $f3, $existente['id']);
} else {
    $sql  = "INSERT INTO peso_historial (peso, fecha, semana, foto_frente, foto_lado, foto_atras) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    if ($stmt) $stmt->bind_param("dsisss", $peso, $fecha, $semana, $f1, $f2, $f3);
}

if ($stmt) {
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
