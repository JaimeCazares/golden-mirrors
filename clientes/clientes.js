// clientes/clientes.js — Panel de Clientes (CRM de prospectos)

let clClientes = [];
let clFiltroEstado = 'todos';
let clDetalleId = null;

const CL_ESTADOS = [
    { v: 'nuevo',      l: 'Nuevo contacto' },
    { v: 'propuesta',  l: 'Propuesta enviada' },
    { v: 'pensando',   l: 'Lo va a pensar' },
    { v: 'dudas',      l: 'Tiene dudas' },
    { v: 'aprobado',   l: 'Aprobado ✅' },
    { v: 'rechazado',  l: 'Rechazado ❌' },
    { v: 'desarrollo', l: 'En desarrollo' },
    { v: 'entregado',  l: 'Entregado 🎉' },
];
const CL_GIRO_EMOJI = {
    restaurante: '🍽️', retail: '🛍️', servicios: '💼', salud_belleza: '💇',
    taller: '🔧', educacion: '🎓', otro: '📦'
};
const CL_CANAL_EMOJI = {
    whatsapp: '💬', llamada: '📞', presencial: '🚶', redes: '📱', referido: '🤝'
};
const CL_POSITIVOS = ['aprobado', 'desarrollo', 'entregado'];
const CL_NEGATIVOS = ['rechazado'];

function clEstadoLabel(v) { return (CL_ESTADOS.find(e => e.v === v) || {}).l || v; }
function clFind(id) { return clClientes.find(c => String(c.id) === String(id)); }
function clNormalizar(c) { c.notas = c.notas || []; c.checklist = c.checklist || []; return c; }

function initClientes() {
    fetch('clientes/api_clientes.php?accion=obtener')
        .then(r => r.json())
        .then(data => {
            if (data.error) { console.error('Error CRM:', data.error); return; }
            clClientes = (data.clientes || []).map(clNormalizar);
            clRenderFiltros();
            clRender();
        })
        .catch(e => console.error('Error cargando clientes:', e));
}

// ═══════════════════ RENDER ═══════════════════

function clListaFiltrada() {
    const q = (document.getElementById('cl-buscar')?.value || '').toLowerCase().trim();
    return clClientes.filter(c => {
        if (clFiltroEstado !== 'todos' && c.estado !== clFiltroEstado) return false;
        if (!q) return true;
        return (c.negocio || '').toLowerCase().includes(q)
            || (c.contacto || '').toLowerCase().includes(q)
            || (c.ubicacion || '').toLowerCase().includes(q);
    });
}

function clRender() {
    clRenderStats();
    clRenderLista(clListaFiltrada());
}

function clRenderStats() {
    const cont = document.getElementById('cl-stats');
    if (!cont) return;
    const total = clClientes.length;
    const proceso = clClientes.filter(c => !CL_POSITIVOS.includes(c.estado) && !CL_NEGATIVOS.includes(c.estado)).length;
    const aprobados = clClientes.filter(c => CL_POSITIVOS.includes(c.estado)).length;
    const rechazados = clClientes.filter(c => CL_NEGATIVOS.includes(c.estado)).length;
    const cotizado = clClientes.reduce((s, c) => s + (CL_NEGATIVOS.includes(c.estado) ? 0 : (parseFloat(c.precio) || 0)), 0);

    cont.innerHTML = `
        <div class="cl-stat"><div class="cl-stat-n">${total}</div><div class="cl-stat-l">Prospectos</div></div>
        <div class="cl-stat"><div class="cl-stat-n" style="color:#fbbf24">${proceso}</div><div class="cl-stat-l">En proceso</div></div>
        <div class="cl-stat"><div class="cl-stat-n" style="color:#00ff88">${aprobados}</div><div class="cl-stat-l">Aprobados</div></div>
        <div class="cl-stat"><div class="cl-stat-n" style="color:#ef4444">${rechazados}</div><div class="cl-stat-l">Rechazados</div></div>
        <div class="cl-stat"><div class="cl-stat-n" style="color:#00d9ff">$${cotizado.toLocaleString('es-MX', {maximumFractionDigits:0})}</div><div class="cl-stat-l">Cotizado</div></div>
    `;
}

function clRenderFiltros() {
    const cont = document.getElementById('cl-filtros');
    if (!cont) return;
    const opciones = [{ v: 'todos', l: 'Todos' }, ...CL_ESTADOS];
    cont.innerHTML = opciones.map(o =>
        `<button class="cl-chip ${clFiltroEstado === o.v ? 'activo' : ''}" onclick="clSetFiltro('${o.v}')">${o.l}</button>`
    ).join('');
}

function clSetFiltro(v) {
    clFiltroEstado = v;
    clRenderFiltros();
    clRender();
}

