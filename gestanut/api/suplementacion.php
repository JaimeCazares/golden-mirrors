<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar suplementos activos de un paciente ───
if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM suplementacion WHERE paciente_id = ? AND activo = 1 ORDER BY id ASC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($r) => [
        'id'         => (int)$r['id'],
        'nombre'     => $r['nombre'],
        'dosis'      => $r['dosis'] ?? '',
        'frecuencia' => $r['frecuencia'] ?? '',
        'razon'      => $r['razon'] ?? '',
    ], $stmt->fetchAll()), JSON_UNESCAPED_UNICODE);
    exit;
}

// ── POST: crear suplemento ────────────────────────────
if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['nombre'])) {
        http_response_code(400); echo json_encode(['error' => 'paciente_id y nombre requeridos']); exit;
    }
    $stmt = $pdo->prepare('INSERT INTO suplementacion (paciente_id, nombre, dosis, frecuencia, razon, activo)
                           VALUES (:pid, :nom, :dos, :frec, :razon, 1)');
    $stmt->execute([
        ':pid'  => $pid,
        ':nom'  => trim($d['nombre']),
        ':dos'  => trim($d['dosis']      ?? ''),
        ':frec' => trim($d['frecuencia'] ?? ''),
        ':razon'=> trim($d['razon']      ?? ''),
    ]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

// ── DELETE: eliminar suplemento ───────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }
    $pdo->prepare('DELETE FROM suplementacion WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
