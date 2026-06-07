// ══════════════════════════════════════════════════════
// VIEW · Planes nutricionales
// ══════════════════════════════════════════════════════
VIEWS.planes = () => {
  setTimeout(loadPlanes, 0);
  return `<div class="view active">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px">
      <div>
        <div class="section-eyebrow">Planes activos por paciente</div>
        <h2 class="h-display">Tus planes <em>nutricionales</em></h2>
      </div>
      <button class="btn btn-primary btn-sm" onclick="irACrearPlan()">+ Crear plan</button>
    </div>
    <div id="planes-grid" class="g3">
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-m)">
        <div style="font-size:28px;margin-bottom:10px">🥗</div>
        Cargando planes...
      </div>
    </div>
  </div>`;
};

async function loadPlanes() {
  const grid = $('#planes-grid');
  if (!grid) return;
  try {
    const res   = await fetch('api/planes.php');
    const plans = res.ok ? await res.json() : [];
    renderPlanesGrid(plans);
  } catch (e) {
    const g = $('#planes-grid');
    if (g) g.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px">
      <div style="font-size:36px;margin-bottom:8px">⚠️</div>
      <div class="muted-sm">Error al cargar planes. Verifica la conexión.</div>
    </div>`;
  }
}

const _planColors = ['blush', 'sage', 'terra', 'info', 'gold'];

const _planTipos = {
  materna:  { icon: '🤰', label: 'Materno-infantil' },
  recomp:   { icon: '⚖️',  label: 'Recomposición'    },
  perdida:  { icon: '📉', label: 'Pérdida de peso'   },
  peso:     { icon: '⚖️', label: 'Control de peso'   },
};

function renderPlanesGrid(plans) {
  const grid = $('#planes-grid');
  if (!grid) return;

  if (!plans.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 20px">
      <div style="font-size:48px;margin-bottom:12px">🥗</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--forest);margin-bottom:8px">Sin planes activos</div>
      <div class="muted-sm" style="margin-bottom:20px">Los planes se crean desde el expediente de cada paciente</div>
      <button class="btn btn-primary btn-sm" onclick="irACrearPlan()">Ir a Pacientes →</button>
    </div>`;
    return;
  }

  grid.innerHTML = plans.map((p, i) => {
    const c    = _planColors[i % _planColors.length];
    const t    = _planTipos[p.tipo_consulta] || { icon: '🥗', label: '' };
    const desc = p.descripcion || (p.calorias_diarias ? `${p.calorias_diarias} kcal · Plan personalizado` : 'Plan personalizado');
    const fecha = p.fecha_creacion
      ? new Date(p.fecha_creacion + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
    return `<div class="panel" style="cursor:pointer;transition:all .25s"
      onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 12px 32px rgba(26,51,40,.08)'"
      onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="height:80px;background:linear-gradient(135deg,var(--${c}-l),var(--${c === 'info' ? 'info-l' : c + '-ll'}));display:flex;align-items:center;justify-content:center;font-size:38px">${t.icon}</div>
      <div style="padding:18px 20px">
        <div style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;color:var(--forest);margin-bottom:2px">${p.nombre}</div>
        <div class="muted-sm" style="font-size:11px;margin-bottom:12px">${desc}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="badge b-cream" style="font-size:10px">${fecha}</span>
          <button class="btn btn-outline btn-xs" onclick="abrirPlanPaciente(${p.paciente_id})">Ver →</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function irACrearPlan() {
  navTo('pacientes');
  setTimeout(() => toast('Selecciona una paciente y abre la pestaña "Plan Nutricional"'), 100);
}

async function abrirPlanPaciente(pid) {
  await openPatient(pid);
  setCTab('plan');
}
