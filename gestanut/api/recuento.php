<?php
// ══════════════════════════════════════════════════════
// API · Recuento 24 horas
// GET  ?paciente_id=X   — recuento más reciente
// POST body JSON         — guardar nuevo recuento
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM recuentos_24h WHERE paciente_id = ? ORDER BY fecha_recuento DESC LIMIT 1');
    $stmt->execute([$pid]);
    $rec = $stmt->fetch();
    if (!$rec) { echo json_encode(['fecha'=>'','tiempos'=>[],'agua'=>'','nota'=>'']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM tiempos_comida WHERE recuento_id = ? ORDER BY id ASC');
    $stmt->execute([$rec['id']]);
    $tiempos = array_map(fn($t) => [
        'comida'    => $t['tipo_comida'],
        'hora'      => substr($t['hora'] ?? '', 0, 5),
        'alimentos' => $t['alimentos'] ?? '',
    ], $stmt->fetchAll());
    $p = explode('-', $rec['fecha_recuento']);
    $fecha = (count($p)===3) ? ltrim($p[2],'0') . ' ' . ($meses[$p[1]]??'') . ' ' . $p[0] : $rec['fecha_recuento'];
    echo json_encode(['id'=>(int)$rec['id'], 'fecha'=>$fecha, 'tiempos'=>$tiempos, 'agua'=>$rec['agua']??'', 'nota'=>$rec['nota']??'']);
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid || empty($d['fecha'])) {
        http_response_code(400); echo json_encode(['error'=>'Campos: paciente_id, fecha']); exit;
    }
    $stmt = $pdo->prepare('INSERT INTO recuentos_24h (paciente_id, fecha_recuento, agua, nota)
                           VALUES (:pid, :fecha, :agua, :nota)');
    $stmt->execute([
        ':pid'   => $pid,
        ':fecha' => $d['fecha'],
        ':agua'  => trim($d['agua'] ?? ''),
        ':nota'  => trim($d['nota'] ?? ''),
    ]);
    $recId = $pdo->lastInsertId();
    // Insertar tiempos
    $tiempos = $d['tiempos'] ?? [];
    if ($tiempos) {
        $stmtT = $pdo->prepare('INSERT INTO tiempos_comida (recuento_id, tipo_comida, hora, alimentos)
                                VALUES (:rid, :comida, :hora, :alimentos)');
        foreach ($tiempos as $t) {
            $hora = trim($t['hora'] ?? '');
            if ($hora && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $hora)) $hora = $hora . ':00';
            $stmtT->execute([
                ':rid'       => $recId,
                ':comida'    => trim($t['comida'] ?? ''),
                ':hora'      => $hora ?: null,
                ':alimentos' => trim($t['alimentos'] ?? ''),
            ]);
        }
    }
    echo json_encode(['ok' => true, 'id' => (int)$recId]);
    exit;
}

if ($method === 'PATCH') {
    $id   = (int)($_GET['id']   ?? 0);
    $nota = urldecode($_GET['nota'] ?? '');
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); exit; }
    $pdo->prepare('UPDATE recuentos_24h SET nota=? WHERE id=?')->execute([$nota, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
