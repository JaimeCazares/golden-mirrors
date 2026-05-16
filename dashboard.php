<?php
session_start();
if (empty($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    header('Location: login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Mi Dashboard</title>

  <link rel="stylesheet" href="style.css?v=2.0">
  <link rel="stylesheet" href="kg/kg.css?v=1.0">
  <link rel="stylesheet" href="deuda/deuda.css?v=1.0">
  <link rel="stylesheet" href="escalera/escalera.css?v=1.0">
  <link rel="stylesheet" href="espejo/css/espejo-layout.css">
  <link rel="stylesheet" href="espejo/css/espejo-ui.css">
  <link rel="stylesheet" href="espejo/css/espejo-selector.css">
  <link rel="stylesheet" href="gastos/gastos.css?v=1.0">
</head>

<body>

  <section id="vista-inicio" class="vista-principal activa">
    <div id="deuda-wrapper"></div>
    <div id="kg-wrapper"></div>
    <div id="gastos-container"></div>
</section>

  <section id="vista-dinamica" class="vista-principal">
      <div id="contenido-modulo">
          </div>
  </section>

  <nav class="dock-nav">
      <button class="nav-btn activo" onclick="cambiarPestana('inicio')">
          <span class="icono">🏠</span>
          <span class="label">Inicio</span>
      </button>

      <button class="nav-btn" onclick="cambiarPestana('escalera')">
          <span class="icono">🔥</span>
          <span class="label">Escalera</span>
      </button>

      <button class="nav-btn" onclick="cambiarPestana('espejo')">
          <span class="icono">🪞</span>
          <span class="label">Espejo</span>
      </button>

      <button class="nav-btn" onclick="cambiarPestana('registro')">
          <span class="icono">📝</span>
          <span class="label">Normales</span>
      </button>
  </nav>

  <script src="script.js?v=3.0"></script>

  <script>
    fetch('kg/kg.html').then(r => r.text()).then(h => {
        document.getElementById('kg-wrapper').innerHTML = h;
        const modal = document.getElementById('modalKg');
        const modalFotos = document.getElementById('modalVerFotos');
        if (modal) document.body.appendChild(modal);
        if (modalFotos) document.body.appendChild(modalFotos);
        let s = document.createElement('script');
        s.src = 'kg/kg.js?v=' + Date.now();
        s.onload = () => { if (typeof initKg === 'function') initKg() };
        document.body.appendChild(s);
    });

    fetch('deuda/deuda.html').then(r => r.text()).then(h => {
        document.getElementById('deuda-wrapper').innerHTML = h;
        let s = document.createElement('script');
        s.src = 'deuda/deuda.js?v=' + Date.now();
        s.onload = () => { if (typeof initDeuda === 'function') initDeuda() };
        document.body.appendChild(s);
    });

    fetch('gastos/gastos.html').then(r => r.text()).then(h => {
        document.getElementById('gastos-container').innerHTML = h;
        let s = document.createElement('script');
        s.src = 'gastos/gastos.js?v=' + Date.now();
        s.onload = () => {
            if (typeof initGastos === 'function') initGastos();
        };
        document.body.appendChild(s);
    });
  </script>

  <script src="gastos/gastos.js"></script>

</body>
</html>
