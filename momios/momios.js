// momios/momios.js — Panel de Momios (Champions League)

const MM_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Casas de apuestas ya integradas, siempre sugeridas en el registro manual aunque
// todavía no tengan ningún registro capturado (ej. recién agregada, como BetVIP).
const MM_CASAS_CONOCIDAS = ['Codere', 'Playdoit', 'BetVIP', 'Draftea'];

const MM_THEMES = [
    { key: 'lluvia',    label: 'Lluvia',    emoji: '🌧️' },
    { key: 'otono',     label: 'Otoño',     emoji: '🍁' },
    { key: 'playa',     label: 'Playa',     emoji: '🏖️' },
    { key: 'aurora',    label: 'Aurora',    emoji: '🌌' },
    { key: 'nieve',     label: 'Nieve',     emoji: '❄️' },
    { key: 'atardecer', label: 'Atardecer', emoji: '🌅' }
];

let mmRegistros   = []; // todos los registros (todas las jornadas)
let mmJornadas    = []; // [{ clave, nombre, desde, hasta, oficial }] con al menos un partido registrado
let mmJornadaSel  = null; // clave de la jornada en pantalla (pestaña activa), ej. 'J2'
let mmTema         = 'lluvia';
let mmTemaMenuOpen = false;
let mmEspejos      = {}; // clave "localId-visitanteId-fechaPartido" -> analisis de espejo
let mmEspejosLista  = []; // mismos datos, en array ordenado (para el Top)
let mmPartidosAbiertos = new Set(); // claves de partido con el detalle abierto: sobreviven a los re-render (ej. al borrar una captura desde el detalle)
let mmPartidosRender   = [];        // partidos en el orden en que se pintaron (índice del onclick -> partido)

const MM_COLOR_INFO = {
    rojo:     { emoji: '🔴', label: 'Nunca espejo' },
    naranja:  { emoji: '🟠', label: 'Espejo leve' },
    amarillo: { emoji: '🟡', label: 'Espejo' },
    verde:    { emoji: '🟢', label: 'Buen espejo' },
    azul:     { emoji: '🔵', label: 'Espejo fuerte' },
    dorado:   { emoji: '✨', label: 'Espejo dorado' },
};

function mmFmt(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function mmHoyStr() { return mmFmt(new Date()); }

// Signo explícito en el % de espejo: aunque sea negativo se muestra (para ver qué
// tan cerca está de volverse positivo = espejo real), con "+" marcado en positivos.
function mmFormatPct(pct) {
    if (pct > 0) return `+${pct}%`;
    if (pct < 0) return `${pct}%`;
    return '0%';
}

// 'capturado_en' llega como "YYYY-MM-DD HH:MM:SS" ya en hora local (Culiacán, fijada
// en el servidor); se extrae el texto directo en vez de pasar por Date para que el
// navegador no lo reinterprete con su propia zona horaria. Incluye la fecha (no solo
// la hora) para poder distinguir capturas de distintos días en el detalle de un partido.
function mmFormatearHoraCaptura(capturadoEn) {
    if (!capturadoEn) return '';
    const [fecha, hora] = capturadoEn.split(' ');
    if (!fecha) return '';
    const [, m, d] = fecha.split('-');
    const horaCorta = hora ? hora.slice(0, 5) : '';
    return horaCorta ? `${d}/${m} ${horaCorta}` : `${d}/${m}`;
}

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
    mmInitTema();
    await Promise.all([mmCargarRegistros(), mmCargarAnalisisEspejo()]);
    mmRenderAll();
    mmRevisarDuplicados();
}

// Colapsa/expande una sección genérica (equipos duplicados...; los bloques de partido usan mmTogglePartido).
// OJO: en headEl se usa una clase DISTINTA a la del body ('mm-head-colapsado', no
// 'mm-colapsado') — esta última es un utilitario genérico de "display:none" en todo
// el CSS, y headEl (el encabezado clicable) nunca debe ocultarse, solo rotar su flecha.
function mmToggleSeccion(bodyId, headEl) {
    const body = document.getElementById(bodyId);
    if (!body) return;
    const colapsado = body.classList.toggle('mm-colapsado');
    headEl?.classList.toggle('mm-head-colapsado', colapsado);
}

// Abre/cierra el detalle de un partido. Abierto, el bloque sale en pantalla
// completa (.mm-partido-abierto en el CSS) con la tabla por día "acostada".
// Solo uno a la vez: abrir otro cierra el anterior.
function mmTogglePartido(i) {
    const p = mmPartidosRender[i];
    if (!p) return;
    const abrir = !mmPartidosAbiertos.has(p.clave);
    mmPartidosRender.forEach((otro, j) => {
        if (j !== i && mmPartidosAbiertos.has(otro.clave)) mmMarcarPartidoAbierto(j, false);
    });
    mmPartidosAbiertos.clear();
    if (abrir) mmPartidosAbiertos.add(p.clave);
    mmMarcarPartidoAbierto(i, abrir);
}

// Cerrado, cualquier parte del recuadro lo abre; abierto (pantalla completa), solo
// el encabezado lo cierra, para que borrar capturas o ver las gráficas no lo cierre.
function mmClickPartido(e, i) {
    const grupo = document.getElementById(`mm-partido-${i}`);
    if (!grupo) return;
    if (grupo.classList.contains('mm-partido-abierto') && !e.target.closest('.mm-partido-head')) return;
    mmTogglePartido(i);
}

function mmMarcarPartidoAbierto(i, abierto) {
    const grupo = document.getElementById(`mm-partido-${i}`);
    if (!grupo) return;
    grupo.classList.toggle('mm-partido-abierto', abierto);
    grupo.querySelector('.mm-partido-head')?.classList.toggle('mm-head-colapsado', !abierto);
    const detalle = grupo.querySelector('.mm-partido-detalle');
    if (detalle) {
        // Se arma solo al abrir (gráficas + tabla): cerrado no ocupa DOM.
        detalle.innerHTML = abierto ? mmDetalleCompleto(mmPartidosRender[i]) : '';
        detalle.classList.toggle('mm-colapsado', !abierto);
    }
    if (abierto) grupo.scrollTop = 0;
    else mmOcultarVizTip();
}

// Esc cierra el partido abierto en pantalla completa.
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !mmPartidosAbiertos.size) return;
    const i = mmPartidosRender.findIndex(p => mmPartidosAbiertos.has(p.clave));
    if (i >= 0) mmTogglePartido(i);
});

// Orden de columnas en el detalle por día: casas conocidas primero, otras al final.
function mmOrdenCasa(casa) {
    const i = MM_CASAS_CONOCIDAS.indexOf(casa);
    return i === -1 ? MM_CASAS_CONOCIDAS.length : i;
}

// ══════════════════════════════════════════════════════
// ANÁLISIS DE "APUESTA ESPEJO" — para cada partido, qué tan buena fue la mejor
// oportunidad de cubrir el favorito inicial con el momio contrario que apareció
// después (misma casa u otra). Alimenta el Top y los indicadores de color.
// ══════════════════════════════════════════════════════
async function mmCargarAnalisisEspejo() {
    mmEspejos = {};
    mmEspejosLista = [];
    try {
        const res = await fetch(`momios/api_momios.php?accion=analisis_espejo&_=${Date.now()}`);
        const json = await res.json();
        if (!json.partidos) return;
        mmEspejosLista = json.partidos;
        json.partidos.forEach(p => {
            const clave = `${p.equipo_local_id}-${p.equipo_visitante_id}-${p.fecha_partido}`;
            mmEspejos[clave] = p;
        });
    } catch (e) {
        console.error('Error cargando análisis de espejo', e);
    }
}

