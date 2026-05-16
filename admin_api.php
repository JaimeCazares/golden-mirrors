<?php
require_once 'conexion.php';
header('Content-Type: application/json');

$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {

    // ── CLIENTES ──────────────────────────────────────────────
    case 'listar_clientes':
        $r = $conexion->query("
            SELECT c.*, COUNT(s.id) AS total_servicios
            FROM gt_clientes c
            LEFT JOIN gt_servicios s ON s.cliente_id = c.id
            GROUP BY c.id
            ORDER BY c.numero_cliente
        ");
        echo json_encode($r->fetch_all(MYSQLI_ASSOC));
        break;

    case 'guardar_cliente':
        $d = json_decode(file_get_contents('php://input'), true);
        $id   = intval($d['id'] ?? 0);
        $num  = intval($d['numero_cliente']);
        $nom  = $conexion->real_escape_string(trim($d['nombre']));
        $tel  = $conexion->real_escape_string(trim($d['telefono']));
        if ($id > 0) {
            $conexion->query("UPDATE gt_clientes SET numero_cliente=$num, nombre='$nom', telefono='$tel' WHERE id=$id");
        } else {
            $conexion->query("INSERT INTO gt_clientes (numero_cliente,nombre,telefono) VALUES ($num,'$nom','$tel')");
            $id = $conexion->insert_id;
        }
        echo json_encode(['ok' => true, 'id' => $id]);
        break;

    case 'eliminar_cliente':
        $id = intval($_GET['id']);
        $conexion->query("DELETE FROM gt_clientes WHERE id=$id");
        echo json_encode(['ok' => true]);
        break;

    // ── SERVICIOS ────────────────────────────────────────────
    case 'listar_servicios':
        $cid = intval($_GET['cliente_id']);
        $r = $conexion->query("SELECT * FROM gt_servicios WHERE cliente_id=$cid ORDER BY fecha DESC");
        echo json_encode($r->fetch_all(MYSQLI_ASSOC));
        break;

    case 'guardar_servicio':
        $d   = json_decode(file_get_contents('php://input'), true);
        $id  = intval($d['id'] ?? 0);
        $cid = intval($d['cliente_id']);
        $tip = $conexion->real_escape_string(trim($d['tipo']));
        $des = $conexion->real_escape_string(trim($d['descripcion'] ?? ''));
        $fec = $conexion->real_escape_string($d['fecha']);
        $cos = floatval($d['costo']);
        if ($id > 0) {
            $conexion->query("UPDATE gt_servicios SET tipo='$tip',descripcion='$des',fecha='$fec',costo=$cos WHERE id=$id");
        } else {
            $conexion->query("INSERT INTO gt_servicios (cliente_id,tipo,descripcion,fecha,costo) VALUES ($cid,'$tip','$des','$fec',$cos)");
            $id = $conexion->insert_id;
        }
        echo json_encode(['ok' => true, 'id' => $id]);
        break;

    case 'eliminar_servicio':
        $id = intval($_GET['id']);
        $conexion->query("DELETE FROM gt_servicios WHERE id=$id");
        echo json_encode(['ok' => true]);
        break;

    // ── AHORRO ───────────────────────────────────────────────
    case 'listar_ahorro':
        $r = $conexion->query("SELECT * FROM gt_ahorro ORDER BY fecha DESC, id DESC");
        $rows = $r->fetch_all(MYSQLI_ASSOC);
        $saldo = 0;
        foreach ($rows as $row) {
            $saldo += $row['tipo'] === 'ingreso' ? $row['monto'] : -$row['monto'];
        }
        echo json_encode(['movimientos' => $rows, 'saldo' => $saldo]);
        break;

    case 'guardar_ahorro':
        $d     = json_decode(file_get_contents('php://input'), true);
        $id    = intval($d['id'] ?? 0);
        $con   = $conexion->real_escape_string(trim($d['concepto']));
        $tipo  = $d['tipo'] === 'egreso' ? 'egreso' : 'ingreso';
        $mon   = floatval($d['monto']);
        $fec   = $conexion->real_escape_string($d['fecha']);
        $not   = $conexion->real_escape_string(trim($d['notas'] ?? ''));
        if ($id > 0) {
            $conexion->query("UPDATE gt_ahorro SET concepto='$con',tipo='$tipo',monto=$mon,fecha='$fec',notas='$not' WHERE id=$id");
        } else {
            $conexion->query("INSERT INTO gt_ahorro (concepto,tipo,monto,fecha,notas) VALUES ('$con','$tipo',$mon,'$fec','$not')");
            $id = $conexion->insert_id;
        }
        echo json_encode(['ok' => true, 'id' => $id]);
        break;

    case 'eliminar_ahorro':
        $id = intval($_GET['id']);
        $conexion->query("DELETE FROM gt_ahorro WHERE id=$id");
        echo json_encode(['ok' => true]);
        break;

    default:
        echo json_encode(['error' => 'accion desconocida']);
}
