// ══════════════════════════════════════════════════════
// VIEW · Lista de pacientes
// ══════════════════════════════════════════════════════
VIEWS.pacientes = () => `<div class="view active">
  <div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
    <input class="input" id="px-search" type="text" placeholder="🔍 Buscar paciente..." oninput="pxSearch=this.value;renderGrid()" value="${pxSearch}" style="max-width:280px;flex:1">
    ${['todos', 'materna', 'recomp', 'peso'].map(f => `<button class="btn btn-sm ${pxFilter === f ? 'btn-sage' : 'btn-outline'}" onclick="pxFilter='${f}';renderGrid()">${{ todos: `Todas (${PATIENTS.length})`, materna: '🤰 Maternas', recomp: '⚖️ Recomp.', peso: '📉 Peso' }[f]}</button>`).join('')}
    <button class="btn btn-primary btn-sm" onclick="openModal('newpx-modal')" style="margin-left:auto">+ Nueva</button>
  </div>
  <div id="px-grid" class="g3"></div>
</div>`;

function renderGrid() {
  const g = $('#px-grid');
  if (!g) return;
  let list = PATIENTS;
  if (pxFilter !== 'todos') list = list.filter(p => p.type === pxFilter);
  if (pxSearch) list = list.filter(p => p.name.toLowerCase().includes(pxSearch.toLowerCase()));

  g.innerHTML = list.map(p => {
    const imc = p.weight > 0 ? calcIMC(p.weight, p.height) : null;
    const cat = imc ? imcCat(imc) : { label: 'Sin datos', c: 'var(--text-m)' };
    const labAlert = p.laboratorio.filter(l => l.status === 'alert').length;
    return `<div class="panel" style="cursor:pointer;transition:all .25s" onclick="openPatient(${p.id})" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 40px rgba(26,51,40,.10)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="padding:20px 22px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
          <div class="avatar av-lg ${p.av}" style="overflow:hidden">${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover;display:block">` : p.ini}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:var(--forest);line-height:1.1">${p.name}</div>
            <div class="muted-sm" style="margin-top:2px">${p.age ? p.age + ' años · ' : ''}${p.online ? '💻 Online' : '📍 Presencial'}</div>
          </div>
          ${labAlert ? `<span class="badge b-danger">🔴 ${labAlert} lab</span>` : ''}
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px">
          <span class="badge ${p.badge}">${p.icon} ${p.typeLabel}</span>
          ${p.status === 'new'         ? '<span class="badge b-gold">⭐ Nueva</span>'          : ''}
          ${p.dg                       ? '<span class="badge b-gold">DG</span>'                 : ''}
          ${p.lactancia                ? '<span class="badge b-blush">🤱 Lactancia</span>'      : ''}
          ${!p.consentimiento.firmado  ? '<span class="badge b-terra">Sin consent.</span>'     : ''}
        </div>
        <div style="background:var(--sage-lll);border-radius:var(--rs);padding:11px 13px;margin-bottom:12px">
          <div style="font-size:11px;color:var(--text-m)">Objetivo</div>
          <div style="font-size:13px;font-weight:500;color:var(--forest)">${p.goal}</div>
          <div class="muted-sm" style="font-size:11px;margin-top:2px">${p.sub}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <div style="text-align:center;padding:9px;background:var(--cream);border-radius:var(--rs)"><div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:var(--forest)">${p.weight > 0 ? p.weight + ' kg' : '—'}</div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:2px">Peso actual</div></div>
          <div style="text-align:center;padding:9px;background:var(--cream);border-radius:var(--rs)"><div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:${cat.c}">${imc ?? '—'}</div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-m);margin-top:2px">IMC · ${cat.label}</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--cream-d)">
          <div class="muted-sm" style="font-size:11px">Próx: <strong style="color:var(--forest)">${p.proxima.split(' · ')[0]}</strong></div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-xs" style="color:var(--terra);border:1px solid var(--terra);background:transparent;border-radius:var(--rs);padding:4px 10px;font-size:11px;cursor:pointer" onclick="event.stopPropagation();confirmarEliminarPaciente(${p.id},'${p.name.replace(/'/g, "\\'")}')">Eliminar</button>
            <button class="btn btn-sage btn-xs" onclick="event.stopPropagation();openPatient(${p.id})">Abrir →</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('') || `<div style="grid-column:1/-1;text-align:center;padding:60px"><div style="font-size:36px;margin-bottom:8px">🌿</div><div class="muted-sm">Sin resultados</div></div>`;
}

function confirmarEliminarPaciente(id, nombre) {
  if (!confirm('¿Eliminar el expediente de ' + nombre + '?\n\nEsta acción eliminará todos sus datos (citas, mediciones, historia clínica, etc.) y no se puede deshacer.')) return;
  eliminarPaciente(id);
}

async function eliminarPaciente(id) {
  try {
    if (typeof gcalIsConnected === 'function' && gcalIsConnected()) {
      const p = PATIENTS.find(px => px.id === id);
      if (p) await gcalDeleteEventsByPatientName(p.name);
    }
    const res = await fetch('api/pacientes.php?id=' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    const idx = PATIENTS.findIndex(p => p.id === id);
    if (idx !== -1) PATIENTS.splice(idx, 1);
    toast('Expediente eliminado ✓');
    renderGrid();
    if (currentView === 'agenda') loadAgendaGcalEvents();
  } catch (e) {
    toast('No se pudo eliminar. Revisa la conexión.');
  }
}
