<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Admin — Golden Tech</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{
  --sand:#F0EBE1;--forest:#2C3E35;--forest2:#3D5247;
  --gold:#C9960C;--gold2:#E8AC0E;--terra:#B5572A;
  --sage:#8FB49A;--white:#FAFAF8;--text:#1E2D27;
  --muted:#6B7C74;--border:rgba(44,62,53,.14);
  --red:#c0392b;--green:#1a7a4a;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--sand);color:var(--text);min-height:100vh;}
a{text-decoration:none;color:inherit;}

/* ── TOPBAR ── */
.topbar{background:var(--forest);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px;}
.topbar .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;}
.topbar .brand span{color:var(--gold2);}
.back-btn{font-size:13px;opacity:.75;display:flex;align-items:center;gap:6px;transition:opacity .2s;}
.back-btn:hover{opacity:1;}

/* ── TABS ── */
.tabs{display:flex;gap:0;border-bottom:2px solid var(--border);background:var(--white);padding:0 24px;}
.tab{padding:14px 22px;font-size:14px;font-weight:600;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;color:var(--muted);transition:color .2s,border-color .2s;}
.tab.active{color:var(--forest);border-color:var(--gold);}

/* ── CONTAINER ── */
.container{max-width:1200px;margin:0 auto;padding:24px 20px;}

/* ── CARDS ── */
.card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:20px;}
.card-title{font-size:15px;font-weight:700;color:var(--forest);margin-bottom:16px;display:flex;align-items:center;gap:8px;}

/* ── BOTONES ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:filter .2s;}
.btn:hover{filter:brightness(.92);}
.btn-gold{background:var(--gold);color:#fff;}
.btn-forest{background:var(--forest);color:#fff;}
.btn-red{background:var(--red);color:#fff;}
.btn-sage{background:var(--sage);color:var(--forest);}
.btn-sm{padding:5px 10px;font-size:12px;}

/* ── TABLA ── */
.tbl-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{background:var(--forest);color:#fff;padding:10px 12px;text-align:left;font-weight:600;}
td{padding:9px 12px;border-bottom:1px solid var(--border);}
tr:hover td{background:rgba(143,180,154,.12);}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;}
.badge-ing{background:#d4edda;color:#1a7a4a;}
.badge-eg{background:#fde0dc;color:var(--red);}

/* ── SALDO ── */
.saldo-box{display:flex;align-items:center;gap:16px;padding:16px 20px;background:linear-gradient(135deg,var(--forest),var(--forest2));border-radius:12px;color:#fff;margin-bottom:20px;}
.saldo-box .s-label{font-size:13px;opacity:.75;}
.saldo-box .s-val{font-size:28px;font-weight:700;color:var(--gold2);}

/* ── MODAL ── */
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:900;align-items:center;justify-content:center;}
.modal-bg.open{display:flex;}
.modal{background:var(--white);border-radius:14px;padding:24px;width:min(520px,95vw);max-height:90vh;overflow-y:auto;}
.modal h3{font-size:16px;font-weight:700;color:var(--forest);margin-bottom:18px;}
.form-group{margin-bottom:14px;}
label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:4px;}
input,select,textarea{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;background:var(--sand);color:var(--text);}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--gold);}
textarea{resize:vertical;min-height:70px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;}

/* ── SERVICIOS INLINE ── */
.srv-expand{background:var(--sand);padding:12px 16px;border-top:1px solid var(--border);}
.srv-expand table th{background:var(--forest2);}

/* ── EMPTY ── */
.empty{text-align:center;padding:32px;color:var(--muted);font-size:13px;}

/* PANEL */
.panel{display:none;}
.panel.active{display:block;}

/* SEARCH */
.search-bar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
.search-bar input{max-width:260px;flex:1;}

