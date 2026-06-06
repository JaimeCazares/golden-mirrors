// ══════════════════════════════════════════════════════
// TAB · Resumen del expediente
// ══════════════════════════════════════════════════════
function tabResumen(p) {
  const imc  = p.weight ? calcIMC(p.weight, p.height) : '—';
  const tmb  = p.weight ? calcTMB(p.weight, p.height, p.age, p.sexo) : '—';
  const agua = p.weight ? (calcWater(p.weight, p.semGestacion || 0) / 1000).toFixed(1) : '—';
  return `<div class="g-21">
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📋</span>Datos del expediente</div></div>
        <div class="panel-body">
          ${(p.bio || p.goal) ? `<div style="background:var(--sage-lll);border-left:3px solid var(--sage);padding:12px 16px;border-radius:0 var(--rs) var(--rs) 0;margin-bottom:16px;font-style:italic;font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--forest);line-height:1.6">"${p.bio || p.goal}"</div>` : ''}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[
              ['Peso',        p.weight ? `${p.weight} kg` : '—'],
              ['Altura',      `${p.height} m`],
              ['Sexo',        p.sexo === 'masculino' ? '♂ Masculino' : '♀ Femenino'],
              ['IMC',         imc],
              ['TMB',         tmb !== '—' ? `${tmb} kcal` : '—'],
              ['Agua/día',    agua !== '—' ? `${agua} L` : '—'],
              ['Última visita', p.ultimaVisita],
            ].map(([l, v]) => `<div style="background:var(--cream);padding:11px 12px;border-radius:var(--rs)"><div style="font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px">${l}</div><div style="font-size:14px;font-weight:500;color:var(--forest);margin-top:2px">${v}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">🧮</span>Cálculos rápidos</div></div>
        <div class="panel-body" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          <div style="text-align:center;padding:16px 8px;background:var(--sage-ll);border-radius:var(--rs)">
            <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:var(--forest)">${imc}</div>
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:3px">IMC</div>
            <div style="font-size:11px;margin-top:4px;color:${imc !== '—' ? imcCat(imc).c : 'var(--text-m)'};font-weight:500">${imc !== '—' ? imcCat(imc).label : 'Sin dato'}</div>
          </div>
          <div style="text-align:center;padding:16px 8px;background:var(--terra-l);border-radius:var(--rs)">
            <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:var(--terra-d)">${tmb}</div>
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:3px">TMB kcal</div>
            <div style="font-size:11px;margin-top:4px;color:var(--text-m)">Mifflin-St Jeor</div>
          </div>
          <div style="text-align:center;padding:16px 8px;background:var(--info-l);border-radius:var(--rs)">
            <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:var(--info)">${agua !== '—' ? agua + 'L' : '—'}</div>
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:3px">Agua/día</div>
            <div style="font-size:11px;margin-top:4px;color:var(--text-m)">${p.semGestacion ? '+extra por embarazo' : '35 ml/kg'}</div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">🥗</span>Plan actual</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-xs" onclick="setCTab('plan')">Ver completo</button>
            <button class="btn-wa" style="padding:5px 12px;font-size:11px" onclick="openSendPlan(${p.id})"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>Enviar</button>
          </div>
        </div>
        <div class="panel-body"><div style="background:var(--sage-lll);border-radius:var(--rs);padding:14px;font-size:14px;color:var(--text);line-height:1.8">${p.plan}</div></div>
      </div>
    </div>
    <div>
      <div class="panel mb-sm" style="background:var(--forest);border:none">
        <div style="padding:20px 22px;color:var(--cream)">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sage-l);margin-bottom:6px">Próxima cita</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:22px;line-height:1.15;margin-bottom:8px">${p.proxima}</div>
          <div style="color:rgba(250,246,239,.65);font-size:12px;margin-bottom:14px">${p.online ? '💻 Online' : '📍 Presencial'}</div>
          <button class="btn-wa" style="width:100%;justify-content:center" onclick="quickWA(${p.id})"><svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>Confirmar por WhatsApp</button>
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📊</span>Adherencia</div></div>
        <div class="panel-body">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span>Al plan alimentario</span><span style="font-weight:600;color:var(--sage)">85%</span></div>
          <div class="progress mb-sm"><div class="progress-fill" style="width:85%"></div></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px"><span>Progreso al objetivo</span><span style="font-weight:600;color:var(--terra)">62%</span></div>
          <div class="progress"><div class="progress-fill" style="width:62%"></div></div>
        </div>
      </div>
      ${p.laboratorio.length ? `<div class="panel" style="cursor:pointer" onclick="setCTab('laboratorio')">
        <div class="panel-body" style="padding:14px 18px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-bottom:8px">Últimos labs · ${p.laboratorio[0].fecha}</div>
          ${p.laboratorio.slice(0, 4).map(l => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--cream-d)">
            <span style="font-size:12px;color:var(--text-m)">${l.prueba}</span>
            <span class="semaphore ${semClass[l.status]}"><span class="sem-dot ${semDot[l.status]}"></span>${l.valor}</span>
          </div>`).join('')}
          <div style="margin-top:8px;font-size:11px;color:var(--sage)">Ver todos los resultados →</div>
        </div>
      </div>` : '<div class="panel"><div class="panel-body" style="text-align:center;padding:20px"><div style="font-size:24px;margin-bottom:6px">🔬</div><div class="muted-sm">Sin laboratorios registrados</div><button class="btn btn-sage btn-xs" onclick="setCTab(\'laboratorio\')" style="margin-top:10px">Registrar resultados</button></div></div>'}
    </div>
  </div>`;
}
