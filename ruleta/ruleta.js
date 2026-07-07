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
        'Escriban historias o poemas el uno para el otro',
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
        'Escriban una canción o playlist el uno para el otro',
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

// ── Estado ────────────────────────────────────────────────────────────────────
let rl = { catAngle:0, actAngle:0, spinning:false, animId:null, selectedCat:null };

function rlSt()      { try { return JSON.parse(localStorage.getItem('rl_prog')||'{}'); } catch { return {}; } }
function rlSaveSt(s) { localStorage.setItem('rl_prog', JSON.stringify(s)); }
function rlKey(k,i)  { return `${k}_${i}`; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function rlRgb(hex) {
    const n = parseInt(hex.slice(1),16);
    return [(n>>16)&255,(n>>8)&255,n&255];
}
function rlDark(hex,t) { const [r,g,b]=rlRgb(hex); return `rgb(${Math.round(r*t)},${Math.round(g*t)},${Math.round(b*t)})`; }
function rlA(hex,a)    { const [r,g,b]=rlRgb(hex); return `rgba(${r},${g},${b},${a})`; }

function rlShortLabel(str) {
    // Show first 2 words, max 12 chars
    const words = str.split(' ');
    let out = words[0];
    if (words[1] && (out+' '+words[1]).length <= 12) out += ' '+words[1];
    return out.length > 13 ? out.slice(0,12)+'…' : out;
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.initRuleta = function () {
    if (rl.animId) cancelAnimationFrame(rl.animId);
    rl = { catAngle:0, actAngle:0, spinning:false, animId:null, selectedCat:null };

    // Permitir scroll en el contenedor padre
    const cm = document.getElementById('contenido-modulo');
    if (cm) { cm.style.overflow = 'hidden'; cm.style.height = '100%'; }
    const vd = document.getElementById('vista-dinamica');
    if (vd) { vd.style.overflow = 'hidden'; }

    rlDrawCatWheel(0);
    rlDrawActWheelIdle();
    rlBuildPanels();
};

// ── Dibujo rueda categorías ───────────────────────────────────────────────────
function rlDrawCatWheel(angleDeg) {
    const cv = document.getElementById('rl-cat-c');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W=cv.width, H=cv.height, cx=W/2, cy=H/2, r=cx-3;
    const n=RL_CATS.length, slice=(2*Math.PI)/n;
    const off = -Math.PI/2 + angleDeg*Math.PI/180;

    ctx.clearRect(0,0,W,H);

    RL_CATS.forEach((cat,i) => {
        const s=off+i*slice, e=s+slice, m=s+slice/2;
        const col = i%2===0 ? cat.color : rlDark(cat.color,0.72);

        // Sector
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,r,s,e);
        ctx.closePath();
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Emoji (60% radio)
        const ed = r*0.60;
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.emoji, cx+Math.cos(m)*ed, cy+Math.sin(m)*ed);

        // Nombre de categoría girado radialmente (80% radio)
        const td = r*0.82;
        ctx.save();
        ctx.translate(cx+Math.cos(m)*td, cy+Math.sin(m)*td);
        ctx.rotate(m + Math.PI/2);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = 'bold 8px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.titulo.toUpperCase(), 0, 0);
        ctx.restore();
    });

    // Anillo exterior
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,2*Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Centro
    const g=ctx.createRadialGradient(cx-3,cy-3,2,cx,cy,18);
    g.addColorStop(0,'#3b2a5a'); g.addColorStop(1,'#0e0818');
    ctx.beginPath(); ctx.arc(cx,cy,18,0,2*Math.PI);
    ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=2; ctx.stroke();
    ctx.font='12px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💞',cx,cy);
}

// ── Dibujo rueda actividades (vacía) ──────────────────────────────────────────
function rlDrawActWheelIdle() {
    const cv = document.getElementById('rl-act-c');
    if (!cv) return;
    const ctx=cv.getContext('2d'), cx=cv.width/2, cy=cv.height/2, r=cx-3;
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
    ctx.fillStyle='#1c1430'; ctx.fill();
    ctx.strokeStyle='rgba(139,92,246,0.12)'; ctx.lineWidth=3; ctx.stroke();
}