/* NUM CLT */
.num-badge{display:inline-block;background:var(--gold);color:#fff;border-radius:999px;padding:1px 9px;font-size:11px;font-weight:700;}
</style>
</head>
<body>

<!-- TOPBAR -->
<div class="topbar">
  <div class="brand"><img src="img/logo.png" style="height:32px;"> Golden <span>Tech</span> — Admin</div>
  <a href="index.html" class="back-btn">← Volver al sitio</a>
</div>

<!-- TABS -->
<div class="tabs">
  <div class="tab active" onclick="showPanel('clientes',this)">👥 Clientes</div>
  <div class="tab" onclick="showPanel('ahorro',this)">💰 Cuenta de Ahorro</div>
</div>

<!-- ═══════════════ PANEL CLIENTES ═══════════════ -->
<div class="container">
<div id="panel-clientes" class="panel active">
  <div class="card">
    <div class="card-title">👥 Clientes registrados
      <button class="btn btn-gold btn-sm" style="margin-left:auto" onclick="abrirModalCliente()">+ Nuevo cliente</button>
    </div>
    <div class="search-bar">
      <input type="text" id="buscar-cliente" placeholder="Buscar por nombre o teléfono…" oninput="filtrarClientes()">
    </div>
    <div class="tbl-wrap">
      <table id="tabla-clientes">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Servicios</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="body-clientes"></tbody>
      </table>
    </div>
  </div>
</div>

<!-- ═══════════════ PANEL AHORRO ═══════════════ -->
<div id="panel-ahorro" class="panel">
  <div class="saldo-box">
    <div>
      <div class="s-label">Saldo disponible</div>
      <div class="s-val" id="saldo-val">$0.00</div>
    </div>
    <button class="btn btn-gold" style="margin-left:auto" onclick="abrirModalAhorro()">+ Movimiento</button>
  </div>
  <div class="card">
    <div class="card-title">📋 Historial de movimientos</div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th>Monto</th><th>Notas</th><th>Acciones</th></tr>
        </thead>
        <tbody id="body-ahorro"></tbody>
      </table>
    </div>
  </div>
</div>

</div><!-- /container -->

<!-- ═══ MODAL CLIENTE ═══ -->
<div class="modal-bg" id="modal-cliente">
  <div class="modal">
    <h3 id="modal-cliente-title">Nuevo cliente</h3>
    <input type="hidden" id="cl-id">
    <div class="form-row">
      <div class="form-group">
        <label>N° de cliente</label>
        <input type="number" id="cl-num" min="1" placeholder="Ej. 1">
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input type="text" id="cl-tel" placeholder="667 000 0000">
      </div>
    </div>
    <div class="form-group">
      <label>Nombre completo</label>
      <input type="text" id="cl-nom" placeholder="Nombre del cliente">
    </div>
    <div class="modal-actions">
      <button class="btn btn-sage" onclick="cerrarModal('modal-cliente')">Cancelar</button>
      <button class="btn btn-forest" onclick="guardarCliente()">Guardar</button>
    </div>
  </div>
</div>

<!-- ═══ MODAL SERVICIO ═══ -->
<div class="modal-bg" id="modal-servicio">
  <div class="modal">
    <h3 id="modal-srv-title">Nuevo servicio</h3>
    <input type="hidden" id="sv-id">
    <input type="hidden" id="sv-cid">
    <div class="form-group">
      <label>Tipo de servicio</label>
      <select id="sv-tipo">
        <option value="Mantenimiento de Computadora">Mantenimiento de Computadora</option>
        <option value="Mantenimiento de Consola/Control">Mantenimiento de Consola/Control</option>
        <option value="Formateo">Formateo</option>
        <option value="Instalación de Office">Instalación de Office</option>
        <option value="Optimización">Optimización</option>
        <option value="Instalación de Sistema Operativo">Instalación de Sistema Operativo</option>
        <option value="Expansión de Almacenamiento">Expansión de Almacenamiento</option>
        <option value="Página Web / Sistema">Página Web / Sistema</option>
        <option value="Otro">Otro</option>
      </select>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea id="sv-desc" placeholder="Detalles del servicio…"></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="sv-fecha">
      </div>
      <div class="form-group">
        <label>Costo ($)</label>
        <input type="number" id="sv-costo" min="0" step="0.01" placeholder="0.00">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-sage" onclick="cerrarModal('modal-servicio')">Cancelar</button>
      <button class="btn btn-forest" onclick="guardarServicio()">Guardar</button>
    </div>
  </div>
</div>

<!-- ═══ MODAL AHORRO ═══ -->
<div class="modal-bg" id="modal-ahorro">
  <div class="modal">
    <h3 id="modal-ah-title">Nuevo movimiento</h3>
    <input type="hidden" id="ah-id">
    <div class="form-group">
      <label>Concepto</label>
      <input type="text" id="ah-con" placeholder="Ej. Compra de pasta térmica">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo</label>
        <select id="ah-tipo">
          <option value="ingreso">Ingreso ↑</option>
          <option value="egreso">Egreso ↓</option>
        </select>
      </div>
      <div class="form-group">
        <label>Monto ($)</label>
        <input type="number" id="ah-mon" min="0" step="0.01" placeholder="0.00">
      </div>
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="ah-fec">
    </div>
    <div class="form-group">
      <label>Notas (opcional)</label>
      <textarea id="ah-not" placeholder="Notas adicionales…"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-sage" onclick="cerrarModal('modal-ahorro')">Cancelar</button>
      <button class="btn btn-forest" onclick="guardarAhorro()">Guardar</button>
    </div>
  </div>
</div>

<script>
const API = 'admin_api.php';
let todosClientes = [];

// ── TABS ────────────────────────────────────────
function showPanel(id, tab) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  tab.classList.add('active');
  if (id === 'ahorro') cargarAhorro();
}

