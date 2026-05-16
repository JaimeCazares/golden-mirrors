<?php
require_once 'conexion.php';
header('Content-Type: application/json');

// Prueba rápida de conexión y tablas
$resultado = [];

// Conexión OK
$resultado['conexion'] = 'OK';
$resultado['host'] = $_SERVER['HTTP_HOST'];
$resultado['doc_root'] = $_SERVER['DOCUMENT_ROOT'];

// Verificar tablas
foreach (['gt_clientes','gt_servicios','gt_ahorro'] as $tabla) {
    $r = $conexion->query("SELECT COUNT(*) as total FROM $tabla");
    $resultado['tabla_'.$tabla] = $r ? $r->fetch_assoc()['total'].' registros' : 'ERROR: '.$conexion->error;
}

echo json_encode($resultado, JSON_PRETTY_PRINT);