function mmRenderTopEspejos() {
    const sec  = document.getElementById('mm-top-espejo-section');
    const cont = document.getElementById('mm-top-espejo-lista');
    if (!sec || !cont) return;

    const top = mmEspejosLista.filter(p => p.ganancia_garantizada_pct > 0 && mmEnJornada(p.fecha_partido)).slice(0, 5);
    if (!top.length) {
        sec.style.display = 'none';
        return;
    }
    sec.style.display = '';

    cont.innerHTML = top.map(p => {
        const info = MM_COLOR_INFO[p.color] || MM_COLOR_INFO.rojo;
        const fecha = p.fecha_partido ? mmFormatearFechaLabel(p.fecha_partido) : '';
        const hora  = p.hora_partido ? p.hora_partido.slice(0, 5) : '';
        return `
            <div class="mm-top-item mm-color-${p.color}">
                <span class="mm-top-badge">${info.emoji} ${mmFormatPct(p.ganancia_garantizada_pct)}</span>
                <div class="mm-top-info">
                    <div class="mm-top-equipos">${mmEscapar(p.equipo_local)} vs ${mmEscapar(p.equipo_visitante)}</div>
                    <div class="mm-top-fecha">⚽ ${fecha}${hora ? ' · ' + hora : ''}</div>
                </div>
            </div>`;
    }).join('');
}

// ══════════════════════════════════════════════════════
// CATÁLOGO DE EQUIPOS — detecta el mismo equipo escrito distinto entre casas
// (ej. "Bodø/Glimt" vs "FK Bodo Glimt") y deja fusionar los que de verdad lo son.
// ══════════════════════════════════════════════════════
async function mmRevisarDuplicados() {
    const sec  = document.getElementById('mm-equipos-dup-section');
    const cont = document.getElementById('mm-equipos-dup-lista');
    if (!sec || !cont) return;

    try {
        const res = await fetch('momios/api_momios.php?accion=sugerir_duplicados');
        const json = await res.json();

        if (!json.sugerencias || !json.sugerencias.length) {
            sec.style.display = 'none';
            return;
        }

        sec.style.display = '';
        cont.innerHTML = json.sugerencias.map(s => `
            <div class="mm-dup-item">
                <span class="mm-dup-nombres">${mmEscapar(s.equipo_a.nombre_canonico)} ↔ ${mmEscapar(s.equipo_b.nombre_canonico)}</span>
                <span class="mm-dup-pct">¿mismo equipo?</span>
                <button type="button" class="mm-dup-btn" onclick="mmFusionarEquipos(${s.equipo_a.id}, ${s.equipo_b.id}, this)">Son el mismo</button>
            </div>`).join('');
    } catch (e) {
        console.error('Error revisando equipos duplicados', e);
    }
}

async function mmFusionarEquipos(mantener, eliminar, btn) {
    if (!confirm('¿Fusionar estos dos equipos en uno solo? No se puede deshacer.')) return;
    if (btn) btn.disabled = true;

    try {
        await fetch('momios/api_momios.php?accion=fusionar_equipos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mantener, eliminar })
        });
        await mmRevisarDuplicados();
        await Promise.all([mmCargarRegistros(), mmCargarAnalisisEspejo()]);
        mmRenderAll();
    } catch (e) {
        console.error('Error fusionando equipos', e);
        if (btn) btn.disabled = false;
    }
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

// Turno según la hora actual: antes de las 13:00 -> mañana, si no -> tarde
// (ya no se elige a mano; capturado_en guarda la hora exacta real de todos modos).
function mmTurnoActual() {
    return new Date().getHours() < 13 ? 'manana' : 'tarde';
}

// ══════════════════════════════════════════════════════
// REGISTRO MANUAL — para cuando no hay captura de pantalla a mano: un momio
// suelto, de un partido ya conocido (se elige de una lista, nunca se escribe el
// nombre del equipo a mano, para no crear variantes nuevas en el catálogo).
// ══════════════════════════════════════════════════════
let mmPartidosConocidos = [];

function mmToggleFormManual() {
    const panel = document.getElementById('mm-form-manual');
    const btn = document.getElementById('mm-btn-manual-toggle');
    if (!panel) return;
    const abierto = panel.style.display !== 'none';
    if (abierto) {
        panel.style.display = 'none';
        btn?.classList.remove('activo');
    } else {
        mmPoblarFormManual();
        panel.style.display = 'flex';
        btn?.classList.add('activo');
    }
}

function mmPoblarFormManual() {
    mmPartidosConocidos = mmAgruparPorPartido(mmRegistrosJornada());

    // El value de cada <option> es la CLAVE del partido (equipos+fecha), no su índice
    // en el arreglo: el arreglo se reconstruye después de cada guardado y el orden
    // puede cambiar (empates de fecha/hora), así que un índice guardado podía terminar
    // apuntando a OTRO partido sin que se notara — eso hacía que un registro se
    // guardara en el partido equivocado silenciosamente.
    const selectPartido = document.getElementById('mm-manual-partido');
    if (selectPartido) {
        const previo = selectPartido.value;
        selectPartido.innerHTML = mmPartidosConocidos.map(p => {
            const fecha = p.fecha_partido ? mmFormatearFechaLabel(p.fecha_partido) : 'sin fecha';
            return `<option value="${mmEscapar(p.clave)}">${mmEscapar(p.equipo_local)} vs ${mmEscapar(p.equipo_visitante)} — ${fecha}</option>`;
        }).join('');
        if (previo && [...selectPartido.options].some(o => o.value === previo)) selectPartido.value = previo;
    }

    const casas = [...new Set([...MM_CASAS_CONOCIDAS, ...mmRegistros.map(r => r.casa_apuestas).filter(Boolean)])].sort();
    const selectCasa = document.getElementById('mm-manual-casa');
    if (selectCasa) {
        const previo = selectCasa.value;
        selectCasa.innerHTML = casas.map(c => `<option value="${mmEscapar(c)}">${mmEscapar(c)}</option>`).join('')
            + '<option value="__otra__">Otra...</option>';
        if (previo && [...selectCasa.options].some(o => o.value === previo)) selectCasa.value = previo;
        mmCasaManualCambio(selectCasa);
    }
}

// Muestra el campo de texto libre solo cuando se elige "Otra..." (casa nueva que
// todavía no está en la lista de sugeridas).
function mmCasaManualCambio(selectEl) {
    const otra = document.getElementById('mm-manual-casa-otra');
    if (otra) otra.style.display = selectEl.value === '__otra__' ? '' : 'none';
}

