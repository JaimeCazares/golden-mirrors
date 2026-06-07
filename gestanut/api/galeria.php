<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar fotos de un paciente ──────────────────
if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM galeria_pacientes WHERE paciente_id = ? ORDER BY fecha DESC, id DESC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($r) => [
        'id'          => (int)$r['id'],
        'fecha'       => $r['fecha'] ?? '',
        'tipo'        => $r['tipo'] ?? 'progreso',
        'url'         => $r['archivo_url'] ?? '',
        'descripcion' => $r['descripcion'] ?? '',
    ], $stmt->fetchAll()), JSON_UNESCAPED_UNICODE);
    exit;
}

// ── POST: subir foto ──────────────────────────────────
if ($method === 'POST') {
    $pid  = (int)($_POST['paciente_id'] ?? 0);
    $tipo = trim($_POST['tipo'] ?? 'progreso');
    $desc = trim($_POST['descripcion'] ?? '');
    $fecha = $_POST['fecha'] ?? date('Y-m-d');

    if (!$pid || empty($_FILES['foto']['tmp_name'])) {
        http_response_code(400); echo json_encode(['error' => 'paciente_id y foto requeridos']); exit;
    }

    $file    = $_FILES['foto'];
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
    if (!in_array($ext, $allowed)) {
        http_response_code(400); echo json_encode(['error' => 'Formato no permitido']); exit;
    }

    $dir = __DIR__ . "/../uploads/galeria/$pid/";
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $fname = uniqid('foto_', true) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . $fname)) {
        http_response_code(500); echo json_encode(['error' => 'Error al guardar archivo']); exit;
    }

    $url = "uploads/galeria/$pid/$fname";
    $stmt = $pdo->prepare('INSERT INTO galeria_pacientes (paciente_id, fecha, tipo, archivo_url, descripcion) VALUES (:pid, :f, :t, :u, :d)');
    $stmt->execute([':pid' => $pid, ':f' => $fecha, ':t' => $tipo, ':u' => $url, ':d' => $desc]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'url' => $url]);
    exit;
}

// ── DELETE: eliminar foto ─────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT archivo_url FROM galeria_pacientes WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row && $row['archivo_url']) {
        $path = __DIR__ . '/../' . $row['archivo_url'];
        if (file_exists($path)) unlink($path);
    }
    $pdo->prepare('DELETE FROM galeria_pacientes WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
