<?php
// momios/extraer_momios.php — recibe una imagen (captura de momios), la manda a la
// API de Claude con vision y regresa equipos + momios en JSON para precargar el
// formulario de momios.html. No guarda nada en BD: solo extrae, el usuario confirma.

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
    echo json_encode(['error' => 'No se recibió ninguna imagen.']);
    exit;
}

$archivo = $_FILES['imagen'];

// Límite de la API para imágenes: 5 MB por imagen.
if ($archivo['size'] > 5 * 1024 * 1024) {
    echo json_encode(['error' => 'La imagen pesa más de 5 MB.']);
    exit;
}

$mimesPermitidos = [
    'image/jpeg' => 'image/jpeg',
    'image/png'  => 'image/png',
    'image/webp' => 'image/webp',
    'image/gif'  => 'image/gif',
];
$mime = mime_content_type($archivo['tmp_name']);
if (!isset($mimesPermitidos[$mime])) {
    echo json_encode(['error' => 'Formato de imagen no soportado (usa JPG, PNG, WEBP o GIF).']);
    exit;
}

$datosBase64 = base64_encode(file_get_contents($archivo['tmp_name']));

$prompt = <<<TXT
Esta imagen es una captura de pantalla de una casa de apuestas con momios (cuotas)
de fútbol en formato 1X2 (local / empate / visitante), mostrados en formato
americano (con signo + o -, ej. +135, -400).

Primero identifica:
- casa_apuestas: nombre de la casa de apuestas (logo/marca visible en la pantalla, ej. "Codere", "Playdoit"). Si no es reconocible, usa null.

Luego, para cada partido visible extrae:
- equipo_local: nombre del equipo local
- equipo_visitante: nombre del equipo visitante
- momio_local: número EXACTO tal como aparece en pantalla, conservando el signo (ej. -400 o 135). NO conviertas a decimal ni hagas ningún cálculo, solo transcribe el número.
- momio_empate: igual que momio_local, para el empate. Si no aparece (deporte sin empate o no visible), usa null.
- momio_visitante: igual que momio_local, para el visitante.

Ignora badges de boost/promoción (como "+156" en un recuadro verde), etiquetas "EN VIVO"/"SGP" y cualquier otro elemento que no sea el nombre del equipo o el momio 1X2.
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
                    'momio_local'      => ['type' => ['number', 'null']],
                    'momio_empate'     => ['type' => ['number', 'null']],
                    'momio_visitante'  => ['type' => ['number', 'null']],
                ],
                'required' => ['equipo_local', 'equipo_visitante', 'momio_local', 'momio_empate', 'momio_visitante'],
                'additionalProperties' => false,
            ],
        ],
    ],
    'required' => ['partidos'],
    'additionalProperties' => false,
];

$body = [
    'model' => 'claude-opus-5',
    'max_tokens' => 4096,
    'output_config' => [
        'effort' => 'low',
        'format' => [
            'type' => 'json_schema',
            'schema' => $schema,
        ],
    ],
    'messages' => [[
        'role' => 'user',
        'content' => [
            [
                'type' => 'image',
                'source' => [
                    'type' => 'base64',
                    'media_type' => $mime,
                    'data' => $datosBase64,
                ],
            ],
            ['type' => 'text', 'text' => $prompt],
        ],
    ]],
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($body),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT => 45,
]);
$respuesta = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($respuesta === false) {
    echo json_encode(['error' => 'Error de conexión con la API: ' . $curlError]);
    exit;
}

$json = json_decode($respuesta, true);

if ($httpCode !== 200) {
    $msg = $json['error']['message'] ?? 'Error desconocido de la API.';
    echo json_encode(['error' => 'API de Claude: ' . $msg]);
    exit;
}

$textoJson = null;
foreach (($json['content'] ?? []) as $bloque) {
    if (($bloque['type'] ?? '') === 'text') {
        $textoJson = $bloque['text'];
        break;
    }
}

if ($textoJson === null) {
    echo json_encode(['error' => 'La API no devolvió texto extraíble.']);
    exit;
}

$extraido = json_decode($textoJson, true);
if (!is_array($extraido) || !isset($extraido['partidos'])) {
    echo json_encode(['error' => 'No se pudo interpretar la respuesta de la API.']);
    exit;
}

// Se guardan tal cual los transcribe la IA (formato americano, con signo).
// Solo se normaliza el tipo numérico, sin convertir ningún valor.
$partidos = array_map(function ($p) {
    foreach (['momio_local', 'momio_empate', 'momio_visitante'] as $campo) {
        $p[$campo] = isset($p[$campo]) && $p[$campo] !== null ? (float)$p[$campo] : null;
    }
    return $p;
}, $extraido['partidos']);

echo json_encode([
    'status'        => 'ok',
    'casa_apuestas' => $extraido['casa_apuestas'] ?? null,
    'partidos'      => $partidos,
]);
