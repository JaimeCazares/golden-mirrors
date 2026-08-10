// ── att/att.js — Calendario semanal de AT&T ──
// Rango fijo: lunes 27 de julio -> viernes 11 de septiembre, agrupado en
// 6 semanas horizontales (las primeras 5 de 7 días, la última se estira
// hasta cubrir el 11 de septiembre).

const ATT_INICIO = '2026-07-27';
const ATT_FIN = '2026-09-11';
const ATT_NUM_SEMANAS = 6;
const ATT_DOW = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const ATT_MESES_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

let attSeleccionados = new Set();

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

function attGenerarDias() {
    const dias = [];
    const cursor = attParsear(ATT_INICIO);
    const fin = attParsear(ATT_FIN);
    while (cursor <= fin) {
        dias.push(attFmt(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }
    return dias;
}

function attAgruparSemanas(dias) {
    const semanas = [];
    let idx = 0;
    for (let s = 0; s < ATT_NUM_SEMANAS; s++) {
        const esUltima = s === ATT_NUM_SEMANAS - 1;
        const cantidad = esUltima ? dias.length - idx : 7;
        semanas.push(dias.slice(idx, idx + cantidad));
        idx += cantidad;
    }
    return semanas;
}

function initAtt() {
    if (!document.getElementById('attSemanas')) return;

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

    const dias = attGenerarDias();
    const semanas = attAgruparSemanas(dias);
    const hoyStr = attFmt(new Date());

    let html = '';
    semanas.forEach((semana, i) => {
        html += `<div class="att-semana">
            <div class="att-semana-label">Semana ${i + 1}</div>
            <div class="att-dias-grid">`;

        semana.forEach(fStr => {
            const fecha = attParsear(fStr);
            const clases = ['att-dia'];
            if (attSeleccionados.has(fStr)) clases.push('on');
            if (fStr === hoyStr) clases.push('hoy');

            html += `<div class="${clases.join(' ')}" onclick="attToggleDia('${fStr}')">
                <span class="att-dia-dow">${ATT_DOW[fecha.getDay()]}</span>
                <span class="att-dia-num">${fecha.getDate()}</span>
                <span class="att-dia-mes">${ATT_MESES_ABR[fecha.getMonth()]}</span>
            </div>`;
        });

        html += `</div></div>`;
    });

    cont.innerHTML = html;

    const contador = document.getElementById('attContador');
    if (contador) contador.textContent = `${attSeleccionados.size} / ${dias.length} días`;
}

function attToggleDia(fStr) {
    const activo = attSeleccionados.has(fStr);

    if (activo) attSeleccionados.delete(fStr);
    else attSeleccionados.add(fStr);

    attRender();

    fetch('att/api_att.php?accion=guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fStr, seleccionado: activo ? 0 : 1 })
    }).catch(e => console.error('Error guardando AT&T', e));
}

document.addEventListener('DOMContentLoaded', initAtt);