async function mmGuardarManual() {
    const claveSel = document.getElementById('mm-manual-partido')?.value;
    const p = mmPartidosConocidos.find(x => x.clave === claveSel);
    const msg = document.getElementById('mm-manual-msg');
    const setMsg = (texto, tipo) => { if (msg) { msg.textContent = texto; msg.className = 'mm-extraer-msg ' + (tipo || ''); } };

    if (!p) { setMsg('Elige un partido.', 'error'); return; }

    const selectCasa = document.getElementById('mm-manual-casa');
    const casa = (selectCasa?.value === '__otra__'
        ? document.getElementById('mm-manual-casa-otra')?.value
        : selectCasa?.value || '').trim();
    const local     = document.getElementById('mm-manual-local')?.value;
    const empate    = document.getElementById('mm-manual-empate')?.value;
    const visitante = document.getElementById('mm-manual-visitante')?.value;
    if (!casa) { setMsg('Falta la casa de apuestas.', 'error'); return; }
    if (local === '' && empate === '' && visitante === '') { setMsg('Falta al menos un momio.', 'error'); return; }

    const btn = document.getElementById('mm-btn-guardar-manual');
    if (btn) btn.disabled = true;
    setMsg('Guardando...', '');

    try {
        const res = await fetch('momios/api_momios.php?accion=guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                turno: mmTurnoActual(),
                fecha_partido: p.fecha_partido,
                hora_partido: p.hora_partido,
                equipo_local: p.equipo_local,
                equipo_visitante: p.equipo_visitante,
                casa_apuestas: casa,
                momio_local: local === '' ? null : local,
                momio_empate: empate === '' ? null : empate,
                momio_visitante: visitante === '' ? null : visitante,
            })
        });
        const json = await res.json();

        if (json.error) {
            setMsg(json.error, 'error');
        } else {
            setMsg('Guardado ✓', 'ok');
            ['mm-manual-local', 'mm-manual-empate', 'mm-manual-visitante'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.value = ''; mmActualizarSigno(el); }
            });
            await Promise.all([mmCargarRegistros(), mmCargarAnalisisEspejo()]);
            mmRenderAll();
            mmRevisarDuplicados();
            mmPoblarFormManual();
        }
    } catch (e) {
        console.error('Error guardando momio manual', e);
        setMsg('Error de conexión al guardar.', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function mmCargarRegistros() {
    const lista = document.getElementById('mm-lista');
    try {
        const res = await fetch(`momios/api_momios.php?accion=listar&_=${Date.now()}`); // cache-busting: que nunca sirva un listado viejo cacheado
        mmRegistros = await res.json();
        if (!Array.isArray(mmRegistros)) mmRegistros = [];
    } catch (e) {
        console.error('Error cargando momios', e);
        mmRegistros = [];
        if (lista) lista.innerHTML = '<p class="mm-lista-vacio">Error al cargar registros.</p>';
    }
    mmCalcularJornadas();
}

// ══════════════════════════════════════════════════════
// JORNADAS — cada jornada es una pestaña. Cada partido se asigna a su jornada
// por su fecha, según el calendario oficial de la UEFA Champions League 2026/27
// (uefa.com, "2026/27 Champions League: Teams, dates, draws, format, final").
// Los registros siguen todos guardados en la BD: las pestañas solo filtran.
// No hay que crear nada a mano: al guardar el primer partido de la siguiente
// jornada aparece su pestaña. Si la UEFA mueve una fecha o un partido cae fuera
// del calendario, se agrupa solo (huecos de más de MM_JORNADA_HUECO_DIAS días).
// ══════════════════════════════════════════════════════
const MM_CALENDARIO_UCL = [
    { clave: 'J1',    nombre: 'Jornada 1',          desde: '2026-09-08', hasta: '2026-09-10' },
    { clave: 'J2',    nombre: 'Jornada 2',          desde: '2026-10-13', hasta: '2026-10-14' },
    { clave: 'J3',    nombre: 'Jornada 3',          desde: '2026-10-20', hasta: '2026-10-21' },
    { clave: 'J4',    nombre: 'Jornada 4',          desde: '2026-11-03', hasta: '2026-11-04' },
    { clave: 'J5',    nombre: 'Jornada 5',          desde: '2026-11-24', hasta: '2026-11-25' },
    { clave: 'J6',    nombre: 'Jornada 6',          desde: '2026-12-08', hasta: '2026-12-09' },
    { clave: 'J7',    nombre: 'Jornada 7',          desde: '2027-01-19', hasta: '2027-01-20' },
    { clave: 'J8',    nombre: 'Jornada 8',          desde: '2027-01-27', hasta: '2027-01-27' },
    { clave: 'PO-1',  nombre: 'Playoffs · ida',     desde: '2027-02-16', hasta: '2027-02-17' },
    { clave: 'PO-2',  nombre: 'Playoffs · vuelta',  desde: '2027-02-23', hasta: '2027-02-24' },
    { clave: 'OF-1',  nombre: 'Octavos · ida',      desde: '2027-03-09', hasta: '2027-03-10' },
    { clave: 'OF-2',  nombre: 'Octavos · vuelta',   desde: '2027-03-16', hasta: '2027-03-17' },
    { clave: 'CF-1',  nombre: 'Cuartos · ida',      desde: '2027-04-06', hasta: '2027-04-07' },
    { clave: 'CF-2',  nombre: 'Cuartos · vuelta',   desde: '2027-04-13', hasta: '2027-04-14' },
    { clave: 'SF-1',  nombre: 'Semifinal · ida',    desde: '2027-04-27', hasta: '2027-04-28' },
    { clave: 'SF-2',  nombre: 'Semifinal · vuelta', desde: '2027-05-04', hasta: '2027-05-05' },
    { clave: 'FINAL', nombre: 'Final',              desde: '2027-06-05', hasta: '2027-06-05' },
];
const MM_JORNADA_HUECO_DIAS = 3;
const MM_JORNADA_STORAGE = 'mm-jornada-sel';
let mmJornadaDeFecha = {}; // 'YYYY-MM-DD' (fecha de partido) -> clave de jornada

const mmSumarDias = (f, n) => mmFmt(new Date(Date.parse(f + 'T12:00:00') + n * 86400000));

function mmCalcularJornadas() {
    const fechas = [...new Set(mmRegistros.map(r => r.fecha_partido).filter(Boolean))].sort();
    const clavesAntes = new Set(mmJornadas.map(j => j.clave));
    const porClave = {};
    mmJornadaDeFecha = {};

    let suelta = null; // grupo en curso de fechas fuera del calendario
    fechas.forEach(f => {
        // ±1 día de tolerancia por si la UEFA recorre un partido o la casa muestra otra zona horaria.
        const oficial = MM_CALENDARIO_UCL.find(j => f >= mmSumarDias(j.desde, -1) && f <= mmSumarDias(j.hasta, 1));
        let j;
        if (oficial) {
            j = porClave[oficial.clave] || (porClave[oficial.clave] = { ...oficial, oficial: true });
            suelta = null;
        } else {
            const pegada = suelta && (Date.parse(f) - Date.parse(suelta.hasta)) / 86400000 <= MM_JORNADA_HUECO_DIAS;
            if (!pegada) suelta = porClave[`X-${f}`] = { clave: `X-${f}`, nombre: 'Otra fecha', desde: f, hasta: f, oficial: false };
            suelta.hasta = f;
            j = suelta;
        }
        mmJornadaDeFecha[f] = j.clave;
    });
    mmJornadas = Object.values(porClave).sort((a, b) => a.desde.localeCompare(b.desde));

    // Pestaña a mostrar: la que el usuario dejó abierta; si apareció una jornada
    // nueva (primer guardado de la siguiente) o no hay elección válida, la más reciente.
    if (mmJornadaSel === null) {
        try { mmJornadaSel = localStorage.getItem(MM_JORNADA_STORAGE); } catch (e) {}
    }
    const hayNueva = clavesAntes.size > 0 && mmJornadas.some(j => !clavesAntes.has(j.clave));
    if (hayNueva || !mmJornadas.some(j => j.clave === mmJornadaSel)) {
        mmJornadaSel = mmJornadas.length ? mmJornadas[mmJornadas.length - 1].clave : null;
    }
}

// ¿La fecha de partido cae en la jornada en pantalla? Sin fecha -> la más reciente.
function mmEnJornada(fechaPartido) {
    if (!mmJornadaSel) return true;
    if (!fechaPartido) return mmJornadaSel === mmJornadas[mmJornadas.length - 1].clave;
    return mmJornadaDeFecha[fechaPartido] === mmJornadaSel;
}

function mmRegistrosJornada() {
    return mmRegistros.filter(r => mmEnJornada(r.fecha_partido));
}

function mmSeleccionarJornada(clave) {
    mmJornadaSel = clave;
    try { localStorage.setItem(MM_JORNADA_STORAGE, clave); } catch (e) {}
    mmPartidosAbiertos.clear();
    mmRenderAll();
    if (document.getElementById('mm-form-manual')?.style.display !== 'none') mmPoblarFormManual();
}

function mmRenderJornadas() {
    const cont = document.getElementById('mm-jornada-tabs');
    if (!cont) return;
    if (!mmJornadas.length) { cont.innerHTML = ''; return; }

    const rango = j => {
        const [, m1, d1] = j.desde.split('-').map(Number);
        const [, m2, d2] = j.hasta.split('-').map(Number);
        const mes = m => MM_MESES[m - 1].slice(0, 3).toLowerCase();
        if (j.desde === j.hasta) return `${d1} ${mes(m1)}`;
        return m1 === m2 ? `${d1}–${d2} ${mes(m1)}` : `${d1} ${mes(m1)} – ${d2} ${mes(m2)}`;
    };
    cont.innerHTML = mmJornadas.map(j => {
        const partidos = mmAgruparPorPartido(mmRegistros.filter(r => mmJornadaDeFecha[r.fecha_partido] === j.clave)).length;
        const titulo = j.oficial ? `Calendario UEFA: ${rango(j)}` : 'Fecha fuera del calendario UEFA: revisa si la fecha se leyó bien';
        return `
            <button type="button" class="mm-jornada-tab${j.clave === mmJornadaSel ? ' activo' : ''}${j.oficial ? '' : ' mm-jornada-suelta'}" onclick="mmSeleccionarJornada('${j.clave}')" title="${titulo}">
                <span class="mm-jornada-nombre">${mmEscapar(j.nombre)}</span>
                <span class="mm-jornada-meta">${rango(j)} · ${partidos} partido${partidos === 1 ? '' : 's'}</span>
            </button>`;
    }).join('');
}

// ══════════════════════════════════════════════════════
// EXTRACCIÓN DE MOMIOS DESDE IMÁGENES (API de Claude, vision)
// Carga varias imágenes (de varias casas) de un jalón, se extraen en paralelo
// en el servidor y se arma una tabla editable para confirmar y guardar todo junto.
// ══════════════════════════════════════════════════════
let mmPartidosExtraidos = [];
let mmArchivosExtraidos = []; // Files de la última carga, en el mismo orden que '_img' de cada partido (para re-verificarlos contra su imagen de origen)
let mmVerificando = false;

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
            mmArchivosExtraidos = files;
            if (json.errores && json.errores.length) {
                mmExtraerMostrarMsg(`${json.errores.length} imagen(es) con error — verificando el resto...`, 'error');
            }
            mmRenderExtraidosTabla();
            await mmVerificarExtraidos();
        }
    } catch (e) {
        console.error('Error extrayendo momios de imágenes', e);
        mmExtraerMostrarMsg('Error de conexión al analizar las imágenes.', 'error');
    } finally {
        if (btn) btn.disabled = false;
        input.value = '';
    }
}