// ── Dibujo rueda actividades (activa) ─────────────────────────────────────────
function rlDrawActWheel(angleDeg) {
    const cv = document.getElementById('rl-act-c');
    if (!cv || rl.selectedCat===null) return;
    const ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height, cx=W/2, cy=H/2, r=cx-3;
    const cat=RL_CATS[rl.selectedCat], lista=RL_ACTS[cat.key];
    const prog=rlSt(), n=lista.length;
    const slice=(2*Math.PI)/n, off=-Math.PI/2+angleDeg*Math.PI/180;

    ctx.clearRect(0,0,W,H);

    lista.forEach((act,i) => {
        const s=off+i*slice, e=s+slice, m=s+slice/2;
        const state=prog[rlKey(cat.key,i)]||'pending';

        let col;
        if      (state==='done')       col='#2a1f3d';
        else if (state==='inprogress') col='#92400e';
        else                            col=i%2===0 ? cat.color : rlDark(cat.color,0.70);

        // Sector
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,r,s,e);
        ctx.closePath();
        ctx.fillStyle=col; ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=2; ctx.stroke();

        // Número (65% radio)
        const nd=r*0.65;
        ctx.save();
        ctx.translate(cx+Math.cos(m)*nd, cy+Math.sin(m)*nd);
        ctx.rotate(m+Math.PI/2);
        ctx.fillStyle = state==='done' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(i+1, 0, -5);

        // Etiqueta corta (debajo del número)
        ctx.fillStyle = state==='done' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)';
        ctx.font = '6.5px system-ui';
        ctx.fillText(rlShortLabel(act), 0, 5);
        ctx.restore();
    });

    // Anillo
    ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
    ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=4; ctx.stroke();

    // Centro
    const g=ctx.createRadialGradient(cx-3,cy-3,2,cx,cy,18);
    g.addColorStop(0,'#3b2a5a'); g.addColorStop(1,'#0e0818');
    ctx.beginPath(); ctx.arc(cx,cy,18,0,2*Math.PI);
    ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2; ctx.stroke();
    ctx.font='11px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💕',cx,cy);
}

// ── Motor de giro genérico ────────────────────────────────────────────────────
function rlSpin(angleRef, drawFn, n, onDone) {
    if (rl.spinning) return;
    rl.spinning = true;

    const sliceDeg = 360/n;
    const target   = Math.floor(Math.random()*n);
    const base     = (360 - target*sliceDeg - sliceDeg/2 + 360) % 360;
    const jitter   = (Math.random()-0.5)*sliceDeg*0.5;
    const total    = 1440 + Math.random()*720 + base + jitter;

    const duration=3600, start=angleRef[0], t0=performance.now();

    function step(now) {
        const t = Math.min((now-t0)/duration, 1);
        const ease = 1-Math.pow(1-t,3);
        angleRef[0] = start + total*ease;
        drawFn(angleRef[0]);
        if (t<1) { rl.animId=requestAnimationFrame(step); }
        else {
            rl.spinning=false;
            const normR=((angleRef[0]%360)+360)%360;
            const ptr=((360-normR)%360+360)%360;
            onDone(Math.floor(ptr/sliceDeg)%n);
        }
    }
    rl.animId=requestAnimationFrame(step);
}

// ── Girar categoría ───────────────────────────────────────────────────────────
function rlSpinCat() {
    const btn=document.getElementById('rl-cat-btn');
    if (btn) btn.disabled=true;
    document.getElementById('rl-cat-result').style.display='none';

    const aRef=[rl.catAngle];
    rlSpin(aRef, rlDrawCatWheel, RL_CATS.length, seg => {
        rl.catAngle=aRef[0];
        rl.selectedCat=seg;
        if (btn) btn.disabled=false;
        // Mostrar badge de categoría
        const cat=RL_CATS[seg], el=document.getElementById('rl-cat-result');
        el.style.display='flex'; el.style.alignItems='center'; el.style.gap='5px';
        el.style.color=cat.color; el.style.borderColor=rlA(cat.color,0.4);
        el.style.background=rlA(cat.color,0.1); el.style.animation='none';
        el.textContent=`${cat.emoji} ${cat.titulo} elegidas`;
        requestAnimationFrame(()=>{ el.style.animation=''; });
        // Activar rueda 2
        rl.actAngle=0;
        rlDrawActWheel(0);
        const lock=document.getElementById('rl-canvas-lock');
        if (lock) lock.classList.add('rl-unlocked');
        const actBtn=document.getElementById('rl-act-btn');
        if (actBtn) actBtn.disabled=false;
        document.getElementById('rl-act-result').style.display='none';
    });
}

