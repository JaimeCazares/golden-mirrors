// ══════════════════════════════════════════════════════
// VIEW · Configuración del sistema
// ══════════════════════════════════════════════════════
VIEWS.config = () => {
  const gcalOn = typeof gcalIsConnected === 'function' && gcalIsConnected();
  const integrations = [
    { i: '📅', n: 'Google Calendar',
      s: gcalOn ? 'Conectado · Sincronización activa' : 'Sin conectar',
      c: gcalOn ? 'sage' : 'gray',
      b: gcalOn ? 'Reconectar' : 'Conectar',
      fn: 'gcalConnect()' },
    { i: '📂', n: 'Google Drive',      s: 'Expedientes y documentos',   c: 'gray', b: 'Conectar',   fn: '' },
    { i: '💬', n: 'WhatsApp Business', s: 'Recordatorios automáticos',  c: 'gray', b: 'Activar',    fn: '' },
    { i: '📊', n: 'Google Sheets',     s: 'Exportar finanzas',           c: 'sage', b: 'Configurar', fn: '' },
  ];

  return `<div class="view active">
  <div class="g2">
    <div class="panel">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">👤</span>Datos profesionales</div></div>
      <div class="panel-body">
        ${[
          ['Nombre',            'Diana Zavala'],
          ['Cédula profesional','15304166'],
          ['Especialidades',    'Materno-infantil · Recomp · Control peso'],
          ['Instagram',         '@gestanut'],
          ['WhatsApp',          '667 305 6211'],
          ['Afiliación',        '@clinica.sontushormonas'],
        ].map(([l, v]) => `<div class="field"><label class="field-label">${l}</label><input class="input" value="${v}" readonly></div>`).join('')}
      </div>
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">🔗</span>Integraciones</div></div>
        <div class="panel-body">
          ${integrations.map(({ i, n, s, c, b, fn }) => `<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--cream-d)">
            <div style="font-size:24px">${i}</div>
            <div style="flex:1">
              <div style="font-weight:500;font-size:13px">${n}</div>
              <div class="muted-sm" style="font-size:11px;color:${c === 'sage' ? 'var(--sage)' : 'inherit'}">${c === 'sage' ? '✓ ' : ''}${s}</div>
            </div>
            <button class="btn btn-${c === 'sage' ? 'outline' : 'sage'} btn-xs" ${fn ? `onclick="${fn}"` : ''}>${b}</button>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">🔒</span>Seguridad</div></div>
        <div class="panel-body">
          <div style="background:var(--sage-ll);border-radius:var(--rs);padding:12px 14px;font-size:12px;color:var(--forest);margin-bottom:12px">✓ Sesión activa · Diana Zavala</div>
          <button class="btn btn-outline btn-sm" onclick="abrirCambioPass()">🔒 Cambiar contraseña</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
};

function abrirCambioPass() {
  const id = 'cambio-pass-modal';
  if (!$('#' + id)) {
    const el = document.createElement('div');
    el.className = 'modal'; el.id = id;
    el.innerHTML = `<div class="modal-content" style="max-width:400px">
      <div class="modal-head"><div class="modal-title">🔒 Cambiar contraseña</div><button class="modal-close" onclick="closeModal('${id}')">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label class="field-label">Contraseña actual</label><input class="input" type="password" id="cp-actual" autocomplete="current-password" placeholder="••••••••"></div>
        <div class="field"><label class="field-label">Nueva contraseña</label><input class="input" type="password" id="cp-nueva" autocomplete="new-password" placeholder="Mínimo 8 caracteres"></div>
        <div class="field"><label class="field-label">Confirmar contraseña</label><input class="input" type="password" id="cp-confirm" autocomplete="new-password" placeholder="Repite la nueva contraseña"></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline btn-sm" onclick="closeModal('${id}')">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="cp-submit" onclick="guardarPass('${id}')">Guardar</button>
      </div>
    </div>`;
    $('#modal-root').appendChild(el);
  }
  $('#cp-actual').value = ''; $('#cp-nueva').value = ''; $('#cp-confirm').value = '';
  openModal(id);
}

async function guardarPass(modalId) {
  const actual  = ($('#cp-actual')  || {}).value?.trim();
  const nueva   = ($('#cp-nueva')   || {}).value?.trim();
  const confirm = ($('#cp-confirm') || {}).value?.trim();
  if (!actual || !nueva) { toast('Completa todos los campos'); return; }
  if (nueva.length < 8)  { toast('La contraseña debe tener al menos 8 caracteres'); return; }
  if (nueva !== confirm)  { toast('Las contraseñas no coinciden'); return; }
  const btn = $('#cp-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const res  = await fetch('api/cambiar_password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual, nueva }),
    });
    const data = await res.json();
    if (!res.ok) { toast(data.error || 'Error al cambiar contraseña'); return; }
    closeModal(modalId);
    toast('Contraseña actualizada ✓');
  } catch { toast('Error de conexión'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; } }
}
