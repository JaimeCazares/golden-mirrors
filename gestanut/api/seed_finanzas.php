<?php
/**
 * GestaNut · Seed finanzas
 * Ejecuta UNA SOLA VEZ desde el navegador:
 *   http://localhost/GESTANUT/GESTANUT/api/seed_finanzas.php
 * Inserta los 12 movimientos de ejemplo en la tabla finanzas.
 * Requiere que seed_pacientes.php ya haya sido ejecutado.
 */
require __DIR__ . '/db.php';
header('Content-Type: text/html; charset=utf-8');

$log = [];

// Verificar que usuario 1 existe
$existe = $pdo->query("SELECT id FROM usuarios WHERE id = 1")->fetch();
if (!$existe) {
    echo '<p style="color:red"><strong>ERROR:</strong> Primero ejecuta seed_pacientes.php para crear al usuario Diana.</p>';
    exit;
}

// id, fecha, concepto, tipo, monto, pagado, paciente_id
$movimientos = [
    [1,  '2025-05-06', 'Consulta prenatal · Sofia Lopez',      'ingreso', 400, 0, 1 ],
    [2,  '2025-05-06', 'Consulta online · Karla Vega',         'ingreso', 350, 0, 4 ],
    [3,  '2025-05-05', 'Recomposicion · Laura Mendez',         'ingreso', 300, 1, 8 ],
    [4,  '2025-05-05', 'Prenatal · Elena Torres',              'ingreso', 400, 1, 9 ],
    [5,  '2025-05-04', 'Suscripcion Canva Pro',                'gasto',   200, 1, null],
    [6,  '2025-05-03', 'Recomposicion · Maria Rodriguez',      'ingreso', 300, 1, 2 ],
    [7,  '2025-05-03', 'Materiales de consulta',               'gasto',   180, 1, null],
    [8,  '2025-05-02', '1a Consulta · Andrea Gonzalez',        'ingreso', 400, 1, 3 ],
    [9,  '2025-05-01', 'Transporte (Uber)',                    'gasto',   160, 1, null],
    [10, '2025-04-30', 'Online · Valeria Cruz',                'ingreso', 280, 1, 12],
    [11, '2025-04-29', 'Plataforma videollamadas',             'gasto',   240, 1, null],
    [12, '2025-04-28', 'Recomposicion · Sandra Flores',        'ingreso', 300, 1, 10],
];

$stmt = $pdo->prepare(
    'INSERT IGNORE INTO finanzas (id, usuario_id, fecha, concepto, tipo, monto, pagado, paciente_id)
     VALUES (?, 1, ?, ?, ?, ?, ?, ?)'
);

foreach ($movimientos as $m) {
    [$id, $fecha, $concepto, $tipo, $monto, $pagado, $pid] = $m;
    $stmt->execute([$id, $fecha, $concepto, $tipo, $monto, $pagado, $pid]);
    if ($stmt->rowCount()) {
        $log[] = "Insertado: $concepto ($tipo \$$monto)";
    } else {
        $log[] = "Ya existia: $concepto";
    }
}

echo '<h2>GestaNut · Seed Finanzas</h2><ul>';
foreach ($log as $l) echo "<li>$l</li>";
echo '</ul>';
echo '<p><strong>Listo.</strong> Recarga la app y ve a Finanzas para ver los datos desde la BD.</p>';
echo '<p style="color:#888;font-size:12px">Puedes borrar este archivo despues de ejecutarlo.</p>';
