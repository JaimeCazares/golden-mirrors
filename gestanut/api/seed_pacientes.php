<?php
/**
 * GestaNut · Seed inicial
 * Ejecuta UNA SOLA VEZ desde el navegador:
 *   http://localhost/GESTANUT/GESTANUT/api/seed_pacientes.php
 * Inserta a Diana (usuario) y las 12 pacientes de ejemplo.
 */
require __DIR__ . '/db.php';

header('Content-Type: text/html; charset=utf-8');

$log = [];

// ── 1. Usuario Diana ─────────────────────────────────────────────
$existe = $pdo->query("SELECT id FROM usuarios WHERE id = 1")->fetch();
if (!$existe) {
    $pdo->exec("INSERT INTO usuarios (id, nombre, cedula_profesional, whatsapp, instagram, email, password_hash)
                VALUES (1, 'Diana Zavala', '15304166', '6673056211', '@gestanut',
                        'diana@gestanut.mx', '" . password_hash('gestanut2025', PASSWORD_DEFAULT) . "')");
    $log[] = '✅ Usuario Diana creada (id=1)';
} else {
    $log[] = 'ℹ️ Usuario Diana ya existe, se omite.';
}

// ── 2. Pacientes ─────────────────────────────────────────────────
$pacientes = [
    [1,  'Sofía López',       28, '6671234567', 'materna', 72.3, 1.62, 'presencial', 'Embarazo saludable',        'activa'],
    [2,  'María Rodríguez',   32, '6679876543', 'recomp',  63.1, 1.68, 'presencial', 'Ganancia de músculo',       'activa'],
    [3,  'Andrea González',   24, '6675551234', 'peso',    78.0, 1.60, 'presencial', 'Bajar 8 kg',                'nueva'],
    [4,  'Karla Vega',        30, '6678889999', 'materna', 66.5, 1.65, 'online',     'Lactancia exclusiva',       'activa'],
    [5,  'Isabel Ramos',      31, '6672223333', 'materna', 75.8, 1.69, 'presencial', 'Embarazo saludable',        'activa'],
    [6,  'María José Pérez',  27, '6675556789', 'peso',    81.2, 1.63, 'presencial', 'Bajar 10 kg',               'seguimiento'],
    [7,  'Lucía Castro',      33, '6677778888', 'peso',    84.3, 1.67, 'presencial', 'Bajar 12 kg',               'activa'],
    [8,  'Laura Méndez',      29, '6671112222', 'recomp',  58.4, 1.63, 'presencial', 'Definición corporal',       'activa'],
    [9,  'Elena Torres',      35, '6673334444', 'materna', 70.2, 1.66, 'presencial', 'Embarazo saludable',        'activa'],
    [10, 'Sandra Flores',     38, '6674445555', 'recomp',  61.0, 1.61, 'presencial', 'Recomposición post 40',     'activa'],
    [11, 'Gabriela Morales',  26, '5559998888', 'recomp',  55.2, 1.59, 'online',     'Recomposición deportiva',   'activa'],
    [12, 'Valeria Cruz',      22, '6699998888', 'peso',    67.4, 1.62, 'online',     'Bajar 5 kg',                'activa'],
];

$stmt = $pdo->prepare('INSERT IGNORE INTO pacientes
    (id, usuario_id, nombre, edad, whatsapp, tipo_consulta, peso_actual, altura, modalidad, objetivo_principal, estado)
    VALUES (?,1,?,?,?,?,?,?,?,?,?)');

foreach ($pacientes as $p) {
    $stmt->execute($p);
    if ($stmt->rowCount()) {
        $log[] = "✅ Insertada: {$p[1]}";
    } else {
        $log[] = "ℹ️ Ya existía: {$p[1]}";
    }
}

// ── 3. Consentimientos ───────────────────────────────────────────
$consentimientos = [
    [1,  1, '2025-03-17'],
    [2,  1, '2025-03-01'],
    // paciente 3 (Andrea González) → pendiente, no se inserta
    [4,  1, '2025-03-05'],
    [5,  1, '2025-03-01'],
    [6,  1, '2025-02-15'],
    [7,  1, '2025-02-01'],
    [8,  1, '2025-03-01'],
    [9,  1, '2025-04-10'],
    [10, 1, '2025-02-15'],
    [11, 1, '2025-03-01'],
    [12, 1, '2025-03-15'],
];

$stmtC = $pdo->prepare('INSERT IGNORE INTO consentimientos (paciente_id, firmado, fecha_firma)
                         VALUES (?, ?, ?)');

foreach ($consentimientos as $c) {
    $stmtC->execute($c);
    if ($stmtC->rowCount()) {
        $log[] = "✅ Consentimiento insertado: paciente_id={$c[0]}";
    } else {
        $log[] = "ℹ️ Consentimiento ya existía: paciente_id={$c[0]}";
    }
}

echo '<h2>GestaNut · Seed completado</h2><ul>';
foreach ($log as $l) echo "<li>$l</li>";
echo '</ul>';
echo '<p><strong>Listo.</strong> Ya puedes borrar o proteger este archivo.</p>';
