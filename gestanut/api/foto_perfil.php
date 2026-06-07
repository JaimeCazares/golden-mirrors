<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$pid = (int)($_POST['paciente_id'] ?? 0);
if (!$pid || empty($_FILES['foto']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'paciente_id y foto requeridos']);
    exit;
}

$file    = $_FILES['foto'];
$ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
if (!in_array($ext, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato no permitido. Usa JPG, PNG o WEBP.']);
    exit;
}

$dir = __DIR__ . '/../uploads/perfiles/';
if (!is_dir($dir)) mkdir($dir, 0755, true);

// Borrar foto anterior si existe
$stmt = $pdo->prepare('SELECT foto_perfil FROM pacientes WHERE id = ?');
$stmt->execute([$pid]);
$old = $stmt->fetchColumn();
if ($old) {
    $oldPath = __DIR__ . '/../' . $old;
    if (file_exists($oldPath)) unlink($oldPath);
}

$fname = 'perfil_' . $pid . '_' . uniqid() . '.' . $ext;
if (!move_uploaded_file($file['tmp_name'], $dir . $fname)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar la foto']);
    exit;
}

$url = 'uploads/perfiles/' . $fname;
$pdo->prepare('UPDATE pacientes SET foto_perfil = ? WHERE id = ?')->execute([$url, $pid]);

echo json_encode(['ok' => true, 'url' => $url]);
