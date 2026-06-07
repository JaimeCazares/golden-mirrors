<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

// Ensure archivo_url column exists
try {
    $pdo->exec('ALTER TABLE consentimientos ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(500) NULL');
} catch (Exception $e) {}

// ── POST: marcar firmado + subir archivo ──────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pid = (int)($_POST['paciente_id'] ?? 0);
    if (!$pid) {
        http_response_code(400);
        echo json_encode(['error' => 'paciente_id requerido']);
        exit;
    }

    $archivoUrl = null;

    if (!empty($_FILES['archivo']['tmp_name'])) {
        $file    = $_FILES['archivo'];
        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'Formato no permitido. Solo JPG, PNG y PDF']);
            exit;
        }
        $dir = __DIR__ . "/../uploads/consentimientos/$pid/";
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $fname = uniqid('cons_', true) . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $dir . $fname)) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar archivo']);
            exit;
        }
        $archivoUrl = "uploads/consentimientos/$pid/$fname";
    }

    $hoy = date('Y-m-d');
    $sql = 'INSERT INTO consentimientos (paciente_id, firmado, fecha_firma, archivo_url)
            VALUES (:pid, 1, :f, :url)
            ON DUPLICATE KEY UPDATE firmado = 1, fecha_firma = :f2, archivo_url = COALESCE(:url2, archivo_url)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':pid' => $pid, ':f' => $hoy, ':url' => $archivoUrl, ':f2' => $hoy, ':url2' => $archivoUrl]);

    echo json_encode(['ok' => true, 'fecha' => $hoy, 'archivo_url' => $archivoUrl]);
    exit;
}

// ── PUT: marcar firmado sin archivo (legado) ──────────────
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);

    if (!$pid) {
        http_response_code(400);
        echo json_encode(['error' => 'paciente_id requerido']);
        exit;
    }

    $hoy = date('Y-m-d');
    $sql = 'INSERT INTO consentimientos (paciente_id, firmado, fecha_firma)
            VALUES (:pid, 1, :f)
            ON DUPLICATE KEY UPDATE firmado = 1, fecha_firma = :f2';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':pid' => $pid, ':f' => $hoy, ':f2' => $hoy]);

    echo json_encode(['ok' => true, 'fecha' => $hoy]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
