// ruleta/ruleta.js

const CATEGORIAS_RULETA = [
    { key: 'fisicas',       emoji: '🏃',  titulo: 'FÍSICAS',       color: '#f97316' },
    { key: 'sociales',      emoji: '🎉',  titulo: 'SOCIALES',      color: '#a855f7' },
    { key: 'intelectuales', emoji: '🧠',  titulo: 'INTELECTUALES', color: '#3b82f6' },
    { key: 'creativas',     emoji: '🎨',  titulo: 'CREATIVAS',     color: '#22c55e' },
    { key: 'emocionales',   emoji: '❤️', titulo: 'EMOCIONALES',   color: '#ec4899' },
];

const ACTIVIDADES_RULETA = {
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

let _ruleAngle   = 0;
let _ruleSpinning = false;
let _ruleAnimId  = null;

// ─── init ────────────────────────────────────────────────────────────────────
window.initRuleta = function () {
    _ruleAngle    = 0;
    _ruleSpinning = false;
    if (_ruleAnimId) { cancelAnimationFrame(_ruleAnimId); _ruleAnimId = null; }
    dibujarRuleta(0);
    _buildLegend();
};

function _buildLegend() {
    const el = document.getElementById('ruleta-legend');
    if (!el) return;
    el.innerHTML = CATEGORIAS_RULETA.map(cat => `
        <div class="ruleta-legend-item">
            <span class="ruleta-legend-dot" style="background:${cat.color}"></span>
            ${cat.emoji} ${cat.titulo}
        </div>
    `).join('');
}

// ─── dibujo ───────────────────────────────────────────────────────────────────
function dibujarRuleta(angleDeg) {
    const canvas = document.getElementById('ruleta-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const r  = Math.min(cx, cy) - 3;
    const n  = CATEGORIAS_RULETA.length;
    const sliceRad  = (2 * Math.PI) / n;
    const offsetRad = -Math.PI / 2 + (angleDeg * Math.PI / 180);

    ctx.clearRect(0, 0, W, H);

    CATEGORIAS_RULETA.forEach((cat, i) => {
        const startRad = offsetRad + i * sliceRad;
        const endRad   = startRad + sliceRad;
        const midRad   = (startRad + endRad) / 2;

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = cat.color;
        ctx.fill();

        // Lighter inner arc for depth
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r * 0.42, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fill();

        // Divider lines
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startRad, endRad);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Emoji
        const ed = r * 0.65;
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.emoji, cx + Math.cos(midRad) * ed, cy + Math.sin(midRad) * ed);
    });

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center hub gradient
    const grad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 22);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(1, '#0f172a');
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center icon
    ctx.font = '15px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💞', cx, cy);
}

// ─── spin ─────────────────────────────────────────────────────────────────────
function girarRuleta() {
    if (_ruleSpinning) return;

    const btn      = document.getElementById('ruleta-girar-btn');
    const resultEl = document.getElementById('ruleta-resultado');

    if (btn)      btn.disabled = true;
    if (resultEl) resultEl.style.display = 'none';

    _ruleSpinning = true;

    // Pick target segment and calculate final angle
    const n          = CATEGORIAS_RULETA.length;
    const sliceDeg   = 360 / n;
    const targetSeg  = Math.floor(Math.random() * n);
    const extraSpins = 1440 + Math.random() * 720;          // 4–6 full rotations
    const baseAngle  = (360 - targetSeg * sliceDeg - sliceDeg / 2 + 360) % 360;
    const jitter     = (Math.random() - 0.5) * (sliceDeg * 0.55);
    const totalSpin  = extraSpins + baseAngle + jitter;

    const duration  = 3800;
    const startAngle = _ruleAngle;
    const startTime  = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);
        _ruleAngle = startAngle + totalSpin * ease;
        dibujarRuleta(_ruleAngle);

        if (t < 1) {
            _ruleAnimId = requestAnimationFrame(step);
        } else {
            _ruleSpinning = false;
            if (btn) btn.disabled = false;

            // Determine which segment ended up at the pointer (top)
            const normR       = ((_ruleAngle % 360) + 360) % 360;
            const ptrAngle    = ((360 - normR) % 360 + 360) % 360;
            const selectedSeg = Math.floor(ptrAngle / sliceDeg) % n;
            mostrarResultado(selectedSeg);
        }
    }

    _ruleAnimId = requestAnimationFrame(step);
}

// ─── result ───────────────────────────────────────────────────────────────────
function mostrarResultado(segIndex) {
    const cat       = CATEGORIAS_RULETA[segIndex];
    const lista     = ACTIVIDADES_RULETA[cat.key];
    const actividad = lista[Math.floor(Math.random() * lista.length)];

    const el = document.getElementById('ruleta-resultado');
    if (!el) return;

    el.style.display    = 'block';
    el.style.background = `linear-gradient(135deg, ${cat.color}28, ${cat.color}10)`;
    el.style.borderColor = cat.color + '44';

    el.innerHTML = `
        <div class="ruleta-resultado-emoji">${cat.emoji}</div>
        <div class="ruleta-resultado-cat" style="color:${cat.color}">${cat.titulo}</div>
        <div class="ruleta-resultado-actividad">${actividad}</div>
        <button class="ruleta-otra-btn" style="color:${cat.color}"
                onclick="mostrarResultado(${segIndex})">
            Otra de esta categoría ↻
        </button>
    `;
}
