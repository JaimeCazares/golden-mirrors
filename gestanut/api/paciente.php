<?php
// ══════════════════════════════════════════════════════
// API · Detalle completo de un paciente (todas las tablas)
// GET api/paciente.php?id=X
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }

$meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
          '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];

function fmtFecha($raw, $meses) {
    if (!$raw) return '';
    $p = explode('-', $raw);
    if (count($p) !== 3) return $raw;
    return ltrim($p[2], '0') . ' ' . ($meses[$p[1]] ?? $p[1]) . ' ' . $p[0];
}

function fmtFechaCorta($raw, $meses) {
    if (!$raw) return '';
    $p = explode('-', $raw);
    if (count($p) !== 3) return $raw;
    return ltrim($p[2], '0') . ' ' . ($meses[$p[1]] ?? $p[1]);
}

// ─── Historia clínica ──────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM historia_clinica WHERE paciente_id = ?');
$stmt->execute([$id]);
$h = $stmt->fetch() ?: [];
$historia = [
    'motivo'       => $h['motivo_consulta']          ?? '',
    'antecedentes' => $h['antecedentes_patologicos'] ?? '',
    'alergias'     => $h['alergias']                 ?? '',
    'intolerancias'=> $h['intolerancias']             ?? '',
    'medicamentos' => $h['medicamentos_actuales']     ?? '',
    'cirugias'     => $h['cirugias_previas']          ?? '',
    'patFam'       => $h['antecedentes_familiares']   ?? '',
    'actFisica'    => $h['actividad_fisica']          ?? '',
    'ocupacion'    => $h['ocupacion']                 ?? '',
    'estadoCivil'  => $h['estado_civil']              ?? '',
    'tabaco'       => $h['tabaquismo']                ?? 'No',
    'alcohol'      => $h['consumo_alcohol']           ?? 'No',
    'bio'          => $h['biografia']                 ?? '',
];

// ─── Consentimiento ────────────────────────────────────
$stmt = $pdo->prepare('SELECT firmado, fecha_firma FROM consentimientos WHERE paciente_id = ?');
$stmt->execute([$id]);
$c = $stmt->fetch() ?: [];
$consentimiento = [
    'firmado' => (bool)($c['firmado'] ?? false),
    'fecha'   => isset($c['fecha_firma']) && $c['fecha_firma'] ? fmtFecha($c['fecha_firma'], $meses) : '',
];

// ─── Laboratorios ──────────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM laboratorios WHERE paciente_id = ? ORDER BY fecha_prueba DESC, id DESC');
$stmt->execute([$id]);
$laboratorio = array_map(function($l) use ($meses) {
    return [
        'id'     => (int)$l['id'],
        'fecha'  => fmtFecha($l['fecha_prueba'] ?? '', $meses),
        'prueba' => $l['prueba'],
        'valor'  => is_numeric($l['valor']) ? (float)$l['valor'] : $l['valor'],
        'rango'  => $l['rango_referencia'] ?? '—',
        'status' => $l['estado'] ?? 'ok',
    ];
}, $stmt->fetchAll());

// ─── Mediciones (historial de peso + medidas corporales) ─
$stmt = $pdo->prepare('SELECT * FROM mediciones WHERE paciente_id = ? ORDER BY fecha ASC, id ASC');
$stmt->execute([$id]);
$meds = $stmt->fetchAll();