// ── Girar actividad ───────────────────────────────────────────────────────────
function rlSpinAct() {
    if (rl.selectedCat===null) return;
    const cat=RL_CATS[rl.selectedCat], lista=RL_ACTS[cat.key];
    const btn=document.getElementById('rl-act-btn');
    if (btn) btn.disabled=true;
    document.getElementById('rl-act-result').style.display='none';

    const aRef=[rl.actAngle];
    rlSpin(aRef, rlDrawActWheel, lista.length, seg => {
        rl.actAngle=aRef[0];
        if (btn) btn.disabled=false;
        // Marcar en proceso
        const prog=rlSt();
        const key=rlKey(cat.key,seg);
        if ((prog[key]||'pending')!=='done') prog[key]='inprogress';
        rlSaveSt(prog);
        rlDrawActWheel(rl.actAngle);
        // Mostrar resultado completo
        const act=lista[seg];
        const el=document.getElementById('rl-act-result');
        el.style.display='block';
        el.style.borderColor=rlA(cat.color,0.45);
        el.style.background=rlA(cat.color,0.1);
        el.innerHTML=`<div style="font-size:.6rem;font-weight:800;letter-spacing:.1em;color:${cat.color};margin-bottom:5px">${cat.emoji} ${cat.titulo.toUpperCase()}</div><div>${act}</div>`;
        el.style.animation='none';
        requestAnimationFrame(()=>{ el.style.animation=''; });
        // Actualizar paneles y hacer scroll a la actividad
        rlBuildPanels();
        setTimeout(()=>{
            const row=document.getElementById(`rl-row-${key}`);
            if (row) {
                row.classList.remove('rl-flash');
                void row.offsetWidth;
                row.classList.add('rl-flash');
                row.scrollIntoView({ behavior:'smooth', block:'center' });
            }
        }, 120);
    });
}

// ── Paneles de actividades ────────────────────────────────────────────────────
function rlBuildPanels() {
    const prog=rlSt();
    const el=document.getElementById('rl-panels');
    if (!el) return;

    el.innerHTML = RL_CATS.map(cat => {
        const lista=RL_ACTS[cat.key];
        const done=lista.filter((_,i)=>(prog[rlKey(cat.key,i)]||'pending')==='done').length;

        const rows=lista.map((act,i) => {
            const key=rlKey(cat.key,i);
            const state=prog[key]||'pending';
            const num=String(i+1).padStart(2,'0');
            let chk='', badge='';
            if (state==='done')       { chk='✓'; badge=`<span class="rl-badge rl-badge--done">HECHA</span>`; }
            else if (state==='inprogress') { chk='…'; badge=`<span class="rl-badge rl-badge--proc">EN PROCESO</span>`; }
            return `
                <div class="rl-act-row" id="rl-row-${key}" data-state="${state}">
                    <span class="rl-act-num">${num}</span>
                    <span class="rl-act-name">${act}</span>
                    <div class="rl-act-right">${badge}<button class="rl-chk" onclick="rlToggle('${key}')">${chk}</button></div>
                </div>`;
        }).join('');

        return `
            <div class="rl-panel">
                <div class="rl-panel-head" style="color:${cat.color};background:${rlA(cat.color,0.1)}">
                    ${cat.emoji}&nbsp;${cat.titulo}
                    <span style="margin-left:auto;font-weight:400;opacity:.7;font-size:.6rem">${done}/${lista.length} hechas</span>
                </div>
                <div class="rl-panel-items">${rows}</div>
            </div>`;
    }).join('');
}

// ── Toggle hecha ──────────────────────────────────────────────────────────────
window.rlToggle = function(key) {
    const prog=rlSt();
    const cur=prog[key]||'pending';
    if (cur==='done') delete prog[key];
    else prog[key]='done';
    rlSaveSt(prog);
    rlBuildPanels();
    if (rl.selectedCat!==null) rlDrawActWheel(rl.actAngle);
};
