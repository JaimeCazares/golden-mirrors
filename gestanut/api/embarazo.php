<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d  = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['paciente_id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }

    $sem = isset($d['semanas_gestacion']) && $d['semanas_gestacion'] !== '' ? (int)$d['semanas_gestacion'] : null;
    $pre = isset($d['peso_preembarazo'])  && $d['peso_preembarazo']  !== '' ? (float)$d['peso_preembarazo']  : null;
    $dg  = !empty($d['diabetes_gestacional']) ? 1 : 0;

    $stmt = $pdo->prepare('SELECT id FROM embarazo WHERE paciente_id = ?');
    $stmt->execute([$id]);
    if ($stmt->fetch()) {
        $pdo->prepare('UPDATE embarazo SET semanas_gestacion=?, peso_preembarazo=?, diabetes_gestacional=? WHERE paciente_id=?')
            ->execute([$sem, $pre, $dg, $id]);
    } else {
        $pdo->prepare('INSERT INTO embarazo (paciente_id, semanas_gestacion, peso_preembarazo, diabetes_gestacional) VALUES (?,?,?,?)')
            ->execute([$id, $sem, $pre, $dg]);
    }

    echo json_encode(['ok' => true, 'semanas_gestacion' => $sem, 'peso_preembarazo' => $pre, 'diabetes_gestacional' => (bool)$dg]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
