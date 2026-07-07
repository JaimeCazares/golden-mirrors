// ruleta/ruleta.js

const RL_CATS = [
    { key:'fisicas',       emoji:'🏃',  titulo:'Físicas',       color:'#f97316' },
    { key:'sociales',      emoji:'🎉',  titulo:'Sociales',      color:'#a855f7' },
    { key:'intelectuales', emoji:'🧠',  titulo:'Intelectuales', color:'#3b82f6' },
    { key:'creativas',     emoji:'🎨',  titulo:'Creativas',     color:'#22c55e' },
    { key:'emocionales',   emoji:'❤️', titulo:'Emocionales',   color:'#ec4899' },
];

const RL_ACTS = {
    fisicas: [
        'Caminata larga por la naturaleza o excursión',
        'Sesión de yoga en pareja',
        'Vayan a bailar',
        'Paseo en auto por paisajes bonitos',
        'Noche de spa en casa',
        'Vayan a nadar juntos',
        'Prueben un deporte nuevo juntos',
        'Desafío de ejercicio como equipo',
        'Patinar sobre hielo o con patines',
        'Caminata al amanecer o al atardecer',
    ],
    sociales: [
        'Cena o noche de juegos en casa',
        'Clase de cocina juntos',
        'Sean voluntarios en una causa local',
        'Visiten un mercado local o feria',
        'Vayan a un evento en vivo',
        'Día de salida con amigos',
        'Asistan a un festival cultural o de comida',
        'Hagan una cata de vinos o café',
        'Únanse a una noche de trivia en equipo',
        'Exploren un lugar nuevo como turistas',
    ],
    intelectuales: [
        'Lean el mismo libro y discutan sobre él',
        'Visiten un museo o galería de arte',
        'Tomen una clase juntos',
        'Vean un documental y tengan una charla después',
        'Escriban historias cortas o poemas el uno para el otro',
        'Hagan un rompecabezas o acertijo mental',
        'Comiencen un diario juntos',
        'Planeen su viaje soñado con todos los detalles',
        'Hagan un proyecto de bricolaje o mejora del hogar',
    ],
    creativas: [
        'Píntense o dibújense el uno al otro',
        'Cocinen o preparen una receta completamente nueva',
        'Reorganicen o redecoren una habitación',
        'Creen un vision board para su futuro juntos',
        'Graben un video divertido juntos',
        'Construyan algo: muebles, Lego o una casa para pájaros',
        'Escriban una canción o creen una playlist el uno para el otro',
        'Creen una noche de cita con un tema especial',
    ],
    emocionales: [
        'Miren las estrellas y hablen sobre la vida',
        'Tengan una cena sin distracciones',
        'Escríbanse cartas de amor',
        'Jueguen a "conóceme mejor" o preguntas de pareja',
        'Caminata silenciosa o meditación juntos',
        'Noche de abrazos sin TV, solo música',
        'Hablen sobre sus metas y sueños',
        'Revisiten el lugar de su primera cita',
        'Planeen una cita sorpresa el uno para el otro',
    ],
};

// ── State ─────────────────────────────────────────────────────────────────────
let rlState = {
    catAngle: 0,
    actAngle: 0,
    spinning: false,
    animId:   null,
    selectedCat: null,  // 0-4
};

function rlSt()       { try { return JSON.parse(localStorage.getItem('rl_prog') || '{}'); } catch { return {}; } }
function rlSaveSt(s)  { localStorage.setItem('rl_prog', JSON.stringify(s)); }
function rlKey(k, i)  { return `${k}_${i}`; }

// ── Init ──────────────────────────────────────────────────────────────────────
window.initRuleta = function () {
    if (rlState.animId) cancelAnimationFrame(rlState.animId);
    rlState = { catAngle:0, actAngle:0, spinning:false, animId:null, selectedCat:null };
    rlDrawCatWheel(0);
    rlDrawActWheelIdle();
    rlBuildPanels();
};

// ── Color helpers ─────────────────────────────────────────────────────────────
function rlHexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rlDarken(hex, t) {
    const [r,g,b] = rlHexRgb(hex);
    return `rgb(${Math.round(r*t)},${Math.round(g*t)},${Math.round(b*t)})`;
}
function rlAlpha(hex, a) {
    const [r,g,b] = rlHexRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}

// ── Draw category wheel ───────────────────────────────────────────────────────
function rlDrawCatWheel(angleDeg) {
    const cv = document.getElementById('rl-cat-c');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, cx = W/2, cy = H/2, r = cx - 4;
    const n = RL_CATS.length, slice = (2*Math.PI)/n;
    const off = -Math.PI/2 + angleDeg * Math.PI/180;

    ctx.clearRect(0, 0, W, H);

    RL_CATS.forEach((cat, i) => {
        const s = off + i*slice, e = s + slice, m = s + slice/2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, s, e);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? cat.color : rlDarken(cat.color, 0.75);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Emoji
        ctx.font = '26px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.emoji, cx + Math.cos(m)*r*0.64, cy + Math.sin(m)*r*0.64);
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Hub
    const g = ctx.createRadialGradient(cx-3, cy-3, 2, cx, cy, 20);
    g.addColorStop(0, '#3b2a5a');
    g.addColorStop(1, '#0e0818');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2*Math.PI);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💞', cx, cy);
}