// Segunda pasada automática: manda cada imagen de vuelta junto con lo que se
// extrajo de ELLA para que la IA confirme campo por campo contra la imagen real,
// en vez de que el usuario tenga que comparar a ojo la tabla contra la captura.
async function mmVerificarExtraidos() {
    const porImagen = {};
    mmPartidosExtraidos.forEach((p, i) => {
        if (p._img === undefined || p._img === null || !mmArchivosExtraidos[p._img]) return;
        (porImagen[p._img] = porImagen[p._img] || []).push(i);
    });

    const idxs = Object.keys(porImagen);
    if (!idxs.length) return;

    mmVerificando = true;
    mmExtraerMostrarMsg(`Verificando ${mmPartidosExtraidos.length} partido(s) contra sus imágenes originales...`, '');
    mmRenderExtraidosTabla();

    await Promise.all(idxs.map(async (imgIdx) => {
        const indices = porImagen[imgIdx];
        try {
            const formData = new FormData();
            formData.append('imagen', mmArchivosExtraidos[imgIdx]);
            formData.append('partidos', JSON.stringify(indices.map(i => mmPartidosExtraidos[i])));

            const res = await fetch('momios/validar_momios.php', { method: 'POST', body: formData });
            const json = await res.json();

            if (json.error || !Array.isArray(json.resultados)) {
                indices.forEach(i => { if (mmPartidosExtraidos[i]) mmPartidosExtraidos[i]._verif = 'error'; });
                return;
            }

            indices.forEach((i, k) => {
                const p = mmPartidosExtraidos[i];
                const r = json.resultados[k];
                if (!p || !r) return;
                if (r.coincide) {
                    p._verif = 'ok';
                    return;
                }
                const cambios = [];
                const campos = ['equipo_local', 'equipo_visitante', 'hora_partido', 'momio_local', 'momio_empate', 'momio_visitante'];
                campos.forEach(campo => {
                    const corregido = r.correcciones ? r.correcciones[campo] : null;
                    if (corregido === null || corregido === undefined) return;
                    if (String(corregido) === String(p[campo] ?? '')) return;
                    cambios.push(`${campo}: ${p[campo] ?? '—'} → ${corregido}`);
                    p[campo] = corregido;
                });
                p._verif = cambios.length ? 'corregido' : 'ok';
                p._verifNota = cambios.join(' · ');
            });
        } catch (e) {
            console.error('Error verificando imagen', imgIdx, e);
            indices.forEach(i => { if (mmPartidosExtraidos[i]) mmPartidosExtraidos[i]._verif = 'error'; });
        }
    }));

    mmVerificando = false;
    const total = mmPartidosExtraidos.length;
    const corregidos = mmPartidosExtraidos.filter(p => p._verif === 'corregido').length;
    const sinVerificar = mmPartidosExtraidos.filter(p => p._verif === 'error').length;
    let msg = `${total} partido(s) verificado(s)`;
    if (corregidos) msg += ` — ${corregidos} corregido(s) automáticamente`;
    if (sinVerificar) msg += ` — ${sinVerificar} no se pudieron verificar, revísalos a mano`;
    mmExtraerMostrarMsg(msg + '. Revisa y guarda.', corregidos || sinVerificar ? 'error' : 'ok');
    mmRenderExtraidosTabla();
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
            <span>${mmPartidosExtraidos.length} partido(s) por confirmar${mmVerificando ? ' — 🔍 verificando con IA...' : ''}</span>
            <div style="display:flex; gap:6px;">
                <button type="button" class="mm-btn-quitar-todos" onclick="mmQuitarTodosExtraidos()" ${mmVerificando ? 'disabled' : ''}>Vaciar</button>
                <button type="button" class="mm-btn-guardar-lote" id="mm-btn-guardar-lote" onclick="mmGuardarTodosExtraidos()" ${mmVerificando ? 'disabled' : ''}>💾 Guardar todos (${mmPartidosExtraidos.length})</button>
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

const MM_VERIF_INFO = {
    ok:        { emoji: '✅', clase: 'mm-ex-row-ok',        title: 'Verificado contra la imagen original' },
    corregido: { emoji: '⚠️', clase: 'mm-ex-row-corregido', title: 'La IA corrigió uno o más campos tras comparar con la imagen' },
    error:     { emoji: '❔', clase: 'mm-ex-row-sinverif',   title: 'No se pudo verificar contra la imagen, revisa a mano' },
};

function mmRenderFilaExtraido(i) {
    const p = mmPartidosExtraidos[i];
    const val = v => (v === null || v === undefined) ? '' : v;
    const verif = MM_VERIF_INFO[p._verif];
    const claseFila = p._motivoOmitido ? 'mm-ex-row-sinverif'
        : (verif ? verif.clase : (mmVerificando ? 'mm-ex-row-pendiente' : ''));
    const badge = mmVerificando && !verif
        ? '<span class="mm-ex-verif-badge" title="Verificando...">⏳</span>'
        : (verif ? `<span class="mm-ex-verif-badge" title="${mmEscapar(verif.title)}">${verif.emoji}</span>` : '');
    const nota = (p._verif === 'corregido' && p._verifNota)
        ? `<div class="mm-ex-verif-nota">⚠️ Corregido por IA: ${mmEscapar(p._verifNota)}</div>`
        : '';
    const notaOmitido = p._motivoOmitido
        ? `<div class="mm-ex-verif-nota mm-ex-omitido-nota">✗ No se guardó: ${mmEscapar(p._motivoOmitido)}</div>`
        : '';
    return `
        <div class="mm-ex-row ${claseFila}" data-idx="${i}">
            ${badge}
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
            ${nota}${notaOmitido}
        </div>`;
}

function mmActualizarMomioExtraido(inputEl, i, campo) {
    mmActualizarExtraido(i, campo, inputEl.value);
    mmActualizarSigno(inputEl);
}

function mmActualizarExtraido(i, campo, valor) {
    const p = mmPartidosExtraidos[i];
    if (!p) return;
    p[campo] = valor;
    // Edición manual tras la verificación automática: ya no refleja lo que la IA confirmó.
    delete p._verif;
    delete p._verifNota;
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
    const turno = mmTurnoActual();

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
            // Los omitidos se quedan en la tabla con su motivo, para corregirlos y volver a guardar.
            const omitidos = (json.omitidos_detalle || [])
                .map(o => ({ ...mmPartidosExtraidos[o.indice], _motivoOmitido: o.motivo }));
            let msg = `${json.guardados} partido(s) guardado(s) ✓`;
            if (json.omitidos) msg += ` — ${json.omitidos} omitido(s), quedaron abajo marcados en rojo para corregir`;
            mmExtraerMostrarMsg(msg, 'ok');
            mmPartidosExtraidos = omitidos;
            mmRenderExtraidosTabla();
            await Promise.all([mmCargarRegistros(), mmCargarAnalisisEspejo()]);
            mmRenderAll();
            mmRevisarDuplicados();
        }
    } catch (e) {
        console.error('Error guardando lote de momios', e);
        mmExtraerMostrarMsg('Error de conexión al guardar.', 'error');
    } finally {
        document.querySelectorAll('.mm-btn-guardar-lote').forEach(b => b.disabled = false);
    }
}

