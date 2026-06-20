<?php
// ══════════════════════════════════════════════════════
// API · Recetario (compartido entre pacientes)
// GET    → todas las recetas con ingredientes embebidos
// POST   body JSON → crear receta nueva
// DELETE ?id=X      → eliminar receta (solo recetas creadas por el usuario)
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $recetas = $pdo->query("SELECT * FROM recetas ORDER BY categoria, nombre")->fetchAll();

    $stmtIng = $pdo->prepare("
        SELECT ri.alimento_id, ri.cantidad, a.nombre, a.categoria, a.porcion_descripcion AS porcion_desc,
               a.calorias, a.proteina_g AS proteina, a.carbohidratos_g AS carbos,
               a.grasas_g AS grasas, a.fibra_g AS fibra
        FROM receta_ingredientes ri
        JOIN alimentos a ON a.id = ri.alimento_id
        WHERE ri.receta_id = ?
        ORDER BY ri.orden
    ");

    $out = array_map(function ($r) use ($stmtIng) {
        $stmtIng->execute([$r['id']]);
        $ing = array_map(function ($i) {
            return [
                'alimId'      => (int)$i['alimento_id'],
                'label'       => $i['nombre'],
                'categoria'   => $i['categoria'],
                'porcion_desc'=> $i['porcion_desc'],
                'qty'         => (float)$i['cantidad'],
                'calorias'    => (int)$i['calorias'],
                'proteina'    => (float)$i['proteina'],
                'carbos'      => (float)$i['carbos'],
                'grasas'      => (float)$i['grasas'],
                'fibra'       => (float)$i['fibra'],
                'step'        => 0.5, 'min' => 0, 'max' => 10,
            ];
        }, $stmtIng->fetchAll());

        return [
            'id'          => (int)$r['id'],
            'nombre'      => $r['nombre'],
            'emoji'       => $r['emoji'],
            'cat'         => $r['categoria'],
            'desc'        => $r['descripcion'],
            'preparacion' => $r['preparacion'],
            'color'       => $r['color'],
            'border'      => $r['border'],
            'ing'         => $ing,
        ];
    }, $recetas);

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $nombre = trim($d['nombre'] ?? '');
    $cat    = $d['categoria'] ?? '';
    $cats   = ['Desayuno','Colación AM','Comida','Colación PM','Cena'];
    $ings   = $d['ingredientes'] ?? [];

    if (!$nombre || !in_array($cat, $cats, true) || !is_array($ings) || !count($ings)) {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan datos: nombre, categoría e ingredientes son requeridos']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO recetas (nombre, emoji, categoria, descripcion, preparacion, color, border) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([
        $nombre,
        trim($d['emoji'] ?? '') ?: '🍽',
        $cat,
        trim($d['descripcion'] ?? ''),
        trim($d['preparacion'] ?? ''),
        $d['color']  ?? '#f5faf5',
        $d['border'] ?? '#6b9e78',
    ]);
    $recetaId = $pdo->lastInsertId();

    $insIng = $pdo->prepare("INSERT INTO receta_ingredientes (receta_id, alimento_id, cantidad, orden) VALUES (?,?,?,?)");
    $orden = 0;
    foreach ($ings as $ing) {
        $aid = (int)($ing['alimento_id'] ?? 0);
        if (!$aid) continue;
        $insIng->execute([$recetaId, $aid, (float)($ing['cantidad'] ?? 1), $orden++]);
    }

    echo json_encode(['ok' => true, 'id' => $recetaId]);
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }
    $pdo->prepare("DELETE FROM recetas WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
