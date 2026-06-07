// ══════════════════════════════════════════════════════
// TAB · Progreso + Mediciones (unified)
// ══════════════════════════════════════════════════════
let _evolMetric = 'peso';

function tabProgreso(p) {
  const d    = p.history || [];
  const m    = p.measures || { cintura:0, cadera:0, brazo:0, muslo:0 };
  const last  = d[d.length - 1];
  const first = d[0];

  const pesoActual = last?.weight ?? p.weight ?? '—';
  const deltaKg    = d.length >= 2 ? parseFloat((last.weight - first.weight).toFixed(1)) : 0;
  const deltaSgn   = deltaKg > 0 ? '↑' : deltaKg < 0 ? '↓' : '→';
  const isMaterno  = p.type === 'materna' || !!(p.semGestacion || p.lactancia);
  // En embarazo/lactancia subir de peso es esperado (verde), bajar es alerta (terra)
  const deltaClr   = isMaterno
    ? (deltaKg > 0 ? 'var(--sage)' : deltaKg < 0 ? 'var(--terra)' : 'var(--text-m)')
    : (deltaKg > 0 ? 'var(--terra)' : 'var(--sage)');
  const imc        = p.weight && p.height ? calcIMC(p.weight, p.height) : '—';
  const ratio      = m.cintura && m.cadera ? m.cintura / m.cadera : null;
  const ratioFmt   = ratio ? ratio.toFixed(2) : null;
  const ratioOk    = ratio && ratio < 0.85;

  // Previous values for delta badges on measure cards
  const prevM = {};
  for (let i = d.length - 2; i >= 0; i--) {
    for (const k of ['cintura','cadera','brazo','muslo']) {
      if (!prevM[k] && d[i][k]) prevM[k] = d[i][k];
    }
    if (['cintura','cadera','brazo','muslo'].every(k => prevM[k])) break;
  }

  const hasMeasures = d.some(h => h.cintura || h.cadera || h.brazo || h.muslo);
  const hasGrasa    = d.some(h => h.grasa);

  // Available chart metrics
  const allMetrics = [
    { k:'peso',    l:'Peso',    u:'kg', color:'#6b9e78', bg:'rgba(107,158,120,.12)' },
    { k:'cintura', l:'Cintura', u:'cm', color:'#c4714a', bg:'rgba(196,113,74,.10)'  },
    { k:'cadera',  l:'Cadera',  u:'cm', color:'#d4a0b5', bg:'rgba(212,160,181,.10)' },
    { k:'brazo',   l:'Brazo',   u:'cm', color:'#6b9e78', bg:'rgba(107,158,120,.10)' },
    { k:'muslo',   l:'Muslo',   u:'cm', color:'#c9a227', bg:'rgba(201,162,39,.10)'  },
  ];
  const metrics = allMetrics.filter(mt =>
    mt.k === 'peso' ? d.some(h => h.weight) : d.some(h => h[mt.k])
  );
  if (metrics.length && !metrics.find(mt => mt.k === _evolMetric)) {
    _evolMetric = metrics[0].k;
  }

  // Helper: find last non-null value for a key before index (reversed array)
  function prevVal(arr, key, fromIdx) {
    for (let i = fromIdx + 1; i < arr.length; i++) {
      if (arr[i][key]) return arr[i][key];
    }
    return null;
  }

  // Measurement table cell (handles missing values and deltas)
  function cellM(val, unit, prev) {
    if (!val) return `<td style="color:var(--text-l);text-align:center">—</td>`;
    const dlt = prev ? parseFloat((val - prev).toFixed(1)) : null;
    const badge = dlt !== null && dlt !== 0
      ? ` <span style="color:${dlt < 0 ? 'var(--sage)' : 'var(--terra)'};font-size:10px">${dlt > 0 ? '+' : ''}${dlt}</span>`
      : '';
    return `<td style="white-space:nowrap;font-size:13px">${val}&thinsp;${unit}${badge}</td>`;
  }

  // Table rows newest-first
  const reversed = d.slice().reverse();
  const hasSem = isMaterno && d.some(h => h.sem);
  const tableRows = reversed.map((h, idx) => {
    const wDeltaClr = isMaterno
      ? (h.delta < 0 ? 'var(--terra)' : 'var(--sage)')
      : (h.delta < 0 ? 'var(--sage)' : 'var(--terra)');
    const wDelta = h.delta !== undefined
      ? ` <span style="color:${wDeltaClr};font-size:10px">${h.delta > 0 ? '+' : ''}${h.delta}</span>`
      : '';
    return `<tr>
      <td style="font-size:12px;color:var(--text-m);white-space:nowrap">${h.date}</td>
      <td style="font-weight:500;white-space:nowrap">${h.weight}&thinsp;kg${wDelta}</td>
      ${hasSem ? `<td style="font-size:12px;color:var(--text-m);text-align:center">${h.sem ? h.sem + ' sem' : '<span style="color:var(--text-l)">—</span>'}</td>` : ''}
      ${hasMeasures ? [
        cellM(h.cintura, 'cm', prevVal(reversed,'cintura',idx)),
        cellM(h.cadera,  'cm', prevVal(reversed,'cadera', idx)),
        cellM(h.brazo,   'cm', prevVal(reversed,'brazo',  idx)),
        cellM(h.muslo,   'cm', prevVal(reversed,'muslo',  idx)),
      ].join('') : ''}
      ${hasGrasa ? `<td style="font-size:12px;color:var(--text-m)">${h.grasa ? h.grasa+'%' : '<span style="color:var(--text-l)">—</span>'}</td>` : ''}
      <td style="font-size:11px;color:var(--text-m)">${h.note || '<span style="color:var(--text-l)">—</span>'}</td>
    </tr>`;
  }).join('');

  return `<div>

    <!-- ── Stats ── -->
    <div class="g3 mb-sm">
      <div class="stat-card green"><div class="stat-deco"></div>
        <div class="stat-icon-w">⚖️</div>
        <div class="stat-val">${pesoActual}&thinsp;kg</div>
        <div class="stat-label">Peso actual</div>
        <div class="stat-trend" style="color:${deltaClr}">${deltaSgn} ${Math.abs(deltaKg)}&thinsp;kg</div>
      </div>
      <div class="stat-card terra"><div class="stat-deco"></div>
        <div class="stat-icon-w">🎯</div>
        <div class="stat-val">${d.length}</div>
        <div class="stat-label">Sesiones</div>
        <div class="stat-trend">desde inicio</div>
      </div>
      <div class="stat-card gold"><div class="stat-deco"></div>
        <div class="stat-icon-w">📊</div>
        <div class="stat-val">${imc}</div>
        <div class="stat-label">IMC</div>
        <div class="stat-trend">${typeof imcCat === 'function' ? imcCat(imc).label : ''}</div>
      </div>
    </div>

    <!-- ── Medidas actuales + Índices ── -->
    <div class="g2 mb-sm">
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📐</span>Medidas actuales</div></div>
        <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${[
            ['Cintura', m.cintura, 'cm', 'terra',  prevM.cintura],
            ['Cadera',  m.cadera,  'cm', 'blush',  prevM.cadera ],
            ['Brazo',   m.brazo,   'cm', 'sage',   prevM.brazo  ],
            ['Muslo',   m.muslo,   'cm', 'gold',   prevM.muslo  ],
          ].map(([label, val, unit, clr, prev]) => {
            const dlt   = val && prev ? parseFloat((val - prev).toFixed(1)) : null;
            const dBadge = dlt !== null
              ? `<div style="font-size:10px;margin-top:3px;color:${dlt < 0 ? 'var(--sage)' : dlt > 0 ? 'var(--terra)' : 'var(--text-l)'}">${dlt > 0 ? '↑' : dlt < 0 ? '↓' : '→'} ${Math.abs(dlt)}</div>`
              : '';
            return `<div style="text-align:center;background:var(--cream);border-radius:var(--rs);padding:14px 8px">
              <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--${clr})">${val || 0}<span style="font-size:11px"> ${unit}</span></div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:2px">${label}</div>
              ${dBadge}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📊</span>Índices</div></div>
        <div class="panel-body">
          ${ratioFmt ? `
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:600;color:var(--forest)">${ratioFmt}</div>
            <div class="muted-sm">Índice cintura-cadera</div>
            <div class="badge b-${ratioOk ? 'sage' : 'terra'}" style="margin-top:6px">${ratioOk ? '✓ Saludable' : '⚠️ Revisar'}</div>
          </div>
          <div style="width:100%;height:1px;background:rgba(107,158,120,.1);margin:12px 0"></div>
          ` : ''}
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px">
            <span style="color:var(--text-m)">IMC</span>
            <span style="font-weight:600;color:var(--forest)">${imc}</span>
          </div>
          ${p.weight ? `
          <div class="progress" style="margin-bottom:4px"><div class="progress-fill" style="width:78%;background:var(--sage)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-m)"><span>Masa magra ~78%</span><span>${(p.weight*.78).toFixed(1)} kg</span></div>
          <div class="progress" style="margin-top:8px;margin-bottom:4px"><div class="progress-fill" style="width:22%;background:var(--terra)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-m)"><span>Masa grasa ~22%</span><span>${(p.weight*.22).toFixed(1)} kg</span></div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- ── Gráfica de evolución ── -->
    ${d.length >= 2 ? `
    <div class="panel mb-sm">
      <div class="panel-head">
        <div class="panel-title"><span class="pt-icon">📈</span>Evolución</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${metrics.map(mt => `<button
            class="evol-btn btn btn-xs ${_evolMetric === mt.k ? 'btn-sage' : 'btn-outline'}"
            data-k="${mt.k}"
            onclick="_evolMetric='${mt.k}';renderEvolChart()"
          >${mt.l}</button>`).join('')}
        </div>
      </div>
      <div class="panel-body"><canvas id="evol-chart" height="90"></canvas></div>
    </div>` : ''}

    <!-- ── Historial de sesiones ── -->
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title"><span class="pt-icon">📋</span>Historial de sesiones</div>
        <button class="btn btn-sage btn-xs" onclick="openRegistroModal()">+ Registro</button>
      </div>
      <div style="overflow-x:auto">
        <table class="lab-table" style="width:100%">
          <thead><tr>
            <th>Fecha</th><th>Peso</th>
            ${hasSem      ? '<th>Sem.</th>' : ''}
            ${hasMeasures ? '<th>Cintura</th><th>Cadera</th><th>Brazo</th><th>Muslo</th>' : ''}
            ${hasGrasa    ? '<th>% Grasa</th>' : ''}
            <th>Nota</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>

  </div>`;
}

