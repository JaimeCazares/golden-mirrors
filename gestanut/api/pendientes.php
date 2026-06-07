<?php
// ══════════════════════════════════════════════════════
// API · Pendientes — Notas y listas personales
// GET    /api/pendientes.php          → listar todos
// POST   /api/pendientes.php          → crear
// PATCH  /api/pendientes.php          → actualizar items de una lista
// DELETE /api/pendientes.php?id=X     → eliminar
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

$pdo->exec("
  CREATE TABLE IF NOT EXISTS pendientes (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo       ENUM('nota','lista') NOT NULL DEFAULT 'nota',
    titulo     VARCHAR(255) NOT NULL DEFAULT '',
    contenido  TEXT,
    color      VARCHAR(20) DEFAULT 'sage',
    items      JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar todos ─────────────────────────────────
if ($method === 'GET') {
    $rows = $pdo->query("SELECT * FROM pendientes ORDER BY created_at DESC")->fetchAll();
    foreach ($rows as &$r) {
        $r['items'] = $r['items'] ? json_decode($r['items'], true) : [];
    }
    echo json_encode($rows);
    exit;
}

// ── POST: crear ───────────────────────────────────────
if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $tipo     = in_array($d['tipo'] ?? '', ['nota','lista']) ? $d['tipo'] : 'nota';
    $titulo   = substr(trim($d['titulo'] ?? ''), 0, 255);
    $contenido = trim($d['contenido'] ?? '');
    $colores  = ['sage','gold','terra','blush','info','cream'];
    $color    = in_array($d['color'] ?? '', $colores) ? $d['color'] : 'sage';
    $items    = json_encode($d['items'] ?? []);

    $stmt = $pdo->prepare("
        INSERT INTO pendientes (tipo, titulo, contenido, color, items)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$tipo, $titulo, $contenido, $color, $items]);
    $newId = (int)$pdo->lastInsertId();

    $stmt2 = $pdo->prepare("SELECT * FROM pendientes WHERE id = ?");
    $stmt2->execute([$newId]);
    $row = $stmt2->fetch();
    $row['items'] = $row['items'] ? json_decode($row['items'], true) : [];
    echo json_encode($row);
    exit;
}

// ── PATCH: actualizar nota o items de lista ───────────
if ($method === 'PATCH') {
    $d  = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }

    if (isset($d['titulo']) || isset($d['contenido']) || isset($d['color'])) {
        $colores  = ['sage','gold','terra','blush','info','cream'];
        $titulo   = substr(trim($d['titulo'] ?? ''), 0, 255);
        $contenido = trim($d['contenido'] ?? '');
        $color    = in_array($d['color'] ?? '', $colores) ? $d['color'] : 'sage';
        $pdo->prepare("UPDATE pendientes SET titulo=?, contenido=?, color=? WHERE id=?")
            ->execute([$titulo, $contenido, $color, $id]);
    } else {
        $items = json_encode($d['items'] ?? []);
        $pdo->prepare("UPDATE pendientes SET items = ? WHERE id = ?")->execute([$items, $id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

// ── DELETE: eliminar ──────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }
    $pdo->prepare("DELETE FROM pendientes WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}
