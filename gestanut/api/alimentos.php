<?php
// ══════════════════════════════════════════════════════
// API · Biblioteca de alimentos + preferencias
// GET  ?paciente_id=X  → todos con flag excluido
// POST { paciente_id, alimento_id, excluido }  → toggle exclusión
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
