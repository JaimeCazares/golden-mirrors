<?php
$servername = "srv526.hstgr.io";
$username = "u717657264_golden";
$password = "AQUI_TU_PASSWORD";
$database = "u717657264_golden";

$conexion = new mysqli($servername, $username, $password, $database);

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}