$history  = [];
$prevW    = null;
foreach ($meds as $m) {
    $w     = (float)$m['peso'];
    $hora  = isset($m['created_at']) ? substr($m['created_at'], 11, 5) : '';
    $fp    = explode('-', $m['fecha'] ?? '');
    $dateFmt = count($fp) === 3 ? $fp[2].'/'.$fp[1].'/'.$fp[0] : ($m['fecha'] ?? '');
    $entry = ['date' => $dateFmt . ($hora ? ' · ' . $hora : ''), 'weight' => $w, 'dateRaw' => $m['fecha']];
    if ($prevW !== null) {
        $delta = round($w - $prevW, 1);
        if ($delta != 0) $entry['delta'] = $delta;
    }
    if (!empty($m['porcentaje_grasa'])) $entry['grasa']   = (float)$m['porcentaje_grasa'];
    if (!empty($m['nota']))             $entry['note']    = $m['nota'];
    if (!empty($m['sem']))              $entry['sem']     = (int)$m['sem'];
    if (!empty($m['cintura']))          $entry['cintura'] = (float)$m['cintura'];
    if (!empty($m['cadera']))           $entry['cadera']  = (float)$m['cadera'];
    if (!empty($m['brazo']))            $entry['brazo']   = (float)$m['brazo'];
    if (!empty($m['muslo']))            $entry['muslo']   = (float)$m['muslo'];
    $history[] = $entry;
    $prevW = $w;
}

// Última medición corporal
$measures = ['cintura' => 0, 'cadera' => 0, 'brazo' => 0, 'muslo' => 0];
foreach (array_reverse($meds) as $m) {
    foreach (['cintura','cadera','brazo','muslo'] as $k) {
        if (!$measures[$k] && !empty($m[$k])) $measures[$k] = (float)$m[$k];
    }
    if ($measures['cintura'] && $measures['cadera'] && $measures['brazo'] && $measures['muslo']) break;
}

// ─── Notas de consulta ─────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM notas_consulta WHERE paciente_id = ? ORDER BY fecha_consulta DESC, id DESC');
$stmt->execute([$id]);
$notas = array_map(function($n) use ($meses) {
    $fechaFmt = fmtFechaCorta($n['fecha_consulta'], $meses);
    $hora     = substr($n['created_at'] ?? '', 11, 5);
    return [
        'id'        => (int)$n['id'],
        'fecha'     => $n['fecha_consulta'],
        'd'         => $fechaFmt . ($hora ? ' · ' . $hora : ''),
        'texto'     => $n['contenido'] ?? '',
        'bienestar' => $n['nivel_bienestar'] ?? '',
    ];
}, $stmt->fetchAll());

// ─── Plan nutricional activo ───────────────────────────
$stmt = $pdo->prepare('SELECT * FROM planes_nutricionales WHERE paciente_id = ? AND activo = 1 ORDER BY id DESC LIMIT 1');
$stmt->execute([$id]);
$plan = $stmt->fetch();
$planDesc = $plan ? ($plan['descripcion'] ?? '') : '';

// ─── Recuento 24h (más reciente) ──────────────────────
$stmt = $pdo->prepare('SELECT * FROM recuentos_24h WHERE paciente_id = ? ORDER BY fecha_recuento DESC LIMIT 1');
$stmt->execute([$id]);
$rec = $stmt->fetch();
$recuento24 = ['fecha' => '', 'tiempos' => [], 'agua' => '', 'nota' => ''];
if ($rec) {
    $stmt = $pdo->prepare('SELECT * FROM tiempos_comida WHERE recuento_id = ? ORDER BY id ASC');
    $stmt->execute([$rec['id']]);
    $tiempos = array_map(fn($t) => [
        'comida'    => $t['tipo_comida'],
        'hora'      => substr($t['hora'] ?? '', 0, 5),
        'alimentos' => $t['alimentos'] ?? '',
    ], $stmt->fetchAll());
    $recuento24 = [
        'id'      => (int)$rec['id'],
        'fecha'   => fmtFecha($rec['fecha_recuento'], $meses),
        'tiempos' => $tiempos,
        'agua'    => $rec['agua']  ?? '',
        'nota'    => $rec['nota']  ?? '',
    ];
}

