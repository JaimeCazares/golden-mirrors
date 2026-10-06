<?php
// momios/extraer_momios.php — recibe una o varias imágenes (capturas de momios de
// distintas casas de apuestas), las manda EN PARALELO a la API de Claude con vision
// y regresa equipos + momios + fecha/hora del partido + casa, ya combinados en una
// sola lista, para que el usuario los revise y confirme de un jalón en momios.html.
// No guarda nada en BD aquí: solo extrae: api_momios.php (accion=guardar_lote) guarda.

error_reporting(0);
header('Content-Type: application/json');

$configPath = __DIR__ . '/../claude.config.local.php';
if (!file_exists($configPath)) {
    echo json_encode(['error' => 'Falta configurar la clave de API (claude.config.local.php).']);
    exit;
}
$apiKey = (require $configPath)['anthropic_api_key'] ?? '';
if ($apiKey === '') {
    echo json_encode(['error' => 'Clave de API vacía en claude.config.local.php.']);
    exit;
}

// $_FILES['imagenes'] llega como arreglo (input multiple) — normalizamos también
// el caso de una sola imagen por si el campo llegara como 'imagen' suelto.
$archivos = [];
if (isset($_FILES['imagenes']) && is_array($_FILES['imagenes']['tmp_name'] ?? null)) {
    foreach ($_FILES['imagenes']['tmp_name'] as $i => $tmp) {
        if (($_FILES['imagenes']['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $archivos[] = [
                'nombre'   => $_FILES['imagenes']['name'][$i] ?? ('imagen_' . ($i + 1)),
                'tmp_name' => $tmp,
                'size'     => $_FILES['imagenes']['size'][$i] ?? 0,
            ];
        }
    }
} elseif (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $archivos[] = ['nombre' => $_FILES['imagen']['name'], 'tmp_name' => $_FILES['imagen']['tmp_name'], 'size' => $_FILES['imagen']['size']];
}

if (!count($archivos)) {
    echo json_encode(['error' => 'No se recibió ninguna imagen.']);
    exit;
}
if (count($archivos) > 15) {
    echo json_encode(['error' => 'Máximo 15 imágenes por carga.']);
    exit;
}

$mimesPermitidos = ['image/jpeg' => 1, 'image/png' => 1, 'image/webp' => 1, 'image/gif' => 1];

$prompt = <<<TXT
Esta imagen es una captura de pantalla de una casa de apuestas con momios (cuotas)
de fútbol en formato 1X2 (local / empate / visitante), mostrados en formato
americano (con signo + o -, ej. +135, -400).

Primero identifica:
- casa_apuestas: nombre de la casa de apuestas (logo/marca visible en la pantalla, ej. "Codere", "Playdoit", "BetVIP", "Draftea"). Si no es reconocible, usa null.

Luego, para cada partido visible extrae:
- equipo_local: nombre del equipo local
- equipo_visitante: nombre del equipo visitante
- dia_partido: día del mes en que se juega (entero 1-31), tal como aparece en la fecha del partido (ej. "14 Oct" -> 14, "13/10" -> 13).
- mes_partido: mes en que se juega (entero 1-12), tal como aparece (ej. "14 Oct" -> 10).
- hora_partido: hora del partido tal como aparece, en formato "HH:MM" de 24 horas (ej. "09:45", "12:00"). Si no es visible, usa null.
- momio_local: número EXACTO tal como aparece en pantalla, conservando el signo (ej. -400 o 135). NO conviertas a decimal ni hagas ningún cálculo, solo transcribe el número.
- momio_empate: igual que momio_local, para el empate. Si no aparece (deporte sin empate o no visible), usa null.
- momio_visitante: igual que momio_local, para el visitante.

Ignora badges de boost/promoción (como "+156" en un recuadro verde), etiquetas "EN VIVO"/"SGP" y cualquier otro elemento que no sea el nombre del equipo, la fecha/hora o el momio 1X2.
Si algún dato no es legible o no aparece, usa null en ese campo. No inventes datos.
Responde solo con los partidos que realmente veas en la imagen.
TXT;

$schema = [
    'type' => 'object',
    'properties' => [
        'casa_apuestas' => ['type' => ['string', 'null']],
        'partidos' => [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'equipo_local'     => ['type' => 'string'],
                    'equipo_visitante' => ['type' => 'string'],
                    'dia_partido'      => ['type' => ['integer', 'null']],
                    'mes_partido'      => ['type' => ['integer', 'null']],
                    'hora_partido'     => ['type' => ['string', 'null']],
                    'momio_local'      => ['type' => ['number', 'null']],
                    'momio_empate'     => ['type' => ['number', 'null']],
                    'momio_visitante'  => ['type' => ['number', 'null']],
                ],
                'required' => ['equipo_local', 'equipo_visitante', 'dia_partido', 'mes_partido', 'hora_partido', 'momio_local', 'momio_empate', 'momio_visitante'],
                'additionalProperties' => false,
            ],
        ],
    ],
    'required' => ['partidos'],
    'additionalProperties' => false,
];