function renderEvolChart() {
  const p = currentPatient;
  if (!p?.history?.length) return;

  const mtDef = [
    { k:'peso',    l:'Peso (kg)',    u:'kg', color:'#6b9e78', bg:'rgba(107,158,120,.12)' },
    { k:'cintura', l:'Cintura (cm)', u:'cm', color:'#c4714a', bg:'rgba(196,113,74,.10)'  },
    { k:'cadera',  l:'Cadera (cm)',  u:'cm', color:'#d4a0b5', bg:'rgba(212,160,181,.10)' },
    { k:'brazo',   l:'Brazo (cm)',   u:'cm', color:'#6b9e78', bg:'rgba(107,158,120,.10)' },
    { k:'muslo',   l:'Muslo (cm)',   u:'cm', color:'#c9a227', bg:'rgba(201,162,39,.10)'  },
  ];
  const mt = mtDef.find(m => m.k === _evolMetric) || mtDef[0];

  const pts = _evolMetric === 'peso'
    ? p.history.map(h => ({ date: h.date, val: h.weight }))
    : p.history.filter(h => h[_evolMetric]).map(h => ({ date: h.date, val: h[_evolMetric] }));

  if (pts.length < 2) return;

  // Update button active states without re-rendering the tab
  document.querySelectorAll('.evol-btn').forEach(b => {
    b.classList.toggle('btn-sage',    b.dataset.k === _evolMetric);
    b.classList.toggle('btn-outline', b.dataset.k !== _evolMetric);
  });

  makeChart('#evol-chart', {
    type: 'line',
    data: {
      labels: pts.map(pt => pt.date),
      datasets: [{
        label: mt.l,
        data: pts.map(pt => pt.val),
        borderColor: mt.color, backgroundColor: mt.bg,
        tension: .35, fill: true,
        pointBackgroundColor: '#1a3328', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a3328', padding: 10,
          titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' },
          callbacks: { label: ctx => ` ${ctx.raw} ${mt.u}` },
        },
      },
      scales: {
        y: {
          grid: { color: 'rgba(107,158,120,.08)' },
          ticks: { font: { family: 'DM Sans', size: 10 }, callback: v => v + ' ' + mt.u },
        },
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } },
      },
    },
  });
}