// ── Draw activity wheel (idle) ────────────────────────────────────────────────
function rlDrawActWheelIdle() {
    const cv = document.getElementById('rl-act-c');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const cx = cv.width/2, cy = cv.height/2, r = cx - 4;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.fillStyle = '#1c1430';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155,114,208,0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// ── Draw activity wheel (loaded) ──────────────────────────────────────────────
function rlDrawActWheel(angleDeg) {
    const cv = document.getElementById('rl-act-c');
    if (!cv || rlState.selectedCat === null) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, cx = W/2, cy = H/2, r = cx - 4;
    const cat = RL_CATS[rlState.selectedCat];
    const lista = RL_ACTS[cat.key];
    const prog = rlSt();
    const n = lista.length;
    const slice = (2*Math.PI)/n;
    const off = -Math.PI/2 + angleDeg * Math.PI/180;

    ctx.clearRect(0, 0, W, H);

    lista.forEach((act, i) => {
        const s = off + i*slice, e = s + slice, m = s + slice/2;
        const state = prog[rlKey(cat.key, i)] || 'pending';

        let col;
        if      (state === 'done')       col = '#2a1f3d';
        else if (state === 'inprogress') col = '#92400e';
        else                              col = i % 2 === 0 ? cat.color : rlDarken(cat.color, 0.72);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, s, e);
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number label
        const dist = r * 0.64;
        const lx = cx + Math.cos(m)*dist;
        const ly = cy + Math.sin(m)*dist;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(m + Math.PI/2);
        ctx.fillStyle = state === 'done' ? 'rgba(255,255,255,0.25)' : '#fff';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, 0, 0);
        ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2*Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Hub
    const g = ctx.createRadialGradient(cx-3, cy-3, 2, cx, cy, 20);
    g.addColorStop(0, '#3b2a5a');
    g.addColorStop(1, '#0e0818');
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2*Math.PI);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💕', cx, cy);
}

// ── Spin helpers ──────────────────────────────────────────────────────────────
function rlSpin(angleRef, drawFn, n, onDone) {
    if (rlState.spinning) return;
    rlState.spinning = true;

    const sliceDeg = 360 / n;
    const target   = Math.floor(Math.random() * n);
    const base     = (360 - target * sliceDeg - sliceDeg/2 + 360) % 360;
    const jitter   = (Math.random() - 0.5) * sliceDeg * 0.5;
    const total    = 1440 + Math.random()*720 + base + jitter;

    const duration = 3600;
    const start    = angleRef[0];
    const t0       = performance.now();

    function step(now) {
        const elapsed = now - t0;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        angleRef[0] = start + total * ease;
        drawFn(angleRef[0]);

        if (t < 1) {
            rlState.animId = requestAnimationFrame(step);
        } else {
            rlState.spinning = false;
            const normR = ((angleRef[0] % 360) + 360) % 360;
            const ptr   = ((360 - normR) % 360 + 360) % 360;
            const seg   = Math.floor(ptr / sliceDeg) % n;
            onDone(seg);
        }
    }

    rlState.animId = requestAnimationFrame(step);
}

// ── Spin category ─────────────────────────────────────────────────────────────
function rlSpinCat() {
    const btn = document.getElementById('rl-cat-btn');
    if (btn) btn.disabled = true;
    document.getElementById('rl-cat-result').style.display = 'none';

    const angleRef = [rlState.catAngle];
    rlSpin(angleRef, rlDrawCatWheel, RL_CATS.length, (seg) => {
        rlState.catAngle    = angleRef[0];
        rlState.selectedCat = seg;
        if (btn) btn.disabled = false;
        rlShowCatResult(seg);
        rlInitActWheel(seg);
    });
}

function rlShowCatResult(seg) {
    const cat = RL_CATS[seg];
    const el  = document.getElementById('rl-cat-result');
    el.style.display    = 'flex';
    el.style.alignItems = 'center';
    el.style.gap        = '6px';
    el.style.color      = cat.color;
    el.style.borderColor = rlAlpha(cat.color, 0.4);
    el.style.background = rlAlpha(cat.color, 0.1);
    el.textContent      = `${cat.emoji} ${cat.titulo} elegidas`;
    void el.offsetWidth; // retrigger animation
    el.style.animation  = 'none';
    requestAnimationFrame(() => { el.style.animation = ''; });
}

