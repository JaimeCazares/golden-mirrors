// nutricion.js

const NUTRI_META = {
    proteina: 206,
    carbos:   160,
    grasa:    55,
    fibra:    30
};

let nutriEntradas    = [];
let nutriFechaActual = '';
let nutriBMR         = 2500;
let nutriMiBand      = 0;

function initNutricion() {
    const hoy = new Date();
    nutriFechaActual = hoy.toISOString().split('T')[0];

    const labelFecha = document.getElementById('n-fecha-label');
    if (labelFecha) {
        labelFecha.textContent = hoy.toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'short'
        });
    }

    // BMR guardado localmente (cambia semanalmente)
    nutriBMR = parseInt(localStorage.getItem('nutriBMR') || '2500', 10);
    const elBMR = document.getElementById('n-bmr-val');
    if (elBMR) elBMR.textContent = nutriBMR.toLocaleString('es-MX');

    nutriCargarDia();
}

async function nutriCargarDia() {
    try {
        const res  = await fetch(`nutricion/api_nutricion.php?accion=obtener&fecha=${nutriFechaActual}`);
        const data = await res.json();
        if (data.error) { console.error(data.error); return; }
        nutriEntradas = data.entradas  || [];
        nutriMiBand   = parseInt(data.miband || '0', 10);
        nutriRenderizar();
    } catch(e) {
        console.error('Error cargando nutrición:', e);
    }
}

function nutriRenderizar() {
    let totalCals = 0, totalProt = 0, totalCarb = 0, totalGras = 0, totalFibra = 0;

    nutriEntradas.forEach(e => {
        totalCals  += parseFloat(e.calorias) || 0;
        totalProt  += parseFloat(e.proteina) || 0;
        totalCarb  += parseFloat(e.carbos)   || 0;
        totalGras  += parseFloat(e.grasa)    || 0;
        totalFibra += parseFloat(e.fibra)    || 0;
    });

    const totalQuemado = nutriBMR + nutriMiBand;
    const deficit      = totalQuemado - Math.round(totalCals);

    // Mi Band display
    const elMiBand = document.getElementById('n-miband-val');
    if (elMiBand) elMiBand.textContent = nutriMiBand > 0 ? nutriMiBand.toLocaleString('es-MX') : '—';

    // Déficit card
    const elQuemado = document.getElementById('n-total-quemado');
    if (elQuemado) {
        const partes = nutriMiBand > 0
            ? `${nutriBMR.toLocaleString('es-MX')} + ${nutriMiBand.toLocaleString('es-MX')} = ${totalQuemado.toLocaleString('es-MX')} kcal`
            : `${nutriBMR.toLocaleString('es-MX')} kcal`;
        elQuemado.textContent = partes;
    }

    const elConsumido = document.getElementById('n-total-consumido');
    if (elConsumido) elConsumido.textContent = `${Math.round(totalCals).toLocaleString('es-MX')} kcal`;

    const elResultadoLabel = document.getElementById('n-resultado-label');
    const elResultadoVal   = document.getElementById('n-resultado-val');
    if (elResultadoLabel && elResultadoVal) {
        if (deficit >= 0) {
            elResultadoLabel.textContent = 'DÉFICIT';
            elResultadoVal.textContent   = `${deficit.toLocaleString('es-MX')} kcal`;
            elResultadoVal.classList.remove('superavit');
        } else {
            elResultadoLabel.textContent = 'SUPERÁVIT';
            elResultadoVal.textContent   = `${Math.abs(deficit).toLocaleString('es-MX')} kcal`;
            elResultadoVal.classList.add('superavit');
        }
    }

    // Macros barras
    nutriSetMacro('prot',  totalProt,  NUTRI_META.proteina);
    nutriSetMacro('carb',  totalCarb,  NUTRI_META.carbos);
    nutriSetMacro('gras',  totalGras,  NUTRI_META.grasa);
    nutriSetMacro('fibra', totalFibra, NUTRI_META.fibra);

    document.getElementById('m-prot').textContent  = Math.round(totalProt);
    document.getElementById('m-carb').textContent  = Math.round(totalCarb);
    document.getElementById('m-gras').textContent  = Math.round(totalGras);
    document.getElementById('m-fibra').textContent = Math.round(totalFibra);

    nutriRenderLog();
}

function nutriSetMacro(clave, valor, meta) {
    const pct = Math.min((valor / meta) * 100, 100);
    const el  = document.getElementById(`m-fill-${clave}`);
    if (el) el.style.width = pct + '%';
}

