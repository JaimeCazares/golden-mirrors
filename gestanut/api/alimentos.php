<?php
// ══════════════════════════════════════════════════════
// API · Biblioteca de alimentos + preferencias
// GET  ?paciente_id=X  → todos con flag excluido
// POST { paciente_id, alimento_id, excluido }  → toggle exclusión
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Insertar alimentos esenciales que pueden faltar en la BD
    $esenciales = [
        ['Jamón de pavo',  'Proteína animal', 30, '1 rebanada (30g)', 35, 5.5, 0.8, 1.2, 0.0],
        ['Jamón de cerdo', 'Proteína animal', 30, '1 rebanada (30g)', 45, 5.0, 1.0, 2.5, 0.0],
    ];
    $ins = $pdo->prepare("
        INSERT INTO alimentos (nombre, categoria, porcion_g, porcion_descripcion, calorias, proteina_g, carbohidratos_g, grasas_g, fibra_g)
        SELECT ?,?,?,?,?,?,?,?,?
        WHERE NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = ?)
    ");
    foreach ($esenciales as $e) $ins->execute(array_merge($e, [$e[0]]));

    $pid = (int)($_GET['paciente_id'] ?? 0);

    if ($pid) {
        $stmt = $pdo->prepare("
            SELECT a.*, COALESCE(pa.excluido, 0) AS excluido
            FROM alimentos a
            LEFT JOIN preferencias_alimentos pa
                   ON pa.alimento_id = a.id AND pa.paciente_id = ?
            ORDER BY a.categoria, a.nombre
        ");
        $stmt->execute([$pid]);
    } else {
        $stmt = $pdo->query("SELECT *, 0 AS excluido FROM alimentos ORDER BY categoria, nombre");
    }

    echo json_encode(array_map(function ($r) {
        return [
            'id'          => (int)$r['id'],
            'nombre'      => $r['nombre'],
            'categoria'   => $r['categoria'],
            'porcion_g'   => (int)$r['porcion_g'],
            'porcion_desc'=> $r['porcion_descripcion'],
            'calorias'    => (int)$r['calorias'],
            'proteina'    => (float)$r['proteina_g'],
            'carbos'      => (float)$r['carbohidratos_g'],
            'grasas'      => (float)$r['grasas_g'],
            'fibra'       => (float)$r['fibra_g'],
            'excluido'    => (bool)$r['excluido'],
        ];
    }, $stmt->fetchAll()), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    $aid = (int)($d['alimento_id'] ?? 0);
    $exc = (int)(bool)($d['excluido'] ?? true);

    if (!$pid || !$aid) {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan parámetros']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO preferencias_alimentos (paciente_id, alimento_id, excluido)
        VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE excluido = VALUES(excluido)
    ");
    $stmt->execute([$pid, $aid, $exc]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
