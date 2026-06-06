<?php
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['usuario_id'])) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Sesion no iniciada']);
    exit;
}
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
