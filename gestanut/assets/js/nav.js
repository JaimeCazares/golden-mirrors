// ══════════════════════════════════════════════════════
// NAVIGATION · Sidebar buttons + view routing
// ══════════════════════════════════════════════════════
$$('.nav-btn').forEach(b => b.addEventListener('click', () => {
  const v = b.dataset.view;
  if (!v) return;
  currentPatient = null;
  $$('.nav-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  showView(v);
}));

function showView(name) {
  currentView = name;
  currentPatient = null;
  const c = $('#content-area');
  c.innerHTML = '';
  const fn = VIEWS[name];
  if (fn) c.innerHTML = fn();
  const total = PATIENTS.length;
  const now   = new Date();
  const mesNom = now.toLocaleString('es-MX', { month: 'long' });
  const anio   = now.getFullYear();

  const ti = {
    dashboard:      ['Buenos días, <em>Diana</em> 🌿',           ''],
    pacientes:      ['Mis <em>Pacientes</em>',                   `${total} paciente${total !== 1 ? 's' : ''} · Expedientes digitales completos`],
    agenda:         ['<em>Agenda</em>',                          typeof gcalIsConnected === 'function' && gcalIsConnected() ? 'Sincronizado con Google Calendar' : 'Semana actual'],
    planes:         ['Planes <em>Nutricionales</em>',            'Crea, edita y envía planes personalizados'],
    calculadoras:   ['<em>Calculadoras</em> Clínicas',           'IMC · Calorías · Macros · Agua · Gestacional'],
    consentimientos:['<em>Consentimientos</em> Informados',      'Control y firma de consentimientos'],
    finanzas:       ['<em>Finanzas</em>',                        `${mesNom.charAt(0).toUpperCase() + mesNom.slice(1)} ${anio} · Ingresos, gastos y recibos`],
    reportes:       ['<em>Reportes</em>',                        'Estadísticas y métricas de tu práctica'],
    pendientes:     ['Mis <em>Pendientes</em>',                   'Notas rápidas y listas de tareas'],
    config:         ['<em>Configuración</em>',                   'Personaliza tu sistema profesional'],
  };
  if (ti[name]) {
    $('#tb-title').innerHTML = ti[name][0];
    $('#tb-sub').textContent = ti[name][1];
  }
  setTimeout(() => {
    if (name === 'dashboard')    initDash();
    if (name === 'pacientes')    renderGrid();
    if (name === 'agenda')       { loadAgendaGcalEvents(); if (!(typeof gcalIsConnected === 'function' && gcalIsConnected())) loadAgendaCitas(); }
    if (name === 'calculadoras') { recalcIMC(); recalcKcal(); recalcWater(); recalcGest(); }
    if (name === 'pendientes')   initPendientes();
    if (name === 'reportes')     initReportes();
  }, 40);
}

function navTo(n) {
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === n));
  showView(n);
}

// ── SIDEBAR TOGGLE · iPad / tablet ──
(function(){
  const toggle  = document.getElementById('sidebar-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebar = document.querySelector('aside');
  if (!toggle || !overlay || !sidebar) return;

  function openSidebar()  { sidebar.classList.add('open');    overlay.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }

  toggle.addEventListener('click', () =>
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
  );
  overlay.addEventListener('click', closeSidebar);

  $$('.nav-btn').forEach(b => b.addEventListener('click', () => {
    if (window.innerWidth <= 850) closeSidebar();
  }));
})();
