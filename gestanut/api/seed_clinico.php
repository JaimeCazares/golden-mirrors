<?php
// ══════════════════════════════════════════════════════
// SEED · Datos clínicos de los 12 pacientes
// Ejecutar UNA VEZ: http://localhost/GESTANUT/api/seed_clinico.php
// Es idempotente: borra y re-inserta los datos clínicos
// ══════════════════════════════════════════════════════
header('Content-Type: text/plain; charset=utf-8');
set_time_limit(120);

require __DIR__ . '/db.php';

$log  = [];
$errs = [];

function ok($msg) { global $log; $log[] = "✓ $msg"; }
function fail($msg) { global $errs; $errs[] = "✗ $msg"; }

// ─── 1. Columnas faltantes ─────────────────────────────
$cols = [
    "ALTER TABLE mediciones     ADD COLUMN IF NOT EXISTS nota TEXT         NULL AFTER imc",
    "ALTER TABLE mediciones     ADD COLUMN IF NOT EXISTS sem  TINYINT      NULL AFTER nota",
    "ALTER TABLE recuentos_24h  ADD COLUMN IF NOT EXISTS agua VARCHAR(50)  NULL AFTER fecha_recuento",
    "ALTER TABLE recuentos_24h  ADD COLUMN IF NOT EXISTS nota TEXT         NULL AFTER agua",
    "ALTER TABLE laboratorios   MODIFY COLUMN valor VARCHAR(100) NULL",
];
foreach ($cols as $sql) {
    try { $pdo->exec($sql); ok($sql); } catch(Exception $e) { ok("(ya existe) $sql"); }
}

// ─── 2. Verificar pacientes ────────────────────────────
$stmt = $pdo->query('SELECT COUNT(*) FROM pacientes');
$cnt  = (int)$stmt->fetchColumn();
if ($cnt < 12) {
    fail("Solo hay $cnt pacientes. Ejecuta seed_pacientes.php primero.");
    echo implode("\n", array_merge($log, $errs));
    exit;
}
ok("$cnt pacientes encontrados");

// ─── 3. Limpiar datos clínicos previos (orden: hijos antes que padres) ──
// Tablas hijas de lactancia
$stmt = $pdo->query("SELECT id FROM lactancia WHERE paciente_id BETWEEN 1 AND 12");
foreach (array_column($stmt->fetchAll(), 'id') as $lid) {
    $pdo->prepare("DELETE FROM lactancia_sintomas WHERE lactancia_id=?")->execute([$lid]);
    $pdo->prepare("DELETE FROM peso_bebe WHERE lactancia_id=?")->execute([$lid]);
}
// Tablas hijas de recuentos_24h
$pdo->exec("DELETE tc FROM tiempos_comida tc INNER JOIN recuentos_24h r ON r.id=tc.recuento_id WHERE r.paciente_id BETWEEN 1 AND 12");
// Tablas con paciente_id directo
foreach (['lactancia','embarazo','glucosa_monitoreo','recuentos_24h',
          'notas_consulta','planes_nutricionales','laboratorios',
          'mediciones','historia_clinica'] as $t) {
    $pdo->exec("DELETE FROM $t WHERE paciente_id BETWEEN 1 AND 12");
}
ok("Datos clínicos anteriores eliminados");

// ─── Helper: convertir fecha "28 Abr 2025" o "28 Abr" → "2025-04-28" ──
function toDate($s) {
    $m = ['Ene'=>'01','Feb'=>'02','Mar'=>'03','Abr'=>'04','May'=>'05','Jun'=>'06',
          'Jul'=>'07','Ago'=>'08','Sep'=>'09','Oct'=>'10','Nov'=>'11','Dic'=>'12'];
    $s = trim($s);
    if (preg_match('/^(\d+)\s+(\w+)\s+(\d{4})$/', $s, $r)) {
        return $r[3] . '-' . ($m[$r[2]]??'01') . '-' . str_pad($r[1],2,'0',STR_PAD_LEFT);
    }
    if (preg_match('/^(\d+)\s+(\w+)$/', $s, $r)) {
        return '2025-' . ($m[$r[2]]??'01') . '-' . str_pad($r[1],2,'0',STR_PAD_LEFT);
    }
    return '2025-01-01';
}

