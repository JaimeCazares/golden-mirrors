<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

// Ensure archivo_url column exists in consentimientos
try {
    $pdo->exec('ALTER TABLE consentimientos ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(500) NULL');
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar pacientes ──────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query('
        SELECT p.*,
               c.firmado AS con_firmado, c.fecha_firma, c.archivo_url AS con_archivo_url,
               (SELECT CONCAT(DATE_FORMAT(ci.fecha, \'%d %b\'), \' · \', TIME_FORMAT(ci.hora, \'%H:%i\'))
                FROM citas ci
                WHERE ci.paciente_id = p.id AND ci.fecha >= CURDATE()
                ORDER BY ci.fecha ASC, ci.hora ASC
                LIMIT 1) AS proxima_cita
        FROM pacientes p
        LEFT JOIN consentimientos c ON c.paciente_id = p.id
        ORDER BY p.created_at DESC
    ');
    echo json_encode(array_map('mapRow', $stmt->fetchAll()));
    exit;
}

// ── PUT: actualizar datos básicos ─────────────────────────────────
if ($method === 'PUT') {
    $d  = json_decode(file_get_contents('php://input'), true);
    $id = (int)($d['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requerido']); exit; }

    $pdo->prepare('UPDATE pacientes SET edad=?, sexo=?, altura=?, objetivo_principal=?, ultima_visita=NOW() WHERE id=?')
        ->execute([
            isset($d['edad'])   ? (int)$d['edad']      : null,
            $d['sexo']          ?? null,
            isset($d['altura']) ? (float)$d['altura']  : null,
            trim($d['objetivo'] ?? ''),
            $id,
        ]);

    $stmt = $pdo->prepare('SELECT * FROM pacientes WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(mapRow($stmt->fetch()));
    exit;
}

// ── POST: crear paciente ───────────────────────────────────────────
if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $tipoMap = [
        'Materno-infantil' => 'materna',
        'Recomposición'    => 'recomp',
        'Pérdida de peso'  => 'perdida',
        'Control de peso'  => 'peso',
    ];
    $tipo = $tipoMap[$d['tipo_consulta']] ?? 'peso';
    $mod  = strtolower($d['modalidad'] ?? 'presencial');

    $sexo = in_array($d['sexo'] ?? '', ['femenino','masculino']) ? $d['sexo'] : null;

    $sql = 'INSERT INTO pacientes
              (usuario_id, nombre, edad, sexo, whatsapp, tipo_consulta,
               peso_actual, altura, modalidad, objetivo_principal, estado)
            VALUES (1,:nom,:edad,:sexo,:wa,:tipo,:peso,:alt,:mod,:obj,"nueva")';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom'  => trim($d['nombre']),
        ':edad' => isset($d['edad']) ? (int)$d['edad'] : null,
        ':sexo' => $sexo,
        ':wa'   => trim($d['whatsapp']),
        ':tipo' => $tipo,
        ':peso' => (float)($d['peso'] ?? 0),
        ':alt'  => (float)($d['altura'] ?? 0),
        ':mod'  => $mod,
        ':obj'  => trim($d['objetivo'] ?? ''),
    ]);

    $id  = $pdo->lastInsertId();

    $stmt = $pdo->prepare('SELECT * FROM pacientes WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(mapRow($stmt->fetch()));
    exit;
}

// ── DELETE: eliminar paciente ──────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id) {
        $pdo->prepare('DELETE FROM pacientes WHERE id = ?')->execute([$id]);
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'id requerido']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);

// ── Helper ────────────────────────────────────────────────────────
function fmtUltimaVisita($uv) {
    if (!$uv) return '—';
    $meses = ['01'=>'Ene','02'=>'Feb','03'=>'Mar','04'=>'Abr','05'=>'May','06'=>'Jun',
              '07'=>'Jul','08'=>'Ago','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Dic'];
    $parts = explode(' ', $uv);
    $d     = explode('-', $parts[0]);
    $hora  = isset($parts[1]) ? substr($parts[1], 0, 5) : '';
    return ltrim($d[2], '0') . ' ' . ($meses[$d[1]] ?? '') . ' ' . $d[0] . ($hora ? ' · ' . $hora : '');
}

function mapRow($r) {
    $tipos = [
        'materna'  => ['label' => 'Materno-infantil', 'icon' => '🤰', 'badge' => 'b-blush', 'av' => 'av-c3'],
        'recomp'   => ['label' => 'Recomposición',    'icon' => '⚖️',  'badge' => 'b-sage',  'av' => 'av-c1'],
        'perdida'  => ['label' => 'Pérdida de peso',  'icon' => '📉',  'badge' => 'b-terra', 'av' => 'av-c2'],
        'peso'     => ['label' => 'Control de peso',  'icon' => '⚖️',  'badge' => 'b-gold',  'av' => 'av-c2'],
    ];
    $estados = ['nueva' => 'new', 'activa' => 'active', 'seguimiento' => 'follow-up', 'inactiva' => 'inactive'];

    $t    = $tipos[$r['tipo_consulta']] ?? $tipos['peso'];
    $pars = array_filter(explode(' ', trim($r['nombre'])));
    $ini  = strtoupper(mb_substr($pars[0] ?? '', 0, 1) . mb_substr($pars[1] ?? '', 0, 1));

    return [
        'id'           => (int)$r['id'],
        'name'         => $r['nombre'],
        'age'          => $r['edad'] !== null ? (int)$r['edad'] : null,
        'phone'        => $r['whatsapp'],
        'type'         => $r['tipo_consulta'],
        'typeLabel'    => $t['label'],
        'icon'         => $t['icon'],
        'badge'        => $t['badge'],
        'av'           => $t['av'],
        'ini'          => $ini,
        'weight'       => (float)$r['peso_actual'],
        'height'       => (float)$r['altura'],
        'modalidad'    => $r['modalidad'],
        'online'       => $r['modalidad'] === 'online',
        'status'       => $estados[$r['estado']] ?? 'active',
        'goal'         => $r['objetivo_principal'] ?? '',
        'sub'          => $r['modalidad'] === 'online' ? 'Online' : 'Presencial',
        'proxima'      => $r['proxima_cita']  ?? '—',
        'sexo'         => $r['sexo'] ?? null,
        'ultimaVisita' => fmtUltimaVisita($r['ultima_visita'] ?? null),
        'foto'         => $r['foto_perfil']  ?? null,
        'consentimiento' => isset($r['con_firmado']) && $r['con_firmado'] !== null
            ? ['firmado'     => (bool)$r['con_firmado'],
               'fecha'       => $r['fecha_firma'] ? date('d M Y', strtotime($r['fecha_firma'])) : '',
               'archivoUrl'  => $r['con_archivo_url'] ?? null]
            : null,
    ];
}
