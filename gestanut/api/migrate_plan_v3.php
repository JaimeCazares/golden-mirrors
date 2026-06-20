<?php
// ══════════════════════════════════════════════════════
// MIGRATION · Plan nutricional v3 — semanal + recetario en BD
// Ejecutar UNA vez: http://localhost/golden/gestanut/api/migrate_plan_v3.php
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if (!isset($pdo)) require __DIR__ . '/db.php';

$ops = [];

// 1. dia_semana en plan_alimentos_seleccionados
try {
    $pdo->exec("ALTER TABLE plan_alimentos_seleccionados
        ADD COLUMN dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo')
        NOT NULL DEFAULT 'lunes' AFTER tiempo_comida");
    $ops[] = '✓ ALTER plan_alimentos_seleccionados ADD dia_semana';
} catch (PDOException $e) { $ops[] = '— dia_semana ya existe'; }

// 2. receta_id en plan_alimentos_seleccionados (para enlazar con la receta de origen)
try {
    $pdo->exec("ALTER TABLE plan_alimentos_seleccionados ADD COLUMN receta_id INT UNSIGNED NULL AFTER alimento_id");
    $ops[] = '✓ ALTER plan_alimentos_seleccionados ADD receta_id';
} catch (PDOException $e) { $ops[] = '— receta_id ya existe'; }

// 3. Tabla recetas
$pdo->exec("CREATE TABLE IF NOT EXISTS recetas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  emoji       VARCHAR(10) NOT NULL DEFAULT '🍽',
  categoria   ENUM('Desayuno','Colación AM','Comida','Colación PM','Cena') NOT NULL,
  descripcion VARCHAR(255) NOT NULL DEFAULT '',
  preparacion TEXT,
  color       VARCHAR(20) NOT NULL DEFAULT '#f5f5f5',
  border      VARCHAR(20) NOT NULL DEFAULT '#999999',
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$ops[] = '✓ CREATE TABLE recetas';

// 4. Tabla receta_ingredientes
$pdo->exec("CREATE TABLE IF NOT EXISTS receta_ingredientes (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receta_id   INT UNSIGNED NOT NULL,
  alimento_id INT UNSIGNED NOT NULL,
  cantidad    DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  orden       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (receta_id)   REFERENCES recetas(id) ON DELETE CASCADE,
  FOREIGN KEY (alimento_id) REFERENCES alimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$ops[] = '✓ CREATE TABLE receta_ingredientes';

// 5. FK receta_id -> recetas (después de que la tabla recetas ya existe)
try {
    $pdo->exec("ALTER TABLE plan_alimentos_seleccionados
        ADD CONSTRAINT fk_pas_receta FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE SET NULL");
    $ops[] = '✓ FK plan_alimentos_seleccionados.receta_id -> recetas';
} catch (PDOException $e) { $ops[] = '— FK receta_id ya existe'; }

// 6. Alimentos esenciales que pueden faltar (usados por las recetas semilla)
$esenciales = [
    ['Jamón de pavo', 'Proteína animal', 30, '1 rebanada (30g)', 35,  5.50, 0.80,  1.20, 0.00],
    ['Granola',       'Carbohidrato',    40, '¼ taza',          150, 4.00, 24.00, 5.00, 3.00],
];
$insEsc = $pdo->prepare("
    INSERT INTO alimentos (nombre, categoria, porcion_g, porcion_descripcion, calorias, proteina_g, carbohidratos_g, grasas_g, fibra_g)
    SELECT ?,?,?,?,?,?,?,?,?
    WHERE NOT EXISTS (SELECT 1 FROM alimentos WHERE nombre = ?)
");
foreach ($esenciales as $e) $insEsc->execute(array_merge($e, [$e[0]]));
$ops[] = '✓ Alimentos esenciales verificados (Jamón de pavo, Granola)';

// 7. Seed de recetas (solo si la tabla está vacía)
$count = (int)$pdo->query("SELECT COUNT(*) FROM recetas")->fetchColumn();
if ($count === 0) {
    $recetas = [
        [
            'nombre' => 'Huevo con jamón', 'emoji' => '🍳', 'cat' => 'Desayuno',
            'desc'   => 'Clásico desayuno proteico', 'color' => '#fff8f5', 'border' => '#c4714a',
            'prep'   => "1. Calienta el aceite en un sartén antiadherente a fuego medio.\n2. Agrega el jamón de pavo y dora 1-2 minutos por lado.\n3. Bate los huevos e incorpóralos al sartén; cocina revolviendo suavemente hasta que cuajen.\n4. Sirve caliente.",
            'ing'    => [['Huevo entero',2],['Jamón de pavo',2],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Omelette de queso', 'emoji' => '🍳', 'cat' => 'Desayuno',
            'desc'   => 'Esponjoso y proteico', 'color' => '#fffbf0', 'border' => '#d4a843',
            'prep'   => "1. Bate los huevos con una pizca de sal.\n2. Calienta el aceite en un sartén a fuego medio-bajo y vierte el huevo batido.\n3. Cuando los bordes cuajen, agrega el queso de un lado y dobla el omelette por la mitad.\n4. Cocina 1 minuto más y sirve.",
            'ing'    => [['Huevo entero',3],['Queso Oaxaca',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Avena con fruta', 'emoji' => '🥣', 'cat' => 'Desayuno',
            'desc'   => 'Fibra + energía sostenida', 'color' => '#f0f7ff', 'border' => '#5b8fb0',
            'prep'   => "1. Cuece la avena con agua o leche a fuego medio durante 5 minutos, moviendo ocasionalmente.\n2. Retira del fuego y deja reposar 2 minutos.\n3. Sirve en un tazón y corona con el plátano rebanado.\n4. Agrega la leche restante encima al gusto.",
            'ing'    => [['Avena',1],['Plátano',1],['Leche descremada',1]],
        ],
        [
            'nombre' => 'Yogur con granola y fruta', 'emoji' => '🥣', 'cat' => 'Desayuno',
            'desc'   => 'Desayuno fresco y equilibrado', 'color' => '#fff5f8', 'border' => '#e8739a',
            'prep'   => "1. Coloca el yogur griego en un tazón.\n2. Agrega la granola encima.\n3. Corona con las fresas cortadas en mitades.\n4. Sirve de inmediato para mantener la granola crujiente.",
            'ing'    => [['Yogurt griego',1],['Granola',0.5],['Fresa',1]],
        ],
        [
            'nombre' => 'Yogur con granola', 'emoji' => '🥛', 'cat' => 'Colación AM',
            'desc'   => 'Alto en proteína, snack ideal', 'color' => '#fff5f8', 'border' => '#e8739a',
            'prep'   => "1. Sirve el yogur griego en un vaso o tazón.\n2. Agrega la granola justo antes de comer para que no se humedezca.\n3. Mezcla ligeramente y disfruta.",
            'ing'    => [['Yogurt griego',1],['Granola',0.5]],
        ],
        [
            'nombre' => 'Licuado proteico', 'emoji' => '🥤', 'cat' => 'Colación AM',
            'desc'   => 'Post entreno / snack energético', 'color' => '#fff8f5', 'border' => '#c4714a',
            'prep'   => "1. Coloca la leche, el plátano y la avena en la licuadora.\n2. Licúa 30-45 segundos hasta obtener una mezcla homogénea.\n3. Sirve frío, de preferencia con hielo.",
            'ing'    => [['Leche descremada',1],['Plátano',1],['Avena',0.5]],
        ],
        [
            'nombre' => 'Fruta con nueces', 'emoji' => '🍎', 'cat' => 'Colación AM',
            'desc'   => 'Energía rápida y grasas saludables', 'color' => '#fffbf0', 'border' => '#d4a843',
            'prep'   => "1. Lava y rebana la manzana.\n2. Sirve junto con las nueces picadas.\n3. Listo para comer, ideal para llevar.",
            'ing'    => [['Manzana',1],['Nuez de Castilla',0.5]],
        ],
        [
            'nombre' => 'Pollo con arroz', 'emoji' => '🍗', 'cat' => 'Comida',
            'desc'   => 'Proteína magra + carbohidrato', 'color' => '#f5faf5', 'border' => '#6b9e78',
            'prep'   => "1. Sazona la pechuga de pollo y cocínala en el aceite a fuego medio 5-6 minutos por lado hasta dorar y cocer por completo.\n2. Cuece el arroz integral según las instrucciones del paquete.\n3. Rebana el pollo y sirve junto con el arroz.",
            'ing'    => [['Pechuga de pollo',1],['Arroz integral',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Atún con arroz y verduras', 'emoji' => '🐟', 'cat' => 'Comida',
            'desc'   => 'Rico en omega-3 y fibra', 'color' => '#f0f7ff', 'border' => '#5b8fb0',
            'prep'   => "1. Cuece el arroz integral.\n2. Escurre el atún y mézclalo con el jitomate picado y el aceite de oliva.\n3. Sirve el atún sobre el arroz caliente.",
            'ing'    => [['Atún en agua',1],['Arroz integral',1],['Jitomate',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Pollo con verduras al vapor', 'emoji' => '🥦', 'cat' => 'Comida',
            'desc'   => 'Ligero, nutritivo y bajo en grasa', 'color' => '#f0fff4', 'border' => '#4a9e6b',
            'prep'   => "1. Cocina la pechuga de pollo a la plancha con un poco de aceite hasta dorar por ambos lados.\n2. Cuece el brócoli y la zanahoria al vapor 6-8 minutos hasta que estén suaves pero firmes.\n3. Sirve el pollo rebanado junto con las verduras y rocía con el aceite restante.",
            'ing'    => [['Pechuga de pollo',1],['Brócoli',1],['Zanahoria',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Fruta con yogur', 'emoji' => '🍓', 'cat' => 'Colación PM',
            'desc'   => 'Snack dulce y proteico', 'color' => '#fff5f8', 'border' => '#e8739a',
            'prep'   => "1. Sirve el yogur griego en un tazón.\n2. Corona con las fresas cortadas en mitades.\n3. Disfruta de inmediato.",
            'ing'    => [['Yogurt griego',1],['Fresa',1]],
        ],
        [
            'nombre' => 'Plátano con almendras', 'emoji' => '🍌', 'cat' => 'Colación PM',
            'desc'   => 'Energía + grasas saludables', 'color' => '#fffbf0', 'border' => '#d4a843',
            'prep'   => "1. Pela y rebana el plátano.\n2. Sirve junto con las almendras.\n3. Ideal como snack rápido entre comidas.",
            'ing'    => [['Plátano',1],['Almendras',0.5]],
        ],
        [
            'nombre' => 'Queso cottage con fruta', 'emoji' => '🧀', 'cat' => 'Colación PM',
            'desc'   => 'Proteína + antioxidantes', 'color' => '#f0f7ff', 'border' => '#5b8fb0',
            'prep'   => "1. Sirve el queso cottage en un tazón.\n2. Corta la manzana en cubos y agrégala encima.\n3. Mezcla ligeramente y sirve frío.",
            'ing'    => [['Queso cottage',1],['Manzana',1]],
        ],
        [
            'nombre' => 'Huevos revueltos con verduras', 'emoji' => '🥚', 'cat' => 'Cena',
            'desc'   => 'Ligero y proteico para la noche', 'color' => '#fff8f5', 'border' => '#c4714a',
            'prep'   => "1. Calienta el aceite en un sartén y sofríe la espinaca y el jitomate picado 2-3 minutos.\n2. Bate los huevos e incorpóralos al sartén.\n3. Revuelve constantemente a fuego medio-bajo hasta que cuajen.\n4. Sirve caliente.",
            'ing'    => [['Huevo entero',2],['Espinaca',1],['Jitomate',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Pechuga a la plancha', 'emoji' => '🍗', 'cat' => 'Cena',
            'desc'   => 'Proteína sin exceso de calorías', 'color' => '#f5faf5', 'border' => '#6b9e78',
            'prep'   => "1. Sazona la pechuga de pollo y cocínala en el aceite a fuego medio 5-6 minutos por lado hasta dorar.\n2. Cuece el brócoli al vapor 5-6 minutos.\n3. Sirve el pollo rebanado junto con el brócoli.",
            'ing'    => [['Pechuga de pollo',1],['Brócoli',1],['Aceite de oliva',1]],
        ],
        [
            'nombre' => 'Sopa de verduras', 'emoji' => '🥣', 'cat' => 'Cena',
            'desc'   => 'Reconfortante y baja en calorías', 'color' => '#f0f7ff', 'border' => '#5b8fb0',
            'prep'   => "1. Corta la calabaza, la zanahoria y la espinaca en trozos pequeños.\n2. Coloca la calabaza y la zanahoria en una olla con agua o caldo de verduras y cocina a fuego medio 12-15 minutos.\n3. Agrega la espinaca los últimos 2 minutos de cocción.\n4. Sazona al gusto y sirve caliente.",
            'ing'    => [['Calabaza',1],['Zanahoria',1],['Espinaca',1]],
        ],
    ];

    $findAlim = $pdo->prepare("SELECT id FROM alimentos WHERE nombre = ? LIMIT 1");
    $insRec   = $pdo->prepare("INSERT INTO recetas (nombre, emoji, categoria, descripcion, preparacion, color, border) VALUES (?,?,?,?,?,?,?)");
    $insIng   = $pdo->prepare("INSERT INTO receta_ingredientes (receta_id, alimento_id, cantidad, orden) VALUES (?,?,?,?)");

    $okRecetas = 0;
    foreach ($recetas as $r) {
        $insRec->execute([$r['nombre'], $r['emoji'], $r['cat'], $r['desc'], $r['prep'], $r['color'], $r['border']]);
        $recetaId = $pdo->lastInsertId();
        $orden = 0;
        foreach ($r['ing'] as [$nombreAlim, $cantidad]) {
            $findAlim->execute([$nombreAlim]);
            $alimId = $findAlim->fetchColumn();
            if (!$alimId) continue;
            $insIng->execute([$recetaId, $alimId, $cantidad, $orden++]);
        }
        $okRecetas++;
    }
    $ops[] = "✓ Seed $okRecetas recetas con preparación";
} else {
    $ops[] = "— Recetas ya existen ($count registros, sin cambios)";
}

echo json_encode(['ok' => true, 'ops' => $ops], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
