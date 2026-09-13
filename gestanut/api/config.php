<?php
$is_local = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', 'localhost:80']);

if ($is_local) {
    define('DB_HOST',   'localhost');
    define('DB_NAME',   'gestanut');
    define('DB_USER',   'root');
    define('DB_PASS',   '');
} else {
    // Credenciales reales de producción: viven SOLO en el servidor, en un archivo
    // que no se sube a git (ver .gitignore) para no exponerlas públicamente.
    $localConfig = __DIR__ . '/config.local.php';
    if (!file_exists($localConfig)) {
        http_response_code(500);
        die('Falta config.local.php en el servidor. Ver config.local.example.php');
    }
    require $localConfig;
}

function get_pdo(): PDO {
    return new PDO(
        'mysql:host=' . DB_HOST . ';port=3306;dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
}