async function mmEliminarRegistro(id) {
    if (!confirm('¿Eliminar este registro de momios?')) return;
    try {
        await fetch('momios/api_momios.php?accion=eliminar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        await Promise.all([mmCargarRegistros(), mmCargarAnalisisEspejo()]);
        mmRenderAll();
    } catch (e) {
        console.error('Error eliminando momio', e);
    }
}

function mmRenderAll() {
    mmRenderJornadas();
    mmRenderStats();
    mmRenderTopEspejos();
    mmRenderLista();
}

function mmRenderStats() {
    const cont = document.getElementById('mm-stats');
    if (!cont) return;

    const total    = mmRegistrosJornada().length; // de la jornada en pantalla; "Hoy" cuenta todas
    const hoyStr   = mmHoyStr();
    const hoyCount = mmRegistros.filter(r => r.fecha === hoyStr).length;

    cont.innerHTML = `
        <div class="mm-stat"><span class="mm-stat-icon">📋</span><span class="mm-stat-n">${total}</span><span class="mm-stat-l">Registros</span></div>
        <div class="mm-stat"><span class="mm-stat-icon">📅</span><span class="mm-stat-n">${hoyCount}</span><span class="mm-stat-l">Hoy</span></div>
    `;
}

function mmFormatearFechaLabel(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    return `${d} de ${MM_MESES[m - 1].toLowerCase()} ${y}`;
}

// Agrupa los registros (una fila por casa/captura) en partidos (misma pareja de
// equipos + fecha de partido), para que la lista sea compacta: un bloque por
// partido, con todas sus capturas colapsadas adentro en vez de una tarjeta larga
// por cada fila cruda.
function mmAgruparPorPartido(registros) {
    const grupos = {};
    const orden = [];
    registros.forEach(r => {
        const clave = (r.equipo_local_id && r.equipo_visitante_id)
            ? `id-${r.equipo_local_id}-${r.equipo_visitante_id}-${r.fecha_partido}`
            : `tx-${r.equipo_local}-${r.equipo_visitante}-${r.fecha_partido}`;
        if (!grupos[clave]) {
            grupos[clave] = {
                clave,
                equipo_local_id: r.equipo_local_id,
                equipo_visitante_id: r.equipo_visitante_id,
                equipo_local: r.equipo_local,
                equipo_visitante: r.equipo_visitante,
                fecha_partido: r.fecha_partido,
                hora_partido: r.hora_partido,
                capturas: [],
            };
            orden.push(clave);
        }
        grupos[clave].capturas.push(r);
    });
    // Próximos partidos primero; sin fecha de partido van al final.
    return orden.map(k => grupos[k]).sort((a, b) => {
        if (!a.fecha_partido) return 1;
        if (!b.fecha_partido) return -1;
        return (a.fecha_partido + (a.hora_partido || '')) < (b.fecha_partido + (b.hora_partido || '')) ? -1 : 1;
    });
}

function mmRenderLista() {
    const cont = document.getElementById('mm-lista');
    if (!cont) return;

    const registros = mmRegistrosJornada();
    if (!registros.length) {
        cont.innerHTML = '<p class="mm-lista-vacio">Aún no hay momios registrados en esta jornada.</p>';
        return;
    }

    const partidos = mmAgruparPorPartido(registros);

    // Del más positivo al más negativo (más cerca de ser espejo real primero); los
    // partidos sin suficientes capturas para calcular el % (sin dato) van al final.
    partidos.forEach(p => {
        const claveEspejo = `${p.equipo_local_id}-${p.equipo_visitante_id}-${p.fecha_partido}`;
        p._espejo = mmEspejos[claveEspejo] || null;
    });
    partidos.sort((a, b) => {
        if (!a._espejo && !b._espejo) return 0;
        if (!a._espejo) return 1;
        if (!b._espejo) return -1;
        return b._espejo.ganancia_garantizada_pct - a._espejo.ganancia_garantizada_pct;
    });

    mmPartidosRender = partidos;
    cont.innerHTML = partidos.map((p, i) => {
        const abierto = mmPartidosAbiertos.has(p.clave);
        const espejo = p._espejo;
        const info = espejo ? (MM_COLOR_INFO[espejo.color] || MM_COLOR_INFO.rojo) : null;

        const fecha = p.fecha_partido ? mmFormatearFechaLabel(p.fecha_partido) : '';
        const hora  = p.hora_partido ? p.hora_partido.slice(0, 5) : '';

        // Para cada resultado (local/empate/visitante), la CAPTURA que tuvo el mejor
        // momio histórico de ESE resultado — se muestran sus 3 momios juntos (tal como
        // salieron esa tanda, misma casa) aunque solo uno de los 3 sea "el mejor"; los
        // otros 2 de esa misma fila están ahí nomás de acompañantes, no son el mejor de
        // su columna.
        const mejorPorCampo = mmMejorPorCampo(p.capturas);
        const mmSpanMomio = (valorCrudo, campo) => {
            const texto = mmFormatMomio(valorCrudo);
            const esMejor = valorCrudo !== null && valorCrudo !== undefined && mejorPorCampo[campo] && Number(valorCrudo) === mejorPorCampo[campo].valor;
            return `<span class="mm-det-momio${esMejor ? ' mm-det-momio-mejor' : ''}"${esMejor ? ' title="Mejor momio registrado para este resultado"' : ''}>${texto}</span>`;
        };

        const resumen = `
            <div class="mm-partido-resumen">
                ${MM_CAMPOS_1X2.map(campo => {
                    const info = mejorPorCampo[campo];
                    if (!info) {
                        return `
                            <div class="mm-resumen-fila">
                                <span class="mm-resumen-tag">${MM_ETIQUETAS_1X2[campo]}</span>
                                <span class="mm-resumen-sin">sin dato</span>
                            </div>`;
                    }
                    const r = info.captura;
                    return `
                        <div class="mm-resumen-fila">
                            <span class="mm-resumen-tag">${MM_ETIQUETAS_1X2[campo]}</span>
                            <span class="mm-resumen-momios">${mmSpanMomio(r.momio_local, 'momio_local')} / ${mmSpanMomio(r.momio_empate, 'momio_empate')} / ${mmSpanMomio(r.momio_visitante, 'momio_visitante')}</span>
                            <span class="mm-resumen-casa">${r.casa_apuestas ? mmEscapar(r.casa_apuestas) : '—'}</span>
                            <span class="mm-resumen-fecha">${mmFormatearHoraCaptura(r.capturado_en) || '—'}</span>
                        </div>`;
                }).join('')}
            </div>`;

        return `
            <div class="mm-partido-grupo${abierto ? ' mm-partido-abierto' : ''}" id="mm-partido-${i}" onclick="mmClickPartido(event, ${i})">
                <div class="mm-partido-principal">
                    <div class="mm-partido-head${abierto ? '' : ' mm-head-colapsado'}">
                        ${espejo ? `<span class="mm-espejo-badge mm-color-${espejo.color}" title="${info.label}">${info.emoji} ${mmFormatPct(espejo.ganancia_garantizada_pct)}</span>` : '<span class="mm-espejo-badge mm-color-gris">—</span>'}
                        <div class="mm-partido-info">
                            <div class="mm-partido-equipos">${mmEscapar(p.equipo_local)} <span class="mm-vs">vs</span> ${mmEscapar(p.equipo_visitante)}</div>
                            <div class="mm-partido-fecha">⚽ ${fecha}${hora ? ' · ' + hora : ''} · ${p.capturas.length} captura(s)</div>
                        </div>
                        <span class="mm-toggle-flecha">▾</span>
                        <span class="mm-partido-cerrar" title="Cerrar (Esc)">✕</span>
                    </div>
                    ${resumen}
                </div>
                <div class="mm-partido-detalle${abierto ? '' : ' mm-colapsado'}">${abierto ? mmDetalleCompleto(p) : ''}</div>
            </div>`;
    }).join('');
}

// ══════════════════════════════════════════════════════
// DETALLE DE PARTIDO EN PANTALLA COMPLETA — tarjetas con el mejor momio de cada
// resultado, una gráfica por resultado (una línea por casa) y la tabla por día
// con el logo de cada casa.
// ══════════════════════════════════════════════════════
const MM_CAMPOS_1X2 = ['momio_local', 'momio_empate', 'momio_visitante'];
const MM_ETIQUETAS_1X2 = { momio_local: '1', momio_empate: 'X', momio_visitante: '2' };
const MM_DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// Colores de línea por casa, validados contra el fondo oscuro del detalle en ese
// orden (Codere → Draftea). Rojo y dorado quedan cerca para daltonismo, por eso
// cada línea termina con el logo de su casa (segunda señal además del color).
const MM_CASAS_INFO = {
    codere:   { logo: 'momios/logos/codere.png',   color: '#199e70' },
    playdoit: { logo: 'momios/logos/playdoit.png', color: '#e34948' },
    betvip:   { logo: 'momios/logos/betvip.png',   color: '#c98500' },
    draftea:  { logo: 'momios/logos/draftea.png',  color: '#9085e9' },
};
function mmCasaInfo(casa) {
    return MM_CASAS_INFO[(casa || '').toLowerCase().replace(/\s+/g, '')] || { logo: null, color: '#8a8f98' };
}
function mmLogoCasa(casa) {
    const info = mmCasaInfo(casa);
    if (info.logo) return `<img class="mm-casa-logo" src="${info.logo}" alt="">`;
    return `<span class="mm-casa-logo mm-casa-logo-ini" style="background:${info.color}">${mmEscapar((casa || '?').charAt(0).toUpperCase())}</span>`;
}
function mmCasaTag(casa) {
    return `<span class="mm-casa-tag">${mmLogoCasa(casa)}${mmEscapar(casa || '—')}</span>`;
}

// Por resultado: { valor, captura } de la captura con el momio más alto (el que más paga).
function mmMejorPorCampo(capturas) {
    const mejor = { momio_local: null, momio_empate: null, momio_visitante: null };
    capturas.forEach(r => {
        MM_CAMPOS_1X2.forEach(campo => {
            if (r[campo] === null || r[campo] === undefined) return;
            const n = Number(r[campo]);
            if (!mejor[campo] || n > mejor[campo].valor) mejor[campo] = { valor: n, captura: r };
        });
    });
    return mejor;
}

// "YYYY-MM-DD HH:MM:SS" (hora local del servidor) -> ms. Se trata como UTC solo
// para escalar/ordenar sin que el navegador le aplique su zona horaria.
function mmTs(capturadoEn) {
    const [f, h = '00:00'] = capturadoEn.split(' ');
    const [y, m, d] = f.split('-').map(Number);
    const [hh, mi] = h.split(':').map(Number);
    return Date.UTC(y, m - 1, d, hh || 0, mi || 0);
}
// Americano <-> decimal. Las gráficas van en decimal porque el americano salta de
// -100 a +100 (son el mismo pago); los rótulos se muestran en americano.
const mmDecimal   = a => a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a);
const mmAmericano = d => d >= 2 ? Math.round((d - 1) * 100) : -Math.round(100 / (d - 1));
// Momios "redondos" candidatos a rótulo del eje Y (de -5000 a +5000).
const MM_MARCAS_AMERICANO = (() => {
    const pos = [];
    for (let a = 100; a < 400; a += 10) pos.push(a);
    for (let a = 400; a < 1000; a += 50) pos.push(a);
    for (let a = 1000; a <= 5000; a += 250) pos.push(a);
    return [...pos.slice(1).map(a => -a).reverse(), ...pos];
})();

