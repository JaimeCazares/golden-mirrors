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

    const fecha           = document.getElementById('mm-input-fecha')?.value || '';
    const turno           = document.getElementById('mm-input-turno')?.value || '';
    const equipoLocal     = document.getElementById('mm-input-local')?.value.trim() || '';
    const equipoVisitante = document.getElementById('mm-input-visitante')?.value.trim() || '';
    const momioLocal      = document.getElementById('mm-input-m1')?.value || '';
    const momioEmpate     = document.getElementById('mm-input-mx')?.value || '';
    const momioVisitante  = document.getElementById('mm-input-m2')?.value || '';
    const notas           = document.getElementById('mm-input-notas')?.value.trim() || '';

    if (!fecha || !equipoLocal || !equipoVisitante) {
        mmMostrarMsg('Completa fecha, equipo local y visitante.', 'error');
        return;
    }

    if (btn) btn.disabled = true;

    try {
        const res = await fetch('momios/api_momios.php?accion=guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fecha, turno,
                equipo_local: equipoLocal,
                equipo_visitante: equipoVisitante,
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
// EXTRACCIÓN DE MOMIOS DESDE IMAGEN (API de Claude, vision)
// ══════════════════════════════════════════════════════
let mmPartidosExtraidos = [];
let mmCasaExtraida = null;

function mmExtraerMostrarMsg(texto, tipo) {
    const msg = document.getElementById('mm-extraer-msg');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'mm-extraer-msg ' + (tipo || '');
}

async function mmImagenSeleccionada(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        mmExtraerMostrarMsg('La imagen pesa más de 5 MB.', 'error');
        input.value = '';
        return;
    }

    const btn = document.getElementById('mm-btn-extraer');
    const cont = document.getElementById('mm-extraidos');
    if (btn) btn.disabled = true;
    if (cont) cont.innerHTML = '';
    mmExtraerMostrarMsg('Analizando imagen...', '');

    try {
        const formData = new FormData();
        formData.append('imagen', file);

        const res = await fetch('momios/extraer_momios.php', { method: 'POST', body: formData });
        const json = await res.json();

        if (json.error) {
            mmExtraerMostrarMsg(json.error, 'error');
        } else if (!Array.isArray(json.partidos) || !json.partidos.length) {
            mmExtraerMostrarMsg('No se detectaron partidos en la imagen.', 'error');
        } else {
            mmPartidosExtraidos = json.partidos;
            mmCasaExtraida = json.casa_apuestas || null;
            const casaTxt = mmCasaExtraida ? ` (${mmCasaExtraida})` : '';
            mmExtraerMostrarMsg(`${json.partidos.length} partido(s) detectado(s)${casaTxt}. Toca uno para cargarlo al formulario.`, 'ok');
            mmRenderExtraidos();
        }
    } catch (e) {
        console.error('Error extrayendo momios de imagen', e);
        mmExtraerMostrarMsg('Error de conexión al analizar la imagen.', 'error');
    } finally {
        if (btn) btn.disabled = false;
        input.value = '';
    }
}

function mmRenderExtraidos() {
    const cont = document.getElementById('mm-extraidos');
    if (!cont) return;

    cont.innerHTML = mmPartidosExtraidos.map((p, i) => {
        const m1 = mmFormatMomio(p.momio_local);
        const mx = mmFormatMomio(p.momio_empate);
        const m2 = mmFormatMomio(p.momio_visitante);
        return `
            <div class="mm-extraido-item" onclick="mmUsarExtraido(${i})">
                <span class="mm-extraido-partido">${mmEscapar(p.equipo_local)} vs ${mmEscapar(p.equipo_visitante)}</span>
                <span class="mm-extraido-momios">1: ${m1} · X: ${mx} · 2: ${m2}</span>
            </div>`;
    }).join('');
}

function mmUsarExtraido(i) {
    const p = mmPartidosExtraidos[i];
    if (!p) return;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = (val !== null && val !== undefined) ? val : '';
    };

    setVal('mm-input-local', p.equipo_local || '');
    setVal('mm-input-visitante', p.equipo_visitante || '');
    setVal('mm-input-m1', p.momio_local);
    setVal('mm-input-mx', p.momio_empate);
    setVal('mm-input-m2', p.momio_visitante);

    const notasEl = document.getElementById('mm-input-notas');
    if (notasEl && !notasEl.value.trim() && mmCasaExtraida) notasEl.value = mmCasaExtraida;

    document.getElementById('mm-form-card')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    mmMostrarMsg('Revisa los datos y guarda cuando estén correctos.', 'ok');
}

function mmLimpiarFormulario() {
    ['mm-input-local', 'mm-input-visitante', 'mm-input-m1', 'mm-input-mx', 'mm-input-m2', 'mm-input-notas'].forEach(id => {
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

        html += `
            <div class="mm-card-partido">
                <div class="mm-card-head">
                    <span class="mm-turno-badge ${turnoClase}">${turnoLabel}</span>
                    <button type="button" class="mm-card-del" onclick="mmEliminarRegistro(${r.id})" title="Eliminar">🗑️</button>
                </div>
                <div class="mm-equipos">
                    <span class="mm-equipo local">${mmEscapar(r.equipo_local)}</span>
                    <span class="mm-vs">vs</span>
                    <span class="mm-equipo visitante">${mmEscapar(r.equipo_visitante)}</span>
                </div>
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
