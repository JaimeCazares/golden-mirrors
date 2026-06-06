// ══════════════════════════════════════════════════════
// TAB · Laboratorio
// ══════════════════════════════════════════════════════
function tabLab(p) {
  const alertas = p.laboratorio.filter(l => l.status !== 'ok');
  return `<div>
    ${alertas.length ? `<div style="background:var(--${alertas.some(a => a.status === 'alert') ? 'danger-l' : 'gold-l'});border-radius:var(--rs);padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:12px;border-left:3px solid var(--${alertas.some(a => a.status === 'alert') ? 'danger' : 'gold'})">
      <div style="font-size:20px">${alertas.some(a => a.status === 'alert') ? '🔴' : '🟡'}</div>
      <div>
        <div style="font-weight:600;color:var(--${alertas.some(a => a.status === 'alert') ? 'danger' : 'gold'});font-size:14px">${alertas.length} resultado${alertas.length > 1 ? 's' : ''} fuera de rango</div>
        <div class="muted-sm">${alertas.map(a => a.prueba).join(', ')}</div>
      </div>
    </div>` : p.laboratorio.length ? `<div style="background:var(--sage-ll);border-radius:var(--rs);padding:12px 18px;margin-bottom:18px;display:flex;align-items:center;gap:10px">
      <div style="font-size:16px">✅</div>
      <div style="font-weight:500;color:var(--forest);font-size:13px">Todos los resultados dentro de rango normal</div>
    </div>` : ''}
    <div class="panel mb-sm">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">🔬</span>Resultados de laboratorio</div>
        <button class="btn btn-sage btn-xs" onclick="openLabModal()">+ Agregar</button>
      </div>
      ${p.laboratorio.length ? `<div style="overflow:hidden">
        <table class="lab-table" style="width:100%">
          <thead><tr>
            <th>Fecha</th><th>Prueba</th><th>Resultado</th><th>Referencia</th><th>Estado</th>
          </tr></thead>
          <tbody>
          ${p.laboratorio.map(l => `<tr>
            <td style="color:var(--text-m);font-size:12px">${l.fecha}</td>
            <td style="font-weight:500">${l.prueba}</td>
            <td style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:${l.status === 'ok' ? 'var(--forest)' : l.status === 'warn' ? '#8a6a14' : 'var(--danger)'}">${l.valor}</td>
            <td style="font-size:11px;color:var(--text-m)">${l.rango}</td>
            <td><span class="semaphore ${semClass[l.status]}"><span class="sem-dot ${semDot[l.status]}"></span>${semLabels[l.status]}</span></td>
          </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="panel-body" style="text-align:center;padding:40px">
        <div style="font-size:40px;margin-bottom:8px">🔬</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--forest);margin-bottom:4px">Sin laboratorios</div>
        <div class="muted-sm">Solicita análisis clínicos y regístralos aquí</div>
        <button class="btn btn-sage btn-sm" style="margin-top:14px" onclick="openLabModal()">+ Registrar resultados</button>
      </div>`}
    </div>
    ${p.laboratorio.length ? `<div class="panel">
      <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💬</span>Interpretación clínica</div></div>
      <div class="panel-body">
        <textarea class="textarea" placeholder="Escribe la interpretación de los resultados y plan de acción..." style="min-height:100px">
${alertas.length ? alertas.map(a => `• ${a.prueba}: ${a.valor} — ${a.status === 'alert' ? 'ATENCIÓN: fuera de rango, revisar' : 'Por vigilar, en límite de referencia'}`).join('\n') : p.laboratorio.length ? 'Todos los parámetros dentro de rangos normales. Continuar con plan actual.' : ''}</textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-sage btn-sm" onclick="toast('Interpretación guardada ✓')">💾 Guardar</button>
        </div>
      </div>
    </div>` : ''}
  </div>`;
}
