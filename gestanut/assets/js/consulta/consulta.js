// ══════════════════════════════════════════════════════
// CONSULTA · Modo expediente / sesión activa
// ══════════════════════════════════════════════════════
async function openPatient(id) {
  currentPatient = PATIENTS.find(p => p.id === id);
  consultaTab = 'resumen';
  renderConsulta();
  try {
    const [detailRes, citaRes] = await Promise.all([
      fetch(`api/paciente.php?id=${id}`),
      fetch(`api/citas.php?paciente_id=${id}`)
    ]);
    if (detailRes.ok) {
      const detail = await detailRes.json();
      const savedWeight = currentPatient.weight;
      Object.assign(currentPatient, detail);
      if (currentPatient.weight == null) currentPatient.weight = savedWeight;
    }
    if (citaRes.ok) {
      const cita = await citaRes.json();
      if (cita && cita.fecha) {
        const d = new Date(cita.fecha + 'T00:00:00');
        const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
        const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const [hh, mm] = cita.hora.split(':');
        currentPatient.proxima     = `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} · ${parseInt(hh)}:${mm}`;
        currentPatient.proximaCita = cita;
      }
    }
    renderConsulta();
  } catch (e) {
    console.warn('No se pudo cargar detalle desde BD', e);
  }
}

function exitConsulta() {
  currentPatient = null;
  showView(currentView);
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === currentView));
}

function setCTab(t) {
  consultaTab = t;
  renderConsultaTab();
}

