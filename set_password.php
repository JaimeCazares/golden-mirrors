<?php
// ⚠️ SCRIPT DE UN SOLO USO — bórralo del servidor en cuanto termines de usarlo.
// Requiere que ya hayas corrido: ALTER TABLE usuarios CHANGE password password_hash VARCHAR(255) NOT NULL;
require __DIR__ . '/conexion.php';

$mensaje = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = trim($_POST['usuario'] ?? '');
    $nueva   = trim($_POST['nueva'] ?? '');

    if (!in_array($usuario, ['admin', 'vale'], true) || strlen($nueva) < 8) {
        $mensaje = 'Usuario inválido o contraseña muy corta (mínimo 8 caracteres).';
    } else {
        $hash = password_hash($nueva, PASSWORD_DEFAULT);
        $stmt = $conexion->prepare('UPDATE usuarios SET password_hash = ? WHERE usuario = ?');
        $stmt->bind_param('ss', $hash, $usuario);
        $stmt->execute();
        $mensaje = $stmt->affected_rows > 0
            ? "Listo, contraseña de '$usuario' actualizada."
            : "No se encontró el usuario '$usuario' (¿ya corriste el ALTER TABLE?).";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;max-width:420px;margin:60px auto">
<h2>Fijar nueva contraseña</h2>
<?php if ($mensaje): ?><p><strong><?= htmlspecialchars($mensaje) ?></strong></p><?php endif; ?>
<form method="POST">
  <label>Usuario:
    <select name="usuario">
      <option value="admin">admin</option>
      <option value="vale">vale</option>
    </select>
  </label><br><br>
  <label>Nueva contraseña: <input type="text" name="nueva" minlength="8" required></label><br><br>
  <button type="submit">Guardar</button>
</form>
<p style="color:red">⚠️ Borra este archivo del servidor en cuanto termines.</p>
</body>
</html>
