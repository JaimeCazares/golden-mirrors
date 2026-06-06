<?php
// ══════════════════════════════════════════════════════
// API · Mediciones corporales (cintura, cadera, brazo, muslo)
// GET    ?paciente_id=X   — última medición
// POST   body JSON         — nueva medición
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM mediciones WHERE paciente_id = ? ORDER BY fecha DESC, id DESC LIMIT 1');
    $stmt->execute([$pid]);
    $m = $stmt->fetch();
    echo json_encode($m ? [
        'cintura' => (float)($m['cintura'] ?? 0),
        'cadera'  => (float)($m['cadera']  ?? 0),
        'brazo'   => (float)($m['brazo']   ?? 0),
        'muslo'   => (float)($m['muslo']   ?? 0),
    ] : ['cintura'=>0,'cadera'=>0,'brazo'=>0,'muslo'=>0]);
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['fecha'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos: paciente_id, fecha']); exit;
    }
    // Busca si ya existe medición en esa fecha para actualizar
    $stmt = $pdo->prepare('SELECT id FROM mediciones WHERE paciente_id=? AND fecha=?');
    $stmt->execute([$pid, $d['fecha']]);
    $existing = $stmt->fetch();

    if ($existing) {
        $pdo->prepare('UPDATE mediciones SET cintura=:c, cadera=:ca, brazo=:b, muslo=:m WHERE id=:id')
            ->execute([
                ':c'  => isset($d['cintura']) && $d['cintura'] !== '' ? (float)$d['cintura'] : null,
                ':ca' => isset($d['cadera'])  && $d['cadera']  !== '' ? (float)$d['cadera']  : null,
                ':b'  => isset($d['brazo'])   && $d['brazo']   !== '' ? (float)$d['brazo']   : null,
                ':m'  => isset($d['muslo'])   && $d['muslo']   !== '' ? (float)$d['muslo']   : null,
                ':id' => $existing['id'],
            ]);
        echo json_encode(['ok' => true, 'id' => $existing['id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO mediciones (paciente_id, fecha, cintura, cadera, brazo, muslo)
                               VALUES (:pid,:fecha,:c,:ca,:b,:m)');
        $stmt->execute([
            ':pid'  => $pid,
            ':fecha'=> $d['fecha'],
            ':c'    => isset($d['cintura']) && $d['cintura'] !== '' ? (float)$d['cintura'] : null,
            ':ca'   => isset($d['cadera'])  && $d['cadera']  !== '' ? (float)$d['cadera']  : null,
            ':b'    => isset($d['brazo'])   && $d['brazo']   !== '' ? (float)$d['brazo']   : null,
            ':m'    => isset($d['muslo'])   && $d['muslo']   !== '' ? (float)$d['muslo']   : null,
        ]);
        echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
