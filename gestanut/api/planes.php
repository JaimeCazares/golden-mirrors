<?php
// ══════════════════════════════════════════════════════
// API · Lista de planes nutricionales activos
// GET — devuelve todos los planes activos con datos del paciente
// ══════════════════════════════════════════════════════
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

$stmt = $pdo->query("
    SELECT pn.id, pn.paciente_id, pn.calorias_diarias, pn.descripcion, pn.fecha_creacion,
           p.nombre, p.tipo_consulta
    FROM planes_nutricionales pn
    JOIN pacientes p ON p.id = pn.paciente_id
    WHERE pn.activo = 1
    ORDER BY pn.fecha_creacion DESC
");

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
