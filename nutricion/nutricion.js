// nutricion.js

const NUTRI_THEMES = [
    { key: 'lluvia',    label: 'Lluvia',    emoji: '🌧️' },
    { key: 'otono',     label: 'Otoño',     emoji: '🍁' },
    { key: 'playa',     label: 'Playa',     emoji: '🏖️' },
    { key: 'aurora',    label: 'Aurora',    emoji: '🌌' },
    { key: 'nieve',     label: 'Nieve',     emoji: '❄️' },
    { key: 'atardecer', label: 'Atardecer', emoji: '🌅' }
];

const NUTRI_API = 'nutricion/api_nutricion.php';
const NUTRI_DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const NUTRI_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let NUTRI_DIAS_VISIBLES = 3; // se recalcula en initNutricion() según el día más viejo con datos

let nutriFechaHoy     = '';
let nutriFechaSel      = '';
let nutriMetas        = { bmr:2500, kcal:1900, prot:180, carbs:160, grasas:60, fibra:35 };
let nutriMiBand       = 0;
let nutriTema         = 'lluvia';
let nutriTemaMenuOpen = false;
let _nutriMidnightTimer = null;

// Formatea un Date a 'YYYY-MM-DD' usando la fecha LOCAL (toISOString() usa UTC
// y en zonas con offset negativo como México adelanta el día por la noche).
function nutriDateAISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

function nutriHoyISO() {
    return nutriDateAISO(new Date());
}

function nutriFechaADate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function nutriSumarDias(iso, n) {
    const d = nutriFechaADate(iso);
    d.setDate(d.getDate() + n);
    return nutriDateAISO(d);
}

// Migra el plan/suplementos/miband que quedaron en localStorage (de antes del
// selector de fechas) hacia el registro de "Ayer", y deja "Hoy" en blanco.
function nutriMigrarDatosLegacy() {
    const legacyPlan   = localStorage.getItem('nutriPlanSel');
    const legacySuple  = localStorage.getItem('nutriSuple');
    const legacyMiBand = localStorage.getItem('nutriMiBand');
    if (!legacyPlan && !legacySuple && !legacyMiBand) return;

    let plan = { desayuno:[], colacion_am:[], comida:[], colacion_pm:[], cena:[] };
    let suplementos = [];
    try { if (legacyPlan)  plan        = JSON.parse(legacyPlan); }  catch(e) {}
    try { if (legacySuple) suplementos = JSON.parse(legacySuple); } catch(e) {}

    fetch(NUTRI_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accion: 'guardar_dia',
            fecha: nutriSumarDias(nutriFechaHoy, -1),
            plan, suplementos,
            miband: parseInt(legacyMiBand, 10) || 0,
        }),
    }).then(() => {
        ['nutriPlanSel','nutriSuple','nutriMiBand','nutriBMR'].forEach(k => localStorage.removeItem(k));
    }).catch(() => {});
}

function initNutricion() {
    nutriFechaHoy = nutriHoyISO();
    nutriFechaSel = nutriFechaHoy;

    nutriInitTema();
    nutriInitAlimentos();
    nutriMigrarDatosLegacy();
    nutriCalcularDiasVisibles().then(() => {
        nutriRenderDiasStrip();
        nutriCargarFecha(nutriFechaSel);
    });
    nutriScheduleMidnightRollover();

    // los videos se cargan de forma lazy en nutriAplicarTema()
}

// Calcula cuántos días mostrar en la franja: desde el día más viejo con datos hasta hoy.
async function nutriCalcularDiasVisibles() {
    try {
        const res = await fetch(`${NUTRI_API}?accion=obtener_fecha_inicio`).then(r => r.json());
        if (res && res.fecha) {
            const inicio = nutriFechaADate(res.fecha);
            const hoy    = nutriFechaADate(nutriFechaHoy);
            const dias   = Math.round((hoy - inicio) / 86400000) + 1;
            NUTRI_DIAS_VISIBLES = Math.max(3, dias);
        }
    } catch (e) { /* se queda con el valor por defecto */ }
}

function nutriScheduleMidnightRollover() {
    clearTimeout(_nutriMidnightTimer);
    const ahora = new Date();
    const medianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0, 5);
    _nutriMidnightTimer = setTimeout(() => {
        const eraHoy = nutriFechaSel === nutriFechaHoy;
        nutriFechaHoy = nutriHoyISO();
        if (eraHoy) nutriFechaSel = nutriFechaHoy;
        nutriRenderDiasStrip();
        nutriCargarFecha(nutriFechaSel);
        nutriScheduleMidnightRollover();
    }, medianoche - ahora);
}

// ── Indicadores de semáforo por día (kc/p/c/g/f) ──────
const NUTRI_INDICADORES = [
    { key:'deficit', letra:'kc', tier:v => v >= 1200 ? 'verde' : (v >= 900 ? 'amarillo' : 'rojo') },
    { key:'prot',    letra:'p',  tier:v => v >= 180  ? 'verde' : (v >= 160 ? 'amarillo' : 'rojo') },
    { key:'carbs',   letra:'c',  tier:v => v <= 160  ? 'verde' : (v <= 180 ? 'amarillo' : 'rojo') },
    { key:'grasas',  letra:'g',  tier:v => v <= 60   ? 'verde' : (v <= 80  ? 'amarillo' : 'rojo') },
    { key:'fibra',   letra:'f',  tier:v => v >= 35   ? 'verde' : (v >= 20  ? 'amarillo' : 'rojo') },
];
const NUTRI_TIER_COLOR = { verde:'#4ade80', amarillo:'#facc15', rojo:'#f87171' };
let _nutriIndCache = {}; // fecha → totales del día (prot/carbs/grasas/fibra consumidos + déficit calórico)

async function nutriObtenerTotalesDia(fecha) {
    if (_nutriIndCache[fecha]) return _nutriIndCache[fecha];
    try {
        const [diaRes, metasRes] = await Promise.all([
            fetch(`${NUTRI_API}?accion=obtener_dia&fecha=${fecha}`).then(r => r.json()),
            fetch(`${NUTRI_API}?accion=obtener_metas&fecha=${fecha}`).then(r => r.json()),
        ]);
        const totales = planTotals(diaRes && diaRes.plan ? diaRes.plan : {});
        const miband  = diaRes  && diaRes.miband ? parseInt(diaRes.miband, 10) : 0;
        const bmr     = metasRes && metasRes.bmr ? parseInt(metasRes.bmr, 10)  : 0;
        totales.deficit = (bmr + miband) - totales.kcal;
        _nutriIndCache[fecha] = totales;
        return totales;
    } catch (e) { return null; }
}

function nutriIndicadoresHtml(totales) {
    return NUTRI_INDICADORES.map(ind => {
        const tier = totales ? ind.tier(totales[ind.key]) : null;
        const dots = ['rojo','amarillo','verde'].map(t => {
            const activo = t === tier;
            return `<span class="nutri-dia-dot${activo ? ' activo' : ''}"${activo ? ` style="background:${NUTRI_TIER_COLOR[t]};box-shadow:0 0 4px ${NUTRI_TIER_COLOR[t]}"` : ''}></span>`;
        }).join('');
        return `<div class="nutri-dia-ind"><span class="nutri-dia-ind-letra">${ind.letra}</span>${dots}</div>`;
    }).join('');
}

function nutriDiaBoxHtml(fecha, ayer, totales) {
    const d       = nutriFechaADate(fecha);
    const esHoy   = fecha === nutriFechaHoy;
    const top     = esHoy ? 'Hoy' : (fecha === ayer ? 'Ayer' : NUTRI_DIAS_SEMANA[d.getDay()]);
    const semana  = NUTRI_DIAS_SEMANA[d.getDay()];
    return `<button type="button" class="nutri-dia-circ${esHoy ? ' hoy' : ''}${fecha === nutriFechaSel ? ' activo' : ''}"
                onclick="nutriSeleccionarDia('${fecha}')">
        <span class="nutri-dia-circ-label">${top}</span>
        <span class="nutri-dia-circ-semana">${top !== semana ? semana : ' '}</span>
        <div class="nutri-dia-circ-num">
          <span class="nutri-dia-circ-numero">${d.getDate()}</span>
          <div class="nutri-dia-inds">${nutriIndicadoresHtml(totales)}</div>
        </div>
      </button>`;
}

