// ══════════════════════════════════════════════════════
// VIEW · Reportes y analytics
// ══════════════════════════════════════════════════════
VIEWS.reportes = () => {
  const now  = new Date();
  const ym   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const prev = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const ym1  = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;
  const mesAnt = prev.toLocaleString('es-MX',{month:'long'}).replace(/^\w/,c=>c.toUpperCase());

  const ingMes  = FINANZAS.filter(m=>m.tipo==='in'&&(m.fecha||'').startsWith(ym)).reduce((s,m)=>s+m.monto,0);
  const ingAnt  = FINANZAS.filter(m=>m.tipo==='in'&&(m.fecha||'').startsWith(ym1)).reduce((s,m)=>s+m.monto,0);
  const pct     = ingAnt>0 ? Math.round((ingMes-ingAnt)/ingAnt*100) : null;
  const pctStr  = pct===null ? '—' : `${pct>=0?'+':''}${pct}%`;
  const pctTrend = pct===null ? 'Sin datos previos' : `vs ${mesAnt}`;

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
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">💰</span>Ingresos · 6 meses</div></div><div class="panel-body"><canvas id="rep-inc" height="180"></canvas></div></div>
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">👩</span>Por tipo de consulta</div></div><div class="panel-body"><canvas id="rep-typ" height="180"></canvas></div></div>
  </div>
</div>`;
};

function initReportes() {
  const now     = new Date();
  const months  = [];
  const incomes = [];
  for (let i = 5; i >= 0; i--) {
    const d  = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    months.push(d.toLocaleString('es-MX',{month:'short'}).replace(/^\w/,c=>c.toUpperCase()));
    incomes.push(FINANZAS.filter(m=>m.tipo==='in'&&(m.fecha||'').startsWith(ym)).reduce((s,m)=>s+m.monto,0));
  }

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