function nutriRenderLog() {
    const cont = document.getElementById('n-log');
    if (!cont) return;
    if (nutriEntradas.length === 0) {
        cont.innerHTML = '<div class="nutri-log-vacio">Sin registros aún</div>';
        return;
    }
    cont.innerHTML = nutriEntradas.map(e => {
        const partes = [];
        if (parseFloat(e.proteina) > 0) partes.push(`P:${parseFloat(e.proteina).toFixed(0)}g`);
        if (parseFloat(e.carbos)   > 0) partes.push(`C:${parseFloat(e.carbos).toFixed(0)}g`);
        if (parseFloat(e.grasa)    > 0) partes.push(`G:${parseFloat(e.grasa).toFixed(0)}g`);
        if (parseFloat(e.fibra)    > 0) partes.push(`F:${parseFloat(e.fibra).toFixed(0)}g`);
        const detalle = partes.join(' · ');
        return `
        <div class="nutri-entry">
            <span class="nutri-entry-icon">🍽️</span>
            <div class="nutri-entry-info">
                <div class="nutri-entry-nombre">${e.nombre}</div>
                ${detalle ? `<div class="nutri-entry-detalle">${detalle}</div>` : ''}
            </div>
            <span class="nutri-entry-cals">+${parseFloat(e.calorias).toFixed(0)} kcal</span>
            <button type="button" class="nutri-entry-del" onclick="nutriEliminar(${e.id})">✕</button>
        </div>`;
    }).join('');
}

// MODALES
function nutriAbrirModal(tipo) {
    const ids = { comida: 'modalNutriComida', bmr: 'modalNutriBMR', miband: 'modalNutriMiBand' };
    const el  = document.getElementById(ids[tipo]);
    if (!el) return;
    if (tipo === 'comida') {
        ['nf-nombre','nf-cals','nf-prot','nf-carb','nf-gras','nf-fibra']
            .forEach(id => { const inp = document.getElementById(id); if (inp) inp.value = ''; });
    }
    if (tipo === 'miband') {
        const inp = document.getElementById('nm-valor');
        if (inp) inp.value = nutriMiBand > 0 ? nutriMiBand : '';
    }
    el.classList.remove('nutri-modal-hidden');
}

function nutriCerrarModal(tipo) {
    const ids = { comida: 'modalNutriComida', bmr: 'modalNutriBMR', miband: 'modalNutriMiBand' };
    const el  = document.getElementById(ids[tipo]);
    if (el) el.classList.add('nutri-modal-hidden');
}

function nutriEditarBMR()    { nutriAbrirModal('bmr'); }
function nutriEditarMiBand() { nutriAbrirModal('miband'); }

function nutriGuardarBMR() {
    const val = parseInt(document.getElementById('nb-valor')?.value, 10);
    if (!val || val < 1000) { alert('Ingresa un valor válido (mínimo 1000)'); return; }
    nutriBMR = val;
    localStorage.setItem('nutriBMR', val);
    const elBMR = document.getElementById('n-bmr-val');
    if (elBMR) elBMR.textContent = val.toLocaleString('es-MX');
    nutriCerrarModal('bmr');
    nutriRenderizar();
}

async function nutriGuardarMiBand() {
    const val = parseInt(document.getElementById('nm-valor')?.value, 10) || 0;
    try {
        const res  = await fetch('nutricion/api_nutricion.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ accion: 'guardar_miband', fecha: nutriFechaActual, calorias: val })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            nutriMiBand = val;
            nutriCerrarModal('miband');
            nutriRenderizar();
        }
    } catch(e) { console.error('Error guardando Mi Band:', e); }
}

async function nutriGuardarComida() {
    const nombre = document.getElementById('nf-nombre')?.value.trim();
    if (!nombre) { alert('Escribe el nombre del alimento'); return; }
    const payload = {
        accion:   'agregar',
        fecha:    nutriFechaActual,
        nombre:   nombre,
        calorias: parseFloat(document.getElementById('nf-cals')?.value)  || 0,
        proteina: parseFloat(document.getElementById('nf-prot')?.value)  || 0,
        carbos:   parseFloat(document.getElementById('nf-carb')?.value)  || 0,
        grasa:    parseFloat(document.getElementById('nf-gras')?.value)  || 0,
        fibra:    parseFloat(document.getElementById('nf-fibra')?.value) || 0
    };
    try {
        const res  = await fetch('nutricion/api_nutricion.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'ok') { nutriCerrarModal('comida'); await nutriCargarDia(); }
    } catch(e) { console.error('Error guardando comida:', e); }
}

async function nutriEliminar(id) {
    try {
        const res  = await fetch('nutricion/api_nutricion.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ accion: 'eliminar', id })
        });
        const data = await res.json();
        if (data.status === 'ok') await nutriCargarDia();
    } catch(e) { console.error('Error eliminando:', e); }
}

document.addEventListener('click', function(e) {
    ['modalNutriComida','modalNutriBMR','modalNutriMiBand'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && e.target === modal) modal.classList.add('nutri-modal-hidden');
    });
});
