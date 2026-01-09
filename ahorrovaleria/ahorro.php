<?php
require_once __DIR__ . '/../session_init.php';

if ($_SESSION['rol'] !== 'novia') {
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
  <link rel="stylesheet" href="ahorro.css?v=4">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#ff69b4">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

</head>

<body>

  <div class="contenedor">
    <h1>
      <span class="titulo-texto">Reto de Ahorro</span>
      <span class="titulo-emoji">🌸</span>
    </h1>

    <p>Vamos por los <strong>$10,000</strong> 💕</p>

    <div class="total">
      Total ahorrado: <span id="total">$0</span>
    </div>

    <div class="lista" id="listaAhorro"></div>
  </div>

  <script src="/ahorrovaleria/ahorro.js?v=3"></script>
</body>

</html>