function mmCuerpoPeticion($mime, $base64, $prompt, $schema) {
    return json_encode([
        'model' => 'claude-opus-5',
        'max_tokens' => 4096,
        'output_config' => [
            'effort' => 'low',
            'format' => ['type' => 'json_schema', 'schema' => $schema],
        ],
        'messages' => [[
            'role' => 'user',
            'content' => [
                ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => $base64]],
                ['type' => 'text', 'text' => $prompt],
            ],
        ]],
    ]);
}

// Resuelve día/mes (sin año, tal como se ve en pantalla) a una fecha ISO real,
// asumiendo el año actual salvo que esa fecha ya haya quedado muy atrás (en cuyo
// caso es del año que entra). Se hace aquí, determinista, no en la IA.
function mmResolverFechaPartido($dia, $mes) {
    $dia = (int)$dia;
    $mes = (int)$mes;
    if ($dia < 1 || $dia > 31 || $mes < 1 || $mes > 12) return null;

    $anio = (int)date('Y');
    $ts = mktime(0, 0, 0, $mes, $dia, $anio);
    if ($ts !== false && $ts < strtotime('-30 days')) {
        $ts = mktime(0, 0, 0, $mes, $dia, $anio + 1);
    }
    return $ts !== false ? date('Y-m-d', $ts) : null;
}

function mmNormalizarHora($h) {
    if (is_string($h) && preg_match('/^(\d{1,2}):(\d{2})$/', trim($h), $m)) {
        $hh = (int)$m[1];
        $mm = (int)$m[2];
        if ($hh >= 0 && $hh <= 23 && $mm >= 0 && $mm <= 59) {
            return sprintf('%02d:%02d', $hh, $mm);
        }
    }
    return null;
}

// ── Preparar y lanzar todas las peticiones en paralelo ──
$mh = curl_multi_init();
$handles = [];
$errores = [];

foreach ($archivos as $i => $archivo) {
    if ($archivo['size'] > 5 * 1024 * 1024) {
        $errores[] = "{$archivo['nombre']}: pesa más de 5 MB.";
        continue;
    }
    $mime = @mime_content_type($archivo['tmp_name']);
    if (!isset($mimesPermitidos[$mime])) {
        $errores[] = "{$archivo['nombre']}: formato no soportado (usa JPG, PNG, WEBP o GIF).";
        continue;
    }
    $base64 = base64_encode(file_get_contents($archivo['tmp_name']));

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => mmCuerpoPeticion($mime, $base64, $prompt, $schema),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_TIMEOUT => 60,
    ]);
    curl_multi_add_handle($mh, $ch);
    $handles[$i] = ['ch' => $ch, 'nombre' => $archivo['nombre']];
}

if (count($handles)) {
    $activos = null;
    do {
        $estado = curl_multi_exec($mh, $activos);
        if ($activos) curl_multi_select($mh);
    } while ($activos && $estado === CURLM_OK);
}

// ── Recolectar y combinar resultados de cada imagen ──
$partidosCombinados = [];
$casasDetectadas = [];

foreach ($handles as $i => $h) {
    $ch = $h['ch'];
    $respuesta = curl_multi_getcontent($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);

    if ($respuesta === false || $respuesta === '') {
        $errores[] = "{$h['nombre']}: error de conexión con la API.";
        continue;
    }

    $json = json_decode($respuesta, true);
    if ($httpCode !== 200) {
        $msg = $json['error']['message'] ?? 'error desconocido';
        $errores[] = "{$h['nombre']}: API de Claude — {$msg}";
        continue;
    }

    $textoJson = null;
    foreach (($json['content'] ?? []) as $bloque) {
        if (($bloque['type'] ?? '') === 'text') { $textoJson = $bloque['text']; break; }
    }
    if ($textoJson === null) {
        $errores[] = "{$h['nombre']}: la API no devolvió texto extraíble.";
        continue;
    }

    $extraido = json_decode($textoJson, true);
    if (!is_array($extraido) || !isset($extraido['partidos'])) {
        $errores[] = "{$h['nombre']}: no se pudo interpretar la respuesta de la API.";
        continue;
    }

    $casa = $extraido['casa_apuestas'] ?? null;
    if ($casa) $casasDetectadas[] = $casa;

    foreach ($extraido['partidos'] as $p) {
        foreach (['momio_local', 'momio_empate', 'momio_visitante'] as $campo) {
            $p[$campo] = isset($p[$campo]) && $p[$campo] !== null ? (float)$p[$campo] : null;
        }
        $p['casa_apuestas'] = $casa;
        $p['fecha_partido'] = mmResolverFechaPartido($p['dia_partido'] ?? null, $p['mes_partido'] ?? null);
        $p['hora_partido']  = mmNormalizarHora($p['hora_partido'] ?? null);
        unset($p['dia_partido'], $p['mes_partido']);
        $p['_img'] = $i; // índice de la imagen de origen (en el mismo orden en que se subieron), para poder re-verificar cada partido contra su imagen después
        $partidosCombinados[] = $p;
    }
}
curl_multi_close($mh);

if (!count($partidosCombinados) && count($errores)) {
    echo json_encode(['error' => implode(' | ', $errores)]);
    exit;
}

echo json_encode([
    'status'   => 'ok',
    'partidos' => $partidosCombinados,
    'errores'  => $errores,
]);
