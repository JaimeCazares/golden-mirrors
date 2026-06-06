// ══════════════════════════════════════════════════════
// VIEW · Dashboard principal
// ══════════════════════════════════════════════════════
VIEWS.dashboard = () => {
  const total     = PATIENTS.length;
  const embarazos = PATIENTS.filter(p => p.semGestacion).length;
  const ingMes    = FINANZAS.filter(m => {
    const d = new Date((m.fechaRaw || m.fecha) + 'T00:00:00');
    const now = new Date();
    return m.tipo === 'in' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, m) => s + m.monto, 0);

  return `<div class="view active">
  <div style="background:linear-gradient(120deg,var(--forest) 0%,var(--forest-l) 100%);border-radius:var(--r);padding:24px 28px;margin-bottom:20px;color:var(--cream);position:relative;overflow:hidden">
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(107,158,120,.18)"></div>
    <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
      <div>
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sage-l);margin-bottom:4px">Tu día hoy</div>
        <div id="dash-header-title" style="font-family:'Cormorant Garamond',serif;font-size:28px;line-height:1.15;margin-bottom:6px">Cargando agenda...</div>
        <div id="dash-header-sub" style="color:rgba(250,246,239,.7);font-size:13px">—</div>
      </div>
      <button class="btn btn-sm" onclick="navTo('agenda')" style="background:var(--cream);color:var(--forest)">Ver agenda →</button>
    </div>
  </div>
  <div class="g4 mb">
    ${[
      ['green', '👩', total, 'Pacientes activas', ''],
      ['terra', '📅', '—',   'Citas hoy',         'Cargando...'],
      ['blush', '🤰', embarazos || '—', 'Embarazos activos', 'Seguimiento'],
      ['gold',  '💵', ingMes ? '$' + ingMes.toLocaleString('es-MX') : '—', 'Ingresos ' + new Date().toLocaleString('es-MX',{month:'long'}), ''],
    ].map(([c, i, v, l, t], idx) => `<div class="stat-card ${c}" id="dash-stat-${idx}"><div class="stat-deco"></div><div class="stat-icon-w">${i}</div><div class="stat-val">${v}</div><div class="stat-label">${l}</div><div class="stat-trend">${t}</div></div>`).join('')}
  </div>
  <div class="g-21 mb">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📅</span>Citas de hoy</div></div>
        <div class="panel-body" id="dash-citas-hoy" style="padding-top:8px">
          <div style="text-align:center;padding:24px;color:var(--text-m);font-size:13px">Cargando...</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📆</span>Citas de mañana</div></div>
        <div class="panel-body" id="dash-citas-manana" style="padding-top:8px">
          <div style="text-align:center;padding:24px;color:var(--text-m);font-size:13px">Cargando...</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">🗓️</span>Próximas citas</div></div>
        <div class="panel-body" id="dash-citas-proximas" style="padding-top:8px">
          <div style="text-align:center;padding:24px;color:var(--text-m);font-size:13px">Cargando...</div>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">⚡</span>Accesos rápidos</div></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[
            ['var(--sage-ll)', 'var(--forest)',  '🧮', 'Calculadoras',   'calculadoras'],
            ['var(--terra-l)', 'var(--terra-d)', '👤', 'Nuevo paciente', 'newpx-modal'],
            ['var(--blush-l)', '#9e3a5a',        '🥗', 'Crear plan',     'planes'],
            ['var(--gold-l)',  '#8a6a14',         '💰', 'Finanzas',       'finanzas'],
          ].map(([bg, co, ic, l, v]) => `<button onclick="${v.includes('-modal') ? `openModal('${v}')` : `navTo('${v}')`}" style="padding:14px;background:${bg};border:none;border-radius:var(--rs);cursor:pointer;text-align:center;font-family:'DM Sans',sans-serif;transition:all .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''"><div style="font-size:22px;margin-bottom:6px">${ic}</div><div style="font-size:12px;font-weight:500;color:${co}">${l}</div></button>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📈</span>Ingresos · 6 meses</div></div>
        <div class="panel-body"><canvas id="dash-chart" height="110"></canvas></div>
      </div>
    </div>
  </div>
  <div class="panel">
    <div class="panel-head"><div class="panel-title"><span class="pt-icon">⏰</span>Seguimientos urgentes</div><span id="dash-urgentes-badge" class="badge b-terra" style="display:none"></span></div>
    <div class="panel-body" id="dash-urgentes" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
      <div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-m);font-size:13px">Cargando...</div>
    </div>
  </div>