// ─── Embarazo ──────────────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM embarazo WHERE paciente_id = ?');
$stmt->execute([$id]);
$emb = $stmt->fetch();
$semGestacion     = $emb ? (int)$emb['semanas_gestacion']  : null;
$dg               = $emb ? (bool)$emb['diabetes_gestacional'] : false;
$prePregWeight    = $emb ? (float)$emb['peso_preembarazo'] : null;

// ─── Lactancia ─────────────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM lactancia WHERE paciente_id = ?');
$stmt->execute([$id]);
$lac = $stmt->fetch();
$hasLactancia = (bool)$lac;
$lactanciaData = null;
if ($lac) {
    $stmt = $pdo->prepare('SELECT sintoma FROM lactancia_sintomas WHERE lactancia_id = ?');
    $stmt->execute([$lac['id']]);
    $sintomas = array_column($stmt->fetchAll(), 'sintoma');
    $stmt = $pdo->prepare('SELECT semana, peso_kg FROM peso_bebe WHERE lactancia_id = ? ORDER BY semana ASC');
    $stmt->execute([$lac['id']]);
    $pesosBebe = array_map(fn($pb) => ['sem' => (int)$pb['semana'], 'kg' => (float)$pb['peso_kg']], $stmt->fetchAll());
    $lactanciaData = [
        'semanas'    => (int)$lac['semanas_lactancia'],
        'produccion' => $lac['produccion'] ?? 'normal',
        'tetadas'    => (int)$lac['tetadas_por_dia'],
        'sintomas'   => $sintomas,
        'pesosBebe'  => $pesosBebe,
    ];
}

// ─── Glucosa ───────────────────────────────────────────
$stmt = $pdo->prepare('SELECT * FROM glucosa_monitoreo WHERE paciente_id = ? ORDER BY fecha DESC');
$stmt->execute([$id]);
$glucosaData = array_map(function($g) use ($meses) {
    return [
        'fecha'       => fmtFechaCorta($g['fecha'], $meses),
        'ayuno'       => (int)($g['ayuno']       ?? 0),
        'pre_comida'  => (int)($g['pre_comida']  ?? 0),
        'post_comida' => (int)($g['post_comida'] ?? 0),
        'pre_cena'    => (int)($g['pre_cena']    ?? 0),
        'post_cena'   => (int)($g['post_cena']   ?? 0),
        'nota'        => $g['nota'] ?? '',
    ];
}, $stmt->fetchAll());

// ─── Suplementación ───────────────────────────────────
$stmt = $pdo->prepare('SELECT id, nombre, dosis, frecuencia, razon FROM suplementacion WHERE paciente_id = ? AND activo = 1 ORDER BY id ASC');
$stmt->execute([$id]);
$suplementacion = array_map(fn($r) => [
    'id'         => (int)$r['id'],
    'nombre'     => $r['nombre'],
    'dosis'      => $r['dosis']      ?? '',
    'frecuencia' => $r['frecuencia'] ?? '',
    'razon'      => $r['razon']      ?? '',
], $stmt->fetchAll());

// ─── Último peso y última visita (de mediciones) ───────
$lastWeight = $history ? end($history)['weight'] : null;
$lastMed    = $history ? end($history) : null;
$ultimaVisitaFmt = $lastMed ? $lastMed['date'] : '—';

echo json_encode([
    'historia'       => $historia,
    'consentimiento' => $consentimiento,
    'laboratorio'    => $laboratorio,
    'history'        => $history,
    'measures'       => $measures,
    'notas'          => $notas,
    'plan'           => $planDesc,
    'recuento24'     => $recuento24,
    'glucosaData'    => $glucosaData,
    'semGestacion'   => $semGestacion,
    'dg'             => $dg,
    'lactancia'      => $hasLactancia,
    'lactanciaData'  => $lactanciaData,
    'prePregWeight'  => $prePregWeight,
    'suplementacion' => $suplementacion,
    'weight'         => $lastWeight,
    'ultimaVisita'   => $ultimaVisitaFmt,
], JSON_UNESCAPED_UNICODE);
