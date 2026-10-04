<?php
date_default_timezone_set('America/Mazatlan'); // Culiacán, Sinaloa (zona Pacífico, UTC-7, una hora menos que CDMX) — fija "hoy" sin importar la zona horaria del servidor
error_reporting(0);
mysqli_report(MYSQLI_REPORT_OFF); // PHP 8.1+ lanza excepciones por defecto; este archivo asume que query() solo devuelve false en error
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate'); // evita que el navegador sirva un 'listar' viejo después de guardar
include '../conexion.php';

if (!isset($conexion) || $conexion->connect_error) {
    echo json_encode(['error' => 'Sin conexión BD']);
    exit;
}

// Un registro por partido: fecha de captura (automática, hoy) + turno (mañana/tarde,
// cuál de las 2 capturas diarias) + fecha/hora del partido (cuándo se juega, para
// poder armar la evolución de momios desde que sale publicado hasta el día del
// encuentro) + casa de apuestas + equipos + momios 1X2 (formato americano, con signo).
$conexion->query("
    CREATE TABLE IF NOT EXISTS momios_registros (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        fecha            DATE NOT NULL,
        capturado_en     DATETIME NULL,
        turno            ENUM('manana','tarde') NOT NULL,
        fecha_partido    DATE NULL,
        hora_partido     TIME NULL,
        casa_apuestas    VARCHAR(50) NULL,
        equipo_local     VARCHAR(100) NOT NULL,
        equipo_visitante VARCHAR(100) NOT NULL,
        momio_local      DECIMAL(7,2) DEFAULT NULL,
        momio_empate     DECIMAL(7,2) DEFAULT NULL,
        momio_visitante  DECIMAL(7,2) DEFAULT NULL,
        notas            VARCHAR(255) DEFAULT NULL,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_fecha (fecha),
        INDEX idx_fecha_partido (fecha_partido)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// Migración idempotente para instalaciones ya existentes (la tabla pudo haberse
// creado antes de que existieran estas columnas).
function mmAsegurarColumna($conexion, $nombre, $definicion) {
    $res = $conexion->query("SHOW COLUMNS FROM momios_registros LIKE '$nombre'");
    if ($res && $res->num_rows === 0) {
        $conexion->query("ALTER TABLE momios_registros ADD COLUMN $nombre $definicion");
    }
}
mmAsegurarColumna($conexion, 'fecha_partido', 'DATE NULL AFTER turno');
mmAsegurarColumna($conexion, 'hora_partido', 'TIME NULL AFTER fecha_partido');
mmAsegurarColumna($conexion, 'casa_apuestas', 'VARCHAR(50) NULL AFTER hora_partido');
mmAsegurarColumna($conexion, 'capturado_en', 'DATETIME NULL AFTER fecha');

// Catálogo de equipos: unifica el mismo equipo aunque cada casa de apuestas lo
// escriba distinto (ej. "Bodø/Glimt" en Codere vs "FK Bodo Glimt" en Playdoit),
// para que las futuras gráficas/estadísticas no los traten como equipos distintos.
$conexion->query("
    CREATE TABLE IF NOT EXISTS equipos_catalogo (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        nombre_canonico VARCHAR(150) NOT NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$conexion->query("
    CREATE TABLE IF NOT EXISTS equipos_alias (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        equipo_id         INT NOT NULL,
        alias             VARCHAR(150) NOT NULL,
        clave_normalizada VARCHAR(150) NOT NULL,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_clave (clave_normalizada),
        INDEX idx_equipo (equipo_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
mmAsegurarColumna($conexion, 'equipo_local_id', 'INT NULL AFTER equipo_local');
mmAsegurarColumna($conexion, 'equipo_visitante_id', 'INT NULL AFTER equipo_visitante');

// Quita acentos/diacríticos comunes en nombres de equipos europeos. Tabla fija
// en vez de iconv//TRANSLIT: ese se comporta distinto entre Windows (local) y
// Linux (Hostinger), nada determinista entre ambos entornos.
function mmQuitarAcentos($s) {
    static $mapa = [
        'à'=>'a','á'=>'a','â'=>'a','ã'=>'a','ä'=>'a','å'=>'a','ā'=>'a',
        'æ'=>'ae',
        'ç'=>'c','ć'=>'c','č'=>'c',
        'è'=>'e','é'=>'e','ê'=>'e','ë'=>'e','ē'=>'e',
        'ì'=>'i','í'=>'i','î'=>'i','ï'=>'i','ī'=>'i',
        'ñ'=>'n','ń'=>'n',
        'ò'=>'o','ó'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','ø'=>'o','ō'=>'o',
        'ù'=>'u','ú'=>'u','û'=>'u','ü'=>'u','ū'=>'u',
        'ý'=>'y','ÿ'=>'y',
        'ß'=>'ss','š'=>'s','ş'=>'s',
        'ž'=>'z','ğ'=>'g','ı'=>'i','đ'=>'d',
    ];
    return strtr($s, $mapa);
}

function mmPrefijosGenericosClub() {
    // Abreviaturas de "tipo de club" sin valor identificador propio. Nunca incluir
    // aquí palabras que distinguen equipos de la misma ciudad (Real/United/City/...).
    return ['fk','sk','fc','cf','cd','ac','sc','ss','ssc','us','as','rc','sd','ud','cp',
            'afc','sv','vfb','vfl','tsg','sg','bk','if','ik','bsc','ca','cr'];
}

// Separa un nombre en palabras: minúsculas, sin acentos ni puntuación.
function mmTokensCrudos($nombre) {
    $n = mb_strtolower(trim((string)$nombre), 'UTF-8');
    $n = mmQuitarAcentos($n);
    $n = preg_replace('/[^a-z0-9]+/', ' ', $n);
    $n = trim(preg_replace('/\s+/', ' ', $n));
    return $n === '' ? [] : explode(' ', $n);
}

// Igual, pero sin abreviaturas genéricas de club (FK/SK/FC/...).
function mmTokensSinGenericos($nombre) {
    $genericos = mmPrefijosGenericosClub();
    $t = mmTokensCrudos($nombre);
    $f = array_values(array_filter($t, function ($x) use ($genericos) { return !in_array($x, $genericos, true); }));
    return count($f) ? $f : $t; // si se quedó vacío, no quitar nada
}

// Normaliza un nombre de equipo a una clave comparable: sin abreviaturas
// genéricas y con las palabras en orden alfabético (para que el orden en que
// aparecen no importe). Dos nombres con la MISMA clave se consideran el mismo
// equipo automáticamente. Determinista: no se le pide a la IA que "adivine" el
// nombre oficial (ya vimos que es inconsistente para ese tipo de tarea, igual
// que con la conversión de momios).
function mmNormalizarEquipo($nombre) {
    $tokens = mmTokensSinGenericos($nombre);
    if (!count($tokens)) return '';
    sort($tokens);
    return implode('', $tokens);
}

// ¿Es razonable sugerir que A y B son el mismo equipo? (para revisión humana,
// NUNCA para fusionar solo — eso exige clave normalizada idéntica). Dos pasadas:
//  1) Subconjunto de palabras CRUDAS (sin quitar genéricos) — cubre "PSV" dentro
//     de "PSV Eindhoven" sin el riesgo de que "AC Milan" (que se reduce a solo
//     "milan" al quitarle el genérico "AC") parezca subconjunto de "Inter Milan".
//  2) Mismo número de palabras (ya sin genéricos) donde cada una tiene una
//     pareja parecida en el otro nombre (praha~prague) — nunca se compara el
//     nombre completo pegado, así "Manchester United" no sale parecido a
//     "Manchester City" solo por compartir la palabra "Manchester".
// Variantes de nombres de ciudades europeas que cambian de ortografía según el
// idioma de la casa de apuestas (ej. "Praha" vs "Prague"). Lista fija y
// determinista en vez de una comparación difusa genérica: con similar_text()
// a secas, palabras de 5-10 letras sin relación (ej. "Arsenal"/"Barcelona",
// "Lens"/"Nápoles") coinciden por azar en más del 50% de sus letras y
// generaban falsos positivos que fusionarían equipos distintos de verdad.
function mmEquivalenciasConocidas() {
    return [
        'munchen' => 'munich', 'praha' => 'prague', 'moskva' => 'moscow',
        'athina' => 'athens', 'atenas' => 'athens', 'beograd' => 'belgrade',
        'warszawa' => 'warsaw', 'torino' => 'turin', 'roma' => 'rome',
        'firenze' => 'florence', 'napoli' => 'naples', 'napoles' => 'naples',
        'kobenhavn' => 'copenhagen', 'goteborg' => 'gothenburg',
        'brugge' => 'bruges', 'brujas' => 'bruges', 'gent' => 'ghent', 'gand' => 'ghent',
        'sevilla' => 'seville', 'oporto' => 'porto', 'milano' => 'milan',
        'genova' => 'genoa', 'marsella' => 'marseille', 'amberes' => 'antwerp',
    ];
}

function mmPalabrasParecidas($a, $b) {
    if ($a === $b) return true;
    $equivalencias = mmEquivalenciasConocidas();
    if (($equivalencias[$a] ?? $a) === ($equivalencias[$b] ?? $b)) return true;
    $corta = strlen($a) <= strlen($b) ? $a : $b;
    $larga = strlen($a) <= strlen($b) ? $b : $a;
    if (strlen($corta) >= 2 && strpos($larga, $corta) === 0) return true; // prefijo: "sp" -> "sporting"
    return false;
}

function mmSonPosibleDuplicado($nombreA, $nombreB) {
    $crudoA = array_values(array_unique(mmTokensCrudos($nombreA)));
    $crudoB = array_values(array_unique(mmTokensCrudos($nombreB)));
    sort($crudoA); sort($crudoB);
    if (!count($crudoA) || !count($crudoB) || $crudoA === $crudoB) return false; // idénticos: ya se auto-fusionan

    if (!array_diff($crudoA, $crudoB) || !array_diff($crudoB, $crudoA)) return true;

    $tA = mmTokensSinGenericos($nombreA);
    $tB = mmTokensSinGenericos($nombreB);
    if (count($tA) !== count($tB) || !count($tA)) return false;

    $usados = [];
    foreach ($tA as $palabra) {
        $idx = null;
        foreach ($tB as $k => $cand) {
            if (isset($usados[$k])) continue;
            if (mmPalabrasParecidas($palabra, $cand)) { $idx = $k; break; }
        }
        if ($idx === null) return false;
        $usados[$idx] = true;
    }
    return true;
}

// Encuentra o crea el equipo en el catálogo para un nombre crudo. Nunca bloquea
// el guardado: si es una variante nueva, crea un equipo nuevo de inmediato (se
// puede fusionar después vía accion=fusionar_equipos si resulta ser duplicado).
function mmResolverEquipoId($conexion, $nombreCrudo) {
    $nombreCrudo = trim((string)$nombreCrudo);
    if ($nombreCrudo === '') return null;

    $clave = $conexion->real_escape_string(mmNormalizarEquipo($nombreCrudo));
    if ($clave === '') return null;

    $res = $conexion->query("SELECT equipo_id FROM equipos_alias WHERE clave_normalizada = '$clave' LIMIT 1");
    if ($res && $res->num_rows) {
        return (int)$res->fetch_assoc()['equipo_id'];
    }

    $nombreEsc = $conexion->real_escape_string($nombreCrudo);
    if (!$conexion->query("INSERT INTO equipos_catalogo (nombre_canonico) VALUES ('$nombreEsc')")) {
        return null;
    }
    $equipoId = $conexion->insert_id;
    $conexion->query("INSERT IGNORE INTO equipos_alias (equipo_id, alias, clave_normalizada) VALUES ($equipoId, '$nombreEsc', '$clave')");
    return $equipoId;
}

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$accion = $_GET['accion'] ?? $input['accion'] ?? '';

function mmFechaValida($f) {
    return is_string($f) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $f) === 1;
}

function mmHoraValida($h) {
    return is_string($h) && preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $h) === 1;
}

function mmDecimalONull($v) {
    if ($v === null || $v === '') return null;
    return is_numeric($v) ? (float)$v : null;
}

// Arma el INSERT de un registro; regresa true/false. Usada por 'guardar' y 'guardar_lote'.
function mmInsertarRegistro($conexion, $turno, $r) {
    $equipoLocal     = trim($r['equipo_local'] ?? '');
    $equipoVisitante = trim($r['equipo_visitante'] ?? '');
    $fechaPartido    = $r['fecha_partido'] ?? '';

    if (!mmFechaValida($fechaPartido) || $equipoLocal === '' || $equipoVisitante === '') {
        return false;
    }

    $fechaPartido    = $conexion->real_escape_string($fechaPartido);
    $turnoEsc        = $conexion->real_escape_string($turno);
    $equipoLocal     = $conexion->real_escape_string($equipoLocal);
    $equipoVisitante = $conexion->real_escape_string($equipoVisitante);
    $notas           = $conexion->real_escape_string(trim($r['notas'] ?? ''));
    $casaApuestas    = $conexion->real_escape_string(trim($r['casa_apuestas'] ?? ''));

    $horaPartido    = mmHoraValida($r['hora_partido'] ?? '') ? "'" . $conexion->real_escape_string($r['hora_partido']) . "'" : 'NULL';
    $casaApuestasSql = $casaApuestas === '' ? 'NULL' : "'$casaApuestas'";
    $hoy = date('Y-m-d'); // fecha de captura en hora local (no CURDATE(), que usa la zona horaria del servidor MySQL)
    $capturadoEn = date('Y-m-d H:i:s'); // momento exacto de captura, para comparar en qué horario suelen estar mejores los momios

    $momioLocal     = mmDecimalONull($r['momio_local']     ?? null);
    $momioEmpate    = mmDecimalONull($r['momio_empate']    ?? null);
    $momioVisitante = mmDecimalONull($r['momio_visitante'] ?? null);

    $momioLocalSql     = $momioLocal     === null ? 'NULL' : $momioLocal;
    $momioEmpateSql    = $momioEmpate    === null ? 'NULL' : $momioEmpate;
    $momioVisitanteSql = $momioVisitante === null ? 'NULL' : $momioVisitante;

    $equipoLocalId     = mmResolverEquipoId($conexion, $r['equipo_local'] ?? '');
    $equipoVisitanteId = mmResolverEquipoId($conexion, $r['equipo_visitante'] ?? '');
    $equipoLocalIdSql     = $equipoLocalId     === null ? 'NULL' : $equipoLocalId;
    $equipoVisitanteIdSql = $equipoVisitanteId === null ? 'NULL' : $equipoVisitanteId;

    return $conexion->query("
        INSERT INTO momios_registros
            (fecha, capturado_en, turno, fecha_partido, hora_partido, casa_apuestas, equipo_local, equipo_local_id, equipo_visitante, equipo_visitante_id, momio_local, momio_empate, momio_visitante, notas)
        VALUES
            ('$hoy', '$capturadoEn', '$turnoEsc', '$fechaPartido', $horaPartido, $casaApuestasSql, '$equipoLocal', $equipoLocalIdSql, '$equipoVisitante', $equipoVisitanteIdSql, $momioLocalSql, $momioEmpateSql, $momioVisitanteSql, '$notas')
    ");
}

// GET: lista de registros, opcionalmente filtrada por rango de fechas de captura
if ($accion === 'listar') {
    $desde = $_GET['desde'] ?? '';
    $hasta = $_GET['hasta'] ?? '';

    if (mmFechaValida($desde) && mmFechaValida($hasta)) {
        $desde = $conexion->real_escape_string($desde);
        $hasta = $conexion->real_escape_string($hasta);
        $where = "WHERE fecha BETWEEN '$desde' AND '$hasta'";
    } else {
        $where = '';
    }

    $res = $conexion->query("
        SELECT id, fecha, capturado_en, turno, fecha_partido, hora_partido, casa_apuestas,
               equipo_local, equipo_local_id, equipo_visitante, equipo_visitante_id,
               momio_local, momio_empate, momio_visitante, notas
        FROM momios_registros
        $where
        ORDER BY fecha DESC, capturado_en DESC, turno ASC, fecha_partido ASC, hora_partido ASC, id DESC
    ");

    $out = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $row['momio_local']      = $row['momio_local']      !== null ? (float)$row['momio_local']      : null;
        $row['momio_empate']     = $row['momio_empate']     !== null ? (float)$row['momio_empate']     : null;
        $row['momio_visitante']  = $row['momio_visitante']  !== null ? (float)$row['momio_visitante']  : null;
        $out[] = $row;
    }
    echo json_encode($out);
    exit;
}

// Momio americano -> decimal (retorno total por cada 1 unidad apostada).
function mmDecimalDeAmericano($momio) {
    $m = (float)$momio;
    if ($m > 0) return $m / 100 + 1;
    if ($m < 0) return 100 / abs($m) + 1;
    return null;
}

// Color según % de ganancia garantizada al cubrir (ver 'analisis_espejo' abajo).
function mmColorEspejo($pct) {
    if ($pct <= 0)  return 'rojo';
    if ($pct <= 3)  return 'naranja';
    if ($pct <= 7)  return 'amarillo';
    if ($pct <= 15) return 'verde';
    if ($pct <= 25) return 'azul';
    return 'dorado';
}

// GET: para cada partido (mismo equipo local+visitante+fecha, sin importar casa o
// captura — gracias al catálogo de equipos que ya unifica nombres entre casas),
// busca la mejor "apuesta espejo": cubrir el resultado favorito de la PRIMERA
// captura con el momio contrario que, en alguna captura POSTERIOR (misma casa u
// otra), da una ganancia garantizada sin importar cuál de los dos gane. No cubre
// el tercer resultado (ese riesgo queda descubierto) — es la mecánica simple que
// describe "aposté al favorito y se volvió espejo", no arbitraje de los 3 resultados.
if ($accion === 'analisis_espejo') {
    $res = $conexion->query("
        SELECT equipo_local_id, equipo_visitante_id, equipo_local, equipo_visitante,
               fecha_partido, hora_partido, casa_apuestas, capturado_en,
               momio_local, momio_empate, momio_visitante
        FROM momios_registros
        WHERE equipo_local_id IS NOT NULL AND equipo_visitante_id IS NOT NULL
          AND fecha_partido IS NOT NULL AND capturado_en IS NOT NULL
        ORDER BY capturado_en ASC
    ");

    $partidos = [];
    while ($res && ($row = $res->fetch_assoc())) {
        $clave = $row['equipo_local_id'] . '-' . $row['equipo_visitante_id'] . '-' . $row['fecha_partido'];
        if (!isset($partidos[$clave])) {
            $partidos[$clave] = [
                'equipo_local' => $row['equipo_local'],
                'equipo_visitante' => $row['equipo_visitante'],
                'fecha_partido' => $row['fecha_partido'],
                'hora_partido' => $row['hora_partido'],
                'capturas' => [],
            ];
        }
        $partidos[$clave]['capturas'][] = [
            'casa_apuestas' => $row['casa_apuestas'],
            'capturado_en'  => $row['capturado_en'],
            'local'     => $row['momio_local']     !== null ? (float)$row['momio_local']     : null,
            'empate'    => $row['momio_empate']    !== null ? (float)$row['momio_empate']    : null,
            'visitante' => $row['momio_visitante'] !== null ? (float)$row['momio_visitante']  : null,
        ];
    }

    $stake = 100; // monto hipotético fijo, solo para normalizar el % de ganancia
    $out = [];
    foreach ($partidos as $p) {
        $capturas = $p['capturas']; // ya vienen ordenadas por capturado_en ASC
        if (count($capturas) < 2) continue; // necesita al menos 2 momentos para poder "cambiar"

        $primera = $capturas[0];
        $candidatos = array_filter(
            ['local' => $primera['local'], 'empate' => $primera['empate'], 'visitante' => $primera['visitante']],
            fn($v) => $v !== null
        );
        if (count($candidatos) < 2) continue;
        asort($candidatos); // momio más bajo (más negativo = más favorito) primero
        $favorito = array_key_first($candidatos);
        $decimalFavorito = mmDecimalDeAmericano($candidatos[$favorito]);

        $mejorPct = null;
        $mejorDetalle = null;
        for ($i = 1; $i < count($capturas); $i++) {
            foreach (['local', 'empate', 'visitante'] as $resultado) {
                if ($resultado === $favorito) continue;
                $momioCobertura = $capturas[$i][$resultado];
                if ($momioCobertura === null) continue;
                $decimalCobertura = mmDecimalDeAmericano($momioCobertura);
                if (!$decimalCobertura) continue;

                $hedgeStake = ($stake * $decimalFavorito) / $decimalCobertura;
                $retornoGarantizado = $stake * $decimalFavorito; // igual gane el favorito o la cobertura
                $pct = (($retornoGarantizado - ($stake + $hedgeStake)) / $stake) * 100;

                if ($mejorPct === null || $pct > $mejorPct) {
                    $mejorPct = $pct;
                    $mejorDetalle = [
                        'resultado_cobertura'    => $resultado,
                        'momio_cobertura'        => $momioCobertura,
                        'casa_cobertura'         => $capturas[$i]['casa_apuestas'],
                        'capturado_en_cobertura' => $capturas[$i]['capturado_en'],
                    ];
                }
            }
        }
        if ($mejorPct === null) continue;

        $out[] = [
            'equipo_local'             => $p['equipo_local'],
            'equipo_visitante'         => $p['equipo_visitante'],
            'fecha_partido'            => $p['fecha_partido'],
            'hora_partido'             => $p['hora_partido'],
            'resultado_favorito'       => $favorito,
            'momio_favorito'           => $candidatos[$favorito],
            'casa_favorito'            => $primera['casa_apuestas'],
            'capturado_en_favorito'    => $primera['capturado_en'],
            'ganancia_garantizada_pct' => round($mejorPct, 1),
            'color'                    => mmColorEspejo($mejorPct),
            'mejor_cobertura'          => $mejorDetalle,
            'total_capturas'           => count($capturas),
        ];
    }

    usort($out, fn($a, $b) => $b['ganancia_garantizada_pct'] <=> $a['ganancia_garantizada_pct']);

    echo json_encode(['status' => 'ok', 'partidos' => $out]);
    exit;
}

// POST: guardar un nuevo registro de momios (entrada manual)
if ($accion === 'guardar') {
    $turno = $input['turno'] ?? '';
    if (!in_array($turno, ['manana', 'tarde'], true)) {
        echo json_encode(['error' => 'Turno inválido']);
        exit;
    }

    $ok = mmInsertarRegistro($conexion, $turno, $input);

    if (!$ok) {
        echo json_encode(['error' => 'Datos inválidos o error al guardar']);
        exit;
    }
    echo json_encode(['status' => 'ok', 'id' => $conexion->insert_id]);
    exit;
}

// POST: guardar varios registros de un jalón (confirmación masiva tras extraer de imágenes)
if ($accion === 'guardar_lote') {
    $turno     = $input['turno'] ?? '';
    $registros = $input['registros'] ?? [];

    if (!in_array($turno, ['manana', 'tarde'], true) || !is_array($registros) || !count($registros)) {
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $guardados = 0;
    $omitidos  = 0;
    foreach ($registros as $r) {
        if (is_array($r) && mmInsertarRegistro($conexion, $turno, $r)) {
            $guardados++;
        } else {
            $omitidos++;
        }
    }

    echo json_encode(['status' => 'ok', 'guardados' => $guardados, 'omitidos' => $omitidos]);
    exit;
}

// GET: sugiere pares de equipos del catálogo que podrían ser el mismo (nombre
// parecido pero con clave normalizada distinta, ej. abreviaturas no contempladas
// o nombres muy diferentes del mismo club). No fusiona nada automático: solo
// sugiere, el usuario confirma con accion=fusionar_equipos.
if ($accion === 'sugerir_duplicados') {
    $res = $conexion->query("SELECT id, nombre_canonico FROM equipos_catalogo ORDER BY id");
    $equipos = [];
    while ($res && ($row = $res->fetch_assoc())) $equipos[] = $row;

    $sugerencias = [];
    $n = count($equipos);
    for ($i = 0; $i < $n; $i++) {
        for ($j = $i + 1; $j < $n; $j++) {
            if (mmSonPosibleDuplicado($equipos[$i]['nombre_canonico'], $equipos[$j]['nombre_canonico'])) {
                $sugerencias[] = ['equipo_a' => $equipos[$i], 'equipo_b' => $equipos[$j]];
            }
        }
    }
    echo json_encode(['status' => 'ok', 'sugerencias' => array_slice($sugerencias, 0, 30)]);
    exit;
}

// POST: fusiona dos equipos del catálogo en uno solo (confirmado por el usuario).
// Reasigna alias y todos los registros históricos; no se puede deshacer.
if ($accion === 'fusionar_equipos') {
    $mantener = (int)($input['mantener'] ?? 0);
    $eliminar = (int)($input['eliminar'] ?? 0);

    if ($mantener <= 0 || $eliminar <= 0 || $mantener === $eliminar) {
        echo json_encode(['error' => 'IDs inválidos']);
        exit;
    }

    $conexion->query("UPDATE equipos_alias SET equipo_id = $mantener WHERE equipo_id = $eliminar");
    $conexion->query("UPDATE momios_registros SET equipo_local_id = $mantener WHERE equipo_local_id = $eliminar");
    $conexion->query("UPDATE momios_registros SET equipo_visitante_id = $mantener WHERE equipo_visitante_id = $eliminar");
    $conexion->query("DELETE FROM equipos_catalogo WHERE id = $eliminar");

    echo json_encode(['status' => 'ok']);
    exit;
}

// POST: eliminar un registro por id
if ($accion === 'eliminar') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['error' => 'Id inválido']);
        exit;
    }
    $conexion->query("DELETE FROM momios_registros WHERE id = $id");
    echo json_encode(['status' => 'ok']);
    exit;
}

echo json_encode(['error' => 'Acción no reconocida']);
