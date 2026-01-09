<?php
session_start();

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'novia') {
    header("Location: ../login.html");
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mi ahorro 💖</title>
<link rel="stylesheet" href="ahorro.css">
</head>
<body>

<div class="contenedor">
  <h1>🌸 Reto de Ahorro 🌸</h1>
  <p>Vamos por los <strong>$10,000</strong> 💕</p>

  <div class="total">
    Total ahorrado: <span id="total">$0</span>
  </div>

  <div class="lista" id="listaAhorro"></div>
</div>

<script src="ahorro.js"></script>
</body>
</html>