function clRenderLista(lista) {
    const cont = document.getElementById('cl-lista');
    if (!cont) return;

    if (lista.length === 0) {
        cont.innerHTML = '<div class="cl-vacio">No hay prospectos aquí todavía 👀</div>';
        return;
    }

    cont.innerHTML = lista.map(c => {
        const estrellas = c.satisfaccion ? '★'.repeat(c.satisfaccion) + '☆'.repeat(5 - c.satisfaccion) : '';
        return `
        <div class="cl-card" onclick="clAbrirDetalle(${c.id})">
            <div class="cl-card-top">
                <div>
                    <div class="cl-card-negocio">${clEsc(c.negocio)}</div>
                    <div class="cl-card-contacto">${clEsc(c.contacto || 'Sin contacto registrado')}</div>
                </div>
                <span class="cl-badge cl-badge--${clEsc(c.estado)}">${clEsc(clEstadoLabel(c.estado))}</span>
            </div>
            <div class="cl-card-meta">
                ${c.ubicacion ? `<span>📍 ${clEsc(c.ubicacion)}</span>` : ''}
                <span>${CL_GIRO_EMOJI[c.giro] || '📦'} ${clEsc(c.giro || 'otro')}</span>
                ${c.telefono ? `<span>${CL_CANAL_EMOJI[c.canal] || '💬'} ${clEsc(c.telefono)}</span>` : ''}
                ${estrellas ? `<span class="cl-stars">${estrellas}</span>` : ''}
            </div>
        </div>`;
    }).join('');
}

function clEsc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ═══════════════════ MODAL NUEVO / EDITAR DATOS BÁSICOS ═══════════════════

function clAbrirModalNuevo() {
    document.getElementById('cl-modal-titulo').textContent = 'Nuevo prospecto';
    document.getElementById('cl-f-id').value = '';
    document.getElementById('cl-f-negocio').value = '';
    document.getElementById('cl-f-contacto').value = '';
    document.getElementById('cl-f-telefono').value = '';
    document.getElementById('cl-f-ubicacion').value = '';
    document.getElementById('cl-f-giro').value = 'otro';
    document.getElementById('cl-f-canal').value = 'whatsapp';
    document.getElementById('cl-modal-overlay').classList.add('activo');
}

function clAbrirModalEditar(id) {
    const c = clFind(id);
    if (!c) return;
    document.getElementById('cl-modal-titulo').textContent = 'Editar datos';
    document.getElementById('cl-f-id').value = c.id;
    document.getElementById('cl-f-negocio').value = c.negocio || '';
    document.getElementById('cl-f-contacto').value = c.contacto || '';
    document.getElementById('cl-f-telefono').value = c.telefono || '';
    document.getElementById('cl-f-ubicacion').value = c.ubicacion || '';
    document.getElementById('cl-f-giro').value = c.giro || 'otro';
    document.getElementById('cl-f-canal').value = c.canal || 'whatsapp';
    document.getElementById('cl-modal-overlay').classList.add('activo');
}

function clGuardarNuevo() {
    const id = document.getElementById('cl-f-id').value;
    const negocio = document.getElementById('cl-f-negocio').value.trim();
    if (!negocio) { alert('Ponle el nombre del negocio'); return; }

    const payload = {
        negocio,
        contacto: document.getElementById('cl-f-contacto').value.trim(),
        telefono: document.getElementById('cl-f-telefono').value.trim(),
        ubicacion: document.getElementById('cl-f-ubicacion').value.trim(),
        giro: document.getElementById('cl-f-giro').value,
        canal: document.getElementById('cl-f-canal').value,
    };

    if (id) {
        payload.id = parseInt(id, 10);
        clActualizar(payload).then(() => {
            clCerrarModal('cl-modal-overlay');
            if (clDetalleId) clAbrirDetalle(clDetalleId);
        });
    } else {
        fetch('clientes/api_clientes.php?accion=crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(resp => {
            if (resp.status === 'ok') {
                clClientes.unshift(clNormalizar(resp.cliente));
                clCerrarModal('cl-modal-overlay');
                clRender();
            } else {
                alert('No se pudo guardar: ' + (resp.message || 'error desconocido'));
            }
        })
        .catch(() => alert('Error de conexión al guardar el prospecto.'));
    }
}

function clActualizar(payload) {
    return fetch('clientes/api_clientes.php?accion=actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.status === 'ok' && resp.cliente) {
            const idx = clClientes.findIndex(c => String(c.id) === String(resp.cliente.id));
            if (idx !== -1) {
                // 'actualizar' nunca toca notas/checklist: conservamos la versión local
                // para no pisar un cambio de checklist/nota que aún esté guardándose.
                const { notas, checklist } = clClientes[idx];
                clClientes[idx] = clNormalizar(resp.cliente);
                clClientes[idx].notas = notas;
                clClientes[idx].checklist = checklist;
            }
            clRender();
        } else {
            alert('No se pudo guardar el cambio: ' + (resp.message || 'error desconocido'));
        }
        return resp;
    })
    .catch(() => {
        alert('Error de conexión al guardar el cambio.');
        return { status: 'error' };
    });
}

