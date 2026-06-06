<?php
$is_local = in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', 'localhost:80']);

if ($is_local) {
    define('DB_HOST',   'localhost');
    define('DB_NAME',   'gestanut');
    define('DB_USER',   'root');
    define('DB_PASS',   '');
} else {
    define('DB_HOST',   'localhost');
    define('DB_NAME',   'u717657264_gestanut');
    define('DB_USER',   'u717657264_gestanut');
    define('DB_PASS',   'Valeriabb7.');
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