function renderConsulta() {
  const p = currentPatient;
  if (!p) return;
  const c = $('#content-area');
  $('#tb-title').innerHTML = `Consulta · <em>${p.name}</em>`;
  $('#tb-sub').innerHTML   = `<span class="dot-pulse"></span>&nbsp; Sesión activa · ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

  const tabs = [
    { k: 'resumen',     l: '📋 Resumen' },
    { k: 'historia',    l: '🗂 Historia Clínica' },
    { k: 'laboratorio', l: '🔬 Laboratorio' },
    { k: 'progreso',    l: '📈 Progreso' },
    { k: 'recuento24',  l: '🍽 Recuento 24h' },
    { k: 'plan',        l: '🥗 Plan Nutricional' },
    { k: 'notas',       l: '📝 Notas' },
    ...(p.semGestacion ? [{ k: 'embarazo',  l: '🤰 Embarazo' }]  : []),
    ...(p.lactancia    ? [{ k: 'lactancia', l: '🤱 Lactancia' }] : []),
    ...(p.dg           ? [{ k: 'glucosa',   l: '📊 Glucosa' }]   : []),
    { k: 'galeria',     l: '📸 Galería' },
    { k: 'documentos',  l: '📁 Documentos' },
  ];

  const imc = p.weight ? calcIMC(p.weight, p.height) : '—';
  const cat = imcCat(imc);

  c.innerHTML = `<div class="view active">
    <!-- Header del paciente -->
    <div style="background:linear-gradient(120deg,var(--forest) 0%,var(--forest-l) 100%);border-radius:var(--r);padding:24px 28px;margin-bottom:20px;color:var(--cream);position:relative;overflow:hidden">
      <div style="position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:rgba(107,158,120,.15)"></div>
      <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap">
        <div style="display:flex;align-items:flex-start;gap:18px">
          <div style="position:relative;cursor:pointer;flex-shrink:0" onclick="document.getElementById('foto-perfil-input').click()" title="Cambiar foto de perfil" onmouseover="this.querySelector('.foto-cam').style.opacity='1'" onmouseout="this.querySelector('.foto-cam').style.opacity='0'">
            <div class="avatar av-xl ${p.av}" style="border:3px solid rgba(255,255,255,.2);overflow:hidden">
              ${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover;display:block">` : p.ini}
            </div>
            <div class="foto-cam" style="position:absolute;inset:0;background:rgba(0,0,0,.45);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;font-size:20px;pointer-events:none">📷</div>
          </div>
          <input type="file" id="foto-perfil-input" accept="image/*" style="display:none" onchange="uploadFotoPerfil(${p.id},this)">
          <div>
            <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sage-l);margin-bottom:4px">${p.icon} ${p.typeLabel}</div>
            <h1 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:500;line-height:1;margin-bottom:6px">${p.name}</h1>
            <div style="color:rgba(250,246,239,.7);font-size:12px;display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
              ${p.age ? `<span>${p.age} años</span>·` : ''}<span>${p.sexo === 'masculino' ? '♂️ Masculino' : p.sexo === 'femenino' ? '♀️ Femenino' : ''}</span>${!p.sexo ? '' : '·'}<span>${p.online ? '💻 Online' : '📍 Presencial'}</span>·<span>📱 ${p.phone}</span>
              ${p.consentimiento?.firmado
                ? `·<span style="color:var(--sage-l)">✓ Consentimiento firmado</span>`
                : `·<span style="color:var(--terra)">⚠️ Sin consentimiento</span>`}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <a href="${waLink(p.phone, 'Hola ' + p.name.split(' ')[0] + '! 🌿 Te confirmo tu cita de hoy.')}" target="_blank" class="btn-wa"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>WhatsApp</a>
              <button class="btn btn-sm" onclick="openSendPlan(${p.id})" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:var(--cream)">📤 Enviar plan</button>
              <button class="btn btn-sm" onclick="openReceiptModal()" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:var(--cream)">🧾 Recibo</button>
              <button class="btn btn-sm" onclick="exitConsulta()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(250,246,239,.7)">← Salir</button>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:20px;text-align:center">
          <div><div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;line-height:1">${p.weight || '—'}</div><div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(250,246,239,.5);margin-top:3px">kg</div></div>
          <div><div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;line-height:1">${imc}</div><div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(250,246,239,.5);margin-top:3px">IMC</div></div>
          ${p.semGestacion ? `<div><div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;line-height:1">${p.semGestacion}</div><div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(250,246,239,.5);margin-top:3px">sem</div></div>` : ''}
          ${p.dg ? `<div><div style="font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:500;line-height:1;color:var(--gold-l)">DG</div><div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:rgba(250,246,239,.5);margin-top:3px">Diab. Gest.</div></div>` : ''}
        </div>
      </div>
    </div>
    <!-- Tabs -->
    <div class="ctabs">${tabs.map(t => `<button class="ctab${consultaTab === t.k ? ' active' : ''}" data-tab="${t.k}" onclick="setCTab('${t.k}')">${t.l}</button>`).join('')}</div>
    <div id="ctab-content"></div>
  </div>`;
  renderConsultaTab();
}

function renderConsultaTab() {
  const p = currentPatient;
  const c = $('#ctab-content');
  if (!c || !p) return;

  const fns = {
    resumen:     tabResumen,
    historia:    tabHistoria,
    laboratorio: tabLab,
    progreso:    tabProgreso,
    recuento24:  tabRecuento,
    plan:        tabPlan,
    notas:       tabNotas,
    embarazo:    tabEmbarazo,
    lactancia:   tabLactancia,
    glucosa:     tabGlucosa,
    galeria:     tabGaleria,
    documentos:  tabDocumentos,
  };
  const fn = fns[consultaTab];
  c.innerHTML = fn ? fn(p) : '';
  $$('.ctab').forEach(b => b.classList.toggle('active', b.dataset.tab === consultaTab));

  setTimeout(() => {
    if (consultaTab === 'progreso') renderEvolChart();
    if (consultaTab === 'glucosa')  renderGlucChart();
    if (consultaTab === 'embarazo') renderGanChart();
    if (consultaTab === 'galeria')      renderGaleria();
    if (consultaTab === 'documentos')   renderDocumentos();
  }, 60);
}

async function uploadFotoPerfil(id, input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';
  const fd = new FormData();
  fd.append('paciente_id', id);
  fd.append('foto', file);
  try {
    const res  = await fetch('api/foto_perfil.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.ok) {
      const p = PATIENTS.find(x => x.id === id);
      if (p) p.foto = data.url;
      if (currentPatient?.id === id) currentPatient.foto = data.url;
      renderConsulta();
      toast('Foto actualizada ✓');
    } else {
      toast(data.error || 'Error al subir foto', '✗');
    }
  } catch(e) {
    toast('No se pudo subir la foto', '✗');
  }
}

