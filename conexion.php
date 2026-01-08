<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$esLocal = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']);

if ($esLocal) {
    $servername = "localhost";
    $username   = "root";
    $password   = "";
    $database   = "golden";
} else {
    $servername = "srv526.hstgr.io"; // ⚠️ esto lo vamos a verificar
    $username   = "u717657264_golden";
    $password   = "Jaimecazares7.";
    $database   = "u717657264_golden";
}

$conexion = new mysqli($servername, $username, $password, $database);

if ($conexion->connect_error) {
    die("ERROR BD: " . $conexion->connect_error);
}
