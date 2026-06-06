// ══════════════════════════════════════════════════════
// TAB · Progreso de peso
// ══════════════════════════════════════════════════════
function tabProgreso(p) {
  const d = p.history;
  const first = d[0]?.weight;
  const last  = d[d.length - 1]?.weight;
  const delta = d.length ? (last - first).toFixed(1) : '0';
  return `<div>
    <div class="g2 mb-sm">
      <div class="stat-card green"><div class="stat-deco"></div><div class="stat-icon-w">⚖️</div><div class="stat-val">${last || p.weight} kg</div><div class="stat-label">Peso actual</div><div class="stat-trend ${parseFloat(delta) > 0 && p.type === 'peso' ? 'down' : ''}">${parseFloat(delta) > 0 ? '↑' : '↓'} ${Math.abs(parseFloat(delta))} kg</div></div>
      <div class="stat-card terra"><div class="stat-deco"></div><div class="stat-icon-w">🎯</div><div class="stat-val">${d.length}</div><div class="stat-label">Mediciones</div><div class="stat-trend">desde inicio</div></div>
    </div>
    ${d.length ? `<div class="panel mb-sm"><div class="panel-head"><div class="panel-title"><span class="pt-icon">📈</span>Evolución de peso${d[0].grasa ? ' y % grasa' : ''}</div></div><div class="panel-body"><canvas id="evol-chart" height="90"></canvas></div></div>` : ''}
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">📋</span>Historial</div><button class="btn btn-sage btn-xs" onclick="openProgresoModal()">+ Registro</button></div>
      <table class="lab-table" style="width:100%"><thead><tr><th>Fecha</th>${p.semGestacion ? '<th>Sem</th>' : ''}<th>Peso</th>${d[0]?.grasa ? '<th>% Grasa</th>' : ''}<th>Nota</th></tr></thead>
      <tbody>${d.slice().reverse().map(h => `<tr><td style="font-size:12px;color:var(--text-m)">${h.date}</td>${p.semGestacion ? `<td>${h.sem || '—'}</td>` : ''}<td style="font-weight:500">${h.weight} kg ${h.delta ? `<span style="color:var(--sage);font-size:11px">+${h.delta}</span>` : ''}</td>${d[0]?.grasa ? `<td>${h.grasa || '—'}${h.grasa ? '%' : ''}</td>` : ''}<td style="font-size:11px;color:var(--text-m)">${h.note || '—'}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

function renderEvolChart() {
  const p = currentPatient;
  if (!p?.history.length) return;
  makeChart('#evol-chart', {
    type: 'line',
    data: {
      labels: p.history.map(h => h.date),
      datasets: [
        {
          label: 'Peso', data: p.history.map(h => h.weight),
          borderColor: '#6b9e78', backgroundColor: 'rgba(107,158,120,.12)',
          tension: .35, fill: true,
          pointBackgroundColor: '#1a3328', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
        },
        ...(p.history[0].grasa ? [{
          label: '% Grasa', data: p.history.map(h => h.grasa),
          borderColor: '#c4714a', tension: .35, fill: false,
          pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y1'
        }] : [])
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 10 }, usePointStyle: true } },
        tooltip: { backgroundColor: '#1a3328', padding: 10, titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' } }
      },
      scales: {
        y: { grid: { color: 'rgba(107,158,120,.08)' }, ticks: { font: { family: 'DM Sans', size: 10 } } },
        ...(p.history[0].grasa ? { y1: { position: 'right', grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 }, color: '#c4714a' } } } : {}),
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}