</div>`;
};

// ── Construye la gráfica de ingresos con datos reales ─
function getDashChartData() {
  const lbls = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // Agrupar ingresos por mes real (YYYY-MM)
  const monthMap = {};
  FINANZAS.filter(f => f.tipo === 'in').forEach(f => {
    const d = new Date((f.fechaRaw || f.fecha) + 'T00:00:00');
    if (isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + f.monto;
  });

  // Incluir siempre el mes actual (aunque sea 0)
  const now = new Date();
  const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!(currKey in monthMap)) monthMap[currKey] = 0;

  // Tomar los últimos 6 meses con actividad (orden cronológico)
  const sorted = Object.keys(monthMap).sort().slice(-6);

  return {
    labels: sorted.map(k => lbls[parseInt(k.split('-')[1]) - 1]),
    data:   sorted.map(k => monthMap[k]),
  };
}

function _localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function renderCitasPanel(elId, citas, { showDate = false, showIniciar = false } = {}) {
  const el = $('#' + elId);
  if (!el) return;
  if (!citas.length) {
    el.innerHTML = `<div style="text-align:center;padding:28px 16px;color:var(--text-m)"><div style="font-size:28px;margin-bottom:8px;opacity:.35">📅</div><div style="font-size:13px">Sin citas</div></div>`;
    return;
  }
  const AVCOLORS = ['av-c1','av-c2','av-c3','av-c4'];
  el.innerHTML = citas.map((c, idx) => {
    const p   = PATIENTS.find(x => x.id == c.paciente_id);
    const av  = p ? p.av  : AVCOLORS[idx % 4];
    const ini = p ? p.ini : c.paciente_nombre.split(' ').map(w => w[0]).slice(0,2).join('');
    const [hh, mm] = c.hora.split(':');
    const href = p ? `onclick="openPatient(${c.paciente_id})"` : '';
    const dateLbl = showDate && c.fecha
      ? `<div style="font-size:10px;color:var(--text-m);margin-top:1px">${new Date(c.fecha+'T00:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'})}</div>`
      : '';
    const btn = p
      ? `<button class="btn ${showIniciar ? 'btn-sage' : 'btn-ghost'} btn-xs" onclick="event.stopPropagation();openPatient(${c.paciente_id})">${showIniciar ? 'Iniciar →' : 'Ver →'}</button>`
      : '';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--cream-d);cursor:${p?'pointer':'default'}" ${href}>
      <div style="font-family:'Cormorant Garamond',serif;font-size:17px;color:var(--sage);font-weight:600;min-width:36px">${parseInt(hh)}:${mm}</div>
      <div class="avatar av-sm ${av}">${ini}</div>
      <div style="flex:1;min-width:0"><div style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.paciente_nombre}${c.modalidad==='online'?' 💻':''}</div><div class="muted-sm">${c.tipo_consulta}</div>${dateLbl}</div>
      ${btn}
    </div>`;
  }).join('');
}

