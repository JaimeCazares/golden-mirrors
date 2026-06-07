<?php
// ══════════════════════════════════════════════════════
// API · Monitoreo de glucosa
// GET  ?paciente_id=X   — listar registros
// POST body JSON         — nuevo registro
// DELETE ?id=X           — eliminar
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

function mapGlucosa($g, $meses) {
    $p = explode('-', $g['fecha'] ?? '');
    $fecha = (count($p)===3) ? ltrim($p[2],'0') . ' ' . ($meses[$p[1]] ?? '') : ($g['fecha']??'');
    return [
        'id'          => (int)$g['id'],
        'fecha'       => $fecha,
        'fechaRaw'    => $g['fecha'],
        'ayuno'       => (int)($g['ayuno']       ?? 0),
        'pre_comida'  => (int)($g['pre_comida']  ?? 0),
        'post_comida' => (int)($g['post_comida'] ?? 0),
        'pre_cena'    => (int)($g['pre_cena']    ?? 0),
        'post_cena'   => (int)($g['post_cena']   ?? 0),
        'nota'        => $g['nota'] ?? '',
    ];
}

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM glucosa_monitoreo WHERE paciente_id = ? ORDER BY fecha DESC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($g) => mapGlucosa($g, $meses), $stmt->fetchAll()));
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['fecha'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos: paciente_id, fecha']); exit;
    }
    $stmt = $pdo->prepare('INSERT INTO glucosa_monitoreo
        (paciente_id, fecha, ayuno, pre_comida, post_comida, pre_cena, post_cena, nota)
        VALUES (:pid,:fecha,:ay,:pre,:post,:prec,:postc,:nota)');
    $stmt->execute([
        ':pid'   => $pid,
        ':fecha' => $d['fecha'],
        ':ay'    => isset($d['ayuno'])       && $d['ayuno']       !== '' ? (int)$d['ayuno']       : null,
        ':pre'   => isset($d['pre_comida'])  && $d['pre_comida']  !== '' ? (int)$d['pre_comida']  : null,
        ':post'  => isset($d['post_comida']) && $d['post_comida'] !== '' ? (int)$d['post_comida'] : null,
        ':prec'  => isset($d['pre_cena'])    && $d['pre_cena']    !== '' ? (int)$d['pre_cena']    : null,
        ':postc' => isset($d['post_cena'])   && $d['post_cena']   !== '' ? (int)$d['post_cena']   : null,
        ':nota'  => trim($d['nota'] ?? ''),
    ]);
    $newId = $pdo->lastInsertId();
    $stmt  = $pdo->prepare('SELECT * FROM glucosa_monitoreo WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode(mapGlucosa($stmt->fetch(), $meses));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
    $pdo->prepare('DELETE FROM glucosa_monitoreo WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
