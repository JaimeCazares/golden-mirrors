// ══════════════════════════════════════════════════════
// TAB · Embarazo
// ══════════════════════════════════════════════════════
function tabEmbarazo(p) {
  if (!p.semGestacion) return '';
  const sem    = p.semGestacion;
  const pct    = (sem / 40 * 100).toFixed(0);
  const trim   = sem <= 13 ? 1 : sem <= 27 ? 2 : 3;
  const imcPre = parseFloat(calcIMC(p.prePregWeight, p.height));
  const gan    = calcGanancia(imcPre);
  const ganado = (p.weight - p.prePregWeight).toFixed(1);
  const frutas = ['frijol', 'arándano', 'limón', 'aguacate', 'mango', 'elote', 'berenjena', 'coliflor', 'lechuga', 'sandía'];
  const fruta  = frutas[Math.floor(Math.min(sem - 1, 39) / 4)];

  return `<div class="g-21"><div>
    <div class="panel mb-sm">
      <div class="panel-body" style="background:linear-gradient(135deg,var(--blush-l),var(--terra-l));border-radius:calc(var(--r) - 1px);padding:24px">
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--terra);margin-bottom:4px">Trimestre ${trim} · ${['', '1er', '2do', '3er'][trim]}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:600;color:var(--forest);line-height:1">Semana ${sem}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--terra-d)">${pct}%</div>
            <div class="muted-sm">del embarazo</div>
          </div>
        </div>
        <div style="height:8px;background:rgba(255,255,255,.5);border-radius:4px;position:relative">
          <div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:linear-gradient(90deg,var(--blush),var(--terra));border-radius:4px"></div>
          ${[33, 67].map(x => `<div style="position:absolute;left:${x}%;top:-4px;width:2px;height:16px;background:rgba(0,0,0,.12)"></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--text-m)"><span>S1</span><span>S13</span><span>S27</span><span>S40</span></div>
      </div>
    </div>
    <div class="panel mb-sm">
      <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">⚖️</span>Ganancia gestacional · IOM 2009</div></div>
      <div class="panel-body">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
          ${[
            ['Pre-embarazo', p.prePregWeight + ' kg', 'cream-d'],
            ['Ganado', '+' + ganado + ' kg', 'sage'],
            ['Actual', p.weight + ' kg', 'forest'],
          ].map(([l, v, c]) => `<div style="text-align:center;padding:14px 8px;background:${c === 'forest' ? 'var(--forest)' : 'var(--' + c + ')'};border-radius:var(--rs)"><div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:${c === 'forest' ? 'var(--cream)' : c === 'sage' ? 'var(--cream)' : 'var(--forest)'}">${v}</div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:${c === 'forest' ? 'rgba(250,246,239,.6)' : 'var(--text-m)'};margin-top:3px">${l}</div></div>`).join('')}
        </div>
        <div style="background:var(--sage-lll);border-radius:var(--rs);padding:12px 14px;font-size:12px;color:var(--forest)">
          IMC pre: <strong>${imcPre}</strong> (${gan.l}) · Rango ideal total: <strong>${gan.min}–${gan.max} kg</strong>
        </div>
      </div>
    </div>
    <div class="panel"><div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📈</span>Ganancia por semana</div></div><div class="panel-body"><canvas id="gan-chart" height="90"></canvas></div></div>
  </div>
  <div>
    <div class="panel mb-sm" style="background:linear-gradient(135deg,var(--blush-l),var(--cream));border:none">
      <div class="panel-body" style="text-align:center;padding:24px">
        <div style="font-size:52px;margin-bottom:8px">👶</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--forest);font-weight:600">Tamaño del bebé</div>
        <div class="muted-sm" style="margin:4px 0">Semana ${sem} · del tamaño de un</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:32px;font-style:italic;color:var(--terra-d);margin:6px 0">${fruta}</div>
      </div>
    </div>
    <div class="panel mb-sm">
      <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">🍽</span>Nutrición este trimestre</div></div>
      <div class="panel-body">
        ${[
          ['Energía extra', trim === 1 ? '+0 kcal/día' : trim === 2 ? '+340 kcal/día' : '+450 kcal/día'],
          ['Proteína extra', '+25 g/día vs pre-embarazo'],
          ['Ácido fólico', sem < 28 ? '600 mcg/día' : '400 mcg/día (continuar)'],
          ['Hierro', sem >= 16 ? '45-60 mg/día' : '27 mg/día (dieta)'],
          ['Calcio', '1,200 mg/día'],
          ['DHA', '200 mg/día (neurodesarrollo fetal)'],
        ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--cream-d);font-size:12px"><span style="color:var(--text-m)">${l}</span><span style="font-weight:500;color:var(--forest)">${v}</span></div>`).join('')}
      </div>
    </div>
    <div class="panel"><div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💧</span>Agua extra</div></div>
      <div class="panel-body" style="text-align:center">
        <div style="font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:600;color:var(--info)">${(calcWater(p.weight, sem) / 1000).toFixed(1)}L</div>
        <div class="muted-sm">Recomendación diaria con embarazo</div>
      </div>
    </div>
  </div></div>`;
}

function renderGanChart() {
  const p = currentPatient;
  if (!p?.semGestacion) return;
  const sem    = p.semGestacion;
  const imcPre = parseFloat(calcIMC(p.prePregWeight, p.height));
  const gan    = calcGanancia(imcPre);
  const sems   = [10, 14, 18, 22, 26, 28, 30, 32, 34, 36, 38, 40];
  const factor = s => {
    if (s <= 13) return { min: 1, max: 2 };
    const d = s - 13;
    return { min: 1 + d * gan.min / 27, max: 2 + d * gan.max / 27 };
  };
  makeChart('#gan-chart', {
    type: 'line',
    data: {
      labels: sems,
      datasets: [
        { label: 'Mín ideal', data: sems.map(s => factor(s).min), borderColor: 'rgba(107,158,120,.4)', borderDash: [4, 3], fill: false, pointRadius: 0, borderWidth: 1.5 },
        { label: 'Máx ideal', data: sems.map(s => factor(s).max), borderColor: 'rgba(107,158,120,.4)', borderDash: [4, 3], fill: '-1', backgroundColor: 'rgba(107,158,120,.08)', pointRadius: 0, borderWidth: 1.5 },
        { label: 'Real',      data: sems.map(s => { const h = p.history.find(h => h.sem === s); return h ? h.weight - p.prePregWeight : null; }), borderColor: '#c4714a', tension: .35, pointRadius: 5, pointBackgroundColor: '#c4714a', pointBorderColor: '#fff', pointBorderWidth: 2, spanGaps: true },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 10 }, usePointStyle: true } },
        tooltip: { backgroundColor: '#1a3328', padding: 8, titleFont: { family: 'DM Sans' }, bodyFont: { family: 'DM Sans' } }
      },
      scales: {
        y: { title: { display: true, text: 'kg ganados', font: { family: 'DM Sans', size: 10 } }, grid: { color: 'rgba(107,158,120,.08)' }, ticks: { font: { family: 'DM Sans', size: 10 } } },
        x: { title: { display: true, text: 'Semana gestacional', font: { family: 'DM Sans', size: 10 } }, grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 10 } } }
      }
    }
  });
}
