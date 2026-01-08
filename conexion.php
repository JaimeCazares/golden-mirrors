<?php

$esLocal = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']);

if ($esLocal) {
    // ===== XAMPP =====
    $servername = "localhost";
    $username   = "root";
    $password   = "";
    $database   = "golden"; // ⚠️ tu BD local
} else {
    // ===== HOSTINGER =====
    $servername = "srv526.hstgr.io";
    $username   = "u717657264_golden";
    $password   = "Cazares710";
    $database   = "u717657264_golden";
}

$conexion = new mysqli($servername, $username, $password, $database);

if ($conexion->connect_error) {
    die("❌ Error de conexión");
}
