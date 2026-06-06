// ══════════════════════════════════════════════════════
// VIEW · Reportes y analytics
// ══════════════════════════════════════════════════════
VIEWS.reportes = () => `<div class="view active">
  <div class="g4 mb">
    ${[
      ['green', '📈', '+18%', 'Crecimiento mensual', 'vs Abril'],
      ['terra', '💚', '92%',  'Retención',           'Excelente'],
      ['blush', '⏱', '3.2',  'Consultas/px',        'Promedio'],
      ['gold',  '⭐', '4.9',  'Satisfacción',        '47 reseñas'],
    ].map(([c, i, v, l, t]) => `<div class="stat-card ${c}"><div class="stat-deco"></div><div class="stat-icon-w">${i}</div><div class="stat-val">${v}</div><div class="stat-label">${l}</div><div class="stat-trend">${t}</div></div>`).join('')}
  </div>
  <div class="g2">
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">💰</span>Ingresos · 6 meses</div></div><div class="panel-body"><canvas id="rep-inc" height="180"></canvas></div></div>
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">👩</span>Por tipo de consulta</div></div><div class="panel-body"><canvas id="rep-typ" height="180"></canvas></div></div>
  </div>
</div>`;

function initReportes() {
  makeChart('#rep-inc', {
    type: 'bar',
    data: {
      labels: ['Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
      datasets: [{ data: [3200, 3500, 2800, 4200, 4100, 4800], backgroundColor: '#6b9e78', borderRadius: 8 }]
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
      datasets: [{ data: [5, 4, 3], backgroundColor: ['#e8a8b8', '#6b9e78', '#c4714a'] }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { font: { family: 'DM Sans' } } } }
    }
  });
}
