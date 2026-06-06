<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar documentos de un paciente ─────────────────
if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM documentos_pacientes WHERE paciente_id = ? ORDER BY fecha DESC, id DESC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($r) => [
        'id'          => (int)$r['id'],
        'nombre'      => $r['nombre'] ?? '',
        'tipo_archivo'=> $r['tipo_archivo'] ?? 'imagen',
        'url'         => $r['archivo_url'] ?? '',
        'descripcion' => $r['descripcion'] ?? '',
        'fecha'       => $r['fecha'] ?? '',
    ], $stmt->fetchAll()), JSON_UNESCAPED_UNICODE);
    exit;
}

// ── POST: subir documento ─────────────────────────────────
if ($method === 'POST') {
    $pid    = (int)($_POST['paciente_id'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $desc   = trim($_POST['descripcion'] ?? '');
    $fecha  = $_POST['fecha'] ?? date('Y-m-d');

    if (!$pid || empty($_FILES['archivo']['tmp_name'])) {
        http_response_code(400); echo json_encode(['error' => 'paciente_id y archivo requeridos']); exit;
    }

    $file    = $_FILES['archivo'];
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($ext, $allowed)) {
        http_response_code(400); echo json_encode(['error' => 'Formato no permitido. Solo JPG, PNG y PDF']); exit;
    }

    $tipo = $ext === 'pdf' ? 'pdf' : 'imagen';

    if (empty($nombre)) {
        $nombre = pathinfo($file['name'], PATHINFO_FILENAME);
    }

    $dir = __DIR__ . "/../uploads/documentos/$pid/";
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $fname = uniqid('doc_', true) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . $fname)) {
        http_response_code(500); echo json_encode(['error' => 'Error al guardar archivo']); exit;
    }

    $url = "uploads/documentos/$pid/$fname";
    $stmt = $pdo->prepare(
        'INSERT INTO documentos_pacientes (paciente_id, nombre, tipo_archivo, archivo_url, descripcion, fecha) VALUES (:pid, :n, :t, :u, :d, :f)'
    );
    $stmt->execute([':pid' => $pid, ':n' => $nombre, ':t' => $tipo, ':u' => $url, ':d' => $desc, ':f' => $fecha]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'url' => $url, 'tipo_archivo' => $tipo]);
    exit;
}

// ── DELETE: eliminar documento ────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT archivo_url FROM documentos_pacientes WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row && $row['archivo_url']) {
        $path = __DIR__ . '/../' . $row['archivo_url'];
        if (file_exists($path)) unlink($path);
    }
    $pdo->prepare('DELETE FROM documentos_pacientes WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
