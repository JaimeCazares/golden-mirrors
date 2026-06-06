<?php
// ══════════════════════════════════════════════════════
// MIGRATION · Plan nutricional v2
// Ejecutar UNA vez: http://localhost/GESTANUT/api/migrate_plan.php
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

$ops = [];

// 0. agua y nota en recuentos_24h
try {
    $pdo->exec("ALTER TABLE recuentos_24h ADD COLUMN agua VARCHAR(50) NULL AFTER fecha_recuento");
    $ops[] = '✓ ALTER recuentos_24h ADD agua';
} catch (PDOException $e) { $ops[] = '— agua ya existe en recuentos_24h'; }

try {
    $pdo->exec("ALTER TABLE recuentos_24h ADD COLUMN nota TEXT NULL AFTER agua");
    $ops[] = '✓ ALTER recuentos_24h ADD nota';
} catch (PDOException $e) { $ops[] = '— nota ya existe en recuentos_24h'; }

// 0b. nota y sem en mediciones
try {
    $pdo->exec("ALTER TABLE mediciones ADD COLUMN nota TEXT NULL");
    $ops[] = '✓ ALTER mediciones ADD nota';
} catch (PDOException $e) { $ops[] = '— nota ya existe en mediciones'; }

try {
    $pdo->exec("ALTER TABLE mediciones ADD COLUMN sem TINYINT UNSIGNED NULL");
    $ops[] = '✓ ALTER mediciones ADD sem';
} catch (PDOException $e) { $ops[] = '— sem ya existe en mediciones'; }

// 1b. Campo foto_perfil en pacientes
try {
    $pdo->exec("ALTER TABLE pacientes ADD COLUMN foto_perfil VARCHAR(255) NULL");
    $ops[] = '✓ ALTER pacientes ADD foto_perfil';
} catch (PDOException $e) { $ops[] = '— foto_perfil ya existe'; }

// 1. Campo sexo en pacientes
try {
    $pdo->exec("ALTER TABLE pacientes ADD COLUMN sexo ENUM('femenino','masculino') NOT NULL DEFAULT 'femenino' AFTER edad");
    $ops[] = '✓ ALTER pacientes ADD sexo';
} catch (PDOException $e) {
    $ops[] = '— sexo ya existe';
}

// 2. Campo fibra_g en planes_nutricionales
try {
    $pdo->exec("ALTER TABLE planes_nutricionales ADD COLUMN fibra_g TINYINT UNSIGNED DEFAULT NULL AFTER grasas_g");
    $ops[] = '✓ ALTER planes_nutricionales ADD fibra_g';
} catch (PDOException $e) {
    $ops[] = '— fibra_g ya existe';
}

// 3. Campo actividad en planes_nutricionales
try {
    $pdo->exec("ALTER TABLE planes_nutricionales ADD COLUMN actividad DECIMAL(5,3) NOT NULL DEFAULT 1.400 AFTER fibra_g");
    $ops[] = '✓ ALTER planes_nutricionales ADD actividad';
} catch (PDOException $e) {
    $ops[] = '— actividad ya existe';
}

