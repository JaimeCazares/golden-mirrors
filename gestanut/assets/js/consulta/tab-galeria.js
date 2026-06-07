// ══════════════════════════════════════════════════════
// TAB · Galería de fotos de progreso
// ══════════════════════════════════════════════════════
function tabGaleria(p) {
  return `<div class="panel">
    <div class="panel-head">
      <div class="panel-title"><span class="pt-icon">📸</span>Galería de progreso</div>
      <button class="btn btn-sage btn-xs" onclick="triggerFotoUpload()">+ Subir foto</button>
    </div>
    <div class="panel-body">
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="subirFoto(this)">
      <div id="galeria-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div style="text-align:center;padding:40px;color:var(--text-m);grid-column:1/-1;font-size:13px">Cargando...</div>
      </div>
    </div>
  </div>`;
}

async function renderGaleria() {
  const p = currentPatient;
  const grid = $('#galeria-grid');
  if (!grid || !p) return;

  try {
    const res  = await fetch(`api/galeria.php?paciente_id=${p.id}`);
    const fotos = res.ok ? await res.json() : [];

    if (!fotos.length) {
      grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-m);grid-column:1/-1">
        <div style="font-size:40px;margin-bottom:12px;opacity:.4">📷</div>
        <div style="font-size:14px;font-weight:500">Sin fotos aún</div>
        <div style="font-size:12px;margin-top:4px">Sube la primera foto de progreso con el botón de arriba</div>
      </div>`;
      return;
    }

    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    grid.innerHTML = fotos.map(f => {
      const d     = f.fecha ? new Date(f.fecha + 'T00:00:00') : null;
      const fecha = d ? `${d.getDate()} ${MESES[d.getMonth()]}` : '';
      const label = [fecha, f.descripcion].filter(Boolean).join(' · ');
      return `<div style="aspect-ratio:3/4;border-radius:var(--rs);overflow:hidden;position:relative;cursor:pointer;transition:transform .2s" onmouseover="this.querySelector('.foto-del').style.opacity='1';this.style.transform='scale(1.02)'" onmouseout="this.querySelector('.foto-del').style.opacity='0';this.style.transform=''">
        <img src="${f.url}" style="width:100%;height:100%;object-fit:cover" loading="lazy" onclick="verFoto('${f.url}')">
        ${label ? `<div style="position:absolute;bottom:0;left:0;right:0;padding:8px 6px 6px;background:linear-gradient(transparent,rgba(0,0,0,.55))">
          <span style="font-size:9px;color:#fff;display:block;text-align:center;letter-spacing:.4px">${label}</span>
        </div>` : ''}
        <button class="foto-del" onclick="eliminarFoto(${f.id})" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.55);border:none;color:#fff;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:13px;opacity:0;transition:opacity .2s;display:flex;align-items:center;justify-content:center;line-height:1">✕</button>
      </div>`;
    }).join('');
  } catch (e) {
    grid.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-m);grid-column:1/-1">No se pudo cargar la galería</div>`;
  }
}

function triggerFotoUpload() {
  const input = $('#foto-input');
  if (input) input.click();
}

async function subirFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const p = currentPatient;
  if (!p) return;

  const fd = new FormData();
  fd.append('paciente_id', p.id);
  fd.append('foto', file);
  fd.append('fecha', localToday());
  fd.append('descripcion', '');

  toast('Subiendo foto...');
  try {
    const res = await fetch('api/galeria.php', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Error servidor');
    toast('Foto subida ✓');
    renderGaleria();
  } catch (e) {
    toast('Error al subir la foto');
  }
  input.value = '';
}

async function eliminarFoto(id) {
  if (!confirm('¿Eliminar esta foto?')) return;
  try {
    const res = await fetch(`api/galeria.php?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    toast('Foto eliminada');
    renderGaleria();
  } catch (e) {
    toast('Error al eliminar');
  }
}

function verFoto(url) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  ov.innerHTML = `<img src="${url}" style="max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain">`;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}
