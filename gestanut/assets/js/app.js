// Devuelve la fecha local del sistema como YYYY-MM-DD (evita el bug de toISOString en UTC+)
function localToday() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// ══════════════════════════════════════════════════════
// APP · Initialisation
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Auto-migración: garantiza que todas las columnas existan
  try { await fetch('api/migrate_plan.php'); } catch (e) {}

  // Cargar pacientes y finanzas desde la BD en paralelo
  try {
    const [resP, resF] = await Promise.all([
      fetch('api/pacientes.php'),
      fetch('api/finanzas.php'),
    ]);
    if (resP.ok) PATIENTS = (await resP.json()).map(buildPatient);
    if (resF.ok) FINANZAS = await resF.json();
  } catch (e) {
    console.warn('No se pudo conectar a la BD, usando datos locales.', e);
  }

  injectModals();
  showView('dashboard');
  actualizarContadores();

  const h = new Date().getHours();
  const g = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  $('#tb-title').innerHTML = `${g}, <em>Diana</em> 🌿`;
});

function actualizarContadores() {
  const total = PATIENTS.length;
  // Badge del nav
  const badge = document.querySelector('.nav-btn[data-view="pacientes"] .nav-badge');
  if (badge) badge.textContent = total;
  // Sub del topbar
  const sub = $('#tb-sub');
  if (sub) {
    const hoy = new Date().toLocaleDateString('es-MX', {weekday:'long', day:'numeric', month:'long'});
    sub.textContent = `${hoy.charAt(0).toUpperCase() + hoy.slice(1)} · ${total} paciente${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}`;
  }
  // Botón filtro "Todas"
  const btnTodas = document.querySelector('.btn[onclick*="todos"]');
  if (btnTodas) btnTodas.textContent = `Todas (${total})`;
  // Stat card del dashboard
  const dashStat = document.querySelector('#dash-stat-0 .stat-val');
  if (dashStat) dashStat.textContent = total;
}
