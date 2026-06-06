// ══════════════════════════════════════════════════════
// TAB · Glucosa (solo pacientes con diabetes gestacional)
// ══════════════════════════════════════════════════════
function tabGlucosa(p) {
  const data  = p.glucosaData || [];
  const ultima = data[0];
  return `<div>
    <div style="background:linear-gradient(120deg,var(--gold-l),var(--terra-l));border-radius:var(--r);padding:20px 24px;margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
        <div>
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--terra);margin-bottom:4px">Diabetes Gestacional · Control con dieta</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--forest)">Monitoreo glucémico</div>
          <div class="muted-sm">Metas: Ayuno &lt;92 · 1h pp &lt;140 · 2h pp &lt;120 mg/dL</div>
        </div>
        <button class="btn btn-terra btn-sm" onclick="openGlucosaModal()">+ Registro de hoy</button>
      </div>
    </div>
    <div class="g2 mb-sm">
      ${ultima ? `
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📊</span>Último registro · ${ultima.fecha}</div></div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
            ${[
              ['Ayuno',       ultima.ayuno,      92],
              ['Pre-comida',  ultima.pre_comida, 100],
              ['Post-comida', ultima.post_comida,140],
              ['Pre-cena',    ultima.pre_cena,   100],
              ['Post-cena',   ultima.post_cena,  120],
            ].map(([l, v, ref]) => `<div style="text-align:center;padding:12px 8px;background:${v > ref ? 'var(--danger-l)' : v > ref * 0.9 ? 'var(--gold-l)' : 'var(--sage-ll)'};border-radius:var(--rs)">
              <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:${v > ref ? 'var(--danger)' : v > ref * 0.9 ? '#8a6a14' : 'var(--forest)'}">${v}</div>
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:3px">${l}</div>
              <div style="font-size:9px;margin-top:2px;color:var(--text-l)">meta: &lt;${ref}</div>
            </div>`).join('')}
          </div>
          ${ultima.nota ? `<div style="margin-top:12px;padding:10px 14px;background:var(--cream-d);border-radius:var(--rs);font-size:12px;color:var(--text-m)">${ultima.nota}</div>` : ''}
        </div>
      </div>` : ''}
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📈</span>Tendencia semanal</div></div>
        <div class="panel-body"><canvas id="gluc-chart" height="120"></canvas></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">📋</span>Historial de glucosa</div></div>
      <div style="overflow:hidden">
        <table class="lab-table" style="width:100%">
          <thead><tr>
            <th>Fecha</th><th>Ayuno</th><th>Pre-comida</th><th>Post-comida</th><th>Pre-cena</th><th>Post-cena</th><th>Nota</th>
          </tr></thead>
          <tbody>
          ${data.map(d => `<tr>
            <td style="color:var(--text-m);font-size:12px">${d.fecha}</td>
            ${[
              [d.ayuno, 92], [d.pre_comida, 100], [d.post_comida, 140],
              [d.pre_cena, 100], [d.post_cena, 120]
            ].map(([v, ref]) => `<td><span class="gluc-pill ${v > ref ? 'gluc-high' : v > ref * 0.9 ? 'gluc-warn' : 'gluc-normal'}">${v}</span></td>`).join('')}
            <td style="font-size:11px;color:var(--text-m)">${d.nota}</td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderGlucChart() {
  const p = currentPatient;
  if (!p?.glucosaData) return;
  const data = p.glucosaData.slice().reverse();
  makeChart('#gluc-chart', {
    type: 'line',
    data: {
      labels: data.map(d => d.fecha),
      datasets: [
        { label: 'Ayuno',      data: data.map(d => d.ayuno),      borderColor: '#6b9e78', tension: .35, pointRadius: 4, borderWidth: 2 },
        { label: 'Post-comida',data: data.map(d => d.post_comida),borderColor: '#c4714a', tension: .35, pointRadius: 4, borderWidth: 2 },
        { label: 'Meta post',  data: data.map(() => 140),          borderColor: 'rgba(192,57,43,.3)', borderDash: [4, 4], borderWidth: 1, pointRadius: 0 },
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
        x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}
