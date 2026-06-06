// ══════════════════════════════════════════════════════
// TAB · Documentos y archivos médicos
// ══════════════════════════════════════════════════════
function tabDocumentos(p) {
  return `<div class="panel">
    <div class="panel-head">
      <div class="panel-title"><span class="pt-icon">📁</span>Documentos y archivos</div>
      <button class="btn btn-sage btn-xs" onclick="triggerDocUpload()">+ Subir archivo</button>
    </div>
    <div class="panel-body">
      <input type="file" id="doc-input" accept="image/jpeg,image/png,application/pdf" style="display:none" onchange="subirDocumento(this)">
      <div id="doc-lista">
        <div style="text-align:center;padding:40px;color:var(--text-m);font-size:13px">Cargando...</div>
      </div>
    </div>
  </div>`;
}

async function renderDocumentos() {
  const p = currentPatient;
  const lista = $('#doc-lista');
  if (!lista || !p) return;

  try {
    const res  = await fetch(`api/documentos.php?paciente_id=${p.id}`);
    const docs = res.ok ? await res.json() : [];

    if (!docs.length) {
      lista.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-m)">
        <div style="font-size:40px;margin-bottom:12px;opacity:.4">📄</div>
        <div style="font-size:14px;font-weight:500">Sin documentos aún</div>
        <div style="font-size:12px;margin-top:4px">Sube exámenes, estudios o cualquier archivo médico con el botón de arriba</div>
      </div>`;
      return;
    }

    const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    lista.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px">` +
      docs.map(d => {
        const esPDF  = d.tipo_archivo === 'pdf';
        const fecha  = d.fecha ? (() => { const dt = new Date(d.fecha + 'T00:00:00'); return `${dt.getDate()} ${MESES[dt.getMonth()]} ${dt.getFullYear()}`; })() : '';
        const icono  = esPDF ? '📄' : '🖼';
        const badgeColor = esPDF ? 'var(--terra)' : 'var(--sage)';
        const badgeTxt   = esPDF ? 'PDF' : 'IMG';
        return `<div style="display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:var(--rs);border:1px solid var(--border);background:var(--bg);transition:background .15s" onmouseover="this.style.background='var(--bg-h)'" onmouseout="this.style.background='var(--bg)'">
          <div style="width:44px;height:44px;border-radius:var(--rs);background:var(--bg-h);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${icono}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(d.nombre)}</div>
            <div style="font-size:11px;color:var(--text-m);margin-top:2px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <span style="background:${badgeColor}22;color:${badgeColor};padding:1px 6px;border-radius:4px;font-weight:600;letter-spacing:.3px">${badgeTxt}</span>
              ${fecha ? `<span>${fecha}</span>` : ''}
              ${d.descripcion ? `<span style="opacity:.7">${escHtml(d.descripcion)}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            ${esPDF
              ? `<a href="${d.url}" target="_blank" class="btn btn-xs" style="text-decoration:none">Ver</a>`
              : `<button class="btn btn-xs" onclick="verDocImagen('${d.url}','${escHtml(d.nombre).replace(/'/g,"\\'")}')">Ver</button>`
            }
            <a href="${d.url}" download="${escHtml(d.nombre)}" class="btn btn-xs">↓</a>
            <button class="btn btn-xs" style="background:var(--terra-l);color:#fff" onclick="eliminarDocumento(${d.id})">✕</button>
          </div>
        </div>`;
      }).join('') + `</div>`;
  } catch (e) {
    lista.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-m)">No se pudo cargar los documentos</div>`;
  }
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function triggerDocUpload() {
  const input = $('#doc-input');
  if (input) input.click();
}

async function subirDocumento(input) {
  const file = input.files[0];
  if (!file) return;
  const p = currentPatient;
  if (!p) return;

  const nombre = prompt('Nombre del documento:', file.name.replace(/\.[^.]+$/, ''));
  if (nombre === null) { input.value = ''; return; }

  const fd = new FormData();
  fd.append('paciente_id', p.id);
  fd.append('archivo', file);
  fd.append('nombre', nombre.trim() || file.name);
  fd.append('fecha', new Date().toISOString().split('T')[0]);
  fd.append('descripcion', '');

  toast('Subiendo archivo...');
  try {
    const res = await fetch('api/documentos.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Error servidor');
    toast('Archivo subido ✓');
    renderDocumentos();
  } catch (e) {
    toast(e.message || 'Error al subir el archivo', '✗');
  }
  input.value = '';
}

async function eliminarDocumento(id) {
  if (!confirm('¿Eliminar este documento?')) return;
  try {
    const res = await fetch(`api/documentos.php?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    toast('Documento eliminado');
    renderDocumentos();
  } catch (e) {
    toast('Error al eliminar');
  }
}

function verDocImagen(url, nombre) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:zoom-out;gap:12px';
  ov.innerHTML = `
    <div style="font-size:13px;color:rgba(255,255,255,.7);max-width:90vw;text-align:center">${escHtml(nombre)}</div>
    <img src="${url}" style="max-width:90vw;max-height:85vh;border-radius:8px;object-fit:contain">
  `;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}
