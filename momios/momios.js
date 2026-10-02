// momios/momios.js — Panel de Momios (Champions League)

const MM_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const MM_THEMES = [
    { key: 'lluvia',    label: 'Lluvia',    emoji: '🌧️' },
    { key: 'otono',     label: 'Otoño',     emoji: '🍁' },
    { key: 'playa',     label: 'Playa',     emoji: '🏖️' },
    { key: 'aurora',    label: 'Aurora',    emoji: '🌌' },
    { key: 'nieve',     label: 'Nieve',     emoji: '❄️' },
    { key: 'atardecer', label: 'Atardecer', emoji: '🌅' }
];

let mmRegistros   = [];
let mmDiasFiltro  = 7; // 7, 30 u 0 (todo)
let mmTema         = 'lluvia';
let mmTemaMenuOpen = false;

function mmFmt(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function mmHoyStr() { return mmFmt(new Date()); }

// Formato americano: entero con signo explícito (+135, -400). Null -> '—'.
function mmFormatMomio(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Math.round(Number(v));
    return (n > 0 ? '+' : '') + n;
}

// 'data-sign' para el wrapper visual: <input type="number"> nunca muestra el "+"
// de los positivos (el navegador lo recorta), así que se superpone aparte.
function mmSignoAttr(v) {
    return (v !== null && v !== undefined && v !== '' && Number(v) > 0) ? '+' : '';
}

// Refresca el atributo data-sign del wrapper (sirve tanto para el formulario
// manual como para las filas de la tabla de extraídos).
function mmActualizarSigno(inputEl) {
    const wrap = inputEl.closest('[data-sign]');
    if (wrap) wrap.dataset.sign = mmSignoAttr(inputEl.value);
}

async function initMomios() {
    const inputFecha = document.getElementById('mm-input-fecha');
    if (inputFecha) inputFecha.value = mmHoyStr();

    mmInitTema();
    mmAutoSeleccionarTurno();
    await mmCargarRegistros();
    mmRenderAll();
}

// ══════════════════════════════════════════════════════
// SELECTOR DE DISEÑO — fondos de video intercambiables
// (reusa los videos de nutricion/videos)
// ══════════════════════════════════════════════════════
function mmInitTema() {
    mmTema = localStorage.getItem('mmTema') || 'lluvia';
    mmAplicarTema(mmTema);
    mmRenderThemeMenu();
}

function mmRenderThemeMenu() {
    const cont = document.getElementById('mm-theme-menu');
    if (!cont) return;
    cont.innerHTML = MM_THEMES.map(t => `
        <button type="button" class="mm-theme-opt ${t.key === mmTema ? 'activo' : ''}" onclick="mmElegirTema('${t.key}')">
            <span class="mto-swatch mto-${t.key}"></span>
            <span class="mto-emoji">${t.emoji}</span>
            <span class="mto-label">${t.label}</span>
        </button>`).join('');
}

function mmToggleThemeMenu() {
    mmTemaMenuOpen = !mmTemaMenuOpen;
    const menu = document.getElementById('mm-theme-menu');
    const btn  = document.getElementById('mm-theme-btn');
    if (menu) menu.classList.toggle('abierto', mmTemaMenuOpen);
    if (btn)  btn.classList.toggle('activo', mmTemaMenuOpen);
}

function mmElegirTema(key) {
    mmTema = key;
    localStorage.setItem('mmTema', key);
    mmAplicarTema(key);
    mmRenderThemeMenu();
    if (mmTemaMenuOpen) mmToggleThemeMenu();
}

function mmAplicarTema(key) {
    document.querySelectorAll('.mm-layer').forEach(l => {
        const activo = l.dataset.themeLayer === key;
        l.classList.toggle('activo', activo);
        const vid = l.querySelector('.mm-video-bg');
        if (vid) {
            if (activo) {
                if (vid.dataset.src && !vid.src) {
                    vid.src = vid.dataset.src;
                    vid.load();
                }
                vid.muted = true;
                vid.play().catch(() => {});
            } else {
                vid.pause();
            }
        }
    });
    const btnEmoji = document.getElementById('mm-theme-btn-emoji');
    const theme    = MM_THEMES.find(t => t.key === key);
    if (btnEmoji && theme) btnEmoji.textContent = theme.emoji;
}

// Sugiere el turno según la hora actual: antes de las 13:00 -> mañana, si no -> tarde
function mmAutoSeleccionarTurno() {
    const sel = document.getElementById('mm-input-turno');
    if (!sel) return;
    const hora = new Date().getHours();
    sel.value = hora < 13 ? 'manana' : 'tarde';
}

async function mmCargarRegistros() {
    const lista = document.getElementById('mm-lista');
    try {
        let url = 'momios/api_momios.php?accion=listar';
        if (mmDiasFiltro > 0) {
            const hoy = new Date();
            const desde = new Date(hoy);
            desde.setDate(desde.getDate() - mmDiasFiltro);
            url += `&desde=${mmFmt(desde)}&hasta=${mmFmt(hoy)}`;
        }
        const res = await fetch(url);
        mmRegistros = await res.json();
        if (!Array.isArray(mmRegistros)) mmRegistros = [];
    } catch (e) {
        console.error('Error cargando momios', e);
        mmRegistros = [];
        if (lista) lista.innerHTML = '<p class="mm-lista-vacio">Error al cargar registros.</p>';
    }
}

async function mmFiltrarDias(dias, btn) {
    mmDiasFiltro = dias;
    document.querySelectorAll('.mm-filtro-btn').forEach(b => b.classList.remove('activo'));
    btn?.classList.add('activo');
    await mmCargarRegistros();
    mmRenderAll();
}

function mmMostrarMsg(texto, tipo) {
    const msg = document.getElementById('mm-form-msg');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'mm-form-msg ' + (tipo || '');
    if (texto) setTimeout(() => { if (msg.textContent === texto) { msg.textContent = ''; msg.className = 'mm-form-msg'; } }, 3000);
}

async function mmGuardarRegistro() {
    const btn = document.getElementById('mm-btn-guardar');

    const fechaPartido    = document.getElementById('mm-input-fecha')?.value || '';
    const turno           = document.getElementById('mm-input-turno')?.value || '';
    const equipoLocal     = document.getElementById('mm-input-local')?.value.trim() || '';
    const equipoVisitante = document.getElementById('mm-input-visitante')?.value.trim() || '';
    const casaApuestas    = document.getElementById('mm-input-casa')?.value.trim() || '';
    const momioLocal      = document.getElementById('mm-input-m1')?.value || '';
    const momioEmpate     = document.getElementById('mm-input-mx')?.value || '';
    const momioVisitante  = document.getElementById('mm-input-m2')?.value || '';
    const notas           = document.getElementById('mm-input-notas')?.value.trim() || '';

    if (!fechaPartido || !equipoLocal || !equipoVisitante) {
        mmMostrarMsg('Completa fecha del partido, equipo local y visitante.', 'error');
        return;
    }

    if (btn) btn.disabled = true;

    try {
        const res = await fetch('momios/api_momios.php?accion=guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                turno,
                fecha_partido: fechaPartido,
                equipo_local: equipoLocal,
                equipo_visitante: equipoVisitante,
                casa_apuestas: casaApuestas,
                momio_local: momioLocal,
                momio_empate: momioEmpate,
                momio_visitante: momioVisitante,
                notas
            })
        });
        const json = await res.json();

        if (json.error) {
            mmMostrarMsg(json.error, 'error');
        } else {
            mmMostrarMsg('Momio guardado ✓', 'ok');
            mmLimpiarFormulario();
            await mmCargarRegistros();
            mmRenderAll();
        }
    } catch (e) {
        console.error('Error guardando momio', e);
        mmMostrarMsg('Error de conexión al guardar.', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ══════════════════════════════════════════════════════
// EXTRACCIÓN DE MOMIOS DESDE IMÁGENES (API de Claude, vision)
// Carga varias imágenes (de varias casas) de un jalón, se extraen en paralelo
// en el servidor y se arma una tabla editable para confirmar y guardar todo junto.
// ══════════════════════════════════════════════════════
let mmPartidosExtraidos = [];

function mmExtraerMostrarMsg(texto, tipo) {
    const msg = document.getElementById('mm-extraer-msg');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'mm-extraer-msg ' + (tipo || '');
}

async function mmImagenesSeleccionadas(input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const sobrepeso = files.find(f => f.size > 5 * 1024 * 1024);
    if (sobrepeso) {
        mmExtraerMostrarMsg(`"${sobrepeso.name}" pesa más de 5 MB.`, 'error');
        input.value = '';
        return;
    }

    const btn = document.getElementById('mm-btn-extraer');
    if (btn) btn.disabled = true;
    document.getElementById('mm-extraidos-tabla').innerHTML = '';
    mmExtraerMostrarMsg(`Analizando ${files.length} imagen(es)...`, '');

    try {
        const formData = new FormData();
        files.forEach(f => formData.append('imagenes[]', f));

        const res = await fetch('momios/extraer_momios.php', { method: 'POST', body: formData });
        const json = await res.json();

        if (json.error && (!json.partidos || !json.partidos.length)) {
            mmExtraerMostrarMsg(json.error, 'error');
        } else if (!Array.isArray(json.partidos) || !json.partidos.length) {
            mmExtraerMostrarMsg('No se detectaron partidos en las imágenes.', 'error');
        } else {
            mmPartidosExtraidos = json.partidos;
            const casas = [...new Set(json.partidos.map(p => p.casa_apuestas).filter(Boolean))];
            let msg = `${json.partidos.length} partido(s) detectado(s)${casas.length ? ' — ' + casas.join(', ') : ''}. Revisa y guarda.`;
            if (json.errores && json.errores.length) msg += ` (${json.errores.length} imagen(es) con error)`;
            mmExtraerMostrarMsg(msg, 'ok');
            mmRenderExtraidosTabla();
        }
    } catch (e) {
        console.error('Error extrayendo momios de imágenes', e);
        mmExtraerMostrarMsg('Error de conexión al analizar las imágenes.', 'error');
    } finally {
        if (btn) btn.disabled = false;
        input.value = '';
    }
}

function mmRenderExtraidosTabla() {
    const cont = document.getElementById('mm-extraidos-tabla');
    if (!cont) return;

    if (!mmPartidosExtraidos.length) {
        cont.innerHTML = '';
        return;
    }

    const barra = `
        <div class="mm-ex-barra">
            <span>${mmPartidosExtraidos.length} partido(s) por confirmar</span>
            <div style="display:flex; gap:6px;">
                <button type="button" class="mm-btn-quitar-todos" onclick="mmQuitarTodosExtraidos()">Vaciar</button>
                <button type="button" class="mm-btn-guardar-lote" id="mm-btn-guardar-lote" onclick="mmGuardarTodosExtraidos()">💾 Guardar todos (${mmPartidosExtraidos.length})</button>
            </div>
        </div>`;

    // Agrupa por casa de apuestas para que sea más fácil de revisar
    const grupos = {};
    mmPartidosExtraidos.forEach((p, i) => {
        const casa = p.casa_apuestas || 'Sin identificar';
        if (!grupos[casa]) grupos[casa] = [];
        grupos[casa].push(i);
    });

    let filas = '';
    Object.keys(grupos).forEach(casa => {
        filas += `<div class="mm-ex-grupo-label">🏠 ${mmEscapar(casa)} — ${grupos[casa].length} partido(s)</div>`;
        grupos[casa].forEach(i => { filas += mmRenderFilaExtraido(i); });
    });

    cont.innerHTML = barra + filas + barra;
}

function mmRenderFilaExtraido(i) {
    const p = mmPartidosExtraidos[i];
    const val = v => (v === null || v === undefined) ? '' : v;
    return `
        <div class="mm-ex-row" data-idx="${i}">
            <input type="date" class="mm-ex-fecha" value="${val(p.fecha_partido)}" oninput="mmActualizarExtraido(${i}, 'fecha_partido', this.value)" title="Fecha del partido">
            <input type="time" class="mm-ex-hora" value="${val(p.hora_partido)}" oninput="mmActualizarExtraido(${i}, 'hora_partido', this.value)" title="Hora del partido">
            <input type="text" class="mm-ex-equipo" value="${mmEscapar(p.equipo_local)}" oninput="mmActualizarExtraido(${i}, 'equipo_local', this.value)" placeholder="Local">
            <span class="mm-ex-vs">vs</span>
            <input type="text" class="mm-ex-equipo" value="${mmEscapar(p.equipo_visitante)}" oninput="mmActualizarExtraido(${i}, 'equipo_visitante', this.value)" placeholder="Visitante">
            <span class="mm-ex-momio-wrap" data-sign="${mmSignoAttr(p.momio_local)}">
                <input type="number" step="1" class="mm-ex-momio" value="${val(p.momio_local)}" oninput="mmActualizarMomioExtraido(this, ${i}, 'momio_local')" title="Momio 1 (Local)">
            </span>
            <span class="mm-ex-momio-wrap" data-sign="${mmSignoAttr(p.momio_empate)}">
                <input type="number" step="1" class="mm-ex-momio" value="${val(p.momio_empate)}" oninput="mmActualizarMomioExtraido(this, ${i}, 'momio_empate')" title="Momio X (Empate)">
            </span>
            <span class="mm-ex-momio-wrap" data-sign="${mmSignoAttr(p.momio_visitante)}">
                <input type="number" step="1" class="mm-ex-momio" value="${val(p.momio_visitante)}" oninput="mmActualizarMomioExtraido(this, ${i}, 'momio_visitante')" title="Momio 2 (Visitante)">
            </span>
            <button type="button" class="mm-ex-del" onclick="mmQuitarExtraido(${i})" title="Quitar">✕</button>
        </div>`;
}

function mmActualizarMomioExtraido(inputEl, i, campo) {
    mmActualizarExtraido(i, campo, inputEl.value);
    mmActualizarSigno(inputEl);
}

function mmActualizarExtraido(i, campo, valor) {
    if (mmPartidosExtraidos[i]) mmPartidosExtraidos[i][campo] = valor;
}

function mmQuitarExtraido(i) {
    mmPartidosExtraidos.splice(i, 1);
    mmRenderExtraidosTabla();
}

function mmQuitarTodosExtraidos() {
    mmPartidosExtraidos = [];
    mmRenderExtraidosTabla();
    mmExtraerMostrarMsg('', '');
}

async function mmGuardarTodosExtraidos() {
    if (!mmPartidosExtraidos.length) return;
    const turno = document.getElementById('mm-input-turno')?.value || 'manana';

    document.querySelectorAll('.mm-btn-guardar-lote').forEach(b => b.disabled = true);
    mmExtraerMostrarMsg('Guardando...', '');

    try {
        const res = await fetch('momios/api_momios.php?accion=guardar_lote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turno, registros: mmPartidosExtraidos })
        });
        const json = await res.json();

        if (json.error) {
            mmExtraerMostrarMsg(json.error, 'error');
        } else {
            let msg = `${json.guardados} partido(s) guardado(s) ✓`;
            if (json.omitidos) msg += ` (${json.omitidos} con datos incompletos, omitidos)`;
            mmExtraerMostrarMsg(msg, 'ok');
            mmPartidosExtraidos = [];
            mmRenderExtraidosTabla();
            await mmCargarRegistros();
            mmRenderAll();
        }
    } catch (e) {
        console.error('Error guardando lote de momios', e);
        mmExtraerMostrarMsg('Error de conexión al guardar.', 'error');
    } finally {
        document.querySelectorAll('.mm-btn-guardar-lote').forEach(b => b.disabled = false);
    }
}

function mmLimpiarFormulario() {
    ['mm-input-local', 'mm-input-visitante', 'mm-input-casa', 'mm-input-m1', 'mm-input-mx', 'mm-input-m2', 'mm-input-notas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    mmAutoSeleccionarTurno();
}

async function mmEliminarRegistro(id) {
    if (!confirm('¿Eliminar este registro de momios?')) return;
    try {
        await fetch('momios/api_momios.php?accion=eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        await mmCargarRegistros();
        mmRenderAll();
    } catch (e) {
        console.error('Error eliminando momio', e);
    }
}

function mmRenderAll() {
    mmRenderStats();
    mmRenderLista();
}

function mmRenderStats() {
    const cont = document.getElementById('mm-stats');
    if (!cont) return;

    const total     = mmRegistros.length;
    const hoyStr    = mmHoyStr();
    const hoyCount  = mmRegistros.filter(r => r.fecha === hoyStr).length;
    const conMomios = mmRegistros.filter(r => r.momio_local !== null || r.momio_empate !== null || r.momio_visitante !== null);
    const promedioLocal = conMomios.length
        ? mmFormatMomio(conMomios.reduce((s, r) => s + (r.momio_local || 0), 0) / conMomios.length)
        : '—';

    cont.innerHTML = `
        <div class="mm-stat"><span class="mm-stat-icon">📋</span><div class="mm-stat-n">${total}</div><div class="mm-stat-l">Registros</div></div>
        <div class="mm-stat"><span class="mm-stat-icon">📅</span><div class="mm-stat-n">${hoyCount}</div><div class="mm-stat-l">Hoy</div></div>
        <div class="mm-stat"><span class="mm-stat-icon">📈</span><div class="mm-stat-n">${promedioLocal}</div><div class="mm-stat-l">Momio 1 prom.</div></div>
    `;
}

function mmFormatearFechaLabel(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    return `${d} de ${MM_MESES[m - 1].toLowerCase()} ${y}`;
}

function mmRenderLista() {
    const cont = document.getElementById('mm-lista');
    if (!cont) return;

    if (!mmRegistros.length) {
        cont.innerHTML = '<p class="mm-lista-vacio">Aún no hay momios registrados en este rango.</p>';
        return;
    }

    let html = '';
    let fechaAnterior = null;

    mmRegistros.forEach(r => {
        if (r.fecha !== fechaAnterior) {
            html += `<div class="mm-fecha-grupo-label">${mmFormatearFechaLabel(r.fecha)}</div>`;
            fechaAnterior = r.fecha;
        }

        const turnoLabel = r.turno === 'manana' ? '🌅 6:00 AM' : '🌆 7:00 PM';
        const turnoClase = r.turno === 'manana' ? '' : 'tarde';

        const m1 = mmFormatMomio(r.momio_local);
        const mx = mmFormatMomio(r.momio_empate);
        const m2 = mmFormatMomio(r.momio_visitante);

        const partidoInfo = r.fecha_partido
            ? `${mmFormatearFechaLabel(r.fecha_partido)}${r.hora_partido ? ' · ' + r.hora_partido.slice(0, 5) : ''}`
            : '';

        html += `
            <div class="mm-card-partido">
                <div class="mm-card-head">
                    <span class="mm-turno-badge ${turnoClase}">${turnoLabel}</span>
                    ${r.casa_apuestas ? `<span class="mm-casa-badge">${mmEscapar(r.casa_apuestas)}</span>` : ''}
                    <button type="button" class="mm-card-del" onclick="mmEliminarRegistro(${r.id})" title="Eliminar">🗑️</button>
                </div>
                <div class="mm-equipos">
                    <span class="mm-equipo local">${mmEscapar(r.equipo_local)}</span>
                    <span class="mm-vs">vs</span>
                    <span class="mm-equipo visitante">${mmEscapar(r.equipo_visitante)}</span>
                </div>
                ${partidoInfo ? `<p class="mm-card-partido-fecha">⚽ Juegan: ${partidoInfo}</p>` : ''}
                <div class="mm-momios-row">
                    <div class="mm-momio-chip"><div class="mm-momio-l">1</div><div class="mm-momio-v">${m1}</div></div>
                    <div class="mm-momio-chip"><div class="mm-momio-l">X</div><div class="mm-momio-v">${mx}</div></div>
                    <div class="mm-momio-chip"><div class="mm-momio-l">2</div><div class="mm-momio-v">${m2}</div></div>
                </div>
                ${r.notas ? `<p class="mm-card-notas">${mmEscapar(r.notas)}</p>` : ''}
            </div>
        `;
    });

    cont.innerHTML = html;
}

function mmEscapar(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}
