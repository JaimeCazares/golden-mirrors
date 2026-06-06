// ══════════════════════════════════════════════════════
// TAB · Notas de consulta
// ══════════════════════════════════════════════════════
const _bienLabels = { muy_mal:'😞 Muy mal', mal:'😐 Mal', neutral:'🙂 Regular', bien:'😊 Bien', muy_bien:'🥰 Muy bien' };
const _bienKeys   = ['muy_mal','mal','neutral','bien','muy_bien'];
let   _bienSel    = '';

function tabNotas(p) {
  const notas = p.notas || [];
  return `<div class="g-21">
    <div class="panel">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">📝</span>Notas de consulta</div></div>
      <div class="panel-body">
        <div style="margin-bottom:18px">
          <textarea class="textarea" id="note-text" placeholder="Notas de la sesión: peso, observaciones, ajustes al plan..." style="min-height:100px"></textarea>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">
            <button class="btn btn-sage btn-xs" onclick="saveNote()">💾 Guardar nota</button>
          </div>
        </div>
        ${notas.length ? notas.map(n => `<div style="border-left:3px solid var(--sage);padding:12px 16px;background:var(--sage-lll);border-radius:0 var(--rs) var(--rs) 0;margin-bottom:10px;position:relative">
          <div style="font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;display:flex;justify-content:space-between">
            <span>${n.d}</span>${n.bienestar ? `<span>${_bienLabels[n.bienestar]||''}</span>` : ''}
          </div>
          <div style="font-size:13px;color:var(--text);line-height:1.7">${n.texto}</div>
        </div>`).join('') : '<div style="text-align:center;padding:28px;color:var(--text-l)"><div style="font-size:32px;margin-bottom:8px">📝</div>Sin notas registradas</div>'}
      </div>
    </div>
    <div>
      <div class="panel mb-sm"><div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💚</span>Wellness</div></div>
        <div class="panel-body">
          <div class="muted-sm" style="margin-bottom:10px;font-size:11px">¿Cómo se siente hoy?</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:14px">
            ${['😞','😐','🙂','😊','🥰'].map((e, i) => `<button id="bien-btn-${i}" style="aspect-ratio:1;border:1px solid rgba(107,158,120,.15);border-radius:var(--rs);background:var(--white);cursor:pointer;font-size:18px;transition:all .2s" onclick="selectBienestar('${_bienKeys[i]}',${i})" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform=''">${e}</button>`).join('')}
          </div>
          <div id="bien-label" style="background:var(--cream);border-radius:var(--rs);padding:10px 12px;font-size:12px;color:var(--text-m)">Selecciona cómo se siente</div>
        </div>
      </div>
    </div>
  </div>`;
}

function selectBienestar(key, idx) {
  _bienSel = key;
  _bienKeys.forEach((_, i) => {
    const b = $('#bien-btn-' + i);
    if (b) { b.style.border = i === idx ? '1px solid var(--sage)' : '1px solid rgba(107,158,120,.15)'; b.style.background = i === idx ? 'var(--sage-ll)' : 'var(--white)'; }
  });
  const lbl = $('#bien-label');
  if (lbl) { lbl.style.background = 'var(--sage-ll)'; lbl.style.color = 'var(--forest)'; lbl.textContent = '✨ Se siente ' + (_bienLabels[key]||'').replace(/^[^\s]+\s/,'').toLowerCase(); }
}

async function saveNote() {
  const t = $('#note-text');
  if (!t?.value.trim()) { toast('Escribe algo primero'); return; }
  try {
    const res = await fetch('api/notas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paciente_id: currentPatient.id, contenido: t.value.trim(), bienestar: _bienSel || null, fecha: new Date().toISOString().split('T')[0] }),
    });
    if (!res.ok) throw new Error();
    const nueva = await res.json();
    if (!currentPatient.notas) currentPatient.notas = [];
    currentPatient.notas.unshift(nueva);
    t.value = '';
    _bienSel = '';
    toast('Nota guardada ✓');
    setCTab('notas');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  }
}