function rlInitActWheel(catIdx) {
    // Unlock wheel 2
    const lock = document.getElementById('rl-canvas-lock');
    if (lock) lock.classList.add('rl-unlocked');
    const actBtn = document.getElementById('rl-act-btn');
    if (actBtn) actBtn.disabled = false;
    document.getElementById('rl-act-result').style.display = 'none';

    rlState.actAngle = 0;
    rlDrawActWheel(0);
}

// ── Spin activity ─────────────────────────────────────────────────────────────
function rlSpinAct() {
    if (rlState.selectedCat === null) return;
    const cat   = RL_CATS[rlState.selectedCat];
    const lista = RL_ACTS[cat.key];
    const btn   = document.getElementById('rl-act-btn');
    if (btn) btn.disabled = true;
    document.getElementById('rl-act-result').style.display = 'none';

    const angleRef = [rlState.actAngle];
    rlSpin(angleRef, rlDrawActWheel, lista.length, (seg) => {
        rlState.actAngle = angleRef[0];
        if (btn) btn.disabled = false;
        rlMarkInProgress(cat.key, seg);
        rlShowActResult(cat, seg);
        rlBuildPanels();
        rlScrollToAct(cat.key, seg);
    });
}

function rlMarkInProgress(catKey, idx) {
    const prog = rlSt();
    // Only set to inprogress if not already done
    const cur = prog[rlKey(catKey, idx)] || 'pending';
    if (cur !== 'done') prog[rlKey(catKey, idx)] = 'inprogress';
    rlSaveSt(prog);
}

function rlShowActResult(cat, idx) {
    const act = RL_ACTS[cat.key][idx];
    const el  = document.getElementById('rl-act-result');
    el.style.display    = 'block';
    el.style.borderColor = rlAlpha(cat.color, 0.45);
    el.style.background  = rlAlpha(cat.color, 0.1);
    el.innerHTML = `
        <div style="font-size:0.65rem;font-weight:800;letter-spacing:.1em;color:${cat.color};margin-bottom:5px">
            ${cat.emoji} ${cat.titulo.toUpperCase()}
        </div>
        <div>${act}</div>
    `;
    void el.offsetWidth;
    el.style.animation = 'none';
    requestAnimationFrame(() => { el.style.animation = ''; });
}

function rlScrollToAct(catKey, idx) {
    setTimeout(() => {
        const row = document.getElementById(`rl-row-${rlKey(catKey, idx)}`);
        if (row) {
            row.classList.remove('rl-just-selected');
            void row.offsetWidth;
            row.classList.add('rl-just-selected');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// ── Build panels ──────────────────────────────────────────────────────────────
function rlBuildPanels() {
    const prog = rlSt();
    const el   = document.getElementById('rl-panels');
    if (!el) return;

    el.innerHTML = RL_CATS.map(cat => {
        const lista = RL_ACTS[cat.key];
        const rows  = lista.map((act, i) => {
            const key   = rlKey(cat.key, i);
            const state = prog[key] || 'pending';
            const numLabel = String(i + 1).padStart(2, '0');

            let chkContent, badge = '';
            if      (state === 'done')       { chkContent = '✓'; badge = `<span class="rl-badge rl-badge--done">HECHA</span>`; }
            else if (state === 'inprogress') { chkContent = '…'; badge = `<span class="rl-badge rl-badge--proc">EN PROCESO</span>`; }
            else                              { chkContent = ''; }

            return `
                <div class="rl-act-row" id="rl-row-${key}" data-state="${state}">
                    <span class="rl-act-num">${numLabel}</span>
                    <span class="rl-act-name">${act}</span>
                    <div class="rl-act-right">
                        ${badge}
                        <button class="rl-chk" onclick="rlToggle('${key}')">${chkContent}</button>
                    </div>
                </div>`;
        }).join('');

        const progress = lista.filter((_, i) => (prog[rlKey(cat.key, i)] || 'pending') === 'done').length;

        return `
            <div class="rl-panel">
                <div class="rl-panel-head"
                     style="color:${cat.color};background:${rlAlpha(cat.color, 0.1)};">
                    ${cat.emoji}&nbsp;${cat.titulo}
                    <span style="margin-left:auto;font-weight:400;font-size:0.65rem;color:${rlAlpha(cat.color, 0.7)};letter-spacing:.05em">
                        ${progress}/${lista.length}
                    </span>
                </div>
                <div class="rl-panel-items">${rows}</div>
            </div>`;
    }).join('');
}

// ── Toggle done ───────────────────────────────────────────────────────────────
window.rlToggle = function (key) {
    const prog = rlSt();
    const cur  = prog[key] || 'pending';
    if      (cur === 'done')       delete prog[key];           // undo → pending
    else if (cur === 'inprogress') prog[key] = 'done';         // in-progress → done
    else                            prog[key] = 'done';         // pending → done
    rlSaveSt(prog);
    rlBuildPanels();
    // Redraw act wheel to reflect new state
    if (rlState.selectedCat !== null) rlDrawActWheel(rlState.actAngle);
};
