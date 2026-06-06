<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);

    if (!$pid) {
        http_response_code(400);
        echo json_encode(['error' => 'paciente_id requerido']);
        exit;
    }

    $hoy = date('Y-m-d');
    $sql = 'INSERT INTO consentimientos (paciente_id, firmado, fecha_firma)
            VALUES (:pid, 1, :f)
            ON DUPLICATE KEY UPDATE firmado = 1, fecha_firma = :f2';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':pid' => $pid, ':f' => $hoy, ':f2' => $hoy]);

    echo json_encode(['ok' => true, 'fecha' => $hoy]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