// ── MODAL HELPERS ────────────────────────────────
function abrirModal(id) { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-bg').forEach(m => m.addEventListener('click', e => { if(e.target === m) m.classList.remove('open'); }));

// ══════════════════════════════════════════════════
//  CLIENTES
// ══════════════════════════════════════════════════
async function cargarClientes() {
  const res = await fetch(API + '?accion=listar_clientes');
  todosClientes = await res.json();
  renderClientes(todosClientes);
}

function renderClientes(lista) {
  const tb = document.getElementById('body-clientes');
  if (!lista.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">Sin clientes registrados</td></tr>'; return; }
  tb.innerHTML = lista.map(c => `
    <tr id="row-${c.id}">
      <td><span class="num-badge">#${c.numero_cliente}</span></td>
      <td><strong>${esc(c.nombre)}</strong></td>
      <td>${esc(c.telefono)}</td>
      <td>
        <button class="btn btn-sage btn-sm" onclick="toggleServicios(${c.id})">
          ${c.total_servicios} servicio(s) ▾
        </button>
      </td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-forest btn-sm" onclick="editarCliente(${c.id})">✏️ Editar</button>
        <button class="btn btn-gold btn-sm" onclick="abrirModalServicio(${c.id})">+ Servicio</button>
        <button class="btn btn-red btn-sm" onclick="eliminarCliente(${c.id})">🗑️</button>
      </td>
    </tr>
    <tr id="srv-row-${c.id}" style="display:none;">
      <td colspan="5" class="srv-expand" id="srv-expand-${c.id}">Cargando…</td>
    </tr>
  `).join('');
}

function filtrarClientes() {
  const q = document.getElementById('buscar-cliente').value.toLowerCase();
  const lista = todosClientes.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.telefono.includes(q)
  );
  renderClientes(lista);
}

function abrirModalCliente() {
  document.getElementById('cl-id').value = '';
  document.getElementById('cl-num').value = '';
  document.getElementById('cl-nom').value = '';
  document.getElementById('cl-tel').value = '';
  document.getElementById('modal-cliente-title').textContent = 'Nuevo cliente';
  abrirModal('modal-cliente');
}

function editarCliente(id) {
  const c = todosClientes.find(x => x.id == id);
  if (!c) return;
  document.getElementById('cl-id').value = c.id;
  document.getElementById('cl-num').value = c.numero_cliente;
  document.getElementById('cl-nom').value = c.nombre;
  document.getElementById('cl-tel').value = c.telefono;
  document.getElementById('modal-cliente-title').textContent = 'Editar cliente';
  abrirModal('modal-cliente');
}

async function guardarCliente() {
  const payload = {
    id: document.getElementById('cl-id').value,
    numero_cliente: document.getElementById('cl-num').value,
    nombre: document.getElementById('cl-nom').value,
    telefono: document.getElementById('cl-tel').value,
  };
  if (!payload.numero_cliente || !payload.nombre || !payload.telefono) { alert('Completa todos los campos.'); return; }
  await fetch(API + '?accion=guardar_cliente', { method:'POST', body: JSON.stringify(payload) });
  cerrarModal('modal-cliente');
  cargarClientes();
}

async function eliminarCliente(id) {
  if (!confirm('¿Eliminar este cliente y todos sus servicios?')) return;
  await fetch(API + '?accion=eliminar_cliente&id=' + id);
  cargarClientes();
}

// ── SERVICIOS ────────────────────────────────────
async function toggleServicios(cid) {
  const row = document.getElementById('srv-row-' + cid);
  const exp = document.getElementById('srv-expand-' + cid);
  if (row.style.display === 'none') {
    row.style.display = '';
    const res = await fetch(API + '?accion=listar_servicios&cliente_id=' + cid);
    const srvs = await res.json();
    exp.innerHTML = renderServicios(srvs, cid);
  } else {
    row.style.display = 'none';
  }
}

function renderServicios(srvs, cid) {
  if (!srvs.length) return '<em style="color:var(--muted)">Sin servicios aún. <button class="btn btn-gold btn-sm" onclick="abrirModalServicio('+cid+')">+ Agregar</button></em>';
  const totalCosto = srvs.reduce((a,s) => a + parseFloat(s.costo), 0);
  return `
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Costo</th><th>Acciones</th></tr></thead>
        <tbody>
          ${srvs.map(s => `
            <tr>
              <td><strong>${esc(s.tipo)}</strong></td>
              <td>${esc(s.descripcion||'—')}</td>
              <td>${s.fecha}</td>
              <td>$${parseFloat(s.costo).toLocaleString('es-MX',{minimumFractionDigits:2})}</td>
              <td style="display:flex;gap:5px;">
                <button class="btn btn-forest btn-sm" onclick="editarServicio(${JSON.stringify(s).replace(/"/g,'&quot;')})">✏️</button>
                <button class="btn btn-red btn-sm" onclick="eliminarServicio(${s.id},${cid})">🗑️</button>
              </td>
            </tr>
          `).join('')}
          <tr><td colspan="3" style="font-weight:700;text-align:right;color:var(--forest)">Total:</td><td colspan="2" style="font-weight:700;color:var(--gold)">$${totalCosto.toLocaleString('es-MX',{minimumFractionDigits:2})}</td></tr>
        </tbody>
      </table>
    </div>`;
}

