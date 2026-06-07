<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar finanzas ──────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        'SELECT f.*, p.nombre AS paciente_nombre
         FROM finanzas f
         LEFT JOIN pacientes p ON p.id = f.paciente_id
         WHERE f.usuario_id = 1
         ORDER BY f.fecha DESC, f.id DESC'
    );
    echo json_encode(array_map('mapFinanza', $stmt->fetchAll()));
    exit;
}

// ── POST: crear movimiento ────────────────────────────────────────
if ($method === 'POST') {
    $d    = json_decode(file_get_contents('php://input'), true);
    $tipo = ($d['tipo'] ?? '') === 'in' ? 'ingreso' : 'gasto';

    $stmt = $pdo->prepare(
        'INSERT INTO finanzas (usuario_id, paciente_id, fecha, concepto, tipo, monto, pagado)
         VALUES (1, :pid, :fecha, :concepto, :tipo, :monto, :pagado)'
    );
    $stmt->execute([
        ':pid'     => !empty($d['paciente_id']) ? (int)$d['paciente_id'] : null,
        ':fecha'   => $d['fecha'],
        ':concepto'=> trim($d['concepto']),
        ':tipo'    => $tipo,
        ':monto'   => (float)$d['monto'],
        ':pagado'  => empty($d['pagado']) ? 0 : 1,
    ]);

    $id   = $pdo->lastInsertId();
    $stmt = $pdo->prepare(
        'SELECT f.*, p.nombre AS paciente_nombre
         FROM finanzas f LEFT JOIN pacientes p ON p.id = f.paciente_id
         WHERE f.id = ?'
    );
    $stmt->execute([$id]);
    echo json_encode(mapFinanza($stmt->fetch()));
    exit;
}

// ── PUT: actualizar pagado ────────────────────────────────────────
if ($method === 'PUT') {
    $d  = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); exit; }

    $pdo->prepare('UPDATE finanzas SET pagado = :p, updated_at = NOW() WHERE id = :id AND usuario_id = 1')
        ->execute([':p' => (int)(bool)$d['pagado'], ':id' => $id]);

    $stmt = $pdo->prepare(
        'SELECT f.*, p.nombre AS paciente_nombre
         FROM finanzas f LEFT JOIN pacientes p ON p.id = f.paciente_id
         WHERE f.id = ?'
    );
    $stmt->execute([$id]);
    echo json_encode(mapFinanza($stmt->fetch()));
    exit;
}

// ── DELETE ────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); exit; }
    $pdo->prepare('DELETE FROM finanzas WHERE id = ? AND usuario_id = 1')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo no permitido']);

// ── Helper ────────────────────────────────────────────────────────
function mapFinanza($r) {
    $meses = [
        '01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
        '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic',
    ];
    $parts    = explode('-', $r['fecha'] ?? date('Y-m-d'));
    $fechaFmt = ltrim($parts[2], '0') . ' ' . ($meses[$parts[1]] ?? $parts[1]);

    return [
        'id'       => (int)$r['id'],
        'fecha'    => $fechaFmt,
        'fechaRaw' => $r['fecha'],
        'concepto' => $r['concepto'],
        'tipo'     => $r['tipo'] === 'ingreso' ? 'in' : 'out',
        'monto'    => (float)$r['monto'],
        'pagado'   => (bool)$r['pagado'],
        'px'       => $r['paciente_nombre'] ?? '',
    ];
}