// ── Franja de fechas (selector tipo stories) ──────────
async function nutriRenderDiasStrip() {
    const mesEl  = document.getElementById('n-dias-mes');
    const strip  = document.getElementById('n-dias-strip');
    if (!strip) return;

    const selDate = nutriFechaADate(nutriFechaSel);
    if (mesEl) mesEl.textContent = `${NUTRI_MESES[selDate.getMonth()]} ${selDate.getFullYear()}`;

    const ayer   = nutriSumarDias(nutriFechaHoy, -1);
    const fechas = [];
    for (let i = NUTRI_DIAS_VISIBLES - 1; i >= 0; i--) fechas.push(nutriSumarDias(nutriFechaHoy, -i));

    const pintar = (totalesPorFecha) => {
        strip.innerHTML = fechas.map((fecha, i) => nutriDiaBoxHtml(fecha, ayer, totalesPorFecha ? totalesPorFecha[i] : _nutriIndCache[fecha])).join('');
        const activo = strip.querySelector('.nutri-dia-circ.activo');
        if (activo) activo.scrollIntoView({ inline: 'center', block: 'nearest' });
    };

    pintar(); // pase inmediato con lo que ya esté en caché (indicadores grises si aún no cargan)
    const totales = await Promise.all(fechas.map(f => nutriObtenerTotalesDia(f)));
    pintar(totales);
}

function nutriSeleccionarDia(fecha) {
    if (fecha > nutriFechaHoy || fecha === nutriFechaSel) return;
    nutriFechaSel = fecha;
    nutriRenderDiasStrip();
    nutriCargarFecha(fecha);
}

function nutriFormatFechaLarga(fecha) {
    const d = nutriFechaADate(fecha);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
}

// ── Carga de datos del día seleccionado ───────────────
async function nutriCargarFecha(fecha) {
    const labelFecha = document.getElementById('n-fecha-label');
    if (labelFecha) labelFecha.textContent = nutriFormatFechaLarga(fecha);

    let metasRes = null, diaRes = null;
    try {
        [metasRes, diaRes] = await Promise.all([
            fetch(`${NUTRI_API}?accion=obtener_metas&fecha=${fecha}`).then(r => r.json()),
            fetch(`${NUTRI_API}?accion=obtener_dia&fecha=${fecha}`).then(r => r.json()),
        ]);
    } catch (e) { /* sin conexión: se queda con lo que ya había en memoria */ }

    if (metasRes && !metasRes.error) {
        nutriMetas = {
            bmr:    parseInt(metasRes.bmr)    || nutriMetas.bmr,
            kcal:   parseInt(metasRes.kcal)   || nutriMetas.kcal,
            prot:   parseInt(metasRes.prot)   || nutriMetas.prot,
            carbs:  parseInt(metasRes.carbs)  || nutriMetas.carbs,
            grasas: parseInt(metasRes.grasas) || nutriMetas.grasas,
            fibra:  parseInt(metasRes.fibra)  || nutriMetas.fibra,
        };
    }

    _planSel     = (diaRes && diaRes.plan)        ? diaRes.plan        : { desayuno:[], colacion_am:[], comida:[], colacion_pm:[], cena:[] };
    _suplementos = (diaRes && diaRes.suplementos) ? diaRes.suplementos : [];
    nutriMiBand  = (diaRes && diaRes.miband)      ? parseInt(diaRes.miband) : 0;

    const elBMR    = document.getElementById('n-bmr-val');
    const elMiBand = document.getElementById('n-miband-val');
    if (elBMR)    elBMR.textContent    = nutriMetas.bmr.toLocaleString('es-MX');
    if (elMiBand) elMiBand.textContent = nutriMiBand > 0 ? nutriMiBand.toLocaleString('es-MX') : '—';

    renderPlanRoot();
}

function nutriGuardarDiaActual() {
    delete _nutriIndCache[nutriFechaSel];
    fetch(NUTRI_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accion: 'guardar_dia',
            fecha: nutriFechaSel,
            plan: _planSel,
            suplementos: _suplementos,
            miband: nutriMiBand,
        }),
    }).then(() => nutriRenderDiasStrip()).catch(() => {});
}

// ══════════════════════════════════════════════════════
// PAISAJE ANIMADO / SELECTOR DE TEMA — Canvas edition
// ══════════════════════════════════════════════════════
let _nutriStopFn = null;
let _nutriResizeTimer = null;

function nutriInitTema() {
    nutriTema = localStorage.getItem('nutriTema') || 'lluvia';
    nutriAplicarTema(nutriTema);
    nutriRenderThemeMenu();
    window.addEventListener('resize', () => {
        clearTimeout(_nutriResizeTimer);
        _nutriResizeTimer = setTimeout(() => nutriStartCanvas(nutriTema), 220);
    });
}

function nutriRenderThemeMenu() {
    const cont = document.getElementById('n-theme-menu');
    if (!cont) return;
    cont.innerHTML = NUTRI_THEMES.map(t => `
        <button type="button" class="nutri-theme-opt ${t.key === nutriTema ? 'activo' : ''}" onclick="nutriElegirTema('${t.key}')">
            <span class="nto-swatch nto-${t.key}"></span>
            <span class="nto-emoji">${t.emoji}</span>
            <span class="nto-label">${t.label}</span>
        </button>`).join('');
}

function nutriToggleThemeMenu() {
    nutriTemaMenuOpen = !nutriTemaMenuOpen;
    const menu = document.getElementById('n-theme-menu');
    const btn  = document.getElementById('n-theme-btn');
    if (menu) menu.classList.toggle('abierto', nutriTemaMenuOpen);
    if (btn)  btn.classList.toggle('activo', nutriTemaMenuOpen);
}

function nutriElegirTema(key) {
    nutriTema = key;
    localStorage.setItem('nutriTema', key);
    nutriAplicarTema(key);
    nutriRenderThemeMenu();
    if (nutriTemaMenuOpen) nutriToggleThemeMenu();
}

