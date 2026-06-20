<?php
// ══════════════════════════════════════════════════════
// API · Plan nutricional
// GET  ?paciente_id=X   — plan activo + alimentos seleccionados
// PUT  body JSON         — crear/actualizar plan activo
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $pid = (int)($_GET['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }

    $stmt = $pdo->prepare('SELECT * FROM planes_nutricionales WHERE paciente_id = ? AND activo = 1 ORDER BY id DESC LIMIT 1');
    $stmt->execute([$pid]);
    $plan = $stmt->fetch();

    $seleccion = [];
    if ($plan) {
        $stmt = $pdo->prepare("
            SELECT pas.alimento_id, pas.tiempo_comida AS tiempo, pas.dia_semana AS dia, pas.porciones,
                   pas.receta_id, r.nombre AS receta_nombre, r.preparacion,
                   a.nombre, a.categoria, a.porcion_descripcion AS porcion_desc,
                   a.calorias, a.proteina_g AS proteina, a.carbohidratos_g AS carbos,
                   a.grasas_g AS grasas, a.fibra_g AS fibra
            FROM plan_alimentos_seleccionados pas
            JOIN alimentos a ON a.id = pas.alimento_id
            LEFT JOIN recetas r ON r.id = pas.receta_id
            WHERE pas.plan_id = ?
            ORDER BY FIELD(pas.dia_semana,'lunes','martes','miercoles','jueves','viernes','sabado','domingo'),
                     FIELD(pas.tiempo_comida,'desayuno','colacion_am','comida','colacion_pm','cena'), a.nombre
        ");
        $stmt->execute([$plan['id']]);
        $seleccion = array_map(function ($r) {
            return [
                'alimento_id'   => (int)$r['alimento_id'],
                'tiempo'        => $r['tiempo'],
                'dia'           => $r['dia'],
                'porciones'     => (float)$r['porciones'],
                'receta_id'     => $r['receta_id'] ? (int)$r['receta_id'] : null,
                'receta_nombre' => $r['receta_nombre'],
                'preparacion'   => $r['preparacion'],
                'nombre'        => $r['nombre'],
                'categoria'     => $r['categoria'],
                'porcion_desc'  => $r['porcion_desc'],
                'calorias'      => (int)$r['calorias'],
                'proteina'      => (float)$r['proteina'],
                'carbos'        => (float)$r['carbos'],
                'grasas'        => (float)$r['grasas'],
                'fibra'         => (float)$r['fibra'],
            ];
        }, $stmt->fetchAll());
    }

    echo json_encode([
        'plan'      => $plan ? ($plan['descripcion'] ?? '') : '',
        'actividad' => $plan ? (float)($plan['actividad'] ?? 1.4) : 1.4,
        'seleccion' => $seleccion,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'PUT') {
    $d   = json_decode(file_get_contents('php://input'), true);
    $pid = (int)($d['paciente_id'] ?? 0);
    if (!$pid) { http_response_code(400); echo json_encode(['error' => 'paciente_id requerido']); exit; }

    $pdo->prepare('UPDATE planes_nutricionales SET activo=0 WHERE paciente_id=?')->execute([$pid]);

    $stmt = $pdo->prepare('INSERT INTO planes_nutricionales
        (paciente_id, fecha_creacion, calorias_diarias, proteina_g, carbohidratos_g,
         grasas_g, fibra_g, actividad, descripcion, activo)
        VALUES (:pid,:fecha,:kcal,:prot,:carb,:fat,:fib,:act,:desc,1)');
    $stmt->execute([
        ':pid'  => $pid,
        ':fecha'=> date('Y-m-d'),
        ':kcal' => (int)($d['calorias']  ?? 0),
        ':prot' => (int)($d['proteina']  ?? 0),
        ':carb' => (int)($d['carbos']    ?? 0),
        ':fat'  => (int)($d['grasas']    ?? 0),
        ':fib'  => (int)($d['fibra']     ?? 0),
        ':act'  => (float)($d['actividad'] ?? 1.4),
        ':desc' => trim($d['descripcion'] ?? ''),
    ]);
    $planId = $pdo->lastInsertId();

    if (!empty($d['seleccion']) && is_array($d['seleccion'])) {
        $ins = $pdo->prepare('INSERT INTO plan_alimentos_seleccionados
            (plan_id, alimento_id, tiempo_comida, dia_semana, porciones, receta_id) VALUES (?,?,?,?,?,?)');
        foreach ($d['seleccion'] as $item) {
            $ins->execute([
                $planId,
                (int)$item['alimento_id'],
                $item['tiempo'],
                $item['dia'] ?? 'lunes',
                (float)($item['porciones'] ?? 1.0),
                !empty($item['receta_id']) ? (int)$item['receta_id'] : null,
            ]);
        }
    }

    echo json_encode(['ok' => true, 'plan_id' => $planId]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
