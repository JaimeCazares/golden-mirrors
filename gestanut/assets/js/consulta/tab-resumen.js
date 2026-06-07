// ══════════════════════════════════════════════════════
// TAB · Resumen del expediente
// ══════════════════════════════════════════════════════

function renderImcGauge(imc) {
  if (imc === '—') return `<div style="text-align:center;padding:8px 0;font-size:11px;color:var(--text-m)">Sin datos de peso/altura</div>`;
  const val  = parseFloat(imc);
  const MIN  = 10, RANGE = 30; // escala 10–40
  const pct  = Math.max(0, Math.min(100, ((val - MIN) / RANGE) * 100)).toFixed(2);
  // colores fijos para no romper CSS var() con concatenaciones
  const zoneColor = val < 18.5 ? '#5b8fb0' : val < 25 ? '#6b9e78' : val < 30 ? '#d4a843' : '#c4714a';
  const zoneLabel = val < 18.5 ? 'Bajo peso' : val < 25 ? 'Normal' : val < 30 ? 'Sobrepeso' : 'Obesidad';
  const zones = [
    ['#5b8fb0', 'Bajo peso',  '<18.5',    28.33],
    ['#6b9e78', 'Normal',     '18.5–25',  21.67],
    ['#d4a843', 'Sobrepeso',  '25–30',    16.67],
    ['#c4714a', 'Obesidad',   '>30',      33.33],
  ];
  // posiciones de referencia (en % del rango 10–40)
  const p185 = '28.33', p25 = '50.00', p30 = '66.67';
  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
      <div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:600;color:var(--forest);line-height:1">${imc}</div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--text-m);margin-top:4px">Índice de Masa Corporal</div>
      </div>
      <div style="padding:5px 13px;border-radius:50px;border:1.5px solid ${zoneColor};background:${zoneColor}20;margin-top:4px">
        <span style="color:${zoneColor};font-weight:700;font-size:11px;letter-spacing:.4px">${zoneLabel.toUpperCase()}</span>
      </div>
    </div>
    <div style="position:relative;margin-bottom:6px">
      <div style="display:flex;border-radius:6px;overflow:hidden;height:10px">
        ${zones.map(([c,,, w]) => `<div style="width:${w}%;background:${c}"></div>`).join('')}
      </div>
      <div style="position:absolute;top:-5px;left:calc(${pct}% - 1.5px);width:3px;height:20px;background:var(--forest);border-radius:2px;box-shadow:0 2px 8px rgba(0,0,0,.35);z-index:2"></div>
      <div style="position:absolute;top:-10px;left:calc(${pct}% - 4px);width:9px;height:5px;background:var(--forest);clip-path:polygon(50% 100%,0 0,100% 0);border-radius:1px;z-index:2"></div>
    </div>
    <div style="position:relative;height:18px;margin-bottom:12px">
      <span style="position:absolute;left:0;font-size:9px;color:var(--text-m)">10</span>
      <span style="position:absolute;left:${p185}%;transform:translateX(-50%);font-size:9px;color:var(--text-m)">18.5</span>
      <span style="position:absolute;left:${p25}%;transform:translateX(-50%);font-size:9px;color:var(--text-m)">25</span>
      <span style="position:absolute;left:${p30}%;transform:translateX(-50%);font-size:9px;color:var(--text-m)">30</span>
      <span style="position:absolute;right:0;font-size:9px;color:var(--text-m)">40+</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
      ${zones.map(([c, l, r]) => `
        <div style="border-left:2px solid ${c};background:${c}18;padding:5px 7px;border-radius:0 4px 4px 0">
          <div style="font-size:9px;font-weight:700;color:${c}">${l}</div>
          <div style="font-size:9px;color:var(--text-m);margin-top:1px">${r}</div>
        </div>`).join('')}
    </div>`;
}

function renderMaternoCalcs(p) {
  if (!p.prePregWeight || !p.height) {
    return `<div style="background:#fdf0f5;border-radius:var(--rs);padding:16px 18px;border-left:3px solid #d4a0b5;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--forest);margin-bottom:4px">Seguimiento gestacional</div>
        <div style="font-size:11px;color:var(--text-m)">Registra semanas y peso pre-embarazo para ver el rango IOM recomendado</div>
      </div>
      <button class="btn btn-xs" style="background:#d4a0b5;color:#fff;border:none;white-space:nowrap" onclick="openDatosBasicosModal()">Registrar →</button>
    </div>`;
  }

  const preImc   = parseFloat(calcIMC(p.prePregWeight, p.height));
  const preImcS  = preImc.toFixed(1);
  const rango    = calcGanancia(preImc);
  const ganada   = p.weight ? parseFloat((p.weight - p.prePregWeight).toFixed(1)) : null;
  const sem      = p.semGestacion || 0;
  const tri      = sem >= 27 ? '3er trimestre' : sem >= 13 ? '2do trimestre' : sem > 0 ? '1er trimestre' : '';

  // IMC colors
  const imcClr = preImc < 18.5 ? '#5b8fb0' : preImc < 25 ? '#6b9e78' : preImc < 30 ? '#d4a843' : '#c4714a';
  const imcLbl = preImc < 18.5 ? 'Bajo peso' : preImc < 25 ? 'Normal' : preImc < 30 ? 'Sobrepeso' : 'Obesidad';
  const MIN = 10, RANGE = 30;
  const imcBarPct = Math.max(0, Math.min(99, ((preImc - MIN) / RANGE) * 100)).toFixed(1);

  // Progress bar math
  const barMax  = Math.max(rango.max * 1.45, (ganada || 0) + 4);
  const minPct  = (rango.min / barMax * 100).toFixed(1);
  const rangeW  = ((rango.max - rango.min) / barMax * 100).toFixed(1);
  const maxPct  = (rango.max / barMax * 100).toFixed(1);
  const curPct  = ganada !== null ? Math.max(1, Math.min(97, ganada / barMax * 100)).toFixed(1) : null;

  // Status
  let stTxt, stClr, stIco;
  if (ganada === null)       { stTxt = 'Sin peso actual';                           stClr = '#aaa';     stIco = '—'; }
  else if (ganada < 0)       { stTxt = `Perdió ${Math.abs(ganada)} kg — revisar`;  stClr = '#c4714a';  stIco = '⚠'; }
  else if (ganada < rango.min) { stTxt = `Faltan ${(rango.min-ganada).toFixed(1)} kg para el mínimo`; stClr = '#d4a843'; stIco = '↗'; }
  else if (ganada > rango.max) { stTxt = `${(ganada-rango.max).toFixed(1)} kg sobre el máximo`;       stClr = '#c4714a'; stIco = '⚠'; }
  else                         { stTxt = 'Dentro del rango recomendado';             stClr = '#6b9e78'; stIco = '✓'; }

  return `<div style="background:#fdf0f5;border-radius:var(--rs);padding:16px;display:flex;flex-direction:column;gap:12px">

    <!-- Header: semana + trimestre -->
    ${sem ? `<div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:12px;font-weight:700;color:#b8789a">Semana ${sem}</span>
      ${tri ? `<span style="background:#d4a0b522;border:1px solid #d4a0b5;border-radius:50px;padding:2px 10px;font-size:10px;color:#9a5f7a">${tri}</span>` : ''}
    </div>` : ''}

    <!-- Row: IMC pre-emb | Ganancia acumulada -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">

      <!-- IMC pregestacional -->
      <div style="background:rgba(255,255,255,.65);border-radius:10px;padding:13px 14px">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--text-m);margin-bottom:7px">IMC pre-embarazo</div>
        <div style="display:flex;align-items:flex-end;gap:7px;margin-bottom:9px">
          <span style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:600;color:var(--forest);line-height:1">${preImcS}</span>
          <span style="padding:3px 8px;border-radius:50px;background:${imcClr}20;border:1.5px solid ${imcClr};margin-bottom:3px;font-size:9px;font-weight:700;color:${imcClr};letter-spacing:.4px">${imcLbl.toUpperCase()}</span>
        </div>
        <div style="position:relative;margin-bottom:9px">
          <div style="display:flex;border-radius:4px;overflow:hidden;height:7px">
            <div style="width:28.33%;background:#5b8fb0"></div>
            <div style="width:21.67%;background:#6b9e78"></div>
            <div style="width:16.67%;background:#d4a843"></div>
            <div style="width:33.33%;background:#c4714a"></div>
          </div>
          <div style="position:absolute;top:-3px;left:calc(${imcBarPct}% - 1.5px);width:3px;height:13px;background:var(--forest);border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>
        </div>
        <div style="background:${imcClr}16;border-radius:6px;padding:7px 10px">
          <div style="font-size:9px;color:var(--text-m);margin-bottom:2px">Rango IOM · ${rango.l}</div>
          <div style="font-size:14px;font-weight:700;color:var(--forest)">${rango.min}–${rango.max} kg</div>
        </div>
      </div>

      <!-- Ganancia acumulada -->
      <div style="background:rgba(255,255,255,.65);border-radius:10px;padding:13px 14px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--text-m);margin-bottom:7px">Ganancia acumulada</div>
          ${ganada !== null
            ? `<div style="font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:600;color:var(--forest);line-height:1">${ganada >= 0 ? '+' : ''}${ganada}<span style="font-size:15px;font-weight:400"> kg</span></div>
               <div style="font-size:11px;color:var(--text-m);margin-top:3px">desde ${p.prePregWeight} kg</div>`
            : `<div style="font-size:13px;color:var(--text-m);margin-top:4px">Sin peso registrado</div>`
          }
        </div>
        <div style="display:flex;align-items:flex-start;gap:6px;margin-top:10px;padding:7px 9px;border-radius:7px;background:${stClr}18;border-left:3px solid ${stClr}">
          <span style="font-size:12px;line-height:1.3">${stIco}</span>
          <span style="font-size:10px;font-weight:600;color:${stClr};line-height:1.4">${stTxt}</span>
        </div>
      </div>
    </div>

    <!-- Barra de progreso con zona segura -->
    ${ganada !== null ? `<div style="background:rgba(255,255,255,.65);border-radius:10px;padding:13px 14px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--text-m);margin-bottom:11px">Progreso vs rango IOM</div>
      <div style="position:relative;height:20px;margin-bottom:8px">
        <!-- pista -->
        <div style="position:absolute;top:6px;left:0;right:0;height:8px;background:rgba(0,0,0,.07);border-radius:6px"></div>
        <!-- zona segura -->
        <div style="position:absolute;top:6px;left:${minPct}%;width:${rangeW}%;height:8px;background:#6b9e7848;border:1.5px solid #6b9e7870;border-radius:5px"></div>
        <!-- marcador -->
        <div style="position:absolute;top:1px;left:calc(${curPct}% - 9px);width:18px;height:18px;border-radius:50%;background:${stClr};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.22);z-index:2"></div>
      </div>
      <div style="position:relative;height:14px;font-size:9px">
        <span style="position:absolute;left:0;color:var(--text-m)">0</span>
        <span style="position:absolute;left:${minPct}%;transform:translateX(-50%);color:#6b9e78;font-weight:700">${rango.min}</span>
        <span style="position:absolute;left:${maxPct}%;transform:translateX(-50%);color:#6b9e78;font-weight:700">${rango.max}</span>
        <span style="position:absolute;right:0;color:var(--text-m)">${Math.round(barMax)} kg</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:6px">
        <div style="width:14px;height:8px;background:#6b9e7848;border:1.5px solid #6b9e7870;border-radius:3px"></div>
        <span style="font-size:10px;color:var(--text-m)">Zona IOM recomendada: ${rango.min}–${rango.max} kg</span>
      </div>
    </div>` : ''}

  </div>`;
}

function tabResumen(p) {
  const isEmbarazo = p.type === 'materna' && !p.lactancia;
  const preImc     = (isEmbarazo && p.prePregWeight && p.height) ? parseFloat(calcIMC(p.prePregWeight, p.height)) : null;
  const imc        = p.weight ? calcIMC(p.weight, p.height) : '—';
  const tmb        = p.weight ? calcTMB(p.weight, p.height, p.age, p.sexo) : '—';
  const agua       = p.weight ? (calcWater(p.weight, p.semGestacion || 0) / 1000).toFixed(1) : '—';

  const imcField   = isEmbarazo
    ? ['IMC pre-emb.', preImc ? preImc.toFixed(1) : '—']
    : ['IMC',          imc];

  const dataFields = [
    ['Peso',        p.weight ? `${p.weight} kg` : '—'],
    ['Altura',      p.height ? `${p.height} m` : '—'],
    ['Sexo',        p.sexo === 'masculino' ? '♂ Masculino' : p.sexo === 'femenino' ? '♀ Femenino' : '—'],
    imcField,
    ['TMB',         tmb !== '—' ? `${tmb} kcal` : '—'],
    ['Agua/día',    agua !== '—' ? `${agua} L` : '—'],
    ...(p.type === 'materna' ? [
      ['Sem. gestación', p.semGestacion  ? `${p.semGestacion} sem`  : '—'],
      ['Peso pre-emb.',  p.prePregWeight ? `${p.prePregWeight} kg`  : '—'],
    ] : []),
    ['Última visita', p.ultimaVisita],
  ];

  // Bloque lateral derecho de lactancia postparto
  const lactanciaBlock = (p.lactancia && p.prePregWeight && p.weight && !p.semGestacion) ? (() => {
    const diff = parseFloat((p.weight - p.prePregWeight).toFixed(1));
    const diffClr = diff <= 0 ? 'var(--sage)' : 'var(--gold)';
    return `<div style="background:var(--info-l);border-radius:var(--rs);padding:14px 16px;border-left:3px solid var(--info)">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-bottom:6px">Recuperación postparto</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:${diffClr};line-height:1">${diff > 0 ? '+' : ''}${diff} kg</div>
      <div style="font-size:11px;color:var(--text-m);margin-top:4px">vs peso preembarazo (${p.prePregWeight} kg)</div>
    </div>`;
  })() : '';

  return `<div class="g-21">
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📋</span>Datos del expediente</div><button class="btn btn-sage btn-xs" onclick="openDatosBasicosModal()">✏️ Editar</button></div>
        <div class="panel-body">
          ${(p.bio || p.goal) ? `<div style="background:var(--sage-lll);border-left:3px solid var(--sage);padding:12px 16px;border-radius:0 var(--rs) var(--rs) 0;margin-bottom:16px;font-style:italic;font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--forest);line-height:1.6">"${p.bio || p.goal}"</div>` : ''}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${dataFields.map(([l, v]) => `<div style="background:var(--cream);padding:11px 12px;border-radius:var(--rs)"><div style="font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px">${l}</div><div style="font-size:14px;font-weight:500;color:var(--forest);margin-top:2px">${v}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">🧮</span>Cálculos rápidos</div></div>
        <div class="panel-body" style="display:flex;flex-direction:column;gap:12px">
          ${isEmbarazo
            ? renderMaternoCalcs(p)
            : `<div style="background:var(--sage-ll);border-radius:var(--rs);padding:16px 14px">${renderImcGauge(imc)}</div>`
          }
          ${lactanciaBlock}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
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
