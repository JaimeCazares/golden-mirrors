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

let mmRegistros   = [];
let mmDiasFiltro  = 7; // 7, 30 u 0 (todo)
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

// Abre/cierra el detalle de un partido. Abierto, el bloque ocupa todo el renglón
// de la lista (.mm-partido-abierto en el CSS) para mostrar la tabla por día
// "acostada", sin scroll.
function mmTogglePartido(i) {
    const p = mmPartidosRender[i];
    const grupo = document.getElementById(`mm-partido-${i}`);
    if (!p || !grupo) return;
    const abierto = !mmPartidosAbiertos.has(p.clave);
    if (abierto) mmPartidosAbiertos.add(p.clave); else mmPartidosAbiertos.delete(p.clave);
    grupo.classList.toggle('mm-partido-abierto', abierto);
    grupo.querySelector('.mm-partido-head')?.classList.toggle('mm-head-colapsado', !abierto);
    grupo.querySelector('.mm-partido-detalle')?.classList.toggle('mm-colapsado', !abierto);
    if (abierto) grupo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

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

    const top = mmEspejosLista.filter(p => p.ganancia_garantizada_pct > 0).slice(0, 5);
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
    mmPartidosConocidos = mmAgruparPorPartido(mmRegistros);

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
        let url = `momios/api_momios.php?accion=listar&_=${Date.now()}`; // cache-busting: que nunca sirva un listado viejo cacheado
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
    const claseFila = verif ? verif.clase : (mmVerificando ? 'mm-ex-row-pendiente' : '');
    const badge = mmVerificando && !verif
        ? '<span class="mm-ex-verif-badge" title="Verificando...">⏳</span>'
        : (verif ? `<span class="mm-ex-verif-badge" title="${mmEscapar(verif.title)}">${verif.emoji}</span>` : '');
    const nota = (p._verif === 'corregido' && p._verifNota)
        ? `<div class="mm-ex-verif-nota">⚠️ Corregido por IA: ${mmEscapar(p._verifNota)}</div>`
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
            ${nota}
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
            let msg = `${json.guardados} partido(s) guardado(s) ✓`;
            if (json.omitidos) msg += ` (${json.omitidos} con datos incompletos, omitidos)`;
            mmExtraerMostrarMsg(msg, 'ok');
            mmPartidosExtraidos = [];
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
    mmRenderStats();
    mmRenderTopEspejos();
    mmRenderLista();
}