function mmDetalleCompleto(p) {
    if (!p) return '';
    const mejor = mmMejorPorCampo(p.capturas);
    const casas = [...new Set(p.capturas.map(r => r.casa_apuestas || '—'))]
        .sort((a, b) => mmOrdenCasa(a) - mmOrdenCasa(b) || a.localeCompare(b));
    const nombres = { momio_local: p.equipo_local, momio_empate: 'Empate', momio_visitante: p.equipo_visitante };

    // "Actual": entre la última captura de cada casa, la que más paga.
    const ultimaPorCasa = {};
    p.capturas.forEach(r => {
        const c = r.casa_apuestas || '—';
        if (!ultimaPorCasa[c] || (r.capturado_en || '') > (ultimaPorCasa[c].capturado_en || '')) ultimaPorCasa[c] = r;
    });

    const tarjetas = MM_CAMPOS_1X2.map(campo => {
        const m = mejor[campo];
        const actual = mmMejorPorCampo(Object.values(ultimaPorCasa))[campo];
        return `
            <div class="mm-mejor-card">
                <div class="mm-mejor-card-head"><span class="mm-mejor-tag">${MM_ETIQUETAS_1X2[campo]}</span><span>${mmEscapar(nombres[campo])}</span></div>
                ${m ? `
                    <div class="mm-mejor-valor" title="Mejor momio registrado">${mmFormatMomio(m.valor)}</div>
                    <div class="mm-mejor-meta">${mmCasaTag(m.captura.casa_apuestas)}<span class="mm-mejor-cuando">${mmFormatearHoraCaptura(m.captura.capturado_en)}</span></div>
                    ${actual ? `<div class="mm-mejor-ahora" title="El mejor entre la última captura de cada casa">Actual: <b>${mmFormatMomio(actual.valor)}</b> ${mmCasaTag(actual.captura.casa_apuestas)}</div>` : ''}
                ` : '<div class="mm-grafica-vacia">sin dato</div>'}
            </div>`;
    }).join('');

    const leyenda = casas.map(c => `
        <span class="mm-leyenda-item"><span class="mm-leyenda-linea" style="background:${mmCasaInfo(c).color}"></span>${mmLogoCasa(c)}${mmEscapar(c)}</span>`).join('');
    const graficas = MM_CAMPOS_1X2.map(campo => `
        <div class="mm-grafica">
            <div class="mm-grafica-titulo"><span class="mm-mejor-tag">${MM_ETIQUETAS_1X2[campo]}</span>${mmEscapar(nombres[campo])}<small>más arriba = paga más</small></div>
            ${mmGraficaResultado(p.capturas, campo, casas, mejor[campo], nombres[campo])}
        </div>`).join('');

    return `
        <div class="mm-full-mejores">${tarjetas}</div>
        <div class="mm-full-panel">
            <p class="mm-full-titulo">Cómo se movió cada casa</p>
            <div class="mm-full-leyenda">${leyenda}</div>
            <div class="mm-full-graficas">${graficas}</div>
        </div>
        <div class="mm-full-panel">
            <p class="mm-full-titulo">Capturas por día</p>
            ${mmTablaDias(p, casas, mejor)}
        </div>`;
}

