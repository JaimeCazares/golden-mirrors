// ══════════════════════════════════════════════════════
// TAB · Historia clínica
// ══════════════════════════════════════════════════════
function tabHistoria(p) {
  const h = p.historia;
  return `<div class="g2">
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">🗂</span>Anamnesis</div>
          <button class="btn btn-sage btn-xs" onclick="openHistoriaModal()">✏️ Editar</button>
        </div>
        <div class="panel-body">
          ${[
            ['Motivo de consulta', h.motivo, 'terra'],
            ['Antecedentes patológicos', h.antecedentes, 'sage'],
            ['Alergias', h.alergias, 'sage'],
            ['Intolerancias alimentarias', h.intolerancias, 'sage'],
            ['Medicamentos actuales', h.medicamentos, 'info'],
            ['Cirugías previas', h.cirugias, 'cream'],
            ['Antecedentes familiares', h.patFam, 'gold'],
          ].map(([l, v, c]) => `<div style="margin-bottom:14px">
            <div style="font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">${l}</div>
            <div style="background:var(--${c === 'cream' ? 'cream-d' : c + '-ll'});padding:10px 14px;border-radius:var(--rs);font-size:13px;color:var(--text)">${v}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">🏃</span>Estilo de vida</div></div>
        <div class="panel-body">
          ${[
            ['Actividad física', h.actFisica],
            ['Ocupación', h.ocupacion],
            ['Estado civil', h.estadoCivil],
            ['Tabaquismo', h.tabaco],
            ['Alcohol', h.alcohol],
          ].map(([l, v]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--cream-d)">
            <span style="font-size:12px;color:var(--text-m)">${l}</span>
            <span style="font-size:13px;font-weight:500;color:var(--text)">${v}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📝</span>Consentimiento informado</div></div>
        <div class="panel-body">
          ${p.consentimiento.firmado ? `
            <div style="background:var(--sage-ll);border-radius:var(--rs);padding:14px 16px;display:flex;align-items:center;gap:12px">
              <div style="font-size:24px">✅</div>
              <div><div style="font-weight:500;color:var(--forest)">Firmado el ${p.consentimiento.fecha}</div><div class="muted-sm">Expediente completo</div></div>
            </div>
          ` : `
            <div style="background:var(--terra-l);border-radius:var(--rs);padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div style="font-size:24px">⚠️</div>
              <div><div style="font-weight:500;color:var(--terra-d)">Consentimiento pendiente</div><div class="muted-sm">Requerido para continuar</div></div>
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%" onclick="navTo('consentimientos');toast('Abriendo consentimientos 📝')">📋 Generar consentimiento</button>
          `}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📅</span>Registro de consultas</div></div>
        <div class="panel-body" style="padding:0">
          ${p.history.length ? p.history.slice().reverse().map((h, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--cream-d)">
              <div style="width:8px;height:8px;border-radius:50%;background:${i === 0 ? 'var(--sage)' : 'var(--cream-dd)'};flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:500;color:var(--forest)">${h.date}${h.sem ? ' · Sem ' + h.sem : ''}</div>
                <div class="muted-sm" style="font-size:11px">${h.note || '—'}</div>
              </div>
              <div style="font-size:13px;font-weight:500">${h.weight} kg</div>
            </div>`).join('') : '<div style="text-align:center;padding:28px;color:var(--text-l)">Primera consulta</div>'}
        </div>
      </div>
    </div>
  </div>`;
}