function mmRenderStats() {
    const cont = document.getElementById('mm-stats');
    if (!cont) return;

    const total    = mmRegistros.length;
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

    if (!mmRegistros.length) {
        cont.innerHTML = '<p class="mm-lista-vacio">Aún no hay momios registrados en este rango.</p>';
        return;
    }

    const partidos = mmAgruparPorPartido(mmRegistros);

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

        // capturas más recientes primero dentro del detalle
        const capturasOrdenadas = [...p.capturas].sort((a, b) => (b.capturado_en || '').localeCompare(a.capturado_en || ''));

        // Para cada resultado (local/empate/visitante), la CAPTURA que tuvo el mejor
        // momio histórico de ESE resultado — se muestran sus 3 momios juntos (tal como
        // salieron esa tanda, misma casa) aunque solo uno de los 3 sea "el mejor"; los
        // otros 2 de esa misma fila están ahí nomás de acompañantes, no son el mejor de
        // su columna. Esta misma referencia también marca las filas del detalle completo.
        const CAMPOS_1X2 = ['momio_local', 'momio_empate', 'momio_visitante'];
        const MM_ETIQUETAS_1X2 = { momio_local: '1', momio_empate: 'X', momio_visitante: '2' };
        const mejorPorCampo = { momio_local: null, momio_empate: null, momio_visitante: null };
        p.capturas.forEach(r => {
            CAMPOS_1X2.forEach(campo => {
                if (r[campo] === null || r[campo] === undefined) return;
                const n = Number(r[campo]);
                if (!mejorPorCampo[campo] || n > mejorPorCampo[campo].valor) {
                    mejorPorCampo[campo] = { valor: n, captura: r };
                }
            });
        });
        const mmSpanMomio = (valorCrudo, campo) => {
            const texto = mmFormatMomio(valorCrudo);
            const esMejor = valorCrudo !== null && valorCrudo !== undefined && mejorPorCampo[campo] && Number(valorCrudo) === mejorPorCampo[campo].valor;
            return `<span class="mm-det-momio${esMejor ? ' mm-det-momio-mejor' : ''}"${esMejor ? ' title="Mejor momio registrado para este resultado"' : ''}>${texto}</span>`;
        };

        const resumen = `
            <div class="mm-partido-resumen">
                ${CAMPOS_1X2.map(campo => {
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

        // Detalle "acostado": una fila por día de captura y una columna por casa, así
        // todas las capturas de un día quedan en una sola línea y cada casa queda
        // alineada día con día para ver cómo se fue moviendo su momio.
        const casas = [...new Set(p.capturas.map(r => r.casa_apuestas || '—'))]
            .sort((a, b) => mmOrdenCasa(a) - mmOrdenCasa(b) || a.localeCompare(b));
        const porDia = {}; // 'YYYY-MM-DD' -> { casa -> capturas, más reciente primero }
        capturasOrdenadas.forEach(r => {
            const dia  = (r.capturado_en || r.fecha || '').slice(0, 10);
            const casa = r.casa_apuestas || '—';
            porDia[dia] = porDia[dia] || {};
            (porDia[dia][casa] = porDia[dia][casa] || []).push(r);
        });
        const dias = Object.keys(porDia).sort().reverse(); // más reciente primero

        // Los nombres tal cual los escribió cada casa quedan en el tooltip (ya no
        // caben como columna y casi siempre son el mismo partido escrito distinto).
        const celdaCapturas = capturas => capturas.map(r => `
            <span class="mm-dia-captura" title="${mmEscapar(`${r.equipo_local} vs ${r.equipo_visitante}`).replace(/"/g, '&quot;')}">
                <span class="mm-det-hora">${r.capturado_en ? r.capturado_en.slice(11, 16) : '—'}</span>
                <span class="mm-det-momios">${mmSpanMomio(r.momio_local, 'momio_local')} / ${mmSpanMomio(r.momio_empate, 'momio_empate')} / ${mmSpanMomio(r.momio_visitante, 'momio_visitante')}</span>
                <button type="button" class="mm-card-del" onclick="mmEliminarRegistro(${r.id})" title="Eliminar">🗑️</button>
            </span>`).join('');

        const tablaDetalle = `
            <table class="mm-dias-tabla">
                <colgroup><col>${casas.map(() => `<col style="width:${(99 / casas.length).toFixed(2)}%">`).join('')}</colgroup>
                <thead><tr><th>Día</th>${casas.map(c => `<th>${mmEscapar(c)}</th>`).join('')}</tr></thead>
                <tbody>${dias.map(dia => `
                    <tr>
                        <th class="mm-dia-label">${dia ? mmFormatearHoraCaptura(dia) : '—'}</th>
                        ${casas.map(c => `<td>${porDia[dia][c] ? celdaCapturas(porDia[dia][c]) : '<span class="mm-dia-vacio">—</span>'}</td>`).join('')}
                    </tr>`).join('')}
                </tbody>
            </table>`;

        return `
            <div class="mm-partido-grupo${abierto ? ' mm-partido-abierto' : ''}" id="mm-partido-${i}">
                <div class="mm-partido-principal">
                    <div class="mm-partido-head${abierto ? '' : ' mm-head-colapsado'}" onclick="mmTogglePartido(${i})">
                        ${espejo ? `<span class="mm-espejo-badge mm-color-${espejo.color}" title="${info.label}">${info.emoji} ${mmFormatPct(espejo.ganancia_garantizada_pct)}</span>` : '<span class="mm-espejo-badge mm-color-gris">—</span>'}
                        <div class="mm-partido-info">
                            <div class="mm-partido-equipos">${mmEscapar(p.equipo_local)} <span class="mm-vs">vs</span> ${mmEscapar(p.equipo_visitante)}</div>
                            <div class="mm-partido-fecha">⚽ ${fecha}${hora ? ' · ' + hora : ''} · ${p.capturas.length} captura(s)</div>
                        </div>
                        <span class="mm-toggle-flecha">▾</span>
                    </div>
                    ${resumen}
                </div>
                <div class="mm-partido-detalle${abierto ? '' : ' mm-colapsado'}">${tablaDetalle}</div>
            </div>`;
    }).join('');
}

function mmEscapar(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}
