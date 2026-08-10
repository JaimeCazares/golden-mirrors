// ── att/att.js — Calendario semanal de AT&T ──
// Rango real: lunes 27 de julio -> viernes 11 de septiembre. Se dibuja
// una cuadrícula de 7 semanas completas (49 días); los días que caen
// después del 11 de septiembre se muestran en gris y no son clicables.

const ATT_INICIO = '2026-07-27';
const ATT_FIN = '2026-09-11';
const ATT_NUM_SEMANAS = 7;
const ATT_DOW = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const ATT_MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const ATT_THEMES = [
    { key: 'lluvia',    label: 'Lluvia',    emoji: '🌧️' },
    { key: 'otono',     label: 'Otoño',     emoji: '🍁' },
    { key: 'playa',     label: 'Playa',     emoji: '🏖️' },
    { key: 'aurora',    label: 'Aurora',    emoji: '🌌' },
    { key: 'nieve',     label: 'Nieve',     emoji: '❄️' },
    { key: 'atardecer', label: 'Atardecer', emoji: '🌅' }
];

let attSeleccionados = new Set();
let attTema = 'aurora';
let attTemaMenuOpen = false;
let attTotalValidos = 0;

function attParsear(fStr) {
    const [y, m, d] = fStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function attFmt(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Cuadrícula completa: siempre NUM_SEMANAS * 7 días exactos, aunque los
// últimos se pasen del rango real (esos se pintan en gris).
function attGenerarDiasGrid() {
    const dias = [];
    const cursor = attParsear(ATT_INICIO);
    const total = ATT_NUM_SEMANAS * 7;
    for (let i = 0; i < total; i++) {
        dias.push(attFmt(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return dias;
}

function attAgruparSemanas(dias) {
    const semanas = [];
    for (let s = 0; s < ATT_NUM_SEMANAS; s++) {
        semanas.push(dias.slice(s * 7, s * 7 + 7));
    }
    return semanas;
}

function initAtt() {
    if (!document.getElementById('attSemanas')) return;

    attInitTema();

    fetch('att/api_att.php?accion=obtener', { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
            attSeleccionados = new Set(Array.isArray(data) ? data : []);
            attRender();
        })
        .catch(() => attRender());
}

function attRender() {
    const cont = document.getElementById('attSemanas');
    if (!cont) return;

    const diasGrid = attGenerarDiasGrid();
    const semanas = attAgruparSemanas(diasGrid);
    const hoyStr = attFmt(new Date());

    attTotalValidos = diasGrid.filter(f => f <= ATT_FIN).length;

    let html = '';
    semanas.forEach((semana, i) => {
        html += `<div class="att-semana">
            <div class="att-semana-label">S${i + 1}</div>
            <div class="att-dias-grid">`;

        semana.forEach(fStr => {
            const fecha = attParsear(fStr);
            const esValido = fStr <= ATT_FIN;
            const clases = ['att-dia'];
            if (!esValido) clases.push('disabled');
            if (esValido && attSeleccionados.has(fStr)) clases.push('on');
            if (fStr === hoyStr) clases.push('hoy');

            const click = esValido ? ` onclick="attToggleDia('${fStr}', this)"` : '';

            html += `<div class="${clases.join(' ')}"${click}>
                <span class="att-dia-dow">${ATT_DOW[fecha.getDay()]}</span>
                <span class="att-dia-num">${fecha.getDate()}</span>
                <span class="att-dia-mes">${ATT_MESES_ABR[fecha.getMonth()]}</span>
            </div>`;
        });

        html += `</div></div>`;
    });

    cont.innerHTML = html;
    attActualizarContador();
}

function attActualizarContador() {
    const contador = document.getElementById('attContador');
    if (contador) contador.textContent = `${attSeleccionados.size} / ${attTotalValidos} días`;
}

// Alterna un día sin volver a dibujar toda la cuadrícula, así la
// animación de "pop" solo se ve en el cuadro que se acaba de tocar.
function attToggleDia(fStr, el) {
    if (!el) return;
    const activo = attSeleccionados.has(fStr);

    if (activo) {
        attSeleccionados.delete(fStr);
        el.classList.remove('on', 'att-pop');
    } else {
        attSeleccionados.add(fStr);
        el.classList.add('on');
        el.classList.remove('att-pop');
        void el.offsetWidth; // reinicia la animación aunque se repita la clase
        el.classList.add('att-pop');
    }

    attActualizarContador();

    fetch('att/api_att.php?accion=guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fStr, seleccionado: activo ? 0 : 1 })
    }).catch(e => console.error('Error guardando AT&T', e));
}

// ══════════════════════════════════════════════════════
// FONDO DE VIDEO / SELECTOR DE PAISAJE (mismo banco que Nutrición)
// ══════════════════════════════════════════════════════
function attInitTema() {
    attTema = localStorage.getItem('attTema') || attTema;
    attAplicarTema(attTema);
    attRenderThemeMenu();
}

function attRenderThemeMenu() {
    const cont = document.getElementById('att-theme-menu');
    if (!cont) return;
    cont.innerHTML = ATT_THEMES.map(t => `
        <button type="button" class="att-theme-opt ${t.key === attTema ? 'activo' : ''}" onclick="attElegirTema('${t.key}')">
            <span class="ato-emoji">${t.emoji}</span>
            <span class="ato-label">${t.label}</span>
        </button>`).join('');
}

function attToggleThemeMenu() {
    attTemaMenuOpen = !attTemaMenuOpen;
    const menu = document.getElementById('att-theme-menu');
    const btn = document.getElementById('att-theme-btn');
    if (menu) menu.classList.toggle('abierto', attTemaMenuOpen);
    if (btn) btn.classList.toggle('activo', attTemaMenuOpen);
}

function attElegirTema(key) {
    attTema = key;
    localStorage.setItem('attTema', key);
    attAplicarTema(key);
    attRenderThemeMenu();
    if (attTemaMenuOpen) attToggleThemeMenu();
}

function attAplicarTema(key) {
    document.querySelectorAll('.att-layer').forEach(l => {
        const activo = l.dataset.themeLayer === key;
        l.classList.toggle('activo', activo);
        const vid = l.querySelector('.att-video-bg');
        if (!vid) return;
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
    });

    const btnEmoji = document.getElementById('att-theme-btn-emoji');
    const theme = ATT_THEMES.find(t => t.key === key);
    if (btnEmoji && theme) btnEmoji.textContent = theme.emoji;
}

document.addEventListener('click', function (e) {
    if (!attTemaMenuOpen) return;
    const menu = document.getElementById('att-theme-menu');
    const btn = document.getElementById('att-theme-btn');
    if (menu && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
        attToggleThemeMenu();
    }
});

document.addEventListener('DOMContentLoaded', initAtt);
