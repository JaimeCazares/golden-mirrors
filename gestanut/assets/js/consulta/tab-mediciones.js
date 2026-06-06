// ══════════════════════════════════════════════════════
// TAB · Mediciones corporales
// ══════════════════════════════════════════════════════
function tabMediciones(p) {
  return `<div class="g2">
    <div class="panel"><div class="panel-head"><div class="panel-title"><span class="pt-icon">📐</span>Medidas actuales</div><button class="btn btn-sage btn-xs" onclick="openMedicionModal()">+ Nueva</button></div>
      <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[
          ['Cintura', p.measures.cintura, 'cm',   'terra'],
          ['Cadera',  p.measures.cadera,  'cm',   'blush'],
          ['Brazo',   p.measures.brazo,   'cm',   'sage'],
          ['Muslo',   p.measures.muslo,   'cm',   'gold'],
          ['Peso',    p.weight,           'kg',   'forest'],
          ['Altura',  p.height,           'm',    'info'],
        ].map(([l, v, u, c]) => `<div style="text-align:center;background:var(--cream);border-radius:var(--rs);padding:16px"><div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;color:var(--${c})">${v}<span style="font-size:13px"> ${u}</span></div><div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:4px">${l}</div></div>`).join('')}
      </div>
    </div>
    <div>
      <div class="panel mb-sm"><div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📊</span>Índices</div></div>
        <div class="panel-body">
          <div style="text-align:center;margin-bottom:14px">
            <div style="font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:600;color:var(--forest)">${(p.measures.cintura / p.measures.cadera).toFixed(2)}</div>
            <div class="muted-sm">Índice cintura-cadera</div>
            <div class="badge b-${p.measures.cintura / p.measures.cadera < 0.85 ? 'sage' : 'terra'}" style="margin-top:6px">${p.measures.cintura / p.measures.cadera < 0.85 ? '✓ Saludable' : '⚠️ Revisar'}</div>
          </div>
          <div class="progress mb-sm"><div class="progress-fill" style="width:78%;background:var(--sage)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-m)"><span>Masa magra ~78%</span><span>${(p.weight * .78).toFixed(1)}kg</span></div>
          <div class="progress" style="margin-top:8px"><div class="progress-fill" style="width:22%;background:var(--terra)"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-m);margin-top:3px"><span>Masa grasa ~22%</span><span>${(p.weight * .22).toFixed(1)}kg</span></div>
        </div>
      </div>
    </div>
  </div>`;
}
