// habitos/habitos.js — Panel de Hábitos

const HB_HABITOS = [
  { id: 'minoxidil',  emoji: '💧', label: 'Minoxidil',                      color: '#3b82f6' },
  { id: 'jabon',      emoji: '🧴', label: 'Jabón facial',                   color: '#06b6d4' },
  { id: 'gym',        emoji: '🏋️', label: 'Gym',                            color: '#ef4444' },
  { id: 'cuello',     emoji: '🧘', label: 'Ejercicio de cuello',            color: '#8b5cf6' },
  { id: 'pelis',      emoji: '🎬', label: '30 min de pelis',                color: '#f97316' },
  { id: 'ingles',     emoji: '🇬🇧', label: '30 min de inglés',              color: '#f59e0b' },
  { id: 'anime',      emoji: '🎌', label: '30 min de anime',                color: '#ec4899' },
  { id: 'libro',      emoji: '📖', label: '30 min de libro',                color: '#22c55e' },
  { id: 'programar',  emoji: '💻', label: '30 min de estudio de programar', color: '#14b8a6' },
  { id: 'proyecto',   emoji: '🚀', label: '30 min de proyecto',             color: '#6366f1' },
  { id: 'creatina',   emoji: '💪', label: 'Creatina',                       color: '#84cc16' },
  { id: 'proteina',   emoji: '🥤', label: 'Proteína',                       color: '#fb7185' },
  { id: 'magnesio',   emoji: '💊', label: 'Magnesio',                       color: '#eab308' },
];

const HB_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const HB_DIAS_SEM = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const HB_DOW = ['D','L','M','M','J','V','S'];

let hbMesActual    = new Date();
let hbFechaSel      = null;
let hbDatos         = {};
let hbRangoCargado  = null;
let hbChart         = null;

function hbFmt(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function hbHoyStr() { return hbFmt(new Date()); }

function hbDiaCompletados(fecha) {
    const d = hbDatos[fecha];
    if (!d) return 0;
    let n = 0;
    HB_HABITOS.forEach(h => { if (d[h.id]) n++; });
    return n;
}
function hbDiaPct(fecha) {
    return Math.round((hbDiaCompletados(fecha) / HB_HABITOS.length) * 100);
}

async function initHabitos() {
    hbFechaSel = hbHoyStr();
    hbMesActual = new Date();

    const hoy = new Date();
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 90);
    await hbCargarRango(hbFmt(desde), hbFmt(hoy));

    hbRenderAll();
}

async function hbCargarRango(desde, hasta) {
    try {
        const res = await fetch(`habitos/api_habitos.php?accion=obtener_rango&desde=${desde}&hasta=${hasta}`);
        const json = await res.json();
        Object.assign(hbDatos, json);
        if (!hbRangoCargado) {
            hbRangoCargado = { desde, hasta };
        } else {
            if (desde < hbRangoCargado.desde) hbRangoCargado.desde = desde;
            if (hasta > hbRangoCargado.hasta) hbRangoCargado.hasta = hasta;
        }
    } catch (e) {
        console.error('Error cargando hábitos', e);
    }
}

async function hbAsegurarRangoMes(fecha) {
    const primero = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimo   = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const desdeStr = hbFmt(primero), hastaStr = hbFmt(ultimo);
    if (!hbRangoCargado || desdeStr < hbRangoCargado.desde || hastaStr > hbRangoCargado.hasta) {
        await hbCargarRango(desdeStr, hastaStr);
    }
}

async function hbCambiarMes(delta) {
    hbMesActual.setMonth(hbMesActual.getMonth() + delta);
    await hbAsegurarRangoMes(hbMesActual);
    hbRenderAll();
}

function hbRenderAll() {
    hbRenderHeader();
    hbRenderStats();
    hbRenderDiasStrip();
    hbRenderHoyList();
    hbRenderChart();
    hbRenderGrid();
}

function hbRenderHeader() {
    const el = document.getElementById('hb-fecha-label');
    if (!el) return;
    const [y, m, d] = hbFechaSel.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    el.textContent = `${HB_DIAS_SEM[fecha.getDay()]}, ${d} de ${HB_MESES[m - 1].toLowerCase()}`;
}

