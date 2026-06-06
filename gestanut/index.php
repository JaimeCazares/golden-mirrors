<?php
session_start();
if (empty($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}
$nombre = htmlspecialchars($_SESSION['usuario_nombre'] ?? 'Diana');
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>GestaNut · Sistema · Diana Zavala</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
<style>
.logout-btn{display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--rs);cursor:pointer;color:rgba(250,246,239,.4);font-size:12.5px;border:none;background:transparent;width:100%;text-align:left;font-family:'DM Sans',sans-serif;transition:all .2s;margin-top:6px}
.logout-btn:hover{background:rgba(192,57,43,.12);color:rgba(250,246,239,.8)}
.logout-btn span{font-size:13px}
</style>
<script>(function(){var t=localStorage.getItem('gestanut-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}())</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>

<aside>
  <div class="brand">
    <div class="brand-mark">
      <img src="assets/img/logo.png" class="brand-logo" alt="GestaNut">
    </div>
    <div class="brand-tag">Sistema Clínico · v3.0</div>
  </div>
  <nav class="nav">
    <div class="nav-section">Principal</div>
    <button class="nav-btn active" data-view="dashboard"><span class="nav-icon">🏠</span><span>Inicio</span></button>
    <button class="nav-btn" data-view="pacientes"><span class="nav-icon">👩</span><span>Pacientes</span><span class="nav-badge">12</span></button>
    <button class="nav-btn" data-view="agenda"><span class="nav-icon">📅</span><span>Agenda</span></button>
    <button class="nav-btn" data-view="planes"><span class="nav-icon">🥗</span><span>Planes</span></button>
    <button class="nav-btn" data-view="pendientes"><span class="nav-icon">📌</span><span>Pendientes</span></button>
    <div class="nav-section">Clínico</div>
    <button class="nav-btn" data-view="calculadoras"><span class="nav-icon">🧮</span><span>Calculadoras</span></button>
    <button class="nav-btn" data-view="consentimientos"><span class="nav-icon">📝</span><span>Consentimientos</span></button>
    <div class="nav-section">Negocio</div>
    <button class="nav-btn" data-view="finanzas"><span class="nav-icon">💰</span><span>Finanzas</span></button>
    <button class="nav-btn" data-view="reportes"><span class="nav-icon">📊</span><span>Reportes</span></button>
    <button class="nav-btn" data-view="config"><span class="nav-icon">⚙️</span><span>Configuración</span></button>
  </nav>
  <div class="user-block">
    <div class="user-card">
      <div class="u-avatar">DZ</div>
      <div style="min-width:0;overflow:hidden">
        <div class="u-name"><?= $nombre ?></div>
        <div class="u-role">Nutrióloga · Cédula 15304166</div>
      </div>
    </div>
    <a href="logout.php" class="logout-btn" onclick="return confirm('¿Cerrar sesión?')">
      <span>🚪</span><span>Cerrar sesión</span>
    </a>
  </div>
</aside>

<main>
  <header class="topbar">
    <div class="tb-left">
      <div>
        <div class="tb-greeting" id="tb-title">Buenos días, <em><?= $nombre ?></em> 🌿</div>
        <div class="tb-sub" id="tb-sub">Cargando...</div>
      </div>
    </div>
    <div class="tb-right">
      <button type="button" class="btn-icon btn-menu" id="sidebar-toggle" title="Menú">☰</button>
      <button class="btn-icon btn-theme" id="theme-toggle" onclick="toggleTheme()" title="Cambiar tema"><span id="theme-icon">🌙</span></button>
      <button class="btn btn-outline btn-sm" onclick="openModal('appt-modal')">+ Cita</button>
      <button class="btn btn-primary btn-sm" onclick="openModal('newpx-modal')">+ Paciente</button>
    </div>
  </header>
  <div class="content" id="content-area"></div>
</main>

<div id="modal-root"></div>
<div id="toast-root"></div>
<div class="sidebar-overlay" id="sidebar-overlay"></div>
<button type="button" class="fab" onclick="openModal('appt-modal')" title="Nueva cita">+</button>

<!-- DATA -->
<script src="assets/js/data/patients.js"></script>
<script src="assets/js/data/finanzas.js"></script>

<!-- STATE & UTILS -->
<script src="assets/js/state.js"></script>

<!-- CONSULTA TABS -->
<script src="assets/js/consulta/tab-resumen.js"></script>
<script src="assets/js/consulta/tab-historia.js"></script>
<script src="assets/js/consulta/tab-laboratorio.js"></script>
<script src="assets/js/consulta/tab-recuento.js"></script>
<script src="assets/js/consulta/tab-glucosa.js"></script>
<script src="assets/js/consulta/tab-lactancia.js"></script>
<script src="assets/js/consulta/tab-progreso.js"></script>
<script src="assets/js/consulta/tab-plan.js"></script>
<script src="assets/js/consulta/tab-mediciones.js"></script>
<script src="assets/js/consulta/tab-notas.js"></script>
<script src="assets/js/consulta/tab-embarazo.js"></script>
<script src="assets/js/consulta/tab-galeria.js"></script>
<script src="assets/js/consulta/tab-documentos.js"></script>
<script src="assets/js/consulta/consulta.js"></script>

<!-- VIEWS -->
<script src="assets/js/views/dashboard.js"></script>
<script src="assets/js/views/pacientes.js"></script>
<script src="assets/js/views/agenda.js"></script>
<script src="assets/js/views/planes.js"></script>
<script src="assets/js/views/pendientes.js"></script>
<script src="assets/js/views/calculadoras.js"></script>
<script src="assets/js/views/consentimientos.js"></script>
<script src="assets/js/views/finanzas.js"></script>
<script src="assets/js/views/reportes.js"></script>
<script src="assets/js/views/config.js"></script>

<!-- GOOGLE CALENDAR INTEGRATION -->
<script src="assets/js/google-calendar.js"></script>

<!-- THEME -->
<script src="assets/js/theme.js"></script>

<!-- MODALS, NAVIGATION, INIT -->
<script src="assets/js/modals.js"></script>
<script src="assets/js/nav.js"></script>
<script src="assets/js/app.js"></script>

<!-- Redirigir al login si la API responde 401 -->
<script>
(function(){
  var _fetch = window.fetch;
  window.fetch = function(url, opts) {
    return _fetch(url, opts).then(function(res) {
      if (res.status === 401) { window.location.href = 'login.php'; }
      return res;
    });
  };
})();
</script>

</body>
</html>
