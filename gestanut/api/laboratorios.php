<?php
// ══════════════════════════════════════════════════════
// API · Laboratorios
// GET    ?paciente_id=X   — listar
// POST   body JSON         — crear
// DELETE ?id=X             — eliminar
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

function mapLab($l, $meses) {
    $fecha = '';
    if (!empty($l['fecha_prueba'])) {
        $p = explode('-', $l['fecha_prueba']);
        if (count($p) === 3) $fecha = ltrim($p[2],'0') . ' ' . ($meses[$p[1]] ?? '') . ' ' . $p[0];
    }
    return [
        'id'     => (int)$l['id'],
        'fecha'  => $fecha,
        'prueba' => $l['prueba'],
        'valor'  => is_numeric($l['valor']) ? (float)$l['valor'] : ($l['valor'] ?? ''),
        'rango'  => $l['rango_referencia'] ?? '—',
        'status' => $l['estado'] ?? 'ok',
    ];
}

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM laboratorios WHERE paciente_id = ? ORDER BY fecha_prueba DESC, id DESC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($l) => mapLab($l, $meses), $stmt->fetchAll()));
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['prueba']) || !isset($d['valor'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos obligatorios: paciente_id, prueba, valor']); exit;
    }
    $stmt = $pdo->prepare('INSERT INTO laboratorios
        (paciente_id, fecha_prueba, prueba, valor, rango_referencia, estado)
        VALUES (:pid, :fecha, :prueba, :valor, :rango, :estado)');
    $stmt->execute([
        ':pid'    => $pid,
        ':fecha'  => $d['fecha'] ?? date('Y-m-d'),
        ':prueba' => trim($d['prueba']),
        ':valor'  => is_numeric($d['valor']) ? (float)$d['valor'] : null,
        ':rango'  => trim($d['rango'] ?? '—'),
        ':estado' => $d['status'] ?? 'ok',
    ]);
    $newId = $pdo->lastInsertId();
    $stmt  = $pdo->prepare('SELECT * FROM laboratorios WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode(mapLab($stmt->fetch(), $meses));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
    $pdo->prepare('DELETE FROM laboratorios WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
