// ══════════════════════════════════════════════════════
// TAB · Lactancia
// ══════════════════════════════════════════════════════
function tabLactancia(p) {
  const l = p.lactanciaData;
  if (!l) return '';
  return `<div class="g-21">
    <div>
      <div class="panel mb-sm" style="background:linear-gradient(135deg,var(--blush-l),var(--cream));border:none">
        <div class="panel-body" style="text-align:center;padding:28px">
          <div style="font-size:48px;margin-bottom:8px">🤱</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:var(--forest);line-height:1.1">Semana ${l.semanas}</div>
          <div class="muted-sm" style="margin:6px 0">de lactancia exclusiva</div>
          <div style="display:inline-flex;gap:10px;margin-top:10px">
            <span class="badge b-blush">Producción ${l.produccion}</span>
            <span class="badge b-sage">${l.tetadas} tetadas/día</span>
          </div>
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📈</span>Crecimiento del bebé</div></div>
        <div class="panel-body">
          ${l.pesosBebe.map((pb, i) => `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--cream-d)">
            <div style="width:36px;height:36px;border-radius:50%;background:${i === l.pesosBebe.length - 1 ? 'var(--sage)' : 'var(--cream-d)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:${i === l.pesosBebe.length - 1 ? 'var(--cream)' : 'var(--text-m)'}">S${pb.sem}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500">Semana ${pb.sem}</div>
              <div class="progress" style="margin-top:4px"><div class="progress-fill" style="width:${pb.kg / 8 * 100}%;background:var(--blush)"></div></div>
            </div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:var(--forest)">${pb.kg} kg</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💊</span>Suplementación</div></div>
        <div class="panel-body">
          ${l.suplementos.map(s => `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--cream-d)">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--sage);flex-shrink:0"></div>
            <span style="font-size:13px">${s}</span>
          </div>`).join('')}
          <button class="btn btn-outline btn-xs" style="margin-top:12px" onclick="toast('Suplemento agregado ✓')">+ Agregar</button>
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">⚠️</span>Síntomas reportados</div></div>
        <div class="panel-body">
          ${l.sintomas.map(s => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--cream-d)">
            <span style="font-size:14px">⚡</span>
            <span style="font-size:13px">${s}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💡</span>Recomendaciones</div></div>
        <div class="panel-body">
          ${[
            ['Calorías extra', '+ 500 kcal/día vs pre-embarazo'],
            ['Proteína', '1.5 - 2 g/kg peso'],
            ['Calcio', '1,200 mg/día (dieta + supl)'],
            ['DHA', '500 mg/día (postnatal)'],
            ['Hidratación', '+ 700 ml/día extra'],
          ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--cream-d);font-size:12px">
            <span style="color:var(--text-m)">${l}</span><span style="font-weight:500;color:var(--forest)">${v}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}
