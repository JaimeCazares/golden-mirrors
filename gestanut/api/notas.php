<?php
// ══════════════════════════════════════════════════════
// API · Notas de consulta
// GET    ?paciente_id=X   — listar
// POST   body JSON         — crear
// DELETE ?id=X             — eliminar
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

function mapNota($n, $meses) {
    $p = explode('-', $n['fecha_consulta'] ?? date('Y-m-d'));
    $fechaFmt = (count($p)===3) ? ltrim($p[2],'0') . ' ' . ($meses[$p[1]] ?? '') : '';
    $hora = substr($n['created_at'] ?? '', 11, 5);
    return [
        'id'        => (int)$n['id'],
        'fecha'     => $n['fecha_consulta'],
        'd'         => $fechaFmt . ($hora ? ' · ' . $hora : ''),
        'texto'     => $n['contenido'] ?? '',
        'bienestar' => $n['nivel_bienestar'] ?? '',
    ];
}

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM notas_consulta WHERE paciente_id = ? ORDER BY fecha_consulta DESC, id DESC');
    $stmt->execute([$pid]);
    echo json_encode(array_map(fn($n) => mapNota($n, $meses), $stmt->fetchAll()));
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['contenido'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos: paciente_id, contenido']); exit;
    }
    $bienMap = ['muy_mal'=>'muy_mal','mal'=>'mal','neutral'=>'neutral','bien'=>'bien','muy_bien'=>'muy_bien'];
    $bien = $bienMap[$d['bienestar'] ?? ''] ?? null;
    $stmt = $pdo->prepare('INSERT INTO notas_consulta (paciente_id, fecha_consulta, contenido, nivel_bienestar)
                           VALUES (:pid, :fecha, :contenido, :bien)');
    $stmt->execute([
        ':pid'       => $pid,
        ':fecha'     => $d['fecha'] ?? date('Y-m-d'),
        ':contenido' => trim($d['contenido']),
        ':bien'      => $bien,
    ]);
    $newId = $pdo->lastInsertId();
    $stmt  = $pdo->prepare('SELECT * FROM notas_consulta WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode(mapNota($stmt->fetch(), $meses));
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
    $pdo->prepare('DELETE FROM notas_consulta WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
