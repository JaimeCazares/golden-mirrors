<?php
require_once __DIR__ . '/db.php';

$data  = json_decode(file_get_contents('php://input'), true);
$actual = trim($data['actual'] ?? '');
$nueva  = trim($data['nueva']  ?? '');

if (!$actual || !$nueva || strlen($nueva) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM usuarios WHERE id = ?');
$stmt->execute([$_SESSION['usuario_id']]);
$user = $stmt->fetch();

if (!$user || !password_verify($actual, $user['password_hash'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Contraseña actual incorrecta']);
    exit;
}

$hash = password_hash($nueva, PASSWORD_DEFAULT);
$pdo->prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?')
    ->execute([$hash, $_SESSION['usuario_id']]);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true]);
