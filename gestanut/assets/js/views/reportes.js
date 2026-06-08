// ══════════════════════════════════════════════════════
// VIEW · Reportes y analytics
// ══════════════════════════════════════════════════════
VIEWS.reportes = () => {
  const now    = new Date();
  const currYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  // Meses con ingresos reales, ordenados
  const ymSet = [...new Set(
    FINANZAS.filter(m=>m.tipo==='in'&&m.fechaRaw).map(m=>m.fechaRaw.substring(0,7))
  )].sort();
  if (!ymSet.includes(currYM)) ymSet.push(currYM);

  // Comparar los dos últimos meses con datos
  const ymLast = ymSet[ymSet.length-1];
  const ymPrev = ymSet[ymSet.length-2] || null;
  const ingMes = FINANZAS.filter(m=>m.tipo==='in'&&(m.fechaRaw||'').startsWith(ymLast)).reduce((s,m)=>s+m.monto,0);
  const ingAnt = ymPrev ? FINANZAS.filter(m=>m.tipo==='in'&&(m.fechaRaw||'').startsWith(ymPrev)).reduce((s,m)=>s+m.monto,0) : 0;
  const pct    = ingAnt>0 ? Math.round((ingMes-ingAnt)/ingAnt*100) : null;
  const pctStr = pct===null ? '—' : `${pct>=0?'+':''}${pct}%`;
  const mesAntStr = ymPrev ? (() => {
    const [y,mo] = ymPrev.split('-').map(Number);
    return new Date(y,mo-1,1).toLocaleString('es-MX',{month:'long'}).replace(/^\w/,c=>c.toUpperCase());
  })() : '';
  const pctTrend = pct===null ? 'Sin datos previos' : `vs ${mesAntStr}`;

  const totalCons = FINANZAS.filter(m=>m.tipo==='in').length;
  const avgCons   = PATIENTS.length>0 ? (totalCons/PATIENTS.length).toFixed(1) : '0';
  const nuevas    = PATIENTS.filter(p=>p.status==='new').length;

  return `<div class="view active">
  <div class="g4 mb">
    ${[
      ['green', '📈', pctStr,          'Crecimiento mensual', pctTrend],
      ['terra', '👩', PATIENTS.length, 'Pacientes activas',   'en el sistema'],
      ['blush', '⏱', avgCons,          'Consultas/px',        'Promedio general'],
      ['gold',  '⭐', nuevas,           'Nuevas este mes',     'pacientes'],
    ].map(([c,i,v,l,t])=>`<div class="stat-card ${c}"><div class="stat-deco"></div><div class="stat-icon-w">${i}</div><div class="stat-val">${v}</div><div class="stat-label">${l}</div><div class="stat-trend">${t}</div></div>`).join('')}
  </div>
  <div class="g2">
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">💰</span>Ingresos · últimos meses</div></div><div class="panel-body"><canvas id="rep-inc" height="180"></canvas></div></div>
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">👩</span>Por tipo de consulta</div></div><div class="panel-body"><canvas id="rep-typ" height="180"></canvas></div></div>
  </div>
</div>`;
};

function initReportes() {
  const now    = new Date();
  const currYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  // Tomar los meses con datos reales (hasta 6) e incluir mes actual
  const ymSet = [...new Set(
    FINANZAS.filter(m=>m.tipo==='in'&&m.fechaRaw).map(m=>m.fechaRaw.substring(0,7))
  )];
  if (!ymSet.includes(currYM)) ymSet.push(currYM);
  const last6 = ymSet.sort().slice(-6);

  const months  = last6.map(ym => {
    const [y,mo] = ym.split('-').map(Number);
    return new Date(y,mo-1,1).toLocaleString('es-MX',{month:'short'}).replace(/^\w/,c=>c.toUpperCase());
  });
  const incomes = last6.map(ym =>
    FINANZAS.filter(m=>m.tipo==='in'&&(m.fechaRaw||'').startsWith(ym)).reduce((s,m)=>s+m.monto,0)
  );

  const mat = PATIENTS.filter(p=>p.type==='materna').length;
  const rec = PATIENTS.filter(p=>p.type==='recomp').length;
  const pes = PATIENTS.filter(p=>p.type==='peso').length;

  makeChart('#rep-inc', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{ data: incomes, backgroundColor: '#6b9e78', borderRadius: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { grid: { color: 'rgba(107,158,120,.08)' } }, x: { grid: { display: false } } }
    }
  });
  makeChart('#rep-typ', {
    type: 'doughnut',
    data: {
      labels: ['Materno-infantil', 'Recomposición', 'Control peso'],
      datasets: [{ data: [mat, rec, pes], backgroundColor: ['#e8a8b8', '#6b9e78', '#c4714a'] }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans' } } } }
    }
  });
}
