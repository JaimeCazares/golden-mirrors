<?php
// momios/validar_momios.php — segunda pasada de verificación: recibe UNA imagen
// original (la misma que ya se mandó a extraer_momios.php) junto con los partidos
// que un proceso anterior extrajo de ELLA, y le pide a Claude vision que confirme,
// campo por campo, si lo extraído coincide con lo que realmente se ve en la
// imagen. Así se detectan errores de lectura (dígito cambiado, signo invertido,
// equipo mal leído) antes de guardar en BD, sin depender de que el usuario
// compare a ojo la tabla contra la captura original.

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

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No se recibió la imagen a verificar.']);
    exit;
}
if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
    echo json_encode(['error' => 'La imagen pesa más de 5 MB.']);
    exit;
}
$mimesPermitidos = ['image/jpeg' => 1, 'image/png' => 1, 'image/webp' => 1, 'image/gif' => 1];
$mime = @mime_content_type($_FILES['imagen']['tmp_name']);
if (!isset($mimesPermitidos[$mime])) {
    echo json_encode(['error' => 'Formato de imagen no soportado.']);
    exit;
}

$partidos = json_decode($_POST['partidos'] ?? '', true);
if (!is_array($partidos) || !count($partidos)) {
    echo json_encode(['error' => 'No se recibieron partidos a verificar.']);
    exit;
}
if (count($partidos) > 30) {
    echo json_encode(['error' => 'Demasiados partidos para verificar de una imagen.']);
    exit;
}

// Solo se manda lo que se puede leer directamente en la imagen (no fecha_partido,
// que se resuelve por código a partir de día/mes, no es algo que la IA "vea" literal).
$aVerificar = array_map(function ($p) {
    return [
        'equipo_local'     => $p['equipo_local']     ?? null,
        'equipo_visitante' => $p['equipo_visitante'] ?? null,
        'hora_partido'     => $p['hora_partido']     ?? null,
        'momio_local'      => $p['momio_local']      ?? null,
        'momio_empate'     => $p['momio_empate']     ?? null,
        'momio_visitante'  => $p['momio_visitante']  ?? null,
    ];
}, $partidos);

$prompt = <<<TXT
Esta imagen es una captura de pantalla de una casa de apuestas con momios (cuotas) de
fútbol. A continuación hay una lista de partidos que OTRO proceso ya extrajo de esta
MISMA imagen, en el mismo orden en que aparecen en pantalla:

TXT;
$prompt .= json_encode($aVerificar, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$prompt .= <<<TXT


Para cada partido de la lista, en el MISMO ORDEN, revisa contra la imagen si
equipo_local, equipo_visitante, hora_partido, momio_local, momio_empate y
momio_visitante coinciden EXACTAMENTE con lo que se ve ahí (los momios con su signo
+/-, la hora en formato HH:MM de 24 horas).

Si TODO coincide en un partido, responde coincide=true y deja todos los campos de
correcciones en null.
Si algo NO coincide, responde coincide=false y en correcciones pon el valor correcto
tal como aparece en la imagen SOLO para los campos que estén mal (los campos que sí
eran correctos déjalos en null).
No inventes partidos nuevos ni cambies el orden. Si un partido de la lista no lo
encuentras en la imagen, responde coincide=false con todos los campos de
correcciones en null.
TXT;

$schema = [
    'type' => 'object',
    'properties' => [
        'resultados' => [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'properties' => [
                    'coincide' => ['type' => 'boolean'],
                    'correcciones' => [
                        'type' => 'object',
                        'properties' => [
                            'equipo_local'     => ['type' => ['string', 'null']],
                            'equipo_visitante' => ['type' => ['string', 'null']],
                            'hora_partido'     => ['type' => ['string', 'null']],
                            'momio_local'      => ['type' => ['number', 'null']],
                            'momio_empate'     => ['type' => ['number', 'null']],
                            'momio_visitante'  => ['type' => ['number', 'null']],
                        ],
                        'required' => ['equipo_local', 'equipo_visitante', 'hora_partido', 'momio_local', 'momio_empate', 'momio_visitante'],
                        'additionalProperties' => false,
                    ],
                ],
                'required' => ['coincide', 'correcciones'],
                'additionalProperties' => false,
            ],
        ],
    ],
    'required' => ['resultados'],
    'additionalProperties' => false,
];

$base64 = base64_encode(file_get_contents($_FILES['imagen']['tmp_name']));

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
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
    ]),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT => 60,
]);
$respuesta = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($respuesta === false || $respuesta === '') {
    echo json_encode(['error' => 'Error de conexión con la API al verificar.']);
    exit;
}

$json = json_decode($respuesta, true);
if ($httpCode !== 200) {
    $msg = $json['error']['message'] ?? 'error desconocido';
    echo json_encode(['error' => "API de Claude — {$msg}"]);
    exit;
}

$textoJson = null;
foreach (($json['content'] ?? []) as $bloque) {
    if (($bloque['type'] ?? '') === 'text') { $textoJson = $bloque['text']; break; }
}
if ($textoJson === null) {
    echo json_encode(['error' => 'La API no devolvió texto extraíble.']);
    exit;
}

$resultado = json_decode($textoJson, true);
if (!is_array($resultado) || !isset($resultado['resultados'])) {
    echo json_encode(['error' => 'No se pudo interpretar la respuesta de verificación.']);
    exit;
}

echo json_encode(['status' => 'ok', 'resultados' => $resultado['resultados']]);
