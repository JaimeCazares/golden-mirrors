<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

/**
 * Detectar entorno correctamente
 * Local: XAMPP
 * Producción: Hostinger
 */
$esLocal = (
    in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1'])
    || strpos($_SERVER['DOCUMENT_ROOT'], 'xampp') !== false
);

if ($esLocal) {
    // 🔹 XAMPP (LOCAL)
    $servername = "localhost";
    $username   = "root";
    $password   = "";
    $database   = "golden";
    $port       = 3306; // 👈 Cambiado a 3306 que es el estándar de XAMPP
} else {
    // 🔹 HOSTINGER (PRODUCCIÓN)
    $servername = "localhost"; // Hostinger usa localhost interno
    $username   = "u717657264_golden";
    $password   = "Jaimecazares7.";
    $database   = "u717657264_golden";
    $port       = 3306; // estándar en hosting
}

$conexion = new mysqli(
    $servername,
    $username,
    $password,
    $database,
    $port
);

if ($conexion->connect_error) {
    die("ERROR BD: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");
