<?php
// ══════════════════════════════════════════════════════
// API · Historia clínica
// GET  ?paciente_id=X  — leer
// PUT  body JSON        — crear/actualizar
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM historia_clinica WHERE paciente_id = ?');
    $stmt->execute([$pid]);
    echo json_encode($stmt->fetch() ?: new stdClass());
    exit;
}

if ($method === 'PUT') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error'=>'paciente_id requerido']); exit; }

    $sql = 'INSERT INTO historia_clinica
              (paciente_id, motivo_consulta, antecedentes_patologicos, alergias, intolerancias,
               medicamentos_actuales, cirugias_previas, antecedentes_familiares,
               actividad_fisica, ocupacion, estado_civil, tabaquismo, consumo_alcohol, biografia)
            VALUES (:pid,:motivo,:ant,:aleg,:into,:med,:cir,:fam,:act,:ocu,:ecivil,:tab,:alc,:bio)
            ON DUPLICATE KEY UPDATE
              motivo_consulta=VALUES(motivo_consulta),
              antecedentes_patologicos=VALUES(antecedentes_patologicos),
              alergias=VALUES(alergias),
              intolerancias=VALUES(intolerancias),
              medicamentos_actuales=VALUES(medicamentos_actuales),
              cirugias_previas=VALUES(cirugias_previas),
              antecedentes_familiares=VALUES(antecedentes_familiares),
              actividad_fisica=VALUES(actividad_fisica),
              ocupacion=VALUES(ocupacion),
              estado_civil=VALUES(estado_civil),
              tabaquismo=VALUES(tabaquismo),
              consumo_alcohol=VALUES(consumo_alcohol),
              biografia=VALUES(biografia),
              updated_at=NOW()';

    $tabMap = ['No' => 'nunca', 'nunca' => 'nunca', 'exfumador' => 'exfumador', 'actual' => 'actual'];
    $tab = $tabMap[$d['tabaco'] ?? 'No'] ?? 'nunca';

    $pdo->prepare($sql)->execute([
        ':pid'    => $pid,
        ':motivo' => trim($d['motivo']        ?? ''),
        ':ant'    => trim($d['antecedentes']   ?? ''),
        ':aleg'   => trim($d['alergias']       ?? ''),
        ':into'   => trim($d['intolerancias']  ?? ''),
        ':med'    => trim($d['medicamentos']   ?? ''),
        ':cir'    => trim($d['cirugias']       ?? ''),
        ':fam'    => trim($d['patFam']         ?? ''),
        ':act'    => trim($d['actFisica']      ?? ''),
        ':ocu'    => trim($d['ocupacion']      ?? ''),
        ':ecivil' => trim($d['estadoCivil']    ?? ''),
        ':tab'    => $tab,
        ':alc'    => trim($d['alcohol']        ?? ''),
        ':bio'    => trim($d['bio']            ?? ''),
    ]);

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