function abrirModalServicio(cid) {
  document.getElementById('sv-id').value = '';
  document.getElementById('sv-cid').value = cid;
  document.getElementById('sv-tipo').value = 'Mantenimiento de Computadora';
  document.getElementById('sv-desc').value = '';
  document.getElementById('sv-fecha').value = new Date().toISOString().slice(0,10);
  document.getElementById('sv-costo').value = '';
  document.getElementById('modal-srv-title').textContent = 'Nuevo servicio';
  abrirModal('modal-servicio');
}

function editarServicio(s) {
  document.getElementById('sv-id').value = s.id;
  document.getElementById('sv-cid').value = s.cliente_id;
  document.getElementById('sv-tipo').value = s.tipo;
  document.getElementById('sv-desc').value = s.descripcion || '';
  document.getElementById('sv-fecha').value = s.fecha;
  document.getElementById('sv-costo').value = s.costo;
  document.getElementById('modal-srv-title').textContent = 'Editar servicio';
  abrirModal('modal-servicio');
}

async function guardarServicio() {
  const payload = {
    id: document.getElementById('sv-id').value,
    cliente_id: document.getElementById('sv-cid').value,
    tipo: document.getElementById('sv-tipo').value,
    descripcion: document.getElementById('sv-desc').value,
    fecha: document.getElementById('sv-fecha').value,
    costo: document.getElementById('sv-costo').value,
  };
  if (!payload.fecha || !payload.costo) { alert('Completa fecha y costo.'); return; }
  await fetch(API + '?accion=guardar_servicio', { method:'POST', body: JSON.stringify(payload) });
  cerrarModal('modal-servicio');
  const cid = payload.cliente_id;
  // refrescar fila de servicios si está abierta
  const row = document.getElementById('srv-row-' + cid);
  if (row && row.style.display !== 'none') {
    const res = await fetch(API + '?accion=listar_servicios&cliente_id=' + cid);
    document.getElementById('srv-expand-' + cid).innerHTML = renderServicios(await res.json(), cid);
  }
  cargarClientes();
}