// ═══════════════════ MODAL DETALLE ═══════════════════

function clAbrirDetalle(id) {
    clDetalleId = id;
    clRenderDetalle();
    document.getElementById('cl-detalle-overlay').classList.add('activo');
}

function clRenderDetalle() {
    const c = clFind(clDetalleId);
    const body = document.getElementById('cl-det-body');
    if (!c || !body) return;

    document.getElementById('cl-det-titulo').textContent = c.negocio;

    const estadosBtns = CL_ESTADOS.map(e =>
        `<button class="cl-estado-btn ${c.estado === e.v ? 'activo' : ''}" onclick="clCambiarEstado(${c.id},'${e.v}')">${e.l}</button>`
    ).join('');

    const estrellasHtml = [1,2,3,4,5].map(n =>
        `<span class="${(c.satisfaccion || 0) >= n ? 'on' : ''}" onclick="clSetSatisfaccion(${c.id},${n})">★</span>`
    ).join('');

    const checklistHtml = (c.checklist || []).map((item, idx) => `
        <div class="cl-check-item">
            <button class="cl-check-box ${item.hecho ? 'done' : ''}" onclick="clToggleCheck(${idx})">${item.hecho ? '✓' : ''}</button>
            <span class="cl-check-text ${item.hecho ? 'done' : ''}">${clEsc(item.texto)}</span>
            <button class="cl-check-del" onclick="clBorrarCheck(${idx})" title="Quitar">✕</button>
        </div>
    `).join('') || '<div class="cl-vacio" style="padding:10px 0">Sin tareas todavía</div>';

    const notas = [...(c.notas || [])].reverse();
    const notasHtml = notas.map(n => `
        <div class="cl-nota">
            <div class="cl-nota-fecha">📅 ${clFormatFecha(n.fecha)}</div>
            <div class="cl-nota-texto">${clEsc(n.texto)}</div>
        </div>
    `).join('') || '<div class="cl-vacio" style="padding:10px 0">Sin notas todavía</div>';

    body.innerHTML = `
        <div class="cl-det-sub">${clEsc(c.contacto || 'Sin contacto')} ${c.telefono ? '· ' + clEsc(c.telefono) : ''} ${c.ubicacion ? '· 📍 ' + clEsc(c.ubicacion) : ''}</div>
        <button class="cl-btn cl-btn-ghost" style="margin-top:10px" onclick="clAbrirModalEditar(${c.id})">✏️ Editar datos</button>

        <div class="cl-det-section">
            <div class="cl-det-section-title">Estado</div>
            <div class="cl-estados">${estadosBtns}</div>
        </div>

        <div class="cl-det-section">
            <div class="cl-det-section-title">Satisfacción</div>
            <div class="cl-star-picker">${estrellasHtml}</div>
        </div>

        <div class="cl-det-section">
            <div class="cl-det-section-title">Cotización</div>
            <div class="cl-money-row">
                <div>
                    <label class="cl-label">Precio cotizado</label>
                    <input type="number" class="cl-input" id="cl-det-precio" value="${c.precio ?? ''}" placeholder="$" onchange="clGuardarMoney(${c.id})">
                </div>
                <div>
                    <label class="cl-label">Anticipo</label>
                    <input type="number" class="cl-input" id="cl-det-anticipo" value="${c.anticipo ?? ''}" placeholder="$" onchange="clGuardarMoney(${c.id})">
                </div>
            </div>
        </div>

        <div class="cl-det-section">
            <div class="cl-det-section-title">Checklist de seguimiento</div>
            <div id="cl-checklist-cont">${checklistHtml}</div>
            <div class="cl-check-add">
                <input type="text" id="cl-nueva-tarea" class="cl-input" placeholder="Agregar tarea...">
                <button class="cl-btn cl-btn-ghost" onclick="clAgregarCheck()">+</button>
            </div>
        </div>

        <div class="cl-det-section">
            <div class="cl-det-section-title">Bitácora / notas</div>
            <div id="cl-notas-cont">${notasHtml}</div>
            <div class="cl-nota-add">
                <textarea id="cl-nueva-nota" placeholder="Anota cómo quedó la conversación, dudas, próximos pasos..."></textarea>
            </div>
            <button class="cl-btn cl-btn-primary cl-btn-full" onclick="clAgregarNota(${c.id})">Guardar nota</button>
        </div>

        <div class="cl-det-footer">
            <button class="cl-btn cl-btn-danger" onclick="clEliminar(${c.id})">🗑️ Eliminar prospecto</button>
        </div>
    `;
}