function hbCalcularRacha() {
    let racha = 0;
    const cursor = new Date();
    if (hbDiaPct(hbFmt(cursor)) < 100) cursor.setDate(cursor.getDate() - 1);
    while (hbDiaPct(hbFmt(cursor)) === 100) {
        racha++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return racha;
}

function hbPromedioMes() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const y = hbMesActual.getFullYear(), m = hbMesActual.getMonth();
    const primerDia = new Date(y, m, 1);
    const ultimoDia = new Date(y, m + 1, 0);
    const finRango = ultimoDia < hoy ? ultimoDia : hoy;
    if (finRango < primerDia) return 0;

    let suma = 0, cuenta = 0;
    for (let d = new Date(primerDia); d <= finRango; d.setDate(d.getDate() + 1)) {
        suma += hbDiaPct(hbFmt(d));
        cuenta++;
    }
    return cuenta ? Math.round(suma / cuenta) : 0;
}

function hbRenderStats() {
    const cont = document.getElementById('hb-stats');
    if (!cont) return;
    const hoyPct   = hbDiaPct(hbHoyStr());
    const racha    = hbCalcularRacha();
    const promedio = hbPromedioMes();
    cont.innerHTML = `
        <div class="hb-stat"><span class="hb-stat-icon">✅</span><div class="hb-stat-n">${hoyPct}%</div><div class="hb-stat-l">Hoy</div></div>
        <div class="hb-stat"><span class="hb-stat-icon">🔥</span><div class="hb-stat-n">${racha}</div><div class="hb-stat-l">Racha perfecta</div></div>
        <div class="hb-stat"><span class="hb-stat-icon">📊</span><div class="hb-stat-n">${promedio}%</div><div class="hb-stat-l">Promedio del mes</div></div>
    `;
}

function hbRenderDiasStrip() {
    const mesLbl = document.getElementById('hb-dias-mes');
    if (mesLbl) mesLbl.textContent = `${HB_MESES[hbMesActual.getMonth()]} ${hbMesActual.getFullYear()}`;

    const cont = document.getElementById('hb-dias-strip');
    if (!cont) return;

    const y = hbMesActual.getFullYear(), m = hbMesActual.getMonth();
    const totalDias = new Date(y, m + 1, 0).getDate();
    const hoyStr = hbHoyStr();

    let html = '';
    for (let d = 1; d <= totalDias; d++) {
        const fecha = new Date(y, m, d);
        const fStr = hbFmt(fecha);
        const futuro = fStr > hoyStr;
        const clases = ['hb-dia-chip'];
        if (fStr === hbFechaSel) clases.push('activo');
        if (fStr === hoyStr) clases.push('hoy');
        if (futuro) clases.push('futuro');

        const pct = hbDiaPct(fStr);
        const dotColor = pct === 100 ? '#00ff88' : (pct > 0 ? '#f59e0b' : '#334155');

        html += `<div class="${clases.join(' ')}" ${futuro ? '' : `onclick="hbSeleccionarDia('${fStr}')"`}>
            <div class="hb-dia-dow">${HB_DOW[fecha.getDay()]}</div>
            <div class="hb-dia-num">${d}</div>
            <div class="hb-dia-pct-dot" style="background:${dotColor}"></div>
        </div>`;
    }
    cont.innerHTML = html;

    requestAnimationFrame(() => {
        const activo = cont.querySelector('.hb-dia-chip.activo');
        if (activo) activo.scrollIntoView({ inline: 'center', block: 'nearest' });
    });
}

function hbSeleccionarDia(fStr) {
    hbFechaSel = fStr;
    hbRenderHeader();
    hbRenderDiasStrip();
    hbRenderHoyList();
}

function hbRenderHoyList() {
    const cont = document.getElementById('hb-hoy-list');
    if (!cont) return;

    const datosDia = hbDatos[hbFechaSel] || {};
    let html = '';
    HB_HABITOS.forEach(h => {
        const on = !!datosDia[h.id];
        html += `<div class="hb-hoy-item ${on ? 'on' : ''}" style="--hb-c:${h.color}" onclick="hbToggleHabito('${h.id}')">
            <span class="hb-hoy-check">${on ? '✓' : ''}</span>
            <span class="hb-hoy-label">${h.emoji} ${h.label}</span>
        </div>`;
    });
    cont.innerHTML = html;

    const pct = hbDiaPct(hbFechaSel);
    const pctEl = document.getElementById('hb-hoy-pct');
    const barEl = document.getElementById('hb-hoy-bar-fill');
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
}