function mmGraficaResultado(capturas, campo, casas, mejor, nombre) {
    const W = 420, H = 200, M = { t: 12, r: 30, b: 24, l: 46 };
    const series = casas.map(casa => ({
        casa,
        info: mmCasaInfo(casa),
        pts: capturas
            .filter(r => (r.casa_apuestas || '—') === casa && r[campo] !== null && r[campo] !== undefined && r.capturado_en)
            .map(r => ({ t: mmTs(r.capturado_en), v: Number(r[campo]), r }))
            .sort((a, b) => a.t - b.t),
    })).filter(s => s.pts.length);
    if (!series.length) return '<div class="mm-grafica-vacia">Sin capturas de este resultado</div>';

    const todos = series.flatMap(s => s.pts);
    let t0 = Math.min(...todos.map(q => q.t)), t1 = Math.max(...todos.map(q => q.t));
    if (t1 === t0) { t0 -= 43200000; t1 += 43200000; }
    let d0 = Math.min(...todos.map(q => mmDecimal(q.v))), d1 = Math.max(...todos.map(q => mmDecimal(q.v)));
    const pad = (d1 - d0) * 0.1 || 0.08;
    d0 = Math.max(1.01, d0 - pad);
    d1 += pad;
    const x = t => M.l + (t - t0) / (t1 - t0) * (W - M.l - M.r);
    const y = d => M.t + (1 - (d - d0) / (d1 - d0)) * (H - M.t - M.b);

    // Eje Y: momios "redondos" que caigan en el rango (máx. 5); si no hay, 3 parejos.
    const enRango = MM_MARCAS_AMERICANO.filter(a => { const d = mmDecimal(a); return d >= d0 && d <= d1; });
    let marcas = enRango;
    for (const paso of [10, 20, 25, 50, 100, 250, 500, 1000]) {
        marcas = enRango.filter(a => Math.abs(a) % paso === 0);
        if (marcas.length <= 5) break;
    }
    if (marcas.length < 2) marcas = [0.2, 0.5, 0.8].map(f => mmAmericano(d0 + (d1 - d0) * f));
    const ejeY = marcas.map(a => {
        const yy = y(mmDecimal(a)).toFixed(1);
        return `<line x1="${M.l}" x2="${W - M.r}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,0.07)"/>
                <text x="${M.l - 6}" y="${yy}" dy="3.5" text-anchor="end" font-size="10" fill="#9ca0ad">${mmFormatMomio(a)}</text>`;
    }).join('');

    // Eje X: un rótulo por día (máx. ~6).
    const DIA = 86400000;
    let dias = [];
    for (let t = Math.ceil(t0 / DIA) * DIA; t <= t1; t += DIA) dias.push(t);
    const pasoDia = Math.ceil(dias.length / 6) || 1;
    dias = dias.filter((_, k) => k % pasoDia === 0);
    const ejeX = dias.map(t => {
        const f = new Date(t);
        const xx = x(t).toFixed(1);
        return `<line x1="${xx}" x2="${xx}" y1="${M.t}" y2="${H - M.b}" stroke="rgba(255,255,255,0.04)"/>
                <text x="${xx}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#9ca0ad">${String(f.getUTCDate()).padStart(2, '0')}/${String(f.getUTCMonth() + 1).padStart(2, '0')}</text>`;
    }).join('');

    const lineas = series.map(s => {
        const d = s.pts.map((q, k) => `${k ? 'L' : 'M'}${x(q.t).toFixed(1)},${y(mmDecimal(q.v)).toFixed(1)}`).join(' ');
        return `<path d="${d}" fill="none" stroke="${s.info.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    }).join('');

    const puntos = series.map(s => s.pts.map(q => {
        const cx = x(q.t).toFixed(1), cy = y(mmDecimal(q.v)).toFixed(1);
        const esMejor = mejor && q.v === mejor.valor;
        const tip = `${s.casa} · ${mmFormatearHoraCaptura(q.r.capturado_en)}\n${MM_ETIQUETAS_1X2[campo]} ${nombre}: ${mmFormatMomio(q.v)}${esMejor ? '  ★ mejor' : ''}`;
        return `${esMejor ? `<circle cx="${cx}" cy="${cy}" r="7.5" fill="none" stroke="#fff" stroke-width="1.5"/>` : ''}
                <circle cx="${cx}" cy="${cy}" r="4" fill="${s.info.color}" stroke="#0b0e17" stroke-width="2"/>
                <circle class="mm-viz-hit" cx="${cx}" cy="${cy}" r="11" fill="transparent" data-tip="${mmEscapar(tip).replace(/"/g, '&quot;')}"/>`;
    }).join('')).join('');

    // Logo al final de cada línea (etiqueta directa); se separan si quedan encimados.
    const finales = series.map(s => {
        const q = s.pts[s.pts.length - 1];
        return { s, x: x(q.t), y: y(mmDecimal(q.v)) };
    }).sort((a, b) => a.y - b.y);
    finales.forEach((f, k) => { if (k && f.y - finales[k - 1].y < 18) f.y = finales[k - 1].y + 18; });
    const logos = finales.map(f => {
        const lx = (f.x + 7).toFixed(1), ly = (f.y - 8).toFixed(1);
        return f.s.info.logo
            ? `<rect x="${lx}" y="${ly}" width="16" height="16" rx="4" fill="#fff"/><image href="${f.s.info.logo}" x="${lx}" y="${ly}" width="16" height="16"/>`
            : `<rect x="${lx}" y="${ly}" width="16" height="16" rx="4" fill="${f.s.info.color}"/><text x="${(f.x + 15).toFixed(1)}" y="${(f.y + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">${mmEscapar(f.s.casa.charAt(0).toUpperCase())}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Momio ${MM_ETIQUETAS_1X2[campo]} (${mmEscapar(nombre)}) por casa a lo largo del tiempo">
        ${ejeY}${ejeX}${lineas}${puntos}${logos}
    </svg>`;
}

// Tabla "acostada": una fila por día y una columna por casa; cada captura en una
// mini-rejilla hora | 1 | X | 2, con ▲/▼ contra la captura anterior de esa casa.
function mmTablaDias(p, casas, mejor) {
    const previa = new Map();
    casas.forEach(c => {
        const asc = p.capturas
            .filter(r => (r.casa_apuestas || '—') === c)
            .sort((a, b) => (a.capturado_en || '').localeCompare(b.capturado_en || ''));
        asc.forEach((r, k) => previa.set(r, asc[k - 1] || null));
    });

    const porDia = {}; // 'YYYY-MM-DD' -> { casa -> capturas, más reciente primero }
    [...p.capturas]
        .sort((a, b) => (b.capturado_en || '').localeCompare(a.capturado_en || ''))
        .forEach(r => {
            const dia = (r.capturado_en || r.fecha || '').slice(0, 10);
            const casa = r.casa_apuestas || '—';
            porDia[dia] = porDia[dia] || {};
            (porDia[dia][casa] = porDia[dia][casa] || []).push(r);
        });
    const dias = Object.keys(porDia).sort().reverse();

    const valor = (r, campo) => {
        const v = r[campo];
        if (v === null || v === undefined) return '<span class="mm-cap-val mm-dia-vacio">—</span>';
        const esMejor = mejor[campo] && Number(v) === mejor[campo].valor;
        const ant = previa.get(r);
        const va = ant ? ant[campo] : null;
        let flecha = '';
        if (va !== null && va !== undefined && Number(v) !== Number(va)) {
            flecha = Number(v) > Number(va)
                ? `<span class="mm-flecha mm-flecha-sube" title="Subió desde ${mmFormatMomio(va)} (paga más)">▲</span>`
                : `<span class="mm-flecha mm-flecha-baja" title="Bajó desde ${mmFormatMomio(va)} (paga menos)">▼</span>`;
        }
        const txt = mmFormatMomio(v);
        return `<span class="mm-cap-val">${esMejor ? `<span class="mm-det-momio-mejor" title="Mejor momio registrado para este resultado">${txt}</span>` : txt}${flecha}</span>`;
    };

    // Los nombres tal cual los escribió cada casa quedan en el tooltip.
    const celda = caps => caps.map(r => `
        <div class="mm-cap-grid" title="${mmEscapar(`${r.equipo_local} vs ${r.equipo_visitante}`).replace(/"/g, '&quot;')}">
            <span class="mm-cap-hora">${r.capturado_en ? r.capturado_en.slice(11, 16) : '—'}</span>
            ${MM_CAMPOS_1X2.map(c => valor(r, c)).join('')}
            <button type="button" class="mm-card-del" onclick="mmEliminarRegistro(${r.id})" title="Eliminar">🗑️</button>
        </div>`).join('');

    const etiquetaDia = dia => {
        if (!dia) return '—';
        const [y, m, d] = dia.split('-').map(Number);
        return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}<small>${MM_DIAS_SEMANA[new Date(y, m - 1, d).getDay()]}</small>`;
    };

    return `
        <div class="mm-full-tabla-wrap">
            <table class="mm-dias-tabla">
                <thead><tr>
                    <th>Día</th>
                    ${casas.map(c => `
                        <th class="mm-casa-col-head" style="border-top-color:${mmCasaInfo(c).color}">
                            ${mmCasaTag(c)}
                            <div class="mm-cap-grid mm-cap-grid-head"><span>Hora</span><span>1</span><span>X</span><span>2</span><span></span></div>
                        </th>`).join('')}
                </tr></thead>
                <tbody>${dias.map(dia => `
                    <tr>
                        <th class="mm-dia-label">${etiquetaDia(dia)}</th>
                        ${casas.map(c => `<td>${porDia[dia][c] ? celda(porDia[dia][c]) : '<span class="mm-dia-vacio">—</span>'}</td>`).join('')}
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <p class="mm-full-nota">▲ / ▼ = subió o bajó contra la captura anterior de esa casa · <span class="mm-det-momio-mejor">±000</span> = mejor momio registrado</p>`;
}

// Tooltip de las gráficas (un solo elemento, se mueve con el mouse).
function mmVizTip() {
    let tip = document.getElementById('mm-viz-tip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'mm-viz-tip';
        tip.className = 'mm-viz-tip';
        document.body.appendChild(tip);
    }
    return tip;
}
function mmOcultarVizTip() {
    const tip = document.getElementById('mm-viz-tip');
    if (tip) tip.style.display = 'none';
}
document.addEventListener('mouseover', e => {
    const hit = e.target.closest ? e.target.closest('.mm-viz-hit') : null;
    if (!hit) { mmOcultarVizTip(); return; }
    const tip = mmVizTip();
    tip.textContent = hit.getAttribute('data-tip');
    tip.style.display = 'block';
});
document.addEventListener('mousemove', e => {
    const tip = document.getElementById('mm-viz-tip');
    if (!tip || tip.style.display !== 'block') return;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const left = e.clientX + 14 + w > window.innerWidth ? e.clientX - w - 14 : e.clientX + 14;
    const top = e.clientY + 14 + h > window.innerHeight ? e.clientY - h - 14 : e.clientY + 14;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
});

function mmEscapar(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}