function nutriAplicarTema(key) {
    document.querySelectorAll('.nutri-layer').forEach(l => {
        const activo = l.dataset.themeLayer === key;
        l.classList.toggle('activo', activo);
        const vid = l.querySelector('.nutri-video-bg');
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
    const btnEmoji = document.getElementById('n-theme-btn-emoji');
    const theme    = NUTRI_THEMES.find(t => t.key === key);
    if (btnEmoji && theme) btnEmoji.textContent = theme.emoji;
    setTimeout(() => nutriStartCanvas(key), 80);
}

function nutriStartCanvas(key) {
    if (_nutriStopFn) { _nutriStopFn(); _nutriStopFn = null; }
    const scene  = document.getElementById('nutri-scene');
    const canvas = document.getElementById('canvas-' + key);
    if (!canvas || !scene) return;
    canvas.width  = scene.offsetWidth  || window.innerWidth;
    canvas.height = scene.offsetHeight || window.innerHeight;
    const ctx = canvas.getContext('2d');
    const fns = { lluvia:_ncLluvia, otono:_ncOtono, sakura:_ncSakura, aurora:_ncAurora, nieve:_ncNieve, atardecer:_ncAtardecer };
    if (fns[key]) _nutriStopFn = fns[key](canvas, ctx);
}

/* ── LLUVIA — gotas con destellos de relámpago ── */
function _ncLluvia(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const drops = Array.from({length: 115}, () => ({
        x: Math.random()*W, y: Math.random()*H,
        len: 18+Math.random()*32, spd: 14+Math.random()*18,
        op: 0.15+Math.random()*0.48, w: 0.7+Math.random()*1.1
    }));
    let la=0, nl=4500+Math.random()*9000, last=0, running=true;
    function frame(ts) {
        if (!running) return;
        const dt=Math.min((ts-last)/16,3); last=ts;
        nl-=dt*16;
        if (nl<=0) { la=10+Math.random()*6; nl=5500+Math.random()*14000; }
        ctx.clearRect(0,0,W,H);
        if (la>0) { ctx.fillStyle=`rgba(190,215,255,${Math.min(la*0.013,0.13)})`; ctx.fillRect(0,0,W,H); la-=dt; }
        drops.forEach(d => {
            ctx.beginPath(); ctx.strokeStyle=`rgba(174,214,241,${d.op})`; ctx.lineWidth=d.w; ctx.lineCap='round';
            ctx.moveTo(d.x,d.y); ctx.lineTo(d.x+d.len*0.18,d.y+d.len); ctx.stroke();
            d.y+=d.spd*dt; d.x+=d.spd*0.18*dt;
            if (d.y>H+d.len) { d.y=-d.len; d.x=Math.random()*W; }
            if (d.x>W+20) d.x-=W+20;
        });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { running=false; ctx.clearRect(0,0,W,H); };
}

/* ── OTOÑO — hojas con forma bezier ── */
function _ncOtono(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const cols = ['#c0392b','#e74c3c','#e67e22','#d35400','#f39c12','#8e6b3e','#a93226','#cb4335'];
    const leaves = Array.from({length: 30}, () => ({
        x:Math.random()*W, y:Math.random()*H, sz:5+Math.random()*10,
        rot:Math.random()*Math.PI*2, rs:(Math.random()-0.5)*0.045,
        spd:1.0+Math.random()*2.2, drift:(Math.random()-0.5)*1.1,
        col:cols[Math.floor(Math.random()*cols.length)],
        op:0.68+Math.random()*0.32, ph:Math.random()*Math.PI*2
    }));
    let t=0,last=0,running=true;
    function leaf(x,y,sz,rot,col,op) {
        ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha=op;
        ctx.fillStyle=col; ctx.beginPath();
        ctx.moveTo(0,-sz); ctx.bezierCurveTo(sz*.9,-sz*.4,sz*.9,sz*.4,0,sz);
        ctx.bezierCurveTo(-sz*.9,sz*.4,-sz*.9,-sz*.4,0,-sz); ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(0,-sz*.8); ctx.lineTo(0,sz*.8); ctx.stroke();
        ctx.globalAlpha=1; ctx.restore();
    }
    function frame(ts) {
        if (!running) return;
        const dt=Math.min((ts-last)/16,3); last=ts; t+=dt;
        ctx.clearRect(0,0,W,H);
        leaves.forEach(l => {
            leaf(l.x,l.y,l.sz,l.rot,l.col,l.op);
            l.y+=l.spd*dt; l.x+=(l.drift+Math.sin(t*.018+l.ph)*.5)*dt; l.rot+=l.rs*dt;
            if(l.y>H+20){l.y=-20;l.x=Math.random()*W;}
            if(l.x<-30)l.x=W+20; if(l.x>W+30)l.x=-20;
        });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ()=>{running=false;ctx.clearRect(0,0,W,H);};
}

/* ── SAKURA — pétalos con forma de corazón ── */
function _ncSakura(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const pc = ['#ffb7cf','#ffc8da','#ffd5e5','#ffe0ee','#ffaaca','#ffc2d8'];
    const petals = Array.from({length: 40}, () => ({
        x:Math.random()*W, y:Math.random()*H, sz:3.5+Math.random()*7,
        rot:Math.random()*Math.PI*2, rs:(Math.random()-0.5)*0.035,
        spd:0.7+Math.random()*1.6, drift:(Math.random()-0.5)*0.7,
        col:pc[Math.floor(Math.random()*pc.length)],
        op:0.5+Math.random()*0.5, ph:Math.random()*Math.PI*2
    }));
    let t=0,last=0,running=true;
    function petal(x,y,sz,rot,col,op) {
        ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha=op;
        ctx.fillStyle=col; ctx.beginPath();
        ctx.moveTo(0,sz*.45);
        ctx.bezierCurveTo(-sz,0,-sz*.85,-sz*.85,0,-sz*.45);
        ctx.bezierCurveTo(sz*.85,-sz*.85,sz,0,0,sz*.45);
        ctx.fill(); ctx.globalAlpha=1; ctx.restore();
    }
    function frame(ts) {
        if (!running) return;
        const dt=Math.min((ts-last)/16,3); last=ts; t+=dt;
        ctx.clearRect(0,0,W,H);
        petals.forEach(p => {
            petal(p.x,p.y,p.sz,p.rot,p.col,p.op);
            p.y+=p.spd*dt; p.x+=(p.drift+Math.sin(t*.014+p.ph)*.65)*dt; p.rot+=p.rs*dt;
            if(p.y>H+20){p.y=-20;p.x=Math.random()*W;}
            if(p.x<-30)p.x=W+20; if(p.x>W+30)p.x=-20;
        });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ()=>{running=false;ctx.clearRect(0,0,W,H);};
}

/* ── AURORA — estrellas + estrella fugaz ── */
function _ncAurora(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const stars = Array.from({length: 88}, () => ({
        x:Math.random()*W, y:Math.random()*H*.72,
        r:0.4+Math.random()*1.6, tw:Math.random()*Math.PI*2, ts:0.025+Math.random()*.05
    }));
    let sx=0,sy=0,sp=-1,sd=180+Math.floor(Math.random()*280), running=true;
    function frame() {
        if (!running) return;
        ctx.clearRect(0,0,W,H);
        stars.forEach(s => {
            s.tw+=s.ts;
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${0.22+Math.abs(Math.sin(s.tw))*.78})`; ctx.fill();
        });
        sd--;
        if (sd<=0) {
            if (sp<0) { sp=0; sx=-W*.1; sy=H*.05+Math.random()*H*.18; }
            sp+=0.017;
            if (sp<=1) {
                const ex=sx+W*1.3*sp, ey=sy+H*.38*sp, tl=115;
                const g=ctx.createLinearGradient(ex-tl*.65,ey-tl*.28,ex,ey);
                g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(255,255,255,0.88)');
                ctx.beginPath(); ctx.strokeStyle=g; ctx.lineWidth=1.6;
                ctx.moveTo(ex-tl*.65,ey-tl*.28); ctx.lineTo(ex,ey); ctx.stroke();
            } else { sp=-1; sd=220+Math.floor(Math.random()*400); }
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ()=>{running=false;ctx.clearRect(0,0,W,H);};
}

/* ── NIEVE — copos hexagonales + círculos ── */
function _ncNieve(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const flakes = Array.from({length: 88}, () => ({
        x:Math.random()*W, y:Math.random()*H, r:0.9+Math.random()*3.2,
        spd:0.5+Math.random()*1.6, drift:(Math.random()-0.5)*.55,
        op:0.35+Math.random()*.65, ph:Math.random()*Math.PI*2, hex:Math.random()>.55
    }));
    let t=0,last=0,running=true;
    function flake(x,y,r,op,hex) {
        ctx.save(); ctx.translate(x,y); ctx.globalAlpha=op;
        if (hex&&r>1.8) {
            ctx.strokeStyle='#cce4ff'; ctx.lineWidth=0.7;
            for(let a=0;a<6;a++){
                ctx.rotate(Math.PI/3); ctx.beginPath();
                ctx.moveTo(0,0); ctx.lineTo(0,-r);
                ctx.moveTo(0,-r*.48); ctx.lineTo(r*.28,-r*.7);
                ctx.moveTo(0,-r*.48); ctx.lineTo(-r*.28,-r*.7); ctx.stroke();
            }
        } else {
            ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
            ctx.fillStyle='rgba(200,225,255,0.92)'; ctx.fill();
        }
        ctx.globalAlpha=1; ctx.restore();
    }
    function frame(ts) {
        if (!running) return;
        const dt=Math.min((ts-last)/16,3); last=ts; t+=dt;
        ctx.clearRect(0,0,W,H);
        flakes.forEach(f=>{
            flake(f.x,f.y,f.r,f.op,f.hex);
            f.y+=f.spd*dt; f.x+=(f.drift+Math.sin(t*.009+f.ph)*.38)*dt;
            if(f.y>H+10){f.y=-10;f.x=Math.random()*W;}
            if(f.x<-10)f.x=W+10; if(f.x>W+10)f.x=-10;
        });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ()=>{running=false;ctx.clearRect(0,0,W,H);};
}

/* ── ATARDECER — pájaros volando en formación ── */
function _ncAtardecer(canvas, ctx) {
    const W = canvas.width, H = canvas.height;
    const birds = [];
    for(let f=0;f<3;f++){
        const bx=Math.random()*W-W*.2, by=H*(.14+f*.1), n=3+Math.floor(Math.random()*5);
        for(let i=0;i<n;i++) birds.push({
            x:bx+(i%3)*24+Math.floor(i/3)*14, y:by+(i%3)*9,
            spd:.5+f*.15+Math.random()*.3, wing:Math.random()*Math.PI*2,
            ws:.055+Math.random()*.035, sz:4+Math.random()*4
        });
    }
    let last=0,running=true;
    function bird(x,y,sz,w){
        const fl=Math.sin(w)*.52;
        ctx.beginPath();
        ctx.moveTo(x-sz,y+sz*fl); ctx.quadraticCurveTo(x-sz*.5,y-sz*.35,x,y);
        ctx.moveTo(x+sz,y+sz*fl); ctx.quadraticCurveTo(x+sz*.5,y-sz*.35,x,y);
        ctx.strokeStyle='rgba(15,4,0,0.78)'; ctx.lineWidth=1.5; ctx.lineCap='round'; ctx.stroke();
    }
    function frame(ts){
        if(!running)return;
        const dt=Math.min((ts-last)/16,3); last=ts;
        ctx.clearRect(0,0,W,H);
        birds.forEach(b=>{ b.x+=b.spd*dt; b.y-=.07*dt; b.wing+=b.ws*dt; if(b.x>W+70)b.x=-90; bird(b.x,b.y,b.sz,b.wing); });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return ()=>{running=false;ctx.clearRect(0,0,W,H);};
}

// ══════════════════════════════════════════════════════
// MODALES
// ══════════════════════════════════════════════════════
function nutriAbrirModal(tipo) {
    const ids = { bmr: 'modalNutriBMR', miband: 'modalNutriMiBand', suple: 'nutri-suple-modal' };
    const el  = document.getElementById(ids[tipo]);
    if (!el) return;
    if (tipo === 'miband') {
        const inp = document.getElementById('nm-valor');
        if (inp) inp.value = nutriMiBand > 0 ? nutriMiBand : '';
    }
    if (tipo === 'bmr') {
        const valores = { 'nb-valor': nutriMetas.bmr, 'nb-kcal': nutriMetas.kcal, 'nb-prot': nutriMetas.prot,
                           'nb-carbs': nutriMetas.carbs, 'nb-grasas': nutriMetas.grasas, 'nb-fibra': nutriMetas.fibra };
        Object.entries(valores).forEach(([id, v]) => {
            const inp = document.getElementById(id); if (inp) inp.value = v;
        });
    }
    if (tipo === 'suple') {
        ['suple-nombre','suple-nombre-otro','suple-dosis','suple-razon'].forEach(id => {
            const inp = document.getElementById(id); if (inp) inp.value = '';
        });
        document.getElementById('suple-nombre-otro')?.classList.add('nutri-modal-hidden');
        const frec = document.getElementById('suple-frecuencia');
        if (frec) frec.value = 'AM';
    }
    el.classList.remove('nutri-modal-hidden');
}

function nutriToggleSupleOtro() {
    const sel  = document.getElementById('suple-nombre');
    const otro = document.getElementById('suple-nombre-otro');
    if (!sel || !otro) return;
    otro.classList.toggle('nutri-modal-hidden', sel.value !== 'Otro');
    if (sel.value === 'Otro') otro.focus();
}

function nutriCerrarModal(tipo) {
    const ids = { bmr: 'modalNutriBMR', miband: 'modalNutriMiBand', suple: 'nutri-suple-modal' };
    const el  = document.getElementById(ids[tipo]);
    if (el) el.classList.add('nutri-modal-hidden');
}

function nutriEditarBMR()    { nutriAbrirModal('bmr'); }
function nutriEditarMiBand() { nutriAbrirModal('miband'); }

function nutriGuardarBMR() {
    const bmr = parseInt(document.getElementById('nb-valor')?.value, 10);
    if (!bmr || bmr < 1000) { alert('Ingresa un BMR válido (mínimo 1000)'); return; }

    const nuevasMetas = {
        bmr,
        kcal:   parseInt(document.getElementById('nb-kcal')?.value,   10) || nutriMetas.kcal,
        prot:   parseInt(document.getElementById('nb-prot')?.value,   10) || nutriMetas.prot,
        carbs:  parseInt(document.getElementById('nb-carbs')?.value,  10) || nutriMetas.carbs,
        grasas: parseInt(document.getElementById('nb-grasas')?.value, 10) || nutriMetas.grasas,
        fibra:  parseInt(document.getElementById('nb-fibra')?.value,  10) || nutriMetas.fibra,
    };

    fetch(NUTRI_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'guardar_metas', ...nuevasMetas }),
    }).then(r => r.json()).then(res => {
        if (res.error) { nutriToast('No se pudo guardar'); return; }
        // las metas nuevas solo aplican si estás viendo hoy o un día futuro a la fecha en que se guardaron
        if (nutriFechaSel >= res.fecha) {
            nutriMetas = nuevasMetas;
            const elBMR = document.getElementById('n-bmr-val');
            if (elBMR) elBMR.textContent = bmr.toLocaleString('es-MX');
            renderPlanRoot();
        }
        nutriToast('✓ Metas actualizadas desde hoy');
    }).catch(() => nutriToast('No se pudo guardar (sin conexión)'));

    nutriCerrarModal('bmr');
}

function nutriGuardarMiBand() {
    const val = parseInt(document.getElementById('nm-valor')?.value, 10) || 0;
    nutriMiBand = val;
    const elMiBand = document.getElementById('n-miband-val');
    if (elMiBand) elMiBand.textContent = val > 0 ? val.toLocaleString('es-MX') : '—';
    nutriCerrarModal('miband');
    renderPlanRoot();
    nutriGuardarDiaActual();
}

// ══════════════════════════════════════════════════════
// PLAN NUTRICIONAL
// ══════════════════════════════════════════════════════
let _alimentos   = [];
let _planSel     = { desayuno:[], colacion_am:[], comida:[], colacion_pm:[], cena:[] };
let _pickerMeal   = null;
let _pickerCat    = 'Todos';
let _pickerTab    = 'alimentos';
let _pickerRecCat = 'Todos';
let _suplementos  = [];
let _recetaState   = {}; // rIdx → [{food,qty,step,min,max}, ...]
let _recetaAddOpen = null; // rIdx con panel de búsqueda abierto, null si ninguno
let _recetaAddCat  = 'Todos';
let _recetaAddQ    = '';

const PORC_OPTS = Array.from({ length: 20 }, (_, i) => +((i + 1) * 0.5).toFixed(1));

const PLAN_MEALS = [
    { key:'desayuno',    label:'Desayuno',    hora:'7:30',  pct:.25, emoji:'🌅', col:'#fb923c' },
    { key:'colacion_am', label:'Colación AM', hora:'10:30', pct:.10, emoji:'🍎', col:'#f87171' },
    { key:'comida',      label:'Comida',      hora:'14:00', pct:.35, emoji:'🍽️', col:'#4ade80' },
    { key:'colacion_pm', label:'Colación PM', hora:'17:30', pct:.10, emoji:'🥑', col:'#f472b6' },
    { key:'cena',        label:'Cena',        hora:'20:00', pct:.20, emoji:'🌙', col:'#60a5fa' },
];

function planTargets() {
    return {
        kcal:   nutriMetas.kcal,
        prot:   nutriMetas.prot,
        carbs:  nutriMetas.carbs,
        grasas: nutriMetas.grasas,
        fibra:  nutriMetas.fibra,
    };
}

function planTotals(plan) {
    let kcal=0, prot=0, carbs=0, grasas=0, fibra=0;
    Object.values(plan || _planSel).flat().forEach(i => {
        kcal   += i.calorias * i.porciones;
        prot   += i.proteina * i.porciones;
        carbs  += (i.carbos || 0) * i.porciones;
        grasas += (i.grasas || i.grasa || 0) * i.porciones;
        fibra  += (i.fibra  || 0) * i.porciones;
    });
    return {
        kcal:   Math.round(kcal),
        prot:   Math.round(prot),
        carbs:  Math.round(carbs),
        grasas: Math.round(grasas),
        fibra:  Math.round(fibra),
    };
}

function nutriInitAlimentos() {
    if (typeof NUTRI_FOOD_DB !== 'undefined') {
        _alimentos = NUTRI_FOOD_DB.map((a, i) => ({
            ...a,
            id:           i + 1,
            grasas:       a.grasa,
            porcion_desc: a.porcion,
            excluido:     false,
        }));
    }
}

// ── Render principal ──────────────────────────────────
function renderPlanRoot() {
    const root = document.getElementById('plan-root');
    if (!root) return;
    const T = planTargets();
    const C = planTotals();
    const leftCol  = renderPlanMetasCard(T, C) + renderPlanSupleCard() + renderPlanAguaCard();
    const rightCol = PLAN_MEALS.map(m => renderPlanMealCard(m, T)).join('');
    root.innerHTML = `<div class="plan-grid">
      <div class="plan-col-left">${leftCol}</div>
      <div class="plan-col-right">${rightCol}</div>
    </div>`;
    nutriUpdateBalanceCards(C.kcal);
}

// ── Total quemadas + Déficit calórico ─────────────────
function nutriUpdateBalanceCards(consumidas) {
    if (consumidas == null) consumidas = planTotals().kcal;
    const quemado = nutriMetas.bmr + nutriMiBand;
    const deficit = quemado - consumidas;

    const elQuemado = document.getElementById('n-quemado-val');
    if (elQuemado) elQuemado.textContent = quemado.toLocaleString('es-MX');

    const elDeficit = document.getElementById('n-deficit-val');
    if (elDeficit) {
        const signo = deficit < 0 ? '-' : '';
        elDeficit.innerHTML = `${signo}${Math.abs(deficit).toLocaleString('es-MX')} <small>kcal</small>`;
        elDeficit.classList.toggle('superavit', deficit < 0);
    }
}

// ── Panel de metas ────────────────────────────────────
function renderPlanMetasCard(T, C) {
    const kcalPct  = T.kcal ? Math.min(100, Math.round(C.kcal / T.kcal * 100)) : 0;
    const kcalOver = C.kcal > T.kcal;

    const macros = [
        { l:'Proteína', icon:'🥩', cur:C.prot,   max:T.prot,   col:'#4ade80', bg:'rgba(74,222,128,0.12)'  },
        { l:'Carbos',   icon:'🌾', cur:C.carbs,  max:T.carbs,  col:'#60a5fa', bg:'rgba(96,165,250,0.12)'  },
        { l:'Grasa',    icon:'🫒', cur:C.grasas, max:T.grasas, col:'#facc15', bg:'rgba(250,204,21,0.12)'  },
        { l:'Fibra',    icon:'🥦', cur:C.fibra,  max:T.fibra,  col:'#c084fc', bg:'rgba(192,132,252,0.12)' },
    ];

    const macroHtml = macros.map(m => {
        const pct  = m.max ? Math.min(100, Math.round(m.cur / m.max * 100)) : 0;
        const over = m.cur > m.max;
        return `<div class="plan-macro-mini" style="background:${m.bg};border:1px solid ${m.col}22">
            <div class="plan-macro-icon">${m.icon}</div>
            <div class="plan-macro-val" style="color:${m.col}">${m.max}g</div>
            <div class="plan-macro-label">${m.l}</div>
            <div class="plan-macro-track">
              <div class="plan-macro-bar" style="width:${pct}%;background:${over ? '#f87171' : m.col}"></div>
            </div>
            <div class="plan-macro-cur">${m.cur}/${m.max}·${pct}%</div>
          </div>`;
    }).join('');

    return `<div class="nutri-plan-card">
      <div class="plan-card-header">
        <span>🎯 Metas diarias</span>
        <button type="button" class="nutri-btn-mini" onclick="nutriGuardarPlan()">💾 Guardar</button>
      </div>
      <div class="plan-kcal-banner">
        <div class="plan-kcal-label">Calorías diarias</div>
        <div class="plan-kcal-val">${T.kcal} <span class="plan-kcal-unit">kcal</span></div>
        <div class="plan-kcal-track">
          <div class="plan-kcal-bar" style="width:${kcalPct}%;background:${kcalOver ? '#f87171' : 'rgba(255,255,255,0.82)'}"></div>
        </div>
        <div class="plan-kcal-sub">
          <span>${C.kcal} consumidas en el plan</span><span>${kcalPct}%</span>
        </div>
      </div>
      <div class="plan-macros-row">${macroHtml}</div>
    </div>`;
}

// ── Meal cards ────────────────────────────────────────
function renderPlanMealCard(meal, T) {
    const items = _planSel[meal.key] || [];
    const mKcal    = Math.round(items.reduce((s, i) => s + i.calorias * i.porciones, 0));
    const tKcal    = Math.round(T.kcal * meal.pct);
    const mPctReal = tKcal ? Math.round(mKcal / tKcal * 100) : 0;
    const mPct     = Math.min(100, mPctReal);
    const mOver    = mKcal > tKcal;

    const itemsHtml = items.length
        ? items.map((it, i) => renderPlanFoodRow(it, meal.key, i, items.length)).join('')
        : `<div class="plan-meal-empty">Sin alimentos · objetivo ~${tKcal} kcal</div>`;

    let totalsHtml = '';
    if (items.length) {
        let tP = 0, tC = 0, tG = 0, tF = 0;
        items.forEach(it => {
            tP += (it.proteina || 0) * it.porciones;
            tC += (it.carbos   || 0) * it.porciones;
            tG += (it.grasas || it.grasa || 0) * it.porciones;
            tF += (it.fibra    || 0) * it.porciones;
        });
        totalsHtml = `<div class="plan-meal-totals">
          <span class="plan-meal-tot-kcal">${mKcal} kcal</span>
          <span class="nf-chip prot">P${Math.round(tP)}g</span>
          <span class="nf-chip carb">C${Math.round(tC)}g</span>
          <span class="nf-chip gras">G${Math.round(tG)}g</span>
          <span class="nf-chip fibra">F${Math.round(tF)}g</span>
        </div>`;
    }

    return `<div class="nutri-plan-card plan-meal-card" style="border-left:3px solid ${meal.col}">
      <div class="plan-meal-header">
        <div class="plan-meal-info">
          <div class="plan-meal-emoji" style="background:${meal.col}22">${meal.emoji}</div>
          <div>
            <div class="plan-meal-label">${meal.label}</div>
            <div class="plan-meal-hora">${meal.hora}</div>
          </div>
        </div>
        <div class="plan-meal-right">
          <div class="plan-meal-kcal" style="color:${mKcal > 0 ? meal.col : '#7a82a0'}">
            ${mKcal > 0 ? `${mKcal} / ${tKcal}` : `~${tKcal}`} kcal
          </div>
          ${mKcal > 0 ? `<div class="plan-meal-pct${mOver ? ' rebasado' : ''}">${mPctReal}%${mOver ? ' 🔥' : ''}</div>` : ''}
          <button type="button" class="plan-add-btn" onclick="nutriOpenPicker('${meal.key}')">+ Alimento</button>
        </div>
      </div>
      ${mKcal > 0 ? `<div class="plan-meal-track"><div class="plan-meal-bar" style="width:${mPct}%;background:${mOver ? '#f87171' : meal.col}"></div></div>` : ''}
      <div class="plan-meal-items">${itemsHtml}</div>
      ${totalsHtml}
    </div>`;
}

function renderPlanFoodRow(item, mealKey, idx, total) {
    const kcal  = Math.round(item.calorias * item.porciones);
    const prot  = +(item.proteina * item.porciones).toFixed(1);
    const carbs = +((item.carbos  || 0) * item.porciones).toFixed(1);
    const gras  = +((item.grasas  || item.grasa || 0) * item.porciones).toFixed(1);
    const fibra = +((item.fibra   || 0) * item.porciones).toFixed(1);
    const em    = item.emoji || '🍽️';

    return `<div class="plan-food-row${idx < total - 1 ? ' plan-food-border' : ''}">
      <div class="plan-food-left">
        <span class="plan-food-emoji">${em}</span>
        <div>
          <div class="plan-food-nombre">${item.nombre}</div>
          <div class="plan-food-macros">
            ${item.porcion_desc || item.porcion || ''} ×${item.porciones}&nbsp;
            <span style="color:#4ade80">P${prot}g</span>·
            <span style="color:#60a5fa">C${carbs}g</span>·
            <span style="color:#facc15">G${gras}g</span>·
            <span style="color:#c084fc">F${fibra}g</span>
          </div>
        </div>
      </div>
      <div class="plan-food-right">
        <span class="plan-food-kcal">${kcal} kcal</span>
        <select class="plan-food-select" title="Porciones"
                onchange="nutriChangePortion('${mealKey}',${idx},this.value)">
          ${PORC_OPTS.map(v=>`<option value="${v}"${item.porciones==v?' selected':''}>${v}×</option>`).join('')}
        </select>
        <button type="button" class="plan-food-del"
                onclick="nutriRemoveFood('${mealKey}',${idx})" title="Quitar">✕</button>
      </div>
    </div>`;
}

// ── Suplementación ────────────────────────────────────
function renderPlanSupleCard() {
    const body = _suplementos.length
        ? _suplementos.map((s, i) => `
          <div class="plan-suple-row${i < _suplementos.length - 1 ? ' plan-food-border' : ''}">
            <div>
              <div class="plan-suple-nombre">🟢 ${s.nombre}</div>
              ${s.dosis || s.frecuencia ? `<div class="plan-suple-sub">${[s.dosis,s.frecuencia].filter(Boolean).join(' · ')}</div>` : ''}
              ${s.razon ? `<div class="plan-suple-sub" style="font-style:italic">${s.razon}</div>` : ''}
            </div>
            <button type="button" class="plan-food-del" onclick="nutriBorrarSuple(${i})">✕</button>
          </div>`).join('')
        : '<div class="plan-meal-empty" style="border:none;padding:14px 16px">Sin suplementos registrados</div>';

    return `<div class="nutri-plan-card">
      <div class="plan-card-header">
        <span>💊 Suplementación</span>
        <button type="button" class="nutri-btn-mini" onclick="nutriAbrirModal('suple')">+ Agregar</button>
      </div>
      <div id="plan-suple-list">${body}</div>
    </div>`;
}

// ── Hidratación ───────────────────────────────────────
function renderPlanAguaCard() {
    const peso   = parseFloat(localStorage.getItem('nutriPeso') || '103.75');
    const litros = (peso * 35 / 1000).toFixed(1);
    return `<div class="nutri-plan-card plan-agua-last">
      <div class="plan-card-header"><span>💧 Hidratación</span></div>
      <div class="plan-agua-val">${litros}L</div>
      <div class="plan-agua-sub">35 ml × kg de peso</div>
    </div>`;
}

// ── Acciones de plan ──────────────────────────────────
function nutriChangePortion(mealKey, idx, val) {
    if (!_planSel[mealKey]?.[idx]) return;
    _planSel[mealKey][idx].porciones = parseFloat(val);
    nutriGuardarPlanLocal();
    renderPlanRoot();
}

function nutriRemoveFood(mealKey, idx) {
    _planSel[mealKey].splice(idx, 1);
    nutriGuardarPlanLocal();
    renderPlanRoot();
}

function nutriGuardarPlanLocal() {
    nutriGuardarDiaActual();
}

function nutriGuardarPlan() {
    nutriGuardarPlanLocal();
    nutriToast('✓ Plan guardado');
}

// ── Suplementos ───────────────────────────────────────
function nutriGuardarSuple() {
    const sel = document.getElementById('suple-nombre')?.value || '';
    const nombre = sel === 'Otro'
        ? document.getElementById('suple-nombre-otro')?.value.trim()
        : sel.trim();
    if (!nombre) { nutriToast('Selecciona o escribe el nombre del suplemento'); return; }
    _suplementos.push({
        nombre,
        dosis:      document.getElementById('suple-dosis')?.value.trim()  || '',
        frecuencia: document.getElementById('suple-frecuencia')?.value    || '',
        razon:      document.getElementById('suple-razon')?.value.trim()  || '',
    });
    nutriGuardarDiaActual();
    nutriCerrarModal('suple');
    renderPlanRoot();
    nutriToast('💊 Suplemento agregado');
}

function nutriBorrarSuple(idx) {
    _suplementos.splice(idx, 1);
    nutriGuardarDiaActual();
    renderPlanRoot();
}

// ══════════════════════════════════════════════════════
// FOOD PICKER
// ══════════════════════════════════════════════════════
function nutriOpenPicker(mealKey) {
    _pickerMeal    = mealKey;
    _pickerCat     = 'Todos';
    _pickerRecCat  = 'Todos';
    _pickerTab     = 'alimentos';
    _recetaState   = {};
    _recetaAddOpen = null;
    _recetaAddCat  = 'Todos';
    _recetaAddQ    = '';
    const meal  = PLAN_MEALS.find(m => m.key === mealKey);
    const modal = document.getElementById('food-picker-modal');
    if (!modal) return;
    modal.classList.remove('nutri-modal-hidden');
    const lbl = document.getElementById('picker-meal-lbl');
    if (lbl) lbl.textContent = meal?.label || mealKey;
    const srch = document.getElementById('picker-search');
    if (srch) { srch.value = ''; setTimeout(() => srch.focus(), 80); }
    nutriSwitchPickerTab('alimentos');
}

function nutriClosePicker() {
    const modal = document.getElementById('food-picker-modal');
    if (modal) modal.classList.add('nutri-modal-hidden');
}

function nutriSwitchPickerTab(tab) {
    _recetaAddOpen = null;
    _recetaAddCat  = 'Todos';
    _recetaAddQ    = '';
    _pickerTab     = tab;
    document.querySelectorAll('[data-ptab]').forEach(b =>
        b.classList.toggle('activo', b.dataset.ptab === tab));

    const catsBar = document.getElementById('picker-cats-bar');
    if (!catsBar) return;
    catsBar.style.display = '';

    if (tab === 'alimentos') {
        const cats = ['Todos', ...[...new Set(_alimentos.map(a => a.categoria))].sort()];
        catsBar.innerHTML = cats.map(c =>
            `<button type="button" onclick="nutriPickerSetCat('${c}')" data-pcat="${c}"
              class="nf-cat ${c === _pickerCat ? 'activo' : ''}">${c}</button>`
        ).join('');
    } else {
        const recCats = typeof PLAN_RECETAS !== 'undefined'
            ? ['Todos', ...[...new Set(PLAN_RECETAS.map(r => r.cat))]]
            : ['Todos'];
        catsBar.innerHTML = recCats.map(c =>
            `<button type="button" onclick="nutriPickerSetRecCat('${c}')" data-prcat="${c}"
              class="nf-cat ${c === _pickerRecCat ? 'activo' : ''}">${c}</button>`
        ).join('');
    }
    nutriRenderPickerContent();
}

function nutriPickerSetRecCat(cat) {
    _pickerRecCat = cat;
    document.querySelectorAll('[data-prcat]').forEach(b =>
        b.classList.toggle('activo', b.dataset.prcat === cat));
    nutriRenderPickerContent();
}

function nutriPickerSetCat(cat) {
    _pickerCat = cat;
    document.querySelectorAll('[data-pcat]').forEach(b =>
        b.classList.toggle('activo', b.dataset.pcat === cat));
    nutriRenderPickerContent();
}

function nutriRenderPickerContent() {
    if (_pickerTab === 'recetas') {
        nutriRenderRecetasPicker();
    } else {
        nutriRenderAlimentosPicker();
    }
}

// ── Alimentos ─────────────────────────────────────────
function nutriRenderAlimentosPicker() {
    const cont  = document.getElementById('picker-list');
    if (!cont) return;
    const srch  = (document.getElementById('picker-search')?.value || '').toLowerCase();
    const lista = _alimentos.filter(a =>
        (_pickerCat === 'Todos' || a.categoria === _pickerCat) &&
        (!srch || a.nombre.toLowerCase().includes(srch))
    );

    if (!lista.length) {
        cont.innerHTML = `<div class="nf-vacio">🔍 Sin resultados</div>`;
        return;
    }

    cont.innerHTML = lista.map(a => {
        const em     = a.emoji || '🍽️';
        const inPlan = (_planSel[_pickerMeal] || []).some(x => (x.alimento_id||x.id) === a.id);
        return `<div class="nf-item${a.excluido ? ' plan-excluido' : ''}">
          <div class="nf-item-avatar">${em}</div>
          <div class="nf-item-info">
            <div class="nf-item-nombre">${a.nombre}</div>
            <div class="nf-item-porcion">${a.porcion_desc} · <b>${a.calorias} kcal</b></div>
            <div class="nf-item-macros">
              <span class="nf-chip prot">P ${a.proteina}g</span>
              <span class="nf-chip carb">C ${a.carbos}g</span>
              <span class="nf-chip gras">G ${a.grasas}g</span>
              <span class="nf-chip fibra">F ${a.fibra}g</span>
            </div>
          </div>
          <div class="nf-item-actions">
            ${!a.excluido ? `
              <select class="nf-por-select" id="por-${a.id}" title="Porciones">
                ${PORC_OPTS.map(v=>`<option value="${v}"${v===1?' selected':''}>${v}×</option>`).join('')}
              </select>
              <button type="button" class="nf-item-add"
                      onclick="nutriAddFoodToMeal(${a.id})">${inPlan ? '✓ +' : '+ Agregar'}</button>
              <button type="button" class="plan-excluir-btn"
                      onclick="nutriToggleExclusion(${a.id},true)">👎 Excluir</button>
            ` : `
              <button type="button" class="plan-incluir-btn"
                      onclick="nutriToggleExclusion(${a.id},false)">🚫 Excluido<br>Incluir</button>
            `}
          </div>
        </div>`;
    }).join('');
}

function nutriAddFoodToMeal(alimId) {
    const a = _alimentos.find(x => x.id === alimId);
    if (!a || !_pickerMeal) return;
    const porEl    = document.getElementById(`por-${alimId}`);
    const porciones = porEl ? parseFloat(porEl.value) : 1;
    _planSel[_pickerMeal].push({ ...a, alimento_id: a.id, porciones });
    nutriClosePicker();
    nutriGuardarPlanLocal();
    renderPlanRoot();
    const mName = PLAN_MEALS.find(m => m.key === _pickerMeal)?.label || _pickerMeal;
    nutriToast(`${a.emoji || '🍽️'} ${a.nombre} → ${mName}`);
}

function nutriToggleExclusion(alimId, excluido) {
    const a = _alimentos.find(x => x.id === alimId);
    if (!a) return;
    a.excluido = excluido;
    nutriRenderPickerContent();
}

// ── Recetas ───────────────────────────────────────────
function nutriRecGetState(rIdx) {
    if (!_recetaState[rIdx]) {
        _recetaState[rIdx] = (PLAN_RECETAS[rIdx]?.ing || [])
            .map(ing => {
                const food = _alimentos.find(a => a.nombre.toLowerCase().includes(ing.buscar));
                return food ? { food, qty: ing.qty, step: 0.5, min: 0, max: 10 } : null;
            })
            .filter(Boolean);
    }
    return _recetaState[rIdx];
}

function nutriRecMacrosHtml(food, qty) {
    return `<span class="nf-chip prot">P${+(food.proteina*qty).toFixed(1)}g</span>` +
           `<span class="nf-chip carb">C${+(food.carbos*qty).toFixed(1)}g</span>` +
           `<span class="nf-chip gras">G${+(food.grasas*qty).toFixed(1)}g</span>` +
           `<span class="nf-chip fibra">F${+((food.fibra||0)*qty).toFixed(1)}g</span>`;
}

function nutriCalcRecetaTotalsFromState(rIdx) {
    let kcal=0, prot=0, carbs=0, grasas=0, fibra=0;
    (_recetaState[rIdx] || []).forEach(s => {
        kcal  += s.food.calorias * s.qty;
        prot  += s.food.proteina * s.qty;
        carbs += s.food.carbos   * s.qty;
        grasas += s.food.grasas  * s.qty;
        fibra += (s.food.fibra   || 0) * s.qty;
    });
    return { kcal:Math.round(kcal), prot:Math.round(prot), carbs:Math.round(carbs), grasas:Math.round(grasas), fibra:Math.round(fibra) };
}

function nutriRecetaTotalsHtml(t) {
    return `<span class="plan-tot-kcal">${t.kcal} kcal</span>
      <span class="nf-chip prot">P${t.prot}g</span>
      <span class="nf-chip carb">C${t.carbs}g</span>
      <span class="nf-chip gras">G${t.grasas}g</span>
      <span class="nf-chip fibra">F${t.fibra}g</span>`;
}

function nutriRenderRecetasPicker() {
    const cont = document.getElementById('picker-list');
    if (!cont) return;
    const srch = (document.getElementById('picker-search')?.value || '').toLowerCase();

    if (typeof PLAN_RECETAS === 'undefined' || !PLAN_RECETAS.length) {
        cont.innerHTML = `<div class="nf-vacio">Sin recetas disponibles</div>`;
        return;
    }

    const filtradas = PLAN_RECETAS
        .map((r, i) => ({ r, i }))
        .filter(({ r }) =>
            (_pickerRecCat === 'Todos' || r.cat === _pickerRecCat) &&
            (!srch || r.nombre.toLowerCase().includes(srch)));

    if (!filtradas.length) {
        cont.innerHTML = `<div class="nf-vacio">👨‍🍳 Sin resultados</div>`;
        return;
    }

    cont.innerHTML = filtradas.map(({ r, i: rIdx }) => {
        const state   = nutriRecGetState(rIdx);
        const totals  = nutriCalcRecetaTotalsFromState(rIdx);
        const addOpen = _recetaAddOpen === rIdx;

        const ingHtml = state.map((s, sIdx) => `
          <div class="plan-rec-ing">
            <span class="plan-rec-ing-emoji">${s.food.emoji || '🍽️'}</span>
            <div class="plan-rec-ing-info">
              <div class="plan-rec-ing-nombre">${s.food.nombre}</div>
              <div class="plan-rec-ing-sub">${s.food.porcion_desc}</div>
              <div class="plan-rec-ing-macros" id="rmacros-${rIdx}-${sIdx}">
                ${nutriRecMacrosHtml(s.food, s.qty)}
              </div>
            </div>
            <div class="plan-rec-qty">
              <button type="button" class="plan-rec-btn"
                      onclick="nutriRecAdjState(${rIdx},${sIdx},-0.5)">−</button>
              <span class="plan-rec-qty-val" id="rqty-${rIdx}-${sIdx}">${s.qty}</span>
              <button type="button" class="plan-rec-btn"
                      onclick="nutriRecAdjState(${rIdx},${sIdx},0.5)">+</button>
            </div>
            <span class="plan-rec-ing-kcal" id="rkcal-${rIdx}-${sIdx}">
              ${Math.round(s.food.calorias * s.qty)} kcal
            </span>
            <button type="button" class="plan-rec-del"
                    onclick="nutriRecRemoveIng(${rIdx},${sIdx})" title="Quitar">×</button>
          </div>`).join('');

        const inlinePanelHtml = addOpen ? nutriBuildInlineAddPanel(rIdx) : '';

        return `<div class="plan-receta-card">
          <div class="plan-receta-header">
            <div class="plan-receta-avatar">${r.emoji}</div>
            <div class="plan-receta-info">
              <div class="plan-receta-nombre">${r.nombre}</div>
              <div class="plan-receta-desc">${r.desc}</div>
            </div>
            <span class="plan-receta-cat">${r.cat}</span>
          </div>
          <div class="plan-receta-ings">
            ${state.length ? ingHtml : '<div class="plan-meal-empty">Sin ingredientes</div>'}
            ${inlinePanelHtml}
            <button type="button" class="plan-rec-add-ing-btn${addOpen ? ' activo' : ''}"
                    onclick="nutriRecToggleAdd(${rIdx})">
              ${addOpen ? '✕ Cancelar' : '＋ Agregar ingrediente'}
            </button>
          </div>
          <div class="plan-receta-footer">
            <div id="rtotals-${rIdx}" class="plan-receta-totals">
              ${nutriRecetaTotalsHtml(totals)}
            </div>
            <button type="button" class="nutri-btn-guardar plan-receta-add-btn"
                    onclick="nutriAddRecetaToMeal(${rIdx})">Agregar →</button>
          </div>
        </div>`;
    }).join('');
}

function nutriRecAdjState(rIdx, sIdx, delta) {
    const s = _recetaState[rIdx]?.[sIdx];
    if (!s) return;
    s.qty = Math.min(s.max, Math.max(s.min, Math.round((s.qty + delta) * 100) / 100));
    const qEl   = document.getElementById(`rqty-${rIdx}-${sIdx}`);
    const kEl   = document.getElementById(`rkcal-${rIdx}-${sIdx}`);
    const mEl   = document.getElementById(`rmacros-${rIdx}-${sIdx}`);
    const totEl = document.getElementById(`rtotals-${rIdx}`);
    if (qEl) qEl.textContent = s.qty;
    if (kEl) kEl.textContent = `${Math.round(s.food.calorias * s.qty)} kcal`;
    if (mEl) mEl.innerHTML   = nutriRecMacrosHtml(s.food, s.qty);
    if (totEl) totEl.innerHTML = nutriRecetaTotalsHtml(nutriCalcRecetaTotalsFromState(rIdx));
}

function nutriRecRemoveIng(rIdx, sIdx) {
    _recetaState[rIdx]?.splice(sIdx, 1);
    nutriRenderPickerContent();
}

function nutriRecToggleAdd(rIdx) {
    _recetaAddOpen = (_recetaAddOpen === rIdx) ? null : rIdx;
    _recetaAddCat  = 'Todos';
    _recetaAddQ    = '';
    nutriRenderPickerContent();
}

function nutriBuildInlineAddPanel(rIdx) {
    const cats = ['Todos', ...[...new Set(_alimentos.map(a => a.categoria))].sort()];
    const catHtml = cats.map(c =>
        `<button type="button" onclick="nutriRecPanelSetCat(${rIdx},'${c.replace(/'/g,"\\'")}')"
          data-ricat="${c}" class="nf-cat ${c === _recetaAddCat ? 'activo' : ''}">${c}</button>`
    ).join('');

    const q     = _recetaAddQ.toLowerCase();
    const lista = _alimentos.filter(a =>
        (_recetaAddCat === 'Todos' || a.categoria === _recetaAddCat) &&
        (!q || a.nombre.toLowerCase().includes(q)) &&
        !a.excluido
    );

    const foodHtml = lista.length
        ? lista.map(a => `
          <div class="nf-item nf-item-inline">
            <div class="nf-item-avatar">${a.emoji || '🍽️'}</div>
            <div class="nf-item-info">
              <div class="nf-item-nombre">${a.nombre}</div>
              <div class="nf-item-porcion">${a.porcion_desc} · <b>${a.calorias} kcal</b></div>
              <div class="nf-item-macros">
                <span class="nf-chip prot">P ${a.proteina}g</span>
                <span class="nf-chip carb">C ${a.carbos}g</span>
                <span class="nf-chip gras">G ${a.grasas}g</span>
                <span class="nf-chip fibra">F ${a.fibra}g</span>
              </div>
            </div>
            <div class="nf-item-actions">
              <button type="button" class="nf-item-add"
                      onclick="nutriRecAddIng(${rIdx},${a.id})">+ Agregar</button>
            </div>
          </div>`).join('')
        : '<div class="nf-vacio">🔍 Sin resultados</div>';

    return `<div class="plan-rec-inline-add">
      <div class="plan-rec-inline-srch-wrap">
        <input type="text" id="rec-inline-srch-${rIdx}"
               class="plan-rec-inline-srch"
               value="${_recetaAddQ.replace(/"/g,'&quot;')}"
               placeholder="🔍 Buscar alimento..."
               oninput="nutriRecPanelSearch(${rIdx},this.value)">
      </div>
      <div class="plan-rec-inline-cats" id="rec-inline-cats-${rIdx}">${catHtml}</div>
      <div class="plan-rec-inline-list" id="rec-panel-list-${rIdx}">${foodHtml}</div>
    </div>`;
}

function nutriRecPanelSetCat(rIdx, cat) {
    _recetaAddCat = cat;
    _recetaAddQ   = '';
    document.querySelectorAll('[data-ricat]').forEach(b =>
        b.classList.toggle('activo', b.dataset.ricat === cat));
    const inp = document.getElementById(`rec-inline-srch-${rIdx}`);
    if (inp) inp.value = '';
    nutriUpdateInlinePanelList(rIdx);
}

function nutriRecPanelSearch(rIdx, val) {
    _recetaAddQ = val;
    nutriUpdateInlinePanelList(rIdx);
}

function nutriUpdateInlinePanelList(rIdx) {
    const el = document.getElementById(`rec-panel-list-${rIdx}`);
    if (!el) return;
    const q     = _recetaAddQ.toLowerCase();
    const lista = _alimentos.filter(a =>
        (_recetaAddCat === 'Todos' || a.categoria === _recetaAddCat) &&
        (!q || a.nombre.toLowerCase().includes(q)) &&
        !a.excluido
    );
    el.innerHTML = lista.length
        ? lista.map(a => `
          <div class="nf-item nf-item-inline">
            <div class="nf-item-avatar">${a.emoji || '🍽️'}</div>
            <div class="nf-item-info">
              <div class="nf-item-nombre">${a.nombre}</div>
              <div class="nf-item-porcion">${a.porcion_desc} · <b>${a.calorias} kcal</b></div>
              <div class="nf-item-macros">
                <span class="nf-chip prot">P ${a.proteina}g</span>
                <span class="nf-chip carb">C ${a.carbos}g</span>
                <span class="nf-chip gras">G ${a.grasas}g</span>
                <span class="nf-chip fibra">F ${a.fibra}g</span>
              </div>
            </div>
            <div class="nf-item-actions">
              <button type="button" class="nf-item-add"
                      onclick="nutriRecAddIng(${rIdx},${a.id})">+ Agregar</button>
            </div>
          </div>`).join('')
        : '<div class="nf-vacio">🔍 Sin resultados</div>';
}

function nutriRecAddIng(rIdx, foodId) {
    const food = _alimentos.find(a => a.id === foodId);
    if (!food) return;
    nutriRecGetState(rIdx);
    _recetaState[rIdx].push({ food, qty: 1, step: 0.5, min: 0, max: 10 });
    _recetaAddOpen = null;
    _recetaAddCat  = 'Todos';
    _recetaAddQ    = '';
    nutriToast(`✓ ${food.nombre} agregado a la receta`);
    nutriRenderPickerContent();
}

function nutriAddRecetaToMeal(rIdx) {
    const state = _recetaState[rIdx] || nutriRecGetState(rIdx);
    let added   = 0;
    state.forEach(s => {
        if (s.qty <= 0) return;
        _planSel[_pickerMeal].push({ ...s.food, alimento_id: s.food.id, porciones: s.qty });
        added++;
    });
    if (!added) { nutriToast('Sin ingredientes en la receta'); return; }
    _recetaState[rIdx] = null;
    nutriClosePicker();
    nutriGuardarPlanLocal();
    renderPlanRoot();
    const r     = PLAN_RECETAS[rIdx];
    const mName = PLAN_MEALS.find(m => m.key === _pickerMeal)?.label || _pickerMeal;
    nutriToast(`🍳 ${r.nombre} → ${mName}`);
}

// ══════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════
function nutriToast(msg) {
    let el = document.getElementById('nutri-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'nutri-toast';
        el.className = 'nutri-toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.remove('mostrar');
    void el.offsetWidth;
    el.classList.add('mostrar');
    clearTimeout(window._nutriToastTimer);
    window._nutriToastTimer = setTimeout(() => el.classList.remove('mostrar'), 2200);
}

document.addEventListener('click', function(e) {
    ['modalNutriBMR','modalNutriMiBand','nutri-suple-modal','food-picker-modal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal && e.target === modal) modal.classList.add('nutri-modal-hidden');
    });

    if (nutriTemaMenuOpen) {
        const menu = document.getElementById('n-theme-menu');
        const btn  = document.getElementById('n-theme-btn');
        if (menu && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
            nutriToggleThemeMenu();
        }
    }
});