function clFormatFecha(fechaSql) {
    if (!fechaSql) return '';
    const d = new Date(fechaSql.replace(' ', 'T'));
    if (isNaN(d)) return fechaSql;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function clCambiarEstado(id, estado) {
    clActualizar({ id, estado }).then(() => clRenderDetalle());
}

function clSetSatisfaccion(id, n) {
    const c = clFind(id);
    const nuevo = (c.satisfaccion === n) ? null : n; // click de nuevo en la misma estrella = quitar
    clActualizar({ id, satisfaccion: nuevo }).then(() => clRenderDetalle());
}

function clGuardarMoney(id) {
    const precio = document.getElementById('cl-det-precio').value;
    const anticipo = document.getElementById('cl-det-anticipo').value;
    clActualizar({ id, precio: precio === '' ? null : precio, anticipo: anticipo === '' ? null : anticipo });
}

function clMutarChecklist(mutar) {
    const c = clFind(clDetalleId);
    if (!c) return;
    mutar(c.checklist);
    // Re-render inmediato (optimista): así el DOM siempre tiene índices frescos
    // antes de que el usuario pueda hacer otro clic, aunque el guardado siga en curso.
    clRenderDetalle();
    clGuardarChecklist(c);
}

function clToggleCheck(idx) {
    clMutarChecklist(l => { if (l[idx]) l[idx].hecho = !l[idx].hecho; });
}

function clBorrarCheck(idx) {
    clMutarChecklist(l => l.splice(idx, 1));
}

function clAgregarCheck() {
    const input = document.getElementById('cl-nueva-tarea');
    const texto = input.value.trim();
    if (!texto) return;
    clMutarChecklist(l => l.push({ texto, hecho: false }));
}

function clGuardarChecklist(c) {
    fetch('clientes/api_clientes.php?accion=set_checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, checklist: c.checklist })
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.status !== 'ok') alert('No se pudo guardar el checklist: ' + (resp.message || 'error desconocido'));
    })
    .catch(() => alert('Error de conexión al guardar el checklist.'));
}

function clAgregarNota(id) {
    const textarea = document.getElementById('cl-nueva-nota');
    const texto = textarea.value.trim();
    if (!texto) return;

    fetch('clientes/api_clientes.php?accion=agregar_nota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, texto })
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.status === 'ok') {
            const c = clFind(id);
            if (c) c.notas = resp.notas;
            textarea.value = '';
            clRenderDetalle();
        } else {
            alert('No se pudo guardar la nota: ' + (resp.message || 'error desconocido'));
        }
    })
    .catch(() => alert('Error de conexión al guardar la nota.'));
}

function clEliminar(id) {
    if (!confirm('¿Eliminar este prospecto? Esta acción no se puede deshacer.')) return;
    fetch('clientes/api_clientes.php?accion=eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.status === 'ok') {
            clClientes = clClientes.filter(c => String(c.id) !== String(id));
            clCerrarModal('cl-detalle-overlay');
            clRender();
        } else {
            alert('No se pudo eliminar: ' + (resp.message || 'error desconocido'));
        }
    })
    .catch(() => alert('Error de conexión al eliminar.'));
}

// ═══════════════════ MODALES: helpers genéricos ═══════════════════

function clCerrarModal(overlayId) {
    document.getElementById(overlayId)?.classList.remove('activo');
}
function clCerrarOverlay(event, overlayId) {
    if (event.target.id === overlayId) clCerrarModal(overlayId);
}

// ═══════════════════ GUÍA DE VENTA ═══════════════════

function clAbrirGuia() {
    document.getElementById('cl-guia-overlay').classList.add('activo');
}
function clGuiaTab(tab) {
    document.querySelectorAll('.cl-guia-tab').forEach(b => b.classList.toggle('activa', b.dataset.tab === tab));
    document.getElementById('cl-guia-venta').style.display = tab === 'venta' ? 'block' : 'none';
    document.getElementById('cl-guia-investigar').style.display = tab === 'investigar' ? 'block' : 'none';
}
function clCopiarBloque(btn) {
    const texto = btn.parentElement.querySelector('.cl-plantilla-texto')?.innerText || '';

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        alert('Este navegador no permite copiar automáticamente aquí (requiere HTTPS o localhost). Selecciona el texto manualmente.');
        return;
    }

    navigator.clipboard.writeText(texto).then(() => {
        const original = btn.textContent;
        btn.textContent = '✓ Copiado';
        btn.classList.add('copiado');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copiado'); }, 1500);
    }).catch(() => {
        alert('No se pudo copiar al portapapeles. Selecciona el texto manualmente.');
    });
}