function hbGuardarDia(fecha) {
    fetch('habitos/api_habitos.php?accion=guardar_dia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, datos: hbDatos[fecha] || {} })
    }).catch(e => console.error('Error guardando hábitos', e));
}

function hbRefrescarTrasCambio(fecha) {
    hbRenderStats();
    hbRenderDiasStrip();
    if (fecha === hbFechaSel) hbRenderHoyList();
    hbRenderChart();
    hbRenderGrid();
}

function hbToggleHabito(habitId) {
    if (!hbDatos[hbFechaSel]) hbDatos[hbFechaSel] = {};
    hbDatos[hbFechaSel][habitId] = !hbDatos[hbFechaSel][habitId];
    hbGuardarDia(hbFechaSel);
    hbRefrescarTrasCambio(hbFechaSel);
}

function hbToggleCelda(fecha, habitId) {
    if (fecha > hbHoyStr()) return;
    if (!hbDatos[fecha]) hbDatos[fecha] = {};
    hbDatos[fecha][habitId] = !hbDatos[fecha][habitId];
    hbGuardarDia(fecha);
    hbRefrescarTrasCambio(fecha);
}

function hbRenderGrid() {
    const table = document.getElementById('hb-grid-table');
    if (!table) return;

    const y = hbMesActual.getFullYear(), m = hbMesActual.getMonth();
    const totalDias = new Date(y, m + 1, 0).getDate();
    const hoyStr = hbHoyStr();

    let thead = '<thead><tr><th class="hb-grid-habito-cell"></th>';
    for (let d = 1; d <= totalDias; d++) {
        const fStr = hbFmt(new Date(y, m, d));
        thead += `<th class="${fStr === hoyStr ? 'hb-grid-col-hoy' : ''}">${d}</th>`;
    }
    thead += '</tr></thead>';

    let tbody = '<tbody>';
    HB_HABITOS.forEach(h => {
        tbody += `<tr><td class="hb-grid-habito-cell"><div class="hb-grid-habito-label"><span class="hb-grid-habito-dot" style="background:${h.color}"></span>${h.emoji} ${h.label}</div></td>`;
        for (let d = 1; d <= totalDias; d++) {
            const fStr = hbFmt(new Date(y, m, d));
            const futuro = fStr > hoyStr;
            const on = !!(hbDatos[fStr] && hbDatos[fStr][h.id]);
            const estilo = on ? `background:${h.color};border-color:${h.color}` : '';
            tbody += `<td class="${fStr === hoyStr ? 'hb-grid-col-hoy' : ''}">
                <div class="hb-grid-check ${futuro ? 'futuro' : ''}" style="${estilo}"
                     ${futuro ? '' : `onclick="hbToggleCelda('${fStr}','${h.id}')"`}>${on ? '✓' : ''}</div>
            </td>`;
        }
        tbody += '</tr>';
    });
    tbody += '</tbody>';

    table.innerHTML = thead + tbody;
}

function hbRenderChart() {
    const canvas = document.getElementById('hb-prog-canvas');
    if (!canvas || typeof Chart === 'undefined') return;

    const y = hbMesActual.getFullYear(), m = hbMesActual.getMonth();
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const totalDias = new Date(y, m + 1, 0).getDate();
    const esMesActual = (y === hoy.getFullYear() && m === hoy.getMonth());
    const tope = esMesActual ? hoy.getDate() : totalDias;

    const labels = [];
    const valores = [];
    for (let d = 1; d <= tope; d++) {
        labels.push(d);
        valores.push(hbDiaPct(hbFmt(new Date(y, m, d))));
    }

    const ctx = canvas.getContext('2d');
    if (hbChart) hbChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(0,217,255,0.35)');
    gradient.addColorStop(1, 'rgba(0,217,255,0)');

    hbChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: valores,
                borderColor: '#00d9ff',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: '#00d9ff',
                tension: 0.35,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c) => `${c.parsed.y}% completado` } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 8 } },
                y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#64748b', font: { size: 9 }, callback: v => v + '%' } }
            }
        }
    });
}
