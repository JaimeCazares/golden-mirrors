// ══════════════════════════════════════════════════════
// TAB · Recuento 24 horas
// ══════════════════════════════════════════════════════
function tabRecuento(p) {
  const r = p.recuento24;
  const isEmpty = !r.tiempos.length;
  return `<div class="g-21">
    <div>
      <div class="panel mb-sm">
        <div class="panel-head">
          <div class="panel-title"><span class="pt-icon">🍽</span>Recuento de 24 horas</div>
          <div style="display:flex;gap:8px">
            <span class="muted-sm">${r.fecha || 'Sin registros'}</span>
            <button class="btn btn-sage btn-xs" onclick="openRecuentoModal()">+ Nuevo</button>
          </div>
        </div>
        <div class="panel-body">
          ${isEmpty ? `<div style="text-align:center;padding:40px">
            <div style="font-size:40px;margin-bottom:8px">🍽</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--forest);margin-bottom:4px">Sin recuento</div>
            <div class="muted-sm">Registra qué comió la paciente en las últimas 24 horas</div>
            <button class="btn btn-sage btn-sm" style="margin-top:14px" onclick="openRecuentoModal()">+ Iniciar recuento</button>
          </div>` : r.tiempos.map((t, i) => `<div class="meal-card" style="border-left-color:${i === 0 ? 'var(--gold)' : i === 1 ? 'var(--sage)' : i === 2 ? 'var(--terra)' : i === 3 ? 'var(--blush)' : 'var(--info)'}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <div style="font-weight:600;font-size:13px;color:var(--forest)">${t.comida}</div>
              <div class="muted-sm" style="font-size:11px">${t.hora}</div>
            </div>
            <div style="font-size:13px;color:var(--text)">${t.alimentos}</div>
          </div>`).join('')}
          ${!isEmpty && r.agua ? `<div style="background:var(--info-l);border-radius:var(--rs);padding:12px 14px;display:flex;align-items:center;gap:10px;margin-top:4px">
            <div style="font-size:20px">💧</div>
            <div><div style="font-size:13px;font-weight:500;color:var(--info)">Hidratación: ${r.agua}</div>${r.nota ? `<div class="muted-sm" style="font-size:11px;margin-top:2px">${r.nota}</div>` : ''}</div>
          </div>` : ''}
        </div>
      </div>
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📊</span>Análisis del recuento</div></div>
        <div class="panel-body">
          ${isEmpty ? `<div class="muted-sm" style="text-align:center;padding:20px">Sin datos que analizar</div>` : `
          <div style="margin-bottom:14px">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-bottom:8px">Tiempos de comida</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:600;color:var(--forest)">${r.tiempos.length}</div>
            <div class="muted-sm">de ${r.tiempos.length >= 5 ? '✓ Recomendado (5-6)' : '⚠️ Recomendado (5-6)'}</div>
          </div>
          <div class="progress mb-sm"><div class="progress-fill" style="width:${Math.min(100, r.tiempos.length / 6 * 100)}%"></div></div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:14px">
            ${[
              ['Proteína en desayuno', r.tiempos[0]?.alimentos.match(/huevo|yogurt|queso|leche|proteína/i) ? '✅ Presente' : '⚠️ Revisar'],
              ['Hidratación', parseFloat(r.agua || 0) >= 2 ? '✅ Adecuada' : '⚠️ Insuficiente'],
              ['Colaciones incluidas', r.tiempos.some(t => t.comida.toLowerCase().includes('colación')) ? '✅ Sí' : '⚠️ Sin colaciones'],
              ['Verduras presentes', r.tiempos.some(t => t.alimentos.match(/ensalada|brócoli|nopales|calabaza|espinaca/i)) ? '✅ Sí' : '⚠️ Evaluar'],
            ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--cream-d)"><span style="color:var(--text-m)">${l}</span><span style="font-weight:500">${v}</span></div>`).join('')}
          </div>`}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💬</span>Notas del recuento</div></div>
        <div class="panel-body">
          <textarea class="textarea" placeholder="Observaciones, áreas a mejorar, cambios al plan...">${r.nota || ''}</textarea>
          <button class="btn btn-sage btn-xs" style="margin-top:8px" onclick="guardarNotaRecuento(this)">Guardar</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function guardarNotaRecuento(btn) {
  const ta = btn.previousElementSibling;
  if (!ta || !currentPatient?.recuento24?.id) { toast('Sin recuento activo'); return; }
  toast('Guardando...');
  try {
    await fetch(`api/recuento.php?id=${currentPatient.recuento24.id}&nota=${encodeURIComponent(ta.value)}`, { method: 'PATCH' });
    currentPatient.recuento24.nota = ta.value;
    toast('Nota guardada ✓');
  } catch (e) { toast('No se pudo guardar'); }
}