// ─── 4. Datos clínicos por paciente ───────────────────
$data = [

// ──────────────────────────────────────────────────────
1 => [
  'historia' => ['motivo'=>'Control nutricional prenatal','antecedentes'=>'Sin antecedentes patológicos','alergias'=>'Sin alergias conocidas','intolerancias'=>'Sin intolerancias documentadas','medicamentos'=>'Suplemento prenatal (Ácido fólico 600mcg, DHA 200mg)','cirugias'=>'Ninguna','patFam'=>'DM2 en abuelo materno','actFisica'=>'Caminata 30 min/3x sem','ocupacion'=>'Maestra de primaria','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'No','bio'=>'Primer embarazo. Antes del embarazo en peso normal. Tolerancia gastrointestinal buena. Sin enfermedades previas.'],
  'labs' => [
    ['28 Abr 2025','Hemoglobina',12.8,'11-16 g/dL','ok'],
    ['28 Abr 2025','Hematocrito',38.5,'33-47%','ok'],
    ['28 Abr 2025','Glucosa ayuno',88,'70-92 mg/dL','ok'],
    ['28 Abr 2025','Ferritina',22,'13-150 ng/mL','ok'],
    ['28 Abr 2025','Ácido fólico sérico',9.8,'>5.9 ng/mL','ok'],
    ['28 Abr 2025','TSH',2.1,'0.5-4.5 mUI/L','ok'],
  ],
  'history' => [
    ['17 Mar',22,71.0,null,'Inicio bien',88,104,28,56],
    ['31 Mar',24,71.4,null,'+200kcal/día',88,104,28,56],
    ['14 Abr',26,71.9,null,'Hierro normal',88,104,28,56],
    ['28 Abr',28,72.3,null,'Dentro de rango',88,104,28,56],
  ],
  'recuento' => ['28 Abr 2025',[['Desayuno','8:00','Avena 1 taza + plátano + leche 1 vaso'],['Colación','11:00','Manzana + 10 almendras'],['Comida','2:30','Caldo de pollo + arroz 1 taza + ensalada'],['Colación','5:00','Yogurt natural + granola'],['Cena','8:00','Huevo 2 pzs + frijoles + tortillas 2']],'1.5 L','Le cuesta tomar agua, prefiere agua de sabor sin azúcar'],
  'plan' => '2,200 kcal · 6 tiempos · Hierro 45mg, Ácido Fólico 600mcg, DHA 200mg',
  'embarazo' => [28,64.5,false],
],

// ──────────────────────────────────────────────────────
2 => [
  'historia' => ['motivo'=>'Optimizar composición corporal','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Intolerancia leve al gluten (no celíaca)','medicamentos'=>'Creatina 5g/día (automedicada)','cirugias'=>'Apendicectomía 2018','patFam'=>'Ninguna relevante','actFisica'=>'Crossfit 5x/sem + caminata','ocupacion'=>'Diseñadora gráfica','estadoCivil'=>'Soltera','tabaco'=>'No','alcohol'=>'Ocasional (1x/sem)','bio'=>'Hace crossfit 5 días/semana. Buena adherencia. Objetivo: ganar 2 kg masa magra en 12 semanas.'],
  'labs' => [
    ['01 Mar 2025','Glucosa',91,'70-100 mg/dL','ok'],
    ['01 Mar 2025','Colesterol total',172,'<200 mg/dL','ok'],
    ['01 Mar 2025','Triglicéridos',98,'<150 mg/dL','ok'],
    ['01 Mar 2025','HDL',62,'>50 mg/dL','ok'],
    ['01 Mar 2025','LDL',91,'<130 mg/dL','ok'],
    ['01 Mar 2025','Hemoglobina',13.5,'12-16 g/dL','ok'],
  ],
  'history' => [
    ['01 Mar',null,62.4,24.0,'Inicio',72,96,30,58],
    ['15 Mar',null,62.6,23.2,'Buena adaptación',72,96,30,58],
    ['01 Abr',null,62.9,22.5,'Composición mejora',72,96,30,58],
    ['15 Abr',null,63.0,22.0,'Avance constante',72,96,30,58],
    ['25 Abr',null,63.1,21.4,'Excelente progreso',72,96,30,58],
  ],
  'recuento' => ['25 Abr 2025',[['Pre-entreno','6:00','Plátano + café negro'],['Post-entreno','8:30','Proteína whey 1 scoop + leche'],['Desayuno','9:30','Huevo 3 pzs + avocado + tostadas integrales'],['Comida','2:00','Pechuga 200g + arroz + brócoli'],['Cena','8:00','Salmón 150g + ensalada + camote']],'2.8 L','Muy buena hidratación. Plan muy bien seguido este día.'],
  'plan' => '2,400 kcal · 35% prot · 40% carbs · 25% grasa · Creatina 5g/día',
],

// ──────────────────────────────────────────────────────
3 => [
  'historia' => ['motivo'=>'Bajar de peso, mejorar energía','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Ninguno','cirugias'=>'Ninguna','patFam'=>'DM2 en madre, HTA en padre','actFisica'=>'Ninguna actualmente','ocupacion'=>'Contadora','estadoCivil'=>'Soltera','tabaco'=>'No','alcohol'=>'Social (fin de semana)','bio'=>'Primera consulta. Sin antecedentes patológicos. Estilo de vida sedentario, oficina 9 hrs.'],
  'labs' => [],
  'history' => [],
  'recuento' => [null,[],'',''],
  'plan' => 'Por definir en primera consulta',
],

// ──────────────────────────────────────────────────────
4 => [
  'historia' => ['motivo'=>'Apoyo nutricional lactancia + recuperación postparto','antecedentes'=>'Cesárea programada','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'DHA postnatal, Calcio 1200mg, Fe 30mg','cirugias'=>'Cesárea Feb 2025','patFam'=>'Ninguna relevante','actFisica'=>'Caminata suave 20 min/día','ocupacion'=>'Farmacéutica (licencia maternal)','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'No','bio'=>'Bebé de 3 meses. Lactancia exclusiva. Quiere recuperar composición sin afectar producción de leche.'],
  'labs' => [
    ['02 Abr 2025','Hemoglobina',11.8,'12-16 g/dL','warn'],
    ['02 Abr 2025','Ferritina',10,'13-150 ng/mL','alert'],
    ['02 Abr 2025','Calcio sérico',9.1,'8.5-10.5 mg/dL','ok'],
    ['02 Abr 2025','Vitamina D',22,'30-100 ng/mL','warn'],
    ['02 Abr 2025','Glucosa',85,'70-100 mg/dL','ok'],
  ],
  'history' => [
    ['05 Mar',null,69.0,null,'Post-parto inmediato',80,100,28,56],
    ['02 Abr',null,67.5,null,'Reducción gradual',80,100,28,56],
    ['20 Abr',null,66.5,null,'Producción láctea estable',80,100,28,56],
  ],
  'recuento' => ['20 Abr 2025',[['Madrugada','3:00','Vaso de leche + galletas'],['Desayuno','9:00','Licuado de plátano y avena + tostadas'],['Comida','2:00','Caldo de res + frijoles + arroz'],['Merienda','5:00','Fruta + queso'],['Cena','9:00','Quesadillas 2 + nopales']],'2.0 L','Aumentar ingesta calórica y de hierro'],
  'plan' => '2,500 kcal · alto en proteína y calcio · Suplemento DHA postnatal',
  'lactancia' => [12,'abundante',8,['Cansancio extremo','Sed constante'],['DHA 500mg','Calcio 1200mg','Hierro 30mg','Vitamina D3 2000UI'],[[1,3.1],[4,3.9],[8,5.2],[12,6.1]]],
],

// ──────────────────────────────────────────────────────
5 => [
  'historia' => ['motivo'=>'Control glucémico + nutrición fetal','antecedentes'=>'Diabetes gestacional (actual)','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Suplemento prenatal, metformina suspendida por control con dieta','cirugias'=>'2 partos previos (vaginales)','patFam'=>'DM2 en ambos padres','actFisica'=>'Caminata 20 min/día con autorización obstétrica','ocupacion'=>'Ama de casa','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'No','bio'=>'Tercer embarazo. Diabetes gestacional controlada con dieta. Sin medicamentos.'],
  'labs' => [
    ['24 Abr 2025','Glucosa ayuno',94,'<92 mg/dL','warn'],
    ['24 Abr 2025','Glucosa 1h postprandial',138,'<140 mg/dL','ok'],
    ['24 Abr 2025','HbA1c',5.4,'<5.7%','ok'],
    ['24 Abr 2025','Hemoglobina',11.5,'11-16 g/dL','ok'],
    ['24 Abr 2025','Triglicéridos',198,'<150 mg/dL (emb.)','warn'],
  ],
  'history' => [
    ['01 Mar',24,73.5,null,'Glucosa 92',96,110,30,60],
    ['15 Mar',26,74.0,null,'Plan bajo CHO',96,110,30,60],
    ['01 Abr',28,74.7,null,'Glucosa controlada',96,110,30,60],
    ['15 Abr',30,75.3,null,'Excelente control',96,110,30,60],
    ['24 Abr',32,75.8,null,'Manteniendo',96,110,30,60],
  ],
  'recuento' => ['24 Abr 2025',[['Desayuno','7:30','2 huevos + 1 tortilla + nopales + café sin azúcar'],['Colación','10:30','1 manzana pequeña + queso panela 30g'],['Comida','2:00','Pollo 150g + calabaza + arroz integral ½ taza'],['Colación','5:30','Pepino + jícama + limón (sin chili)'],['Cena','7:30','Sopa de verduras + 1 rebanada pan integral']],'2.5 L','Buen apego. Evita azúcares. Porciones de carbohidratos controladas.'],
  'plan' => '2,100 kcal · CHO complejos · 6 tiempos · Sin azúcares simples',
  'embarazo' => [32,67.5,true],
  'glucosa' => [
    ['2025-04-28',91,98,132,95,128,'Buen control'],
    ['2025-04-27',88,95,140,93,135,'Post-comida límite'],
    ['2025-04-26',94,100,135,96,130,'Ayuno ligeramente alto'],
    ['2025-04-25',87,94,128,90,122,'Día excelente'],
    ['2025-04-24',92,97,142,94,138,'Post-comida alto'],
  ],
],

// ──────────────────────────────────────────────────────
6 => [
  'historia' => ['motivo'=>'Control de peso con SOP e hipotiroidismo','antecedentes'=>'Hipotiroidismo, SOP','alergias'=>'Sin alergias','intolerancias'=>'Intolerancia a la lactosa leve','medicamentos'=>'Levotiroxina 50mcg/día','cirugias'=>'Ninguna','patFam'=>'Hipotiroidismo en madre','actFisica'=>'Yoga 2x/sem','ocupacion'=>'Abogada','estadoCivil'=>'Soltera','tabaco'=>'No','alcohol'=>'Ocasional','bio'=>'Hipotiroidismo controlado con levotiroxina. Estrés laboral alto. SOP diagnosticado 2022.'],
  'labs' => [
    ['15 Abr 2025','TSH',3.8,'0.5-4.5 mUI/L','ok'],
    ['15 Abr 2025','T4 libre',1.1,'0.8-1.8 ng/dL','ok'],
    ['15 Abr 2025','Glucosa',104,'70-100 mg/dL','warn'],
    ['15 Abr 2025','Insulina',18,'<15 mUI/L','warn'],
    ['15 Abr 2025','Índice HOMA',4.7,'<2.5','alert'],
    ['15 Abr 2025','Testosterona libre',8.2,'0.5-5.5 pg/mL','alert'],
  ],
  'history' => [
    ['15 Feb',null,84.0,null,null,92,108,32,62],
    ['01 Mar',null,83.2,null,null,92,108,32,62],
    ['15 Mar',null,82.5,null,null,92,108,32,62],
    ['01 Abr',null,81.9,null,null,92,108,32,62],
    ['18 Abr',null,81.2,null,null,92,108,32,62],
  ],
  'recuento' => ['18 Abr 2025',[['Desayuno','10:00','Café con leche + pan dulce'],['Comida','3:00','Tacos de carnitas x3 + agua de Jamaica'],['Merienda','6:00','Papitas + refresco'],['Cena','9:30','Cereal con leche']],'0.8 L','Comidas irregulares. Poca hidratación. Saltó desayuno temprano.'],
  'plan' => '1,700 kcal · Bajo índice glucémico · Sin lactosa · Inositol 4g/día',
],

// ──────────────────────────────────────────────────────
7 => [
  'historia' => ['motivo'=>'Bajar de peso, prevenir DM2','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Ninguno','cirugias'=>'Ninguna','patFam'=>'DM2 en padre','actFisica'=>'Caminata 30 min/día','ocupacion'=>'Enfermera','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'No','bio'=>'Sin patologías activas. Estrés laboral moderado. Antecedentes familiares de DM2.'],
  'labs' => [
    ['15 Abr 2025','Glucosa',98,'70-100 mg/dL','ok'],
    ['15 Abr 2025','Colesterol total',195,'<200 mg/dL','ok'],
    ['15 Abr 2025','Triglicéridos',142,'<150 mg/dL','ok'],
    ['15 Abr 2025','Hemoglobina',13.2,'12-16 g/dL','ok'],
  ],
  'history' => [
    ['15 Feb',null,88.0,null,null,96,114,34,64],
    ['01 Mar',null,86.5,null,null,96,114,34,64],
    ['15 Mar',null,85.4,null,null,96,114,34,64],
    ['01 Abr',null,84.8,null,null,96,114,34,64],
    ['15 Abr',null,84.3,null,null,96,114,34,64],
  ],
  'recuento' => ['15 Abr 2025',[['Desayuno','7:00','Yogurt + fruta + café'],['Colación','10:30','Nueces + manzana'],['Comida','2:30','Sopa de verduras + pollo + ensalada'],['Cena','7:30','Quesadillas 2 + frijoles']],'1.8 L','Buen apego. Puede mejorar hidratación.'],
  'plan' => '1,700 kcal · Mediterránea · Caminata 30min/día',
],

// ──────────────────────────────────────────────────────
8 => [
  'historia' => ['motivo'=>'Definición muscular, reducir grasa corporal','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Proteína whey (suplemento)','cirugias'=>'Ninguna','patFam'=>'Ninguna','actFisica'=>'Gym 4x/sem + cardio 2x/sem','ocupacion'=>'Maestra','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'Ocasional','bio'=>'Adherencia excelente. Foco en definición. Entrena 4 veces por semana.'],
  'labs' => [
    ['28 Abr 2025','Hemoglobina',13.8,'12-16 g/dL','ok'],
    ['28 Abr 2025','Glucosa',86,'70-100 mg/dL','ok'],
    ['28 Abr 2025','Creatinina',0.8,'0.5-1.1 mg/dL','ok'],
  ],
  'history' => [
    ['01 Mar',null,60.2,22.5,null,68,94,28,54],
    ['15 Mar',null,59.5,21.0,null,68,94,28,54],
    ['01 Abr',null,58.9,19.8,null,68,94,28,54],
    ['15 Abr',null,58.5,19.0,null,68,94,28,54],
    ['28 Abr',null,58.4,18.4,null,68,94,28,54],
  ],
  'recuento' => ['28 Abr 2025',[['Pre-entreno','6:30','Plátano + café'],['Post-entreno','9:00','Whey protein + agua'],['Desayuno','10:00','Huevo 3 pzs + avocado + pan integral'],['Comida','2:00','Pechuga + quinoa + brócoli'],['Cena','8:00','Salmón + ensalada + aguacate']],'2.5 L','Adherencia excelente. Plan muy bien seguido.'],
  'plan' => '2,000 kcal · Déficit moderado · Proteína 1.8g/kg',
],

// ──────────────────────────────────────────────────────
9 => [
  'historia' => ['motivo'=>'Control nutricional 2do embarazo','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Ácido fólico 400mcg','cirugias'=>'Ninguna','patFam'=>'Ninguna relevante','actFisica'=>'Yoga prenatal 2x/sem','ocupacion'=>'Contadora','estadoCivil'=>'Casada','tabaco'=>'No','alcohol'=>'No','bio'=>'Segundo embarazo. Náuseas matutinas leves. Aversión a carnes rojas en 1er trimestre.'],
  'labs' => [
    ['22 Abr 2025','Hemoglobina',12.2,'11-16 g/dL','ok'],
    ['22 Abr 2025','Glucosa ayuno',82,'70-92 mg/dL','ok'],
    ['22 Abr 2025','TSH',1.8,'0.5-4.5 mUI/L','ok'],
    ['22 Abr 2025','Ferritina',18,'13-150 ng/mL','ok'],
  ],
  'history' => [
    ['14 Abr',12,69.5,null,'Inicio control',82,102,30,58],
    ['22 Abr',14,70.2,null,'Náuseas mejorando',82,102,30,58],
  ],
  'recuento' => ['22 Abr 2025',[['Desayuno','8:00','Galletas saladas + té + manzana (náuseas)'],['Colación','11:00','Yogurt + granola'],['Comida','2:00','Sopa de pasta + pechuga + ensalada'],['Cena','8:00','Quesadillas + frijoles']],'1.5 L','Náuseas dificultan ingesta matutina. Tolera bien alimentos bland.'],
  'plan' => '2,000 kcal · 1er trim · Ácido fólico 400mcg',
  'embarazo' => [14,68.0,false],
],

// ──────────────────────────────────────────────────────
10 => [
  'historia' => ['motivo'=>'Preservar músculo, salud ósea, manejo de síntomas','antecedentes'=>'Pre-menopausia','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Calcio 600mg + Vit D3 1000UI','cirugias'=>'Ninguna','patFam'=>'Osteoporosis en madre','actFisica'=>'Fuerza 3x/sem + pilates','ocupacion'=>'Directora de escuela','estadoCivil'=>'Divorciada','tabaco'=>'No','alcohol'=>'No','bio'=>'Pre-menopausia. Cambios hormonales. Foco en preservar masa muscular y salud ósea.'],
  'labs' => [
    ['21 Abr 2025','FSH',18,'3.5-12.5 mUI/mL','warn'],
    ['21 Abr 2025','Estradiol',42,'15-350 pg/mL','ok'],
    ['21 Abr 2025','Calcio sérico',9.4,'8.5-10.5 mg/dL','ok'],
    ['21 Abr 2025','Vitamina D',28,'30-100 ng/mL','warn'],
    ['21 Abr 2025','Colesterol total',210,'<200 mg/dL','warn'],
  ],
  'history' => [
    ['15 Feb',null,62.5,28.0,null,74,96,28,56],
    ['15 Mar',null,61.8,27.0,null,74,96,28,56],
    ['15 Abr',null,61.0,25.5,null,74,96,28,56],
  ],
  'recuento' => ['21 Abr 2025',[['Desayuno','7:30','Avena + proteína + frutos rojos'],['Colación','11:00','Nueces + té verde'],['Comida','2:00','Salmon + quinoa + espinacas'],['Cena','7:30','Tofu + verduras salteadas']],'2.2 L','Muy buena adherencia. Plan bien seguido.'],
  'plan' => '1,900 kcal · Proteína alta · Calcio + Vit D · Fuerza 3x/sem',
],

// ──────────────────────────────────────────────────────
11 => [
  'historia' => ['motivo'=>'Optimizar rendimiento deportivo para maratón','antecedentes'=>'Sin antecedentes','alergias'=>'Alergia a mariscos','intolerancias'=>'Sin intolerancias','medicamentos'=>'Hierro 30mg (preventivo)','cirugias'=>'Ninguna','patFam'=>'Ninguna','actFisica'=>'Correr 5-7x/sem (60-80km semanales)','ocupacion'=>'Ingeniera en software','estadoCivil'=>'Soltera','tabaco'=>'No','alcohol'=>'No','bio'=>'Corredora aficionada. Maratón en 4 meses. Plan periodizado por intensidad de entrenamiento.'],
  'labs' => [
    ['19 Abr 2025','Hemoglobina',13.2,'12-16 g/dL','ok'],
    ['19 Abr 2025','Ferritina',25,'13-150 ng/mL','ok'],
    ['19 Abr 2025','Glucosa',84,'70-100 mg/dL','ok'],
    ['19 Abr 2025','Vitamina D',38,'30-100 ng/mL','ok'],
  ],
  'history' => [
    ['01 Mar',null,54.8,21.0,null,66,90,26,52],
    ['15 Mar',null,55.0,20.5,null,66,90,26,52],
    ['01 Abr',null,55.1,20.0,null,66,90,26,52],
    ['19 Abr',null,55.2,19.5,null,66,90,26,52],
  ],
  'recuento' => ['19 Abr 2025',[['Pre-carrera','6:00','Plátano + gel energético'],['Post-carrera','8:30','Licuado proteína + avena'],['Almuerzo','11:00','Huevo 3 pzs + tostadas + aguacate'],['Comida','2:00','Pechuga + pasta integral + brócoli'],['Cena','8:00','Atún + camote + ensalada']],'3.2 L','Excelente hidratación. Plan bien periodizado.'],
  'plan' => '2,200 kcal · Periodización · Carbs altos en días largos',
],

// ──────────────────────────────────────────────────────
12 => [
  'historia' => ['motivo'=>'Bajar 5 kg para evento en julio','antecedentes'=>'Sin antecedentes','alergias'=>'Sin alergias','intolerancias'=>'Sin intolerancias','medicamentos'=>'Anticonceptivos orales','cirugias'=>'Ninguna','patFam'=>'Sobrepeso en madre','actFisica'=>'Ninguna regular','ocupacion'=>'Estudiante de medicina','estadoCivil'=>'Soltera','tabaco'=>'No','alcohol'=>'Fin de semana','bio'=>'Estudiante universitaria. Vive en Mazatlán. Quiere bajar para una boda en julio.'],
  'labs' => [
    ['15 Mar 2025','Glucosa',90,'70-100 mg/dL','ok'],
    ['15 Mar 2025','Hemoglobina',12.8,'12-16 g/dL','ok'],
  ],
  'history' => [
    ['15 Mar',null,69.5,null,null,78,100,28,58],
    ['01 Abr',null,68.5,null,null,78,100,28,58],
    ['17 Abr',null,67.4,null,null,78,100,28,58],
  ],
  'recuento' => ['17 Abr 2025',[['Desayuno','10:00','Cereal + leche'],['Comida','3:00','Comida de cafetería + agua'],['Cena','9:00','Tacos x2 + agua de sabor']],'1.2 L','Horarios irregulares por universidad. Mejorar estructura de tiempos.'],
  'plan' => '1,600 kcal · Flexible · Recetas para estudiantes',
],

]; // fin $data

// ─── 5. Insertar por paciente ──────────────────────────
$tabMap = ['No'=>'nunca','nunca'=>'nunca','exfumador'=>'exfumador','actual'=>'actual'];

foreach ($data as $pid => $d) {
    try {
        // Historia clínica
        $h = $d['historia'];
        $pdo->prepare('INSERT INTO historia_clinica
            (paciente_id,motivo_consulta,antecedentes_patologicos,alergias,intolerancias,
             medicamentos_actuales,cirugias_previas,antecedentes_familiares,actividad_fisica,
             ocupacion,estado_civil,tabaquismo,consumo_alcohol,biografia)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$pid,$h['motivo'],$h['antecedentes'],$h['alergias'],$h['intolerancias'],
                   $h['medicamentos'],$h['cirugias'],$h['patFam'],$h['actFisica'],
                   $h['ocupacion'],$h['estadoCivil'],$tabMap[$h['tabaco']]??'nunca',
                   $h['alcohol'],$h['bio']]);
        ok("Historia paciente $pid");

        // Laboratorios
        $stmtLab = $pdo->prepare('INSERT INTO laboratorios (paciente_id,fecha_prueba,prueba,valor,rango_referencia,estado) VALUES (?,?,?,?,?,?)');
        foreach ($d['labs'] as $l) {
            $stmtLab->execute([$pid, toDate($l[0]), $l[1], $l[2], $l[3], $l[4]]);
        }
        ok("Labs paciente $pid (" . count($d['labs']) . ")");

        // Mediciones (historial + medidas) — [date, sem, peso, grasa, nota, cintura, cadera, brazo, muslo]
        $stmtMed = $pdo->prepare('INSERT INTO mediciones (paciente_id,fecha,peso,porcentaje_grasa,nota,sem,cintura,cadera,brazo,muslo) VALUES (?,?,?,?,?,?,?,?,?,?)');
        foreach ($d['history'] as $m) {
            $stmtMed->execute([$pid, toDate($m[0]), $m[2], $m[3]??null, $m[4]??null, $m[1]??null, $m[5]??null, $m[6]??null, $m[7]??null, $m[8]??null]);
        }
        ok("Mediciones paciente $pid (" . count($d['history']) . ")");

        // Recuento 24h
        if ($d['recuento'][0]) {
            $pdo->prepare('INSERT INTO recuentos_24h (paciente_id,fecha_recuento,agua,nota) VALUES (?,?,?,?)')
                ->execute([$pid, toDate($d['recuento'][0]), $d['recuento'][2], $d['recuento'][3]]);
            $recId = $pdo->lastInsertId();
            $stmtT = $pdo->prepare('INSERT INTO tiempos_comida (recuento_id,tipo_comida,hora,alimentos) VALUES (?,?,?,?)');
            foreach ($d['recuento'][1] as $t) {
                $hora = $t[1];
                if ($hora && !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $hora)) $hora .= ':00';
                $stmtT->execute([$recId, $t[0], $hora ?: null, $t[2]]);
            }
            ok("Recuento paciente $pid");
        }

        // Plan nutricional
        if (!empty($d['plan'])) {
            $pdo->prepare('INSERT INTO planes_nutricionales (paciente_id,fecha_creacion,descripcion,activo) VALUES (?,?,?,1)')
                ->execute([$pid, date('Y-m-d'), $d['plan']]);
            ok("Plan paciente $pid");
        }

        // Embarazo
        if (!empty($d['embarazo'])) {
            [$sem,$prePeso,$dg] = $d['embarazo'];
            $pdo->prepare('INSERT INTO embarazo (paciente_id,semanas_gestacion,peso_preembarazo,diabetes_gestacional) VALUES (?,?,?,?)')
                ->execute([$pid,$sem,$prePeso,$dg?1:0]);
            ok("Embarazo paciente $pid");
        }

        // Lactancia
        if (!empty($d['lactancia'])) {
            [$sem,$prod,$tet,$sint,$supl,$pesos] = $d['lactancia'];
            $pdo->prepare('INSERT INTO lactancia (paciente_id,semanas_lactancia,produccion,tetadas_por_dia) VALUES (?,?,?,?)')
                ->execute([$pid,$sem,$prod,$tet]);
            $lacId = $pdo->lastInsertId();
            $stmtS = $pdo->prepare('INSERT INTO lactancia_sintomas (lactancia_id,sintoma) VALUES (?,?)');
            foreach ($sint as $s) $stmtS->execute([$lacId,$s]);
            $stmtP = $pdo->prepare('INSERT INTO peso_bebe (lactancia_id,semana,peso_kg) VALUES (?,?,?)');
            foreach ($pesos as $pb) $stmtP->execute([$lacId,$pb[0],$pb[1]]);
            ok("Lactancia paciente $pid");
        }

        // Glucosa
        if (!empty($d['glucosa'])) {
            $stmtG = $pdo->prepare('INSERT INTO glucosa_monitoreo (paciente_id,fecha,ayuno,pre_comida,post_comida,pre_cena,post_cena,nota) VALUES (?,?,?,?,?,?,?,?)');
            foreach ($d['glucosa'] as $g) {
                $stmtG->execute([$pid,$g[0],$g[1],$g[2],$g[3],$g[4],$g[5],$g[6]]);
            }
            ok("Glucosa paciente $pid");
        }

        // Actualizar peso_actual en pacientes con el último peso del historial
        if (!empty($d['history'])) {
            $last = end($d['history']);
            $pdo->prepare('UPDATE pacientes SET peso_actual=? WHERE id=?')->execute([$last[2],$pid]);
        }

    } catch (Exception $e) {
        fail("Paciente $pid: " . $e->getMessage());
    }
}

echo "═══════════════════════════════════\n";
echo "SEED CLÍNICO COMPLETO\n";
echo "═══════════════════════════════════\n\n";
echo implode("\n", $log) . "\n";
if ($errs) {
    echo "\n\nERRORES:\n" . implode("\n", $errs) . "\n";
}
echo "\n\nTotal: " . count($log) . " OK · " . count($errs) . " errores\n";
