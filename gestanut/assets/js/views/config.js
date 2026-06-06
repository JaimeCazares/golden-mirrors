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
          <button class="btn btn-outline btn-sm" onclick="toast('Contraseña cambiada ✓')">🔒 Cambiar contraseña</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
};