async function initDash() {
  actualizarContadores();

  // Gráfica con datos reales de FINANZAS
  const { labels, data } = getDashChartData();
  makeChart('#dash-chart', {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#6b9e78', backgroundColor: 'rgba(107,158,120,.12)',
        tension: .4, fill: true,
        pointBackgroundColor: '#1a3328', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#1a3328', padding: 10, titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' }, callbacks: { label: c => '$' + c.parsed.y.toLocaleString('es-MX') } }
      },
      scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#8a9e84', font: { family: 'DM Sans', size: 11 } } } }
    }
  });

  // Cargar citas: hoy, mañana y próximas (hasta 14 días)
  const today    = _localDate(0);
  const tomorrow = _localDate(1);
  const proxStart = _localDate(2);
  const proxEnd   = _localDate(14);
  try {
    const [citas, citasManana, citasProx] = await Promise.all([
      fetch(`api/citas.php?desde=${today}&hasta=${today}`).then(r => r.ok ? r.json() : []),
      fetch(`api/citas.php?desde=${tomorrow}&hasta=${tomorrow}`).then(r => r.ok ? r.json() : []),
      fetch(`api/citas.php?desde=${proxStart}&hasta=${proxEnd}`).then(r => r.ok ? r.json() : []),
    ]);

    // Actualizar header con citas de hoy
    const headerTitle = $('#dash-header-title');
    const headerSub   = $('#dash-header-sub');
    if (headerTitle) {
      headerTitle.innerHTML = citas.length
        ? `Tienes <em style="color:var(--sage-l);font-style:italic">${citas.length} cita${citas.length !== 1 ? 's' : ''}</em> programada${citas.length !== 1 ? 's' : ''} hoy`
        : 'Sin citas programadas para hoy';
    }
    if (headerSub && citas.length) {
      const primera = citas[0];
      const [hh, mm] = primera.hora.split(':');
      headerSub.textContent = `Primera cita: ${parseInt(hh)}:${mm} · ${primera.paciente_nombre} · ${primera.tipo_consulta}`;
    } else if (headerSub) {
      headerSub.textContent = 'Agrega una cita desde el botón + Cita';
    }

    // Actualizar badge "Citas hoy"
    const statCitas = $('#dash-stat-1');
    if (statCitas) {
      const val = statCitas.querySelector('.stat-val');
      const trend = statCitas.querySelector('.stat-trend');
      if (val) val.textContent = citas.length;
      if (trend) trend.textContent = citas.length ? `${citas.filter(c => c.modalidad === 'presencial').length} presenciales` : 'Sin citas';
    }

    // Renderizar los 3 paneles
    renderCitasPanel('dash-citas-hoy',      citas,      { showIniciar: true });
    renderCitasPanel('dash-citas-manana',   citasManana);
    renderCitasPanel('dash-citas-proximas', citasProx,  { showDate: true });
  } catch (e) {
    ['dash-citas-hoy','dash-citas-manana','dash-citas-proximas'].forEach(id => {
      const el = $('#' + id);
      if (el) el.innerHTML = `<div style="padding:20px;color:var(--text-m);text-align:center;font-size:12px">No se pudo cargar</div>`;
    });
  }

  // Urgentes: pacientes sin consentimiento o con labs en alert
  const urgentes = PATIENTS.filter(p =>
    !p.consentimiento?.firmado ||
    (p.laboratorio || []).some(l => l.status === 'alert')
  ).slice(0, 3);

  const urgEl    = $('#dash-urgentes');
  const urgBadge = $('#dash-urgentes-badge');
  if (urgEl) {
    if (!urgentes.length) {
      urgEl.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-m)"><div style="font-size:24px;margin-bottom:8px;opacity:.3">✓</div><div style="font-size:13px">Sin seguimientos urgentes</div></div>`;
    } else {
      if (urgBadge) { urgBadge.textContent = urgentes.length + ' pendientes'; urgBadge.style.display = ''; }
      urgEl.innerHTML = urgentes.map(p => {
        const motivo = !p.consentimiento?.firmado ? 'Consentimiento pendiente'
          : (p.laboratorio || []).find(l => l.status === 'alert')?.prueba + ' · Atención';
        return `<div style="background:var(--sage-lll);border-radius:var(--rs);padding:14px 16px;border:1px solid rgba(107,158,120,.1)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div class="avatar av-sm ${p.av}">${p.ini}</div>
            <div><div style="font-weight:500;font-size:13px">${p.name}</div><div class="muted-sm" style="font-size:11px">${motivo}</div></div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-xs" onclick="openPatient(${p.id})">Ver →</button>
            <button class="btn-wa" style="padding:4px 10px;font-size:10px" onclick="quickWA(${p.id})"><svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>Contactar</button>
          </div>
        </div>`;
      }).join('');
    }
  }
}