// 4. Tabla alimentos
$pdo->exec("CREATE TABLE IF NOT EXISTS alimentos (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(150) NOT NULL,
  categoria          VARCHAR(50)  NOT NULL,
  porcion_g          SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  porcion_descripcion VARCHAR(80),
  calorias           SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  proteina_g         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  carbohidratos_g    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  grasas_g           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  fibra_g            DECIMAL(5,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$ops[] = '✓ CREATE TABLE alimentos';

// 5. Tabla preferencias_alimentos (exclusiones por paciente)
$pdo->exec("CREATE TABLE IF NOT EXISTS preferencias_alimentos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT UNSIGNED NOT NULL,
  alimento_id INT UNSIGNED NOT NULL,
  excluido    TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_pref (paciente_id, alimento_id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (alimento_id) REFERENCES alimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$ops[] = '✓ CREATE TABLE preferencias_alimentos';

// 6. Tabla plan_alimentos_seleccionados
$pdo->exec("CREATE TABLE IF NOT EXISTS plan_alimentos_seleccionados (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id      INT UNSIGNED NOT NULL,
  alimento_id  INT UNSIGNED NOT NULL,
  tiempo_comida ENUM('desayuno','colacion_am','comida','colacion_pm','cena') NOT NULL,
  porciones    DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  FOREIGN KEY (plan_id)     REFERENCES planes_nutricionales(id) ON DELETE CASCADE,
  FOREIGN KEY (alimento_id) REFERENCES alimentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$ops[] = '✓ CREATE TABLE plan_alimentos_seleccionados';

// 7. Seed alimentos si la tabla está vacía
$count = (int)$pdo->query("SELECT COUNT(*) FROM alimentos")->fetchColumn();
if ($count === 0) {
    $ins = $pdo->prepare("INSERT INTO alimentos
        (nombre, categoria, porcion_g, porcion_descripcion, calorias, proteina_g, carbohidratos_g, grasas_g, fibra_g)
        VALUES (?,?,?,?,?,?,?,?,?)");

    $foods = [
        // ── Proteína animal ─────────────────────────────────
        ['Pechuga de pollo',      'Proteína animal', 100, '100g cocido',       165, 31.00,  0.00,  3.60, 0.00],
        ['Muslo de pollo',        'Proteína animal', 100, '100g cocido',       209, 26.00,  0.00, 11.00, 0.00],
        ['Salmón',                'Proteína animal', 100, '100g cocido',       208, 20.00,  0.00, 13.00, 0.00],
        ['Atún en agua',          'Proteína animal', 100, '1 lata drenada',    116, 26.00,  0.00,  1.00, 0.00],
        ['Carne res magra',       'Proteína animal', 100, '100g cocido',       215, 26.00,  0.00, 12.00, 0.00],
        ['Tilapia',               'Proteína animal', 100, '100g cocido',        96, 20.00,  0.00,  2.00, 0.00],
        ['Sardina en agua',       'Proteína animal', 100, '100g drenado',      208, 25.00,  0.00, 11.00, 0.00],
        ['Camarón',               'Proteína animal', 100, '100g cocido',        99, 18.00,  1.50,  1.40, 0.00],
        ['Huevo entero',          'Proteína animal',  50, '1 pieza',            78,  6.00,  0.60,  5.00, 0.00],
        ['Clara de huevo',        'Proteína animal',  33, '1 clara',            17,  3.60,  0.20,  0.10, 0.00],
        ['Atún en aceite',        'Proteína animal', 100, '1 lata drenada',    198, 25.50,  0.00,  9.00, 0.00],
        // ── Proteína vegetal ────────────────────────────────
        ['Lentejas cocidas',      'Proteína vegetal', 200, '1 taza',           230, 18.00, 40.00,  0.80, 16.00],
        ['Frijoles negros',       'Proteína vegetal', 172, '1 taza',           227, 15.00, 41.00,  0.90, 15.00],
        ['Garbanzos',             'Proteína vegetal', 164, '1 taza cocidos',   269, 15.00, 45.00,  4.00, 12.00],
        ['Tofu firme',            'Proteína vegetal', 100, '100g',              76,  8.00,  1.90,  4.30,  0.30],
        ['Edamame',               'Proteína vegetal', 155, '1 taza',           188, 17.00, 14.00,  8.00,  8.00],
        ['Frijoles bayos',        'Proteína vegetal', 172, '1 taza',           220, 14.00, 40.00,  0.80, 14.00],
        // ── Carbohidrato ────────────────────────────────────
        ['Arroz integral',        'Carbohidrato', 195, '1 taza cocido',        216,  5.00, 45.00,  1.80,  3.50],
        ['Arroz blanco',          'Carbohidrato', 195, '1 taza cocido',        242,  4.40, 53.00,  0.40,  0.60],
        ['Avena',                 'Carbohidrato',  40, '½ taza seca',          148,  6.00, 27.00,  2.50,  4.00],
        ['Quinoa',                'Carbohidrato', 185, '1 taza cocida',        222,  8.00, 39.00,  3.50,  5.00],
        ['Papa',                  'Carbohidrato', 150, '1 papa mediana',       117,  2.50, 27.00,  0.10,  2.00],
        ['Camote',                'Carbohidrato', 130, '1 camote mediano',     112,  2.00, 26.00,  0.10,  3.80],
        ['Tortilla de maíz',      'Carbohidrato',  30, '1 pieza',              65,  1.50, 13.50,  1.00,  1.50],
        ['Pan integral',          'Carbohidrato',  30, '1 rebanada',            79,  3.00, 15.00,  1.00,  1.90],
        ['Pasta integral',        'Carbohidrato',  55, '½ taza seca',          192,  7.00, 37.00,  1.40,  3.80],
        ['Elote',                 'Carbohidrato', 100, '1 mazorca mediana',     86,  3.20, 19.00,  1.20,  2.70],
        ['Tostada de maíz',       'Carbohidrato',  20, '1 pieza',               90,  1.50, 12.00,  4.00,  0.80],
        // ── Fruta ───────────────────────────────────────────
        ['Manzana',               'Fruta', 182, '1 pieza',                      95,  0.50, 25.00,  0.30,  4.40],
        ['Plátano',               'Fruta', 118, '1 pieza',                     105,  1.30, 27.00,  0.40,  3.10],
        ['Fresa',                 'Fruta', 152, '1 taza',                       49,  1.00, 12.00,  0.50,  3.00],
        ['Mango',                 'Fruta', 165, '1 taza',                      107,  0.80, 28.00,  0.50,  3.00],
        ['Naranja',               'Fruta', 131, '1 pieza',                      62,  1.20, 15.00,  0.20,  3.10],
        ['Kiwi',                  'Fruta',  76, '1 pieza',                      46,  0.90, 11.00,  0.40,  2.30],
        ['Frutos rojos mix',      'Fruta', 140, '1 taza',                       62,  1.40, 14.00,  0.50,  6.00],
        ['Piña',                  'Fruta', 165, '1 taza',                       83,  0.90, 22.00,  0.20,  2.30],
        ['Papaya',                'Fruta', 145, '1 taza',                       62,  0.70, 16.00,  0.40,  2.50],
        ['Melón',                 'Fruta', 177, '1 taza',                       60,  1.50, 14.00,  0.30,  1.60],
        ['Uva',                   'Fruta', 151, '1 taza',                      104,  1.10, 27.00,  0.20,  1.40],
        ['Durazno',               'Fruta', 150, '1 pieza',                      60,  1.40, 15.00,  0.40,  2.30],
        // ── Verdura ─────────────────────────────────────────
        ['Brócoli',               'Verdura',  91, '1 taza',                     31,  2.60,  6.00,  0.30,  2.40],
        ['Espinaca',              'Verdura',  30, '1 taza cruda',                7,  0.90,  1.10,  0.10,  0.70],
        ['Zanahoria',             'Verdura',  61, '1 pieza',                    25,  0.60,  6.00,  0.10,  1.70],
        ['Calabaza',              'Verdura', 115, '1 taza',                     19,  1.40,  3.50,  0.20,  1.20],
        ['Pepino',                'Verdura', 119, '1 taza',                     16,  0.70,  3.80,  0.10,  0.50],
        ['Lechuga',               'Verdura',  47, '1 taza',                      8,  0.60,  1.60,  0.10,  0.60],
        ['Jitomate',              'Verdura', 123, '1 pieza',                    22,  1.10,  4.80,  0.20,  1.50],
        ['Champiñones',           'Verdura',  96, '1 taza',                     21,  3.00,  3.00,  0.30,  1.00],
        ['Nopal',                 'Verdura', 149, '1 taza',                     22,  2.00,  5.00,  0.10,  3.70],
        ['Chayote',               'Verdura', 200, '1 pieza',                    38,  1.70,  9.00,  0.10,  3.50],
        ['Pimiento',              'Verdura',  92, '1 pieza',                    20,  0.90,  4.60,  0.20,  1.50],
        ['Cebolla',               'Verdura', 160, '1 taza',                     64,  1.80, 15.00,  0.20,  2.70],
        ['Betabel',               'Verdura', 136, '1 taza cocido',              75,  2.90, 17.00,  0.30,  3.80],
        // ── Grasa saludable ─────────────────────────────────
        ['Aguacate',              'Grasa saludable',  75, '½ pieza',            120,  1.50,  6.40, 11.00,  5.00],
        ['Aceite de oliva',       'Grasa saludable',  14, '1 cucharada',        119,  0.00,  0.00, 13.50,  0.00],
        ['Almendras',             'Grasa saludable',  28, '23 piezas',          164,  6.00,  6.00, 14.00,  3.50],
        ['Nuez de Castilla',      'Grasa saludable',  28, '7 mitades',          185,  4.30,  3.90, 18.50,  1.90],
        ['Mantequilla almendra',  'Grasa saludable',  32, '2 cucharadas',       196,  7.00,  6.00, 18.00,  3.00],
        ['Semillas de chía',      'Grasa saludable',  28, '2 cucharadas',       138,  4.70, 12.00,  8.70,  9.80],
        ['Linaza molida',         'Grasa saludable',  10, '1 cucharada',         55,  2.00,  3.00,  4.00,  3.00],
        ['Cacahuate',             'Grasa saludable',  28, '2 cucharadas',       161,  7.30,  4.60, 14.00,  2.40],
        // ── Lácteo ──────────────────────────────────────────
        ['Yogurt griego',         'Lácteo', 240, '1 taza',                     146, 22.00,  8.00,  4.00,  0.00],
        ['Leche descremada',      'Lácteo', 245, '1 taza',                      83,  8.00, 12.00,  0.20,  0.00],
        ['Leche entera',          'Lácteo', 245, '1 taza',                     149,  8.00, 12.00,  8.00,  0.00],
        ['Queso cottage',         'Lácteo', 113, '½ taza',                     101, 11.00,  3.50,  4.50,  0.00],
        ['Queso panela',          'Lácteo',  30, '1 rebanada',                  72,  7.00,  0.80,  4.50,  0.00],
        ['Queso Oaxaca',          'Lácteo',  30, '1 rebanada',                 104,  7.00,  0.00,  8.50,  0.00],
    ];

    foreach ($foods as $f) {
        $ins->execute($f);
    }
    $ops[] = '✓ Seed ' . count($foods) . ' alimentos';
} else {
    $ops[] = "— Alimentos ya existen ($count registros, sin cambios)";
}

echo json_encode(['ok' => true, 'ops' => $ops], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