async function eliminarServicio(id, cid) {
  if (!confirm('¿Eliminar este servicio?')) return;
  await fetch(API + '?accion=eliminar_servicio&id=' + id);
  const res = await fetch(API + '?accion=listar_servicios&cliente_id=' + cid);
  document.getElementById('srv-expand-' + cid).innerHTML = renderServicios(await res.json(), cid);
  cargarClientes();
}

// ══════════════════════════════════════════════════
//  AHORRO
// ══════════════════════════════════════════════════
async function cargarAhorro() {
  const res = await fetch(API + '?accion=listar_ahorro');
  const data = await res.json();
  document.getElementById('saldo-val').textContent = '$' + parseFloat(data.saldo).toLocaleString('es-MX',{minimumFractionDigits:2});
  const tb = document.getElementById('body-ahorro');
  if (!data.movimientos.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">Sin movimientos aún</td></tr>'; return; }
  tb.innerHTML = data.movimientos.map(m => `
    <tr>
      <td>${m.fecha}</td>
      <td>${esc(m.concepto)}</td>
      <td><span class="badge ${m.tipo==='ingreso'?'badge-ing':'badge-eg'}">${m.tipo==='ingreso'?'↑ Ingreso':'↓ Egreso'}</span></td>
      <td style="font-weight:600;color:${m.tipo==='ingreso'?'var(--green)':'var(--red)'}">
        ${m.tipo==='ingreso'?'+':'-'}$${parseFloat(m.monto).toLocaleString('es-MX',{minimumFractionDigits:2})}
      </td>
      <td>${esc(m.notas||'—')}</td>
      <td style="display:flex;gap:5px;">
        <button class="btn btn-forest btn-sm" onclick="editarAhorro(${JSON.stringify(m).replace(/"/g,'&quot;')})">✏️</button>
        <button class="btn btn-red btn-sm" onclick="eliminarAhorro(${m.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function abrirModalAhorro() {
  document.getElementById('ah-id').value = '';
  document.getElementById('ah-con').value = '';
  document.getElementById('ah-tipo').value = 'ingreso';
  document.getElementById('ah-mon').value = '';
  document.getElementById('ah-fec').value = new Date().toISOString().slice(0,10);
  document.getElementById('ah-not').value = '';
  document.getElementById('modal-ah-title').textContent = 'Nuevo movimiento';
  abrirModal('modal-ahorro');
}

function editarAhorro(m) {
  document.getElementById('ah-id').value = m.id;
  document.getElementById('ah-con').value = m.concepto;
  document.getElementById('ah-tipo').value = m.tipo;
  document.getElementById('ah-mon').value = m.monto;
  document.getElementById('ah-fec').value = m.fecha;
  document.getElementById('ah-not').value = m.notas || '';
  document.getElementById('modal-ah-title').textContent = 'Editar movimiento';
  abrirModal('modal-ahorro');
}

async function guardarAhorro() {
  const payload = {
    id: document.getElementById('ah-id').value,
    concepto: document.getElementById('ah-con').value,
    tipo: document.getElementById('ah-tipo').value,
    monto: document.getElementById('ah-mon').value,
    fecha: document.getElementById('ah-fec').value,
    notas: document.getElementById('ah-not').value,
  };
  if (!payload.concepto || !payload.monto || !payload.fecha) { alert('Completa concepto, monto y fecha.'); return; }
  await fetch(API + '?accion=guardar_ahorro', { method:'POST', body: JSON.stringify(payload) });
  cerrarModal('modal-ahorro');
  cargarAhorro();
}

async function eliminarAhorro(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  await fetch(API + '?accion=eliminar_ahorro&id=' + id);
  cargarAhorro();
}

// ── UTIL ────────────────────────────────────────
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// INIT
cargarClientes();
</script>
</body>
</html>
