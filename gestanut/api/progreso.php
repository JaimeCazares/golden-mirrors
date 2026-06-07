<?php
// ══════════════════════════════════════════════════════
// API · Progreso de peso  (tabla mediciones)
// GET    ?paciente_id=X   — historial
// POST   body JSON         — nuevo registro
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM mediciones WHERE paciente_id = ? ORDER BY fecha ASC, id ASC');
    $stmt->execute([$pid]);
    $rows  = $stmt->fetchAll();
    $result = [];
    $prevW  = null;
    foreach ($rows as $m) {
        $w = (float)$m['peso'];
        $p = explode('-', $m['fecha']);
        $dateStr = ltrim($p[2],'0') . ' ' . ($meses[$p[1]] ?? '');
        $entry = ['id' => (int)$m['id'], 'date' => $dateStr, 'weight' => $w, 'dateRaw' => $m['fecha']];
        if ($prevW !== null) {
            $delta = round($w - $prevW, 1);
            if ($delta != 0) $entry['delta'] = $delta;
        }
        if (!empty($m['porcentaje_grasa'])) $entry['grasa'] = (float)$m['porcentaje_grasa'];
        if (!empty($m['nota']))             $entry['note']  = $m['nota'];
        if (!empty($m['sem']))              $entry['sem']   = (int)$m['sem'];
        $result[] = $entry;
        $prevW = $w;
    }
    echo json_encode($result);
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['fecha']) || !isset($d['peso'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos: paciente_id, fecha, peso']); exit;
    }
    $stmt = $pdo->prepare('INSERT INTO mediciones (paciente_id, fecha, peso, porcentaje_grasa, nota, sem, imc)
                           VALUES (:pid, :fecha, :peso, :grasa, :nota, :sem, :imc)');
    $stmt->execute([
        ':pid'   => $pid,
        ':fecha' => $d['fecha'],
        ':peso'  => (float)$d['peso'],
        ':grasa' => isset($d['grasa']) && $d['grasa'] !== '' ? (float)$d['grasa'] : null,
        ':nota'  => trim($d['nota'] ?? ''),
        ':sem'   => isset($d['sem']) && $d['sem'] !== '' ? (int)$d['sem'] : null,
        ':imc'   => isset($d['altura']) && $d['altura'] ? round((float)$d['peso'] / ((float)$d['altura'] ** 2), 1) : null,
    ]);
    // Actualizar peso_actual en pacientes
    $pdo->prepare('UPDATE pacientes SET peso_actual = :p, updated_at = NOW() WHERE id = :id')
        ->execute([':p' => (float)$d['peso'], ':id' => $pid]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
