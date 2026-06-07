<?php
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__ . '/db.php';

// Crear tabla si no existe
$pdo->exec("
  CREATE TABLE IF NOT EXISTS citas (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    paciente_id   INT UNSIGNED NOT NULL,
    fecha         DATE NOT NULL,
    hora          TIME NOT NULL,
    modalidad     ENUM('presencial','online') NOT NULL DEFAULT 'presencial',
    tipo_consulta VARCHAR(100) NOT NULL DEFAULT 'Control / Seguimiento',
    notas         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: citas de una semana (o próxima cita de un paciente) ─────────
if ($method === 'GET') {
    if (isset($_GET['paciente_id'])) {
        $pid  = (int)$_GET['paciente_id'];
        $stmt = $pdo->prepare("
            SELECT c.*, p.nombre AS paciente_nombre
            FROM citas c
            JOIN pacientes p ON p.id = c.paciente_id
            WHERE c.paciente_id = :pid AND c.fecha >= CURDATE()
            ORDER BY c.fecha ASC, c.hora ASC
            LIMIT 1
        ");
        $stmt->execute([':pid' => $pid]);
        echo json_encode($stmt->fetch() ?: null);
        exit;
    }

    $desde = $_GET['desde'] ?? date('Y-m-d', strtotime('monday this week'));
    $hasta = $_GET['hasta'] ?? date('Y-m-d', strtotime('saturday this week'));

    $stmt = $pdo->prepare("
        SELECT c.*, p.nombre AS paciente_nombre
        FROM citas c
        JOIN pacientes p ON p.id = c.paciente_id
        WHERE c.fecha BETWEEN :desde AND :hasta
        ORDER BY c.fecha ASC, c.hora ASC
    ");
    $stmt->execute([':desde' => $desde, ':hasta' => $hasta]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// ── POST: crear cita ──────────────────────────────────────────────
if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("
        INSERT INTO citas (paciente_id, fecha, hora, modalidad, tipo_consulta, notas)
        VALUES (:pid, :fecha, :hora, :mod, :tipo, :notas)
    ");
    $stmt->execute([
        ':pid'   => (int)$d['paciente_id'],
        ':fecha' => $d['fecha'],
        ':hora'  => $d['hora'],
        ':mod'   => $d['modalidad'] ?? 'presencial',
        ':tipo'  => $d['tipo_consulta'] ?? 'Control / Seguimiento',
        ':notas' => $d['notas'] ?? '',
    ]);

    $id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("
        SELECT c.*, p.nombre AS paciente_nombre
        FROM citas c JOIN pacientes p ON p.id = c.paciente_id
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
    exit;
}

// ── DELETE: eliminar cita ─────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id) {
        $pdo->prepare('DELETE FROM citas WHERE id = ?')->execute([$id]);
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'id requerido']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
