// ══════════════════════════════════════════════════════
// TAB · Plan nutricional v2
// ══════════════════════════════════════════════════════

let _alimentos  = [];
let _planSel    = { desayuno:[], colacion_am:[], comida:[], colacion_pm:[], cena:[] };
let _planAct    = 1.4;
let _pickerMeal = null;
let _pickerCat  = 'Todos';
let _pickerTab  = 'alimentos';
let _pickerRecCat = 'Todos';

const MEALS = [
  { key:'desayuno',    label:'🌅 Desayuno',    hora:'7:30',  pct:.25 },
  { key:'colacion_am', label:'🍎 Colación AM', hora:'10:30', pct:.10 },
  { key:'comida',      label:'🍽 Comida',      hora:'2:00',  pct:.35 },
  { key:'colacion_pm', label:'🥑 Colación PM', hora:'5:30',  pct:.10 },
  { key:'cena',        label:'🌙 Cena',        hora:'8:00',  pct:.20 },
];

const ACT_OPTS = [
  { val:1.2,   label:'Sedentario',  desc:'Sin ejercicio' },
  { val:1.375, label:'Ligero',      desc:'1-2 días/sem' },
  { val:1.55,  label:'Moderado',    desc:'3-5 días/sem' },
  { val:1.725, label:'Intenso',     desc:'6-7 días/sem' },
  { val:1.9,   label:'Muy intenso', desc:'2 sesiones diarias' },
];

// ── Food Picker: emojis / colores / recetas ──────────

const FOOD_EMOJI_MAP = [
  ['huevo','🥚'],['jamón','🥓'],['tocino','🥓'],['chorizo','🌭'],
  ['pechuga','🍗'],['pollo','🍗'],['atún','🐟'],['salmón','🐟'],
  ['sardina','🐟'],['camarón','🦐'],['res ','🥩'],['carne','🥩'],
  ['arroz','🍚'],['pasta','🍝'],['avena','🌾'],['quinoa','🌾'],
  ['pan ','🍞'],['tortilla','🫓'],['tostada','🫓'],['granola','🌾'],
  ['papa','🥔'],['camote','🍠'],['elote','🌽'],
  ['plátano','🍌'],['manzana','🍎'],['naranja','🍊'],['fresa','🍓'],
  ['mango','🥭'],['sandía','🍉'],['uvas','🍇'],['durazno','🍑'],
  ['kiwi','🥝'],['papaya','🍈'],['guayaba','🍐'],
  ['aguacate','🥑'],['aceite','🫒'],['nuez','🥜'],['almendra','🫘'],
  ['mantequilla','🧈'],['cacahuate','🥜'],['ajonjolí','🫘'],
  ['leche','🥛'],['yogur','🥛'],['queso','🧀'],['crema','🫙'],
  ['frijol','🫘'],['lenteja','🫘'],['garbanzo','🫘'],['tofu','🫘'],['edamame','🫘'],
  ['espinaca','🥬'],['lechuga','🥬'],['brócoli','🥦'],['zanahoria','🥕'],
  ['jitomate','🍅'],['tomate','🍅'],['pepino','🥒'],
  ['calabaza','🥦'],['champiñón','🍄'],['nopal','🌵'],['chile','🌶'],
];

const CAT_EMOJI = {
  'Carbohidrato':'🌾','Fruta':'🍎','Grasa saludable':'🫒',
  'Lácteo':'🥛','Proteína animal':'🍗','Proteína vegetal':'🫘','Verdura':'🥦',
};

const CAT_COL = {
  'Carbohidrato':    { bg:'var(--gold-l)',  fg:'var(--gold)',  bar:'var(--gold)' },
  'Fruta':           { bg:'var(--blush-l)', fg:'var(--blush)', bar:'var(--blush)' },
  'Grasa saludable': { bg:'var(--sage-ll)', fg:'var(--sage)',  bar:'var(--sage)' },
  'Lácteo':          { bg:'var(--info-l)',  fg:'var(--info)',  bar:'var(--info)' },
  'Proteína animal': { bg:'var(--terra-l)', fg:'var(--terra)', bar:'var(--terra)' },
  'Proteína vegetal':{ bg:'var(--terra-l)', fg:'var(--terra)', bar:'var(--terra)' },
  'Verdura':         { bg:'var(--sage-ll)', fg:'var(--sage)',  bar:'var(--sage)' },
};

const MEAL_REC_COL = {
  'Desayuno':    { bg:'var(--gold-l)',  fg:'var(--gold)',   bar:'var(--gold)' },
  'Colación AM': { bg:'var(--terra-l)', fg:'var(--terra)',  bar:'var(--terra)' },
  'Comida':      { bg:'var(--sage-ll)', fg:'var(--sage)',   bar:'var(--sage)' },
  'Colación PM': { bg:'var(--blush-l)', fg:'var(--blush)',  bar:'var(--blush)' },
  'Cena':        { bg:'var(--info-l)',  fg:'var(--info)',   bar:'var(--info)' },
};
const MEAL_REC_EMOJI = {
  'Desayuno':'🌅', 'Colación AM':'🍎', 'Comida':'🍽', 'Colación PM':'🥑', 'Cena':'🌙',
};

const RECETAS = [
  // ── Desayuno ─────────────────────────────────────────
  {
    nombre:'Huevo con jamón', emoji:'🍳', cat:'Desayuno',
    desc:'Clásico desayuno proteico', color:'#fff8f5', border:'#c4714a',
    ing:[
      { buscar:'huevo entero',  label:'Huevo entero',  emoji:'🥚', qty:2, step:1,   min:1, max:6 },
      { buscar:'jamón de pavo', label:'Jamón de pavo', emoji:'🥓', qty:2, step:1,   min:0, max:8 },
      { buscar:'aceite',        label:'Aceite',        emoji:'🫒', qty:1, step:0.5, min:0, max:5 },
    ]
  },
  {
    nombre:'Omelette de queso', emoji:'🍳', cat:'Desayuno',
    desc:'Esponjoso y proteico', color:'#fffbf0', border:'#d4a843',
    ing:[
      { buscar:'huevo entero', label:'Huevo entero', emoji:'🥚', qty:3,   step:1,   min:1, max:6 },
      { buscar:'queso',        label:'Queso',        emoji:'🧀', qty:1,   step:0.5, min:0, max:4 },
      { buscar:'aceite',       label:'Aceite',       emoji:'🫒', qty:1,   step:0.5, min:0, max:5 },
    ]
  },
  {
    nombre:'Avena con fruta', emoji:'🥣', cat:'Desayuno',
    desc:'Fibra + energía sostenida', color:'#f0f7ff', border:'#5b8fb0',
    ing:[
      { buscar:'avena',   label:'Avena',   emoji:'🌾', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'plátano', label:'Plátano', emoji:'🍌', qty:1, step:1,   min:0,   max:3 },
      { buscar:'leche',   label:'Leche',   emoji:'🥛', qty:1, step:0.5, min:0,   max:4 },
    ]
  },
  {
    nombre:'Yogur con granola y fruta', emoji:'🥣', cat:'Desayuno',
    desc:'Desayuno fresco y equilibrado', color:'#fff5f8', border:'#e8739a',
    ing:[
      { buscar:'yogur',   label:'Yogur griego', emoji:'🥛', qty:1,   step:0.5, min:0.5, max:4 },
      { buscar:'granola', label:'Granola',      emoji:'🌾', qty:0.5, step:0.5, min:0,   max:3 },
      { buscar:'fresa',   label:'Fresa',        emoji:'🍓', qty:1,   step:0.5, min:0,   max:3 },
    ]
  },
  // ── Colación AM ───────────────────────────────────────
  {
    nombre:'Yogur con granola', emoji:'🥛', cat:'Colación AM',
    desc:'Alto en proteína, snack ideal', color:'#fff5f8', border:'#e8739a',
    ing:[
      { buscar:'yogur',   label:'Yogur griego', emoji:'🥛', qty:1,   step:0.5, min:0.5, max:4 },
      { buscar:'granola', label:'Granola',      emoji:'🌾', qty:0.5, step:0.5, min:0,   max:3 },
    ]
  },
  {
    nombre:'Licuado proteico', emoji:'🥤', cat:'Colación AM',
    desc:'Post entreno / snack energético', color:'#fff8f5', border:'#c4714a',
    ing:[
      { buscar:'leche',   label:'Leche',   emoji:'🥛', qty:1,   step:0.5, min:0.5, max:3 },
      { buscar:'plátano', label:'Plátano', emoji:'🍌', qty:1,   step:1,   min:0,   max:3 },
      { buscar:'avena',   label:'Avena',   emoji:'🌾', qty:0.5, step:0.5, min:0,   max:2 },
    ]
  },
  {
    nombre:'Fruta con nueces', emoji:'🍎', cat:'Colación AM',
    desc:'Energía rápida y grasas saludables', color:'#fffbf0', border:'#d4a843',
    ing:[
      { buscar:'manzana', label:'Manzana', emoji:'🍎', qty:1,   step:1,   min:1, max:3 },
      { buscar:'nuez',    label:'Nueces',  emoji:'🥜', qty:0.5, step:0.5, min:0, max:3 },
    ]
  },
  // ── Comida ────────────────────────────────────────────
  {
    nombre:'Pollo con arroz', emoji:'🍗', cat:'Comida',
    desc:'Proteína magra + carbohidrato', color:'#f5faf5', border:'#6b9e78',
    ing:[
      { buscar:'pechuga', label:'Pechuga', emoji:'🍗', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'arroz',   label:'Arroz',   emoji:'🍚', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'aceite',  label:'Aceite',  emoji:'🫒', qty:1, step:0.5, min:0,   max:5 },
    ]
  },
  {
    nombre:'Atún con arroz y verduras', emoji:'🐟', cat:'Comida',
    desc:'Rico en omega-3 y fibra', color:'#f0f7ff', border:'#5b8fb0',
    ing:[
      { buscar:'atún',      label:'Atún',     emoji:'🐟', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'arroz',     label:'Arroz',    emoji:'🍚', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'jitomate',  label:'Jitomate', emoji:'🍅', qty:1, step:1,   min:0,   max:4 },
      { buscar:'aceite',    label:'Aceite',   emoji:'🫒', qty:1, step:0.5, min:0,   max:5 },
    ]
  },
  {
    nombre:'Pollo con verduras al vapor', emoji:'🥦', cat:'Comida',
    desc:'Ligero, nutritivo y bajo en grasa', color:'#f0fff4', border:'#4a9e6b',
    ing:[
      { buscar:'pechuga',  label:'Pechuga',  emoji:'🍗', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'brócoli',  label:'Brócoli',  emoji:'🥦', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'zanahoria',label:'Zanahoria',emoji:'🥕', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'aceite',   label:'Aceite',   emoji:'🫒', qty:1, step:0.5, min:0,   max:3 },
    ]
  },
  // ── Colación PM ───────────────────────────────────────
  {
    nombre:'Fruta con yogur', emoji:'🍓', cat:'Colación PM',
    desc:'Snack dulce y proteico', color:'#fff5f8', border:'#e8739a',
    ing:[
      { buscar:'yogur', label:'Yogur griego', emoji:'🥛', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'fresa', label:'Fresa',        emoji:'🍓', qty:1, step:0.5, min:0,   max:3 },
    ]
  },
  {
    nombre:'Plátano con almendras', emoji:'🍌', cat:'Colación PM',
    desc:'Energía + grasas saludables', color:'#fffbf0', border:'#d4a843',
    ing:[
      { buscar:'plátano',  label:'Plátano',  emoji:'🍌', qty:1,   step:1,   min:1, max:3 },
      { buscar:'almendra', label:'Almendras',emoji:'🫘', qty:0.5, step:0.5, min:0, max:3 },
    ]
  },
  {
    nombre:'Queso cottage con fruta', emoji:'🧀', cat:'Colación PM',
    desc:'Proteína + antioxidantes', color:'#f0f7ff', border:'#5b8fb0',
    ing:[
      { buscar:'queso cottage', label:'Queso cottage', emoji:'🧀', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'manzana',       label:'Manzana',       emoji:'🍎', qty:1, step:1,   min:0,   max:3 },
    ]
  },
  // ── Cena ──────────────────────────────────────────────
  {
    nombre:'Huevos revueltos con verduras', emoji:'🥚', cat:'Cena',
    desc:'Ligero y proteico para la noche', color:'#fff8f5', border:'#c4714a',
    ing:[
      { buscar:'huevo entero', label:'Huevo entero', emoji:'🥚', qty:2, step:1,   min:1, max:5 },
      { buscar:'espinaca',     label:'Espinaca',     emoji:'🥬', qty:1, step:0.5, min:0, max:3 },
      { buscar:'jitomate',     label:'Jitomate',     emoji:'🍅', qty:1, step:1,   min:0, max:3 },
      { buscar:'aceite',       label:'Aceite',       emoji:'🫒', qty:1, step:0.5, min:0, max:3 },
    ]
  },
  {
    nombre:'Pechuga a la plancha', emoji:'🍗', cat:'Cena',
    desc:'Proteína sin exceso de calorías', color:'#f5faf5', border:'#6b9e78',
    ing:[
      { buscar:'pechuga', label:'Pechuga', emoji:'🍗', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'brócoli', label:'Brócoli', emoji:'🥦', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'aceite',  label:'Aceite',  emoji:'🫒', qty:1, step:0.5, min:0,   max:3 },
    ]
  },
  {
    nombre:'Sopa de verduras', emoji:'🥣', cat:'Cena',
    desc:'Reconfortante y baja en calorías', color:'#f0f7ff', border:'#5b8fb0',
    ing:[
      { buscar:'calabaza',  label:'Calabaza',  emoji:'🥦', qty:1, step:0.5, min:0.5, max:4 },
      { buscar:'zanahoria', label:'Zanahoria', emoji:'🥕', qty:1, step:0.5, min:0,   max:4 },
      { buscar:'espinaca',  label:'Espinaca',  emoji:'🥬', qty:1, step:0.5, min:0,   max:3 },
    ]
  },
];

// ── Recetas mutables (copia editable en sesión) ───────
let _recetasMut  = null;
let _recAddOpen  = null;
let _recAddQuery = '';
let _recAddCat   = 'Todos';

function getRecMut() {
  if (!_recetasMut) _recetasMut = JSON.parse(JSON.stringify(RECETAS));
  return _recetasMut;
}

function resolveIngFood(ing) {
  if (ing.alimId) return _alimentos.find(a => a.id === ing.alimId);
  return _alimentos.find(a => a.nombre.toLowerCase().includes(ing.buscar || ''));
}

function foodEmoji(a) {
  const n = a.nombre.toLowerCase();
  for (const [kw, em] of FOOD_EMOJI_MAP) {
    if (n.includes(kw)) return em;
  }
  return CAT_EMOJI[a.categoria] || '🍽';
}

// ── Cálculos ─────────────────────────────────────────
function planTargets(p, act) {
  const w   = p.weight || 60;
  const h   = p.height || 1.60;
  const age = p.age    || 25;
  const tmb = calcTMB(w, h, age, p.sexo || 'femenino');
  let kcal  = Math.round(tmb * act);
  if ((p.semGestacion || 0) >= 13) kcal += 300;
  if (p.lactancia) kcal += 500;
  return {
    kcal,
    prot:   Math.round(kcal * .30 / 4),
    carbs:  Math.round(kcal * .45 / 4),
    grasas: Math.round(kcal * .25 / 9),
    fibra:  (p.sexo || 'femenino') === 'masculino' ? 38 : 25,
    agua:   (calcWater(w, p.semGestacion || 0) / 1000).toFixed(1),
  };
}

function planTotals() {
  let kcal=0, prot=0, carbs=0, grasas=0, fibra=0;
  Object.values(_planSel).flat().forEach(i => {
    kcal   += i.calorias * i.porciones;
    prot   += i.proteina * i.porciones;
    carbs  += i.carbos   * i.porciones;
    grasas += i.grasas   * i.porciones;
    fibra  += i.fibra    * i.porciones;
  });
  return {
    kcal:   Math.round(kcal),
    prot:   Math.round(prot),
    carbs:  Math.round(carbs),
    grasas: Math.round(grasas),
    fibra:  Math.round(fibra),
  };
}

// ── Entry point (devuelve HTML síncrono, carga async) ─
function tabPlan(p) {
  setTimeout(() => initPlanTab(p), 0);
  return `<div id="plan-root" style="min-height:180px">
    <div style="text-align:center;padding:60px 20px;color:var(--text-m)">
      <div style="font-size:28px;margin-bottom:10px">🥗</div>
      Cargando plan nutricional...
    </div>
  </div>`;
}

async function initPlanTab(p) {
  if (!$('#food-picker-modal')) {
    const mr = $('#modal-root');
    if (mr) mr.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="food-picker-modal" style="display:none"
           onclick="if(event.target===this)closeFoodPicker()">
        <div style="background:var(--white);border-radius:24px;width:100%;max-width:740px;height:86vh;
                    display:flex;flex-direction:column;overflow:hidden;
                    box-shadow:0 24px 64px rgba(26,51,40,.28);animation:slideUp .3s ease">

          <!-- Header -->
          <div style="padding:20px 26px 0;flex-shrink:0;background:linear-gradient(160deg,var(--sage-lll),var(--cream))">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div style="font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--forest);font-weight:600">
                Agregar a <em id="picker-meal-lbl" style="color:var(--terra);font-style:italic">comida</em>
              </div>
              <button onclick="closeFoodPicker()"
                style="width:34px;height:34px;border-radius:50%;background:rgba(128,128,128,.15);border:none;
                       cursor:pointer;font-size:13px;color:var(--text-m);display:flex;align-items:center;
                       justify-content:center;flex-shrink:0">✕</button>
            </div>
            <div style="position:relative;margin-bottom:12px">
              <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none">🔍</span>
              <input id="picker-search" placeholder="Buscar alimento o receta..."
                     oninput="renderPickerContent()"
                     style="width:100%;padding:10px 16px 10px 42px;border-radius:50px;
                            border:2px solid var(--cream-d);background:var(--white);font-size:13px;
                            color:var(--text);outline:none;font-family:'DM Sans',sans-serif"
                     onfocus="this.style.borderColor='var(--sage)'"
                     onblur="this.style.borderColor='var(--cream-d)'">
            </div>
            <div id="picker-tabs" style="display:flex;gap:0">
              <button data-ptab="alimentos" onclick="switchPickerTab('alimentos')"
                style="padding:8px 20px;background:none;border:none;border-bottom:2.5px solid var(--sage);
                       cursor:pointer;font-size:12.5px;font-weight:600;color:var(--forest);
                       font-family:'DM Sans',sans-serif;transition:all .2s">🥗 Alimentos</button>
              <button data-ptab="recetas" onclick="switchPickerTab('recetas')"
                style="padding:8px 20px;background:none;border:none;border-bottom:2.5px solid transparent;
                       cursor:pointer;font-size:12.5px;font-weight:400;color:var(--text-l);
                       font-family:'DM Sans',sans-serif;transition:all .2s">👨‍🍳 Recetas</button>
            </div>
          </div>

          <!-- Category filter bar -->
          <div id="picker-cats-bar"
               style="padding:10px 26px;border-top:1px solid var(--cream-d);border-bottom:1px solid var(--cream-d);
                      flex-shrink:0;display:flex;gap:6px;flex-wrap:wrap;background:var(--cream);min-height:46px"></div>

          <!-- List -->
          <div id="picker-list" style="overflow-y:auto;flex:1;padding:0 26px 20px;background:var(--white)"></div>
        </div>
      </div>`);
  }

  const root = $('#plan-root');
  if (!root || currentPatient?.id !== p.id) return;

  try {
    const [pr, ar] = await Promise.all([
      fetch(`api/plan.php?paciente_id=${p.id}`),
      fetch(`api/alimentos.php?paciente_id=${p.id}`),
    ]);
    const planData = pr.ok ? await pr.json() : {};
    const alimData = ar.ok ? await ar.json() : [];

    _alimentos = alimData;
    _planAct   = parseFloat(planData.actividad) || 1.4;
    _planSel   = { desayuno:[], colacion_am:[], comida:[], colacion_pm:[], cena:[] };
    (planData.seleccion || []).forEach(item => {
      if (_planSel[item.tiempo]) _planSel[item.tiempo].push(item);
    });
    renderPlanRoot(p);
  } catch(e) {
    const r = $('#plan-root');
    if (r) r.innerHTML = `<div style="padding:30px;text-align:center;color:var(--terra)">
      Error al cargar el plan. Verifica que hayas ejecutado la migración.
    </div>`;
  }
}

// ── Render principal ──────────────────────────────────
function renderPlanRoot(p) {
  const root = $('#plan-root');
  if (!root) return;
  const T = planTargets(p, _planAct);
  const C = planTotals();

  root.innerHTML = `<div class="g-21">
    <div>
      ${renderTargetsPanel(T, C)}
      ${MEALS.map(m => renderMealCard(m, T)).join('')}
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head">
          <div class="panel-title" style="font-size:15px"><span class="pt-icon">💊</span>Suplementación</div>
          <button class="btn btn-sage btn-xs" onclick="openSupleModal()">+ Agregar</button>
        </div>
        <div class="panel-body" id="suple-list">${renderSupleList(p.suplementacion)}</div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title" style="font-size:15px"><span class="pt-icon">💧</span>Hidratación</div>
        </div>
        <div class="panel-body" style="text-align:center">
          <div style="font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:600;color:var(--info)">${T.agua}L</div>
          <div class="muted-sm">${p.semGestacion ? 'Incluye extra por embarazo' : p.lactancia ? 'Incluye extra por lactancia' : '35 ml × kg de peso'}</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Panel de metas ────────────────────────────────────
function renderTargetsPanel(T, C) {
  const kcalPct = T.kcal ? Math.min(100, Math.round(C.kcal / T.kcal * 100)) : 0;
  const kcalOver = C.kcal > T.kcal;

  const macros = [
    { l:'Proteína', v:T.prot+'g',   cur:C.prot,   max:T.prot,   bg:'var(--terra-l)', fg:'var(--terra-d)', bar:'var(--terra)', icon:'🥩' },
    { l:'Carbos',   v:T.carbs+'g',  cur:C.carbs,  max:T.carbs,  bg:'var(--gold-l)',  fg:'#8a6a14',        bar:'var(--gold)',  icon:'🌾' },
    { l:'Grasa',    v:T.grasas+'g', cur:C.grasas, max:T.grasas, bg:'var(--blush-l)', fg:'#9e3a5a',        bar:'var(--blush)', icon:'🫒' },
    { l:'Fibra',    v:T.fibra+'g',  cur:C.fibra,  max:T.fibra,  bg:'var(--info-l)',  fg:'var(--info)',     bar:'var(--info)',  icon:'🥦' },
  ];

  const macroCard = (m) => {
    const pct  = m.max ? Math.min(100, Math.round(m.cur / m.max * 100)) : 0;
    const over = m.cur > m.max;
    return `
    <div style="background:${m.bg};border-radius:12px;padding:14px 12px">
      <div style="font-size:18px;margin-bottom:6px">${m.icon}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:${m.fg};line-height:1">${m.v}</div>
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--text-m);margin-top:3px;font-weight:600">${m.l}</div>
      <div style="margin-top:10px;height:5px;border-radius:3px;background:rgba(0,0,0,.08);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${over ? 'var(--terra)' : m.bar};border-radius:3px;transition:width .4s"></div>
      </div>
      <div style="font-size:10px;color:var(--text-m);margin-top:4px">${m.cur} / ${m.max} · ${pct}%</div>
    </div>`;
  };

  const actBtn = (o) => {
    const active = _planAct === o.val;
    return `<button onclick="setPlanAct(${o.val})" title="${o.desc}"
      style="padding:6px 14px;border-radius:20px;cursor:pointer;font-size:11px;
             font-weight:${active ? '600' : '400'};white-space:nowrap;transition:all .2s;
             border:1.5px solid ${active ? 'var(--sage)' : 'var(--cream-d)'};
             background:${active ? 'var(--sage)' : 'transparent'};
             color:${active ? 'var(--cream)' : 'var(--text-m)'}">${o.label}</button>`;
  };

  return `<div class="panel mb-sm">
    <div class="panel-head">
      <div class="panel-title"><span class="pt-icon">🎯</span>Metas diarias</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-xs" onclick="enviarPlanWA()">📤 WhatsApp</button>
        <button class="btn btn-sage btn-xs" onclick="generarPlanPDF()">📄 Exportar PDF</button>
        <button class="btn btn-primary btn-xs" onclick="guardarPlan()">💾 Guardar</button>
      </div>
    </div>
    <div class="panel-body">
      <div style="background:linear-gradient(135deg,var(--sage) 0%,var(--forest-l) 100%);border-radius:14px;padding:20px 24px;margin-bottom:14px;color:var(--cream);position:relative;overflow:hidden">
        <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:58px;opacity:.13;line-height:1;pointer-events:none">🔥</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;opacity:.7;margin-bottom:6px;font-weight:500">Calorías diarias</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:50px;font-weight:700;line-height:1">
          ${T.kcal} <span style="font-size:18px;opacity:.65;font-weight:400">kcal</span>
        </div>
        <div style="margin-top:14px;height:7px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden">
          <div style="height:100%;width:${kcalPct}%;background:${kcalOver ? 'var(--terra)' : 'rgba(255,255,255,.85)'};border-radius:4px;transition:width .5s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;opacity:.7;margin-top:5px">
          <span>${C.kcal} consumidas</span><span>${kcalPct}%</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
        ${macros.map(macroCard).join('')}
      </div>
      <div>
        <div style="font-size:10px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Actividad física</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${ACT_OPTS.map(actBtn).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ── Tarjetas de comida ────────────────────────────────
const MEAL_STYLE = {
  desayuno:    { border:'var(--gold)',  bg:'var(--gold-l)',  emoji:'🌅' },
  colacion_am: { border:'var(--terra)', bg:'var(--terra-l)', emoji:'🍎' },
  comida:      { border:'var(--sage)',  bg:'var(--sage-ll)', emoji:'🍽' },
  colacion_pm: { border:'var(--blush)', bg:'var(--blush-l)', emoji:'🥑' },
  cena:        { border:'var(--info)',  bg:'var(--info-l)',  emoji:'🌙' },
};

function renderMealCard(meal, T) {
  const items  = _planSel[meal.key] || [];
  const mKcal  = Math.round(items.reduce((s, i) => s + i.calorias * i.porciones, 0));
  const tKcal  = Math.round(T.kcal * meal.pct);
  const mPct   = tKcal ? Math.min(100, Math.round(mKcal / tKcal * 100)) : 0;
  const mOver  = mKcal > tKcal;
  const ms     = MEAL_STYLE[meal.key] || { border:'var(--sage)', bg:'var(--sage-ll)', emoji:'🍽' };
  const name   = meal.label.replace(/^\S+\s/, '');

  const mProt  = +items.reduce((s, i) => s + i.proteina * i.porciones, 0).toFixed(1);
  const mCarbs = +items.reduce((s, i) => s + i.carbos   * i.porciones, 0).toFixed(1);
  const mGras  = +items.reduce((s, i) => s + i.grasas   * i.porciones, 0).toFixed(1);
  const mFibra = +items.reduce((s, i) => s + i.fibra    * i.porciones, 0).toFixed(1);

  const macroFooter = items.length ? `
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;
                padding:8px 16px;border-top:1px solid var(--cream-d);background:var(--cream)">
      <span style="font-size:10px;font-weight:600;color:var(--text-m);margin-right:2px">Total:</span>
      <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:var(--terra-l);color:var(--terra);font-weight:600">🥩 P ${mProt}g</span>
      <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:var(--gold-l);color:var(--gold);font-weight:600">🌾 C ${mCarbs}g</span>
      <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:var(--blush-l);color:var(--blush);font-weight:600">🫒 G ${mGras}g</span>
      <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:var(--sage-ll);color:var(--sage);font-weight:600">🌿 F ${mFibra}g</span>
    </div>` : '';

  return `<div class="panel mb-sm" style="border-left:4px solid ${ms.border}">
    <div class="panel-head">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:10px;background:${ms.bg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${ms.emoji}</div>
        <div>
          <div style="font-weight:600;font-size:13px;color:var(--forest)">${name}</div>
          <div style="font-size:11px;color:var(--text-m)">${meal.hora}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:700;color:${mKcal > 0 ? ms.border : 'var(--text-m)'}">
            ${mKcal > 0 ? `${mKcal} / ${tKcal}` : `~${tKcal}`} kcal
          </div>
          ${mKcal > 0 ? `<div style="font-size:10px;color:var(--text-m)">${mPct}% del objetivo</div>` : ''}
        </div>
        <button class="btn btn-outline btn-xs" onclick="openFoodPicker('${meal.key}')">+ Alimento</button>
      </div>
    </div>
    ${mKcal > 0 ? `<div style="height:4px;background:var(--cream-d)"><div style="height:100%;width:${mPct}%;background:${mOver ? 'var(--terra)' : ms.border};transition:width .4s"></div></div>` : ''}
    <div id="meal-${meal.key}" class="panel-body" style="padding:${items.length ? '6px 16px' : '0'}">
      ${items.length
        ? items.map((it, i) => renderFoodRow(it, meal.key, i, items.length)).join('')
        : `<div style="text-align:center;padding:18px 10px;color:var(--text-l);font-size:12px;border-top:1px dashed var(--cream-dd)">
             Sin alimentos · objetivo ~${tKcal} kcal
           </div>`}
    </div>
    ${macroFooter}
  </div>`;
}

function renderFoodRow(item, mealKey, idx, total) {
  const kcal  = Math.round(item.calorias  * item.porciones);
  const prot  = +(item.proteina  * item.porciones).toFixed(1);
  const carbs = +(item.carbos    * item.porciones).toFixed(1);
  const gras  = +(item.grasas    * item.porciones).toFixed(1);
  const fibra = +(item.fibra     * item.porciones).toFixed(1);
  const em    = foodEmoji(item);

  return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;
                       padding:9px 0;${idx < total - 1 ? 'border-bottom:1px solid var(--cream-d)' : ''}">
    <div style="display:flex;align-items:flex-start;gap:8px;flex:1;min-width:0">
      <span style="font-size:18px;line-height:1.4;flex-shrink:0">${em}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:500;color:var(--forest)">${item.nombre}</div>
        <div style="font-size:11px;color:var(--text-m);margin-top:2px">
          ${item.porcion_desc} ×${item.porciones} &nbsp;
          <span style="color:#9e5a3a">🥩 P${prot}g</span> ·
          <span style="color:#8a6a14">🌾 C${carbs}g</span> ·
          <span style="color:#9e3a5a">🫒 G${gras}g</span> ·
          <span style="color:#3a6840">🌿 F${fibra}g</span>
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:5px;flex-shrink:0">
      <span style="font-size:11px;font-weight:600;color:var(--forest);min-width:52px;text-align:right">${kcal} kcal</span>
      <select size="1" style="font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--cream-d);background:#fff;color:#1a3025;cursor:pointer"
              onchange="changePortion('${mealKey}',${idx},this.value)">
        ${Array.from({length:20},(_,i)=>+(i+1)*0.5).map(v => `<option value="${v}"${item.porciones == v ? ' selected' : ''}>${v}×</option>`).join('')}
      </select>
      <button onclick="removeFoodItem('${mealKey}',${idx})"
        style="background:none;border:none;color:var(--text-m);cursor:pointer;font-size:13px;padding:2px 5px;border-radius:4px"
        title="Quitar">✕</button>
    </div>
  </div>`;
}

// ── Food Picker ───────────────────────────────────────
function openFoodPicker(mealKey) {
  _pickerMeal    = mealKey;
  _pickerCat     = 'Todos';
  _pickerRecCat  = 'Todos';
  _pickerTab     = 'alimentos';
  const meal  = MEALS.find(m => m.key === mealKey);
  const el    = $('#food-picker-modal');
  if (!el) return;
  el.style.display = 'flex';

  const lbl = $('#picker-meal-lbl');
  if (lbl) lbl.textContent = (meal?.label || mealKey).replace(/^\S+\s/, '');

  const srch = $('#picker-search');
  if (srch) srch.value = '';

  switchPickerTab('alimentos');
  setTimeout(() => { const s = $('#picker-search'); if (s) s.focus(); }, 50);
}

function closeFoodPicker() {
  const el = $('#food-picker-modal');
  if (el) el.style.display = 'none';
}

function switchPickerTab(tab) {
  _pickerTab = tab;
  $$('[data-ptab]').forEach(b => {
    const active = b.dataset.ptab === tab;
    b.style.borderBottomColor = active ? 'var(--sage)' : 'transparent';
    b.style.fontWeight        = active ? '600' : '400';
    b.style.color             = active ? 'var(--forest)' : 'var(--text-l)';
  });

  const catsBar = $('#picker-cats-bar');
  if (!catsBar) return;

  if (tab === 'alimentos') {
    catsBar.style.display = 'flex';
    const cats = ['Todos', ...[...new Set(_alimentos.map(a => a.categoria))].sort()];
    catsBar.innerHTML = cats.map(c => {
      const col    = CAT_COL[c] || {};
      const active = c === _pickerCat;
      const em     = CAT_EMOJI[c] ? CAT_EMOJI[c] + ' ' : '';
      return `<button onclick="pickerSetCat('${c}')" data-pcat="${c}"
        style="font-size:11px;padding:4px 12px;border-radius:20px;cursor:pointer;
               font-family:'DM Sans',sans-serif;font-weight:500;transition:all .15s;white-space:nowrap;
               border:1.5px solid ${active ? (col.bar||'var(--sage)') : 'var(--cream-dd)'};
               background:${active ? (col.bg||'var(--sage-ll)') : 'transparent'};
               color:${active ? (col.fg||'var(--sage)') : 'var(--text-l)'}"
      >${em}${c}</button>`;
    }).join('');
  } else {
    catsBar.style.display = 'flex';
    const mealCats = ['Todos', 'Desayuno', 'Colación AM', 'Comida', 'Colación PM', 'Cena'];
    catsBar.innerHTML = mealCats.map(c => {
      const col    = MEAL_REC_COL[c] || {};
      const active = c === _pickerRecCat;
      const em     = MEAL_REC_EMOJI[c] ? MEAL_REC_EMOJI[c] + ' ' : '';
      return `<button onclick="pickerSetRecCat('${c}')" data-preccat="${c}"
        style="font-size:11px;padding:4px 12px;border-radius:20px;cursor:pointer;
               font-family:'DM Sans',sans-serif;font-weight:500;transition:all .15s;white-space:nowrap;
               border:1.5px solid ${active ? (col.bar||'var(--sage)') : 'var(--cream-dd)'};
               background:${active ? (col.bg||'var(--sage-ll)') : 'transparent'};
               color:${active ? (col.fg||'var(--sage)') : 'var(--text-l)'}"
      >${em}${c}</button>`;
    }).join('');
  }

  renderPickerContent();
}

function pickerSetCat(cat) {
  _pickerCat = cat;
  $$('[data-pcat]').forEach(b => {
    const c      = b.dataset.pcat;
    const col    = CAT_COL[c] || {};
    const active = c === cat;
    b.style.borderColor = active ? (col.bar||'var(--sage)') : 'var(--cream-dd)';
    b.style.background  = active ? (col.bg||'var(--sage-ll)') : 'transparent';
    b.style.color       = active ? (col.fg||'var(--sage)') : 'var(--text-l)';
  });
  renderPickerContent();
}

function pickerSetRecCat(cat) {
  _pickerRecCat = cat;
  $$('[data-preccat]').forEach(b => {
    const c      = b.dataset.preccat;
    const col    = MEAL_REC_COL[c] || {};
    const active = c === cat;
    b.style.borderColor = active ? (col.bar||'var(--sage)') : 'var(--cream-dd)';
    b.style.background  = active ? (col.bg||'var(--sage-ll)') : 'transparent';
    b.style.color       = active ? (col.fg||'var(--sage)') : 'var(--text-l)';
  });
  renderPickerContent();
}

function renderPickerContent() {
  if (_pickerTab === 'recetas') {
    renderRecetasList();
  } else {
    renderAlimentosList();
  }
}

// ── Alimentos tab ─────────────────────────────────────
function renderAlimentosList() {
  const srch   = ($('#picker-search') || {}).value?.toLowerCase() || '';
  const listEl = $('#picker-list');
  if (!listEl) return;

  const filtered = _alimentos.filter(a =>
    (_pickerCat === 'Todos' || a.categoria === _pickerCat) &&
    (!srch || a.nombre.toLowerCase().includes(srch))
  );

  if (!filtered.length) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:52px 20px;color:var(--text-l)">
        <div style="font-size:38px;margin-bottom:10px">🔍</div>
        <div style="font-size:13px">Sin resultados${srch ? ` para "<b style="color:var(--forest)">${srch}</b>"` : ''}</div>
      </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(a => {
    const em     = foodEmoji(a);
    const col    = CAT_COL[a.categoria] || { bg:'var(--sage-ll)', fg:'var(--sage)', bar:'var(--sage)' };
    const inPlan = (_planSel[_pickerMeal] || []).some(x => (x.alimento_id || x.id) === a.id);
    const porOpts = Array.from({length:20},(_,i)=>+(i+1)*0.5).map(v =>
      `<option value="${v}"${v===1?' selected':''}>${v}×</option>`).join('');

    return `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:13px 0;
                border-bottom:1px solid var(--cream-d);opacity:${a.excluido ? .5 : 1}">
      <!-- Emoji avatar -->
      <div style="width:46px;height:46px;border-radius:13px;flex-shrink:0;
                  background:${col.bg};border:1.5px solid ${col.bar}30;
                  display:flex;align-items:center;justify-content:center;font-size:24px">${em}</div>
      <!-- Info -->
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span style="font-size:13px;font-weight:600;color:var(--forest);
                       ${a.excluido ? 'text-decoration:line-through;opacity:.7' : ''}">${a.nombre}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:500;
                       background:${col.bg};color:${col.fg}">${a.categoria}</span>
        </div>
        <div style="font-size:11px;color:var(--text-l);margin-top:2px">
          ${a.porcion_desc} · <b style="color:var(--forest)">${a.calorias} kcal</b>
        </div>
        <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">
          <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--terra-l);color:var(--terra);font-weight:600">🥩 P ${a.proteina}g</span>
          <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--gold-l);color:var(--gold);font-weight:600">🌾 C ${a.carbos}g</span>
          <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--blush-l);color:var(--blush);font-weight:600">🫒 G ${a.grasas}g</span>
          <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--sage-ll);color:var(--sage);font-weight:600">🌿 F ${a.fibra}g</span>
        </div>
      </div>
      <!-- Actions -->
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">
        ${!a.excluido ? `
        <select id="por-${a.id}"
          style="font-size:11px;padding:5px 8px;border-radius:8px;border:1.5px solid var(--cream-d);
                 background:#fff;color:#1a3025;cursor:pointer;font-family:'DM Sans',sans-serif">
          ${porOpts}
        </select>
        <button onclick="addFoodToMeal(${a.id})"
          style="padding:6px 14px;background:${inPlan ? 'var(--sage)' : 'var(--forest)'};color:var(--cream);
                 border:none;border-radius:20px;cursor:pointer;font-size:11px;font-weight:600;
                 font-family:'DM Sans',sans-serif;white-space:nowrap;transition:background .2s"
        >${inPlan ? '✓ + Otra' : '+ Agregar'}</button>
        <button onclick="toggleExclusion(${a.id},${!a.excluido})"
          style="font-size:10px;padding:2px 6px;border-radius:6px;cursor:pointer;border:none;
                 background:transparent;color:var(--text-ll);font-family:'DM Sans',sans-serif"
        >👎 Excluir</button>
        ` : `
        <button onclick="toggleExclusion(${a.id},false)"
          style="font-size:10px;padding:5px 10px;border-radius:8px;cursor:pointer;
                 border:1.5px solid var(--terra);background:var(--terra-l);color:var(--terra);
                 font-family:'DM Sans',sans-serif;font-weight:500;white-space:nowrap"
        >🚫 Excluido · Incluir</button>
        `}
      </div>
    </div>`;
  }).join('');
}

// ── Recetas tab ───────────────────────────────────────
function calcRecetaTotals(rIdx) {
  const r = getRecMut()[rIdx];
  let kcal=0, prot=0, carbs=0, grasas=0;
  r.ing.forEach((ing, iIdx) => {
    const food = resolveIngFood(ing);
    if (!food) return;
    const qtyEl = $(`#rqty-${rIdx}-${iIdx}`);
    const qty   = qtyEl ? parseFloat(qtyEl.textContent) : ing.qty;
    kcal  += food.calorias * qty;
    prot  += food.proteina * qty;
    carbs += food.carbos   * qty;
    grasas+= food.grasas   * qty;
  });
  return {
    kcal:  Math.round(kcal),
    prot:  Math.round(prot),
    carbs: Math.round(carbs),
    grasas:Math.round(grasas),
  };
}

function recetaTotalsHtml(t) {
  return `<span style="font-size:12px;font-weight:700;color:var(--forest)">${t.kcal} kcal</span>
    <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--terra-l);color:var(--terra);font-weight:600">🥩 P${t.prot}g</span>
    <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--gold-l);color:var(--gold);font-weight:600">🌾 C${t.carbs}g</span>
    <span style="font-size:10px;padding:2px 7px;border-radius:8px;background:var(--blush-l);color:var(--blush);font-weight:600">🫒 G${t.grasas}g</span>`;
}

function renderRecetasList() {
  const srch   = ($('#picker-search') || {}).value?.toLowerCase() || '';
  const listEl = $('#picker-list');
  if (!listEl) return;

  const filtered = getRecMut()
    .map((r, i) => ({ r, i }))
    .filter(({ r }) =>
      (_pickerRecCat === 'Todos' || r.cat === _pickerRecCat) &&
      (!srch || r.nombre.toLowerCase().includes(srch) || r.ing.some(ing => ing.label.toLowerCase().includes(srch)))
    );

  if (!filtered.length) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:52px 20px;color:var(--text-l)">
        <div style="font-size:38px;margin-bottom:10px">👨‍🍳</div>
        <div style="font-size:13px">Sin recetas${srch ? ` para "<b style="color:var(--forest)">${srch}</b>"` : ''}</div>
      </div>`;
    return;
  }

  listEl.innerHTML = `<div style="display:grid;gap:14px;padding-top:14px">` +
    filtered.map(({ r, i: rIdx }) => {
      const ingHtml = r.ing.map((ing, iIdx) => {
        const food = resolveIngFood(ing);
        if (!food) return '';
        const em   = ing.alimId ? foodEmoji(food) : ing.emoji;
        const prot  = +(food.proteina * ing.qty).toFixed(1);
        const carbs = +(food.carbos   * ing.qty).toFixed(1);
        const gras  = +(food.grasas   * ing.qty).toFixed(1);
        const fibra = +(food.fibra    * ing.qty).toFixed(1);
        return `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;
                    border-top:1px dashed var(--cream-d)">
          <span style="font-size:20px;width:28px;text-align:center;flex-shrink:0;margin-top:2px">${em}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:500;color:var(--forest-m)">${food.nombre}</div>
            <div style="font-size:10px;color:var(--text-l);margin-bottom:4px">${food.porcion_desc}</div>
            <div style="display:flex;gap:3px;flex-wrap:wrap">
              <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--terra-l);color:var(--terra);font-weight:600">🥩 P${prot}g</span>
              <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--gold-l);color:var(--gold);font-weight:600">🌾 C${carbs}g</span>
              <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--blush-l);color:var(--blush);font-weight:600">🫒 G${gras}g</span>
              <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--sage-ll);color:var(--sage);font-weight:600">🌿 F${fibra}g</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
            <div style="display:flex;align-items:center;gap:5px">
              <button onclick="recAdj(${rIdx},${iIdx},-${ing.step || 0.5})"
                style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--cream-dd);
                       background:var(--white);cursor:pointer;font-size:15px;color:var(--text-m);
                       display:flex;align-items:center;justify-content:center;line-height:1;
                       font-weight:300;flex-shrink:0">−</button>
              <span id="rqty-${rIdx}-${iIdx}"
                style="font-size:14px;font-weight:700;color:var(--forest);min-width:30px;
                       text-align:center">${ing.qty}</span>
              <button onclick="recAdj(${rIdx},${iIdx},${ing.step || 0.5})"
                style="width:26px;height:26px;border-radius:50%;border:1.5px solid var(--cream-dd);
                       background:var(--white);cursor:pointer;font-size:15px;color:var(--text-m);
                       display:flex;align-items:center;justify-content:center;line-height:1;
                       font-weight:300;flex-shrink:0">+</button>
              <button onclick="recRemoveIng(${rIdx},${iIdx})" title="Quitar ingrediente"
                style="background:none;border:none;color:var(--text-l);cursor:pointer;font-size:13px;
                       padding:2px 4px;border-radius:4px;flex-shrink:0;opacity:.6"
                onmouseover="this.style.opacity='1';this.style.color='var(--terra)'"
                onmouseout="this.style.opacity='.6';this.style.color='var(--text-l)'">✕</button>
            </div>
            <span id="rkcal-${rIdx}-${iIdx}"
              style="font-size:11px;color:var(--text-l);text-align:right;flex-shrink:0">
              ${Math.round(food.calorias * ing.qty)} kcal
            </span>
          </div>
        </div>`;
      }).filter(Boolean).join('');

      const addPanelHtml = `
        <div style="padding:8px 0 4px;border-top:1px dashed var(--cream-d)">
          ${_recAddOpen === rIdx ? (() => {
            const cats = ['Todos', ...[...new Set(_alimentos.map(a => a.categoria))].sort()];
            const catChips = cats.map(c => {
              const col    = CAT_COL[c] || {};
              const active = c === _recAddCat;
              const em     = CAT_EMOJI[c] ? CAT_EMOJI[c] + ' ' : '';
              return `<button onclick="recSetCat(${rIdx},'${c}')"
                style="font-size:10.5px;padding:3px 10px;border-radius:20px;cursor:pointer;white-space:nowrap;
                       font-family:'DM Sans',sans-serif;font-weight:500;transition:all .15s;
                       border:1.5px solid ${active ? (col.bar||'var(--sage)') : 'var(--cream-dd)'};
                       background:${active ? (col.bg||'var(--sage-ll)') : 'transparent'};
                       color:${active ? (col.fg||'var(--sage)') : 'var(--text-l)'}">${em}${c}</button>`;
            }).join('');
            return `
            <div style="background:var(--cream);border-radius:10px;padding:10px;margin-bottom:6px">
              <input id="rec-srch-${rIdx}" placeholder="Buscar alimento..." autofocus
                     oninput="_recAddQuery=this.value;recSearchIng(${rIdx})"
                     onclick="event.stopPropagation()"
                     style="width:100%;padding:7px 10px;border-radius:6px;border:1.5px solid var(--cream-d);
                            font-size:11px;background:var(--white);font-family:'DM Sans',sans-serif;outline:none"
                     onfocus="this.style.borderColor='var(--sage)'"
                     onblur="this.style.borderColor='var(--cream-d)'">
              <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">${catChips}</div>
              <div id="rec-res-${rIdx}" style="max-height:220px;overflow-y:auto;margin-top:6px"></div>
            </div>`;
          })() : ''}
          <button onclick="recToggleAddIng(${rIdx})"
            style="font-size:11px;padding:4px 12px;border-radius:20px;cursor:pointer;
                   border:1.5px dashed var(--sage);background:transparent;color:var(--sage);
                   font-family:'DM Sans',sans-serif;font-weight:500;transition:all .15s"
            onmouseover="this.style.background='var(--sage-ll)'"
            onmouseout="this.style.background='transparent'">
            ${_recAddOpen === rIdx ? '✕ Cancelar' : '+ Ingrediente'}
          </button>
        </div>`;

      // If no ingredients resolved, show a warning
      const hasIngs = r.ing.some(ing => resolveIngFood(ing));

      const totals = hasIngs ? calcRecetaTotals(rIdx) : null;

      return `
      <div style="border:1.5px solid ${r.border}44;border-radius:18px;overflow:hidden">
        <!-- Recipe header -->
        <div style="padding:14px 18px 12px;background:${r.color}">
          <div style="display:flex;align-items:center;gap:11px">
            <div style="width:44px;height:44px;border-radius:13px;background:var(--white);flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;font-size:26px;
                        border:1.5px solid ${r.border}33;box-shadow:0 2px 8px ${r.border}18">${r.emoji}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:700;color:var(--forest)">${r.nombre}</div>
              <div style="font-size:11px;color:var(--text-m);margin-top:2px">${r.desc}</div>
            </div>
            <span style="font-size:10px;padding:3px 10px;border-radius:20px;flex-shrink:0;
                          background:var(--white);color:var(--text-m);border:1px solid ${r.border}33;font-weight:500">${r.cat}</span>
          </div>
        </div>
        <!-- Ingredients -->
        <div style="padding:4px 18px 14px;background:var(--white)">
          ${hasIngs ? ingHtml : `<div style="padding:12px 0;font-size:12px;color:var(--text-l);text-align:center">Ingredientes no disponibles en la base de datos</div>`}
          ${addPanelHtml}
          ${hasIngs ? `
          <!-- Totals + add -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;
                      margin-top:10px;padding-top:10px;border-top:2px solid var(--cream-d);flex-wrap:wrap">
            <div id="rtotals-${rIdx}" style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
              ${recetaTotalsHtml(totals)}
            </div>
            <button onclick="addRecetaToMeal(${rIdx})"
              style="padding:8px 18px;background:var(--forest);color:var(--cream);border:none;
                     border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;
                     font-family:'DM Sans',sans-serif;white-space:nowrap;
                     flex-shrink:0;transition:background .2s"
              onmouseenter="this.style.background='var(--sage)'"
              onmouseleave="this.style.background='var(--forest)'"
            >Agregar receta →</button>
          </div>` : ''}
        </div>
      </div>`;
    }).join('') + `</div>`;
}

function recAdj(rIdx, iIdx, delta) {
  const ing    = getRecMut()[rIdx].ing[iIdx];
  const qtyEl  = $(`#rqty-${rIdx}-${iIdx}`);
  const kEl    = $(`#rkcal-${rIdx}-${iIdx}`);
  const totEl  = $(`#rtotals-${rIdx}`);
  if (!qtyEl) return;

  const step = ing.step || 0.5;
  let cur = parseFloat(qtyEl.textContent);
  cur = Math.min(ing.max || 10, Math.max(ing.min || 0, Math.round((cur + delta) * 100) / 100));
  ing.qty = cur;
  qtyEl.textContent = cur;

  const food = resolveIngFood(ing);
  if (food && kEl) kEl.textContent = `${Math.round(food.calorias * cur)} kcal`;
  if (totEl) totEl.innerHTML = recetaTotalsHtml(calcRecetaTotals(rIdx));
}

function addRecetaToMeal(rIdx) {
  const r = getRecMut()[rIdx];
  let added = 0;
  r.ing.forEach((ing, iIdx) => {
    const food  = resolveIngFood(ing);
    if (!food) return;
    const qtyEl = $(`#rqty-${rIdx}-${iIdx}`);
    const qty   = qtyEl ? parseFloat(qtyEl.textContent) : ing.qty;
    if (qty <= 0) return;
    _planSel[_pickerMeal].push({ ...food, alimento_id: food.id, porciones: qty });
    added++;
  });
  if (!added) { toast('No se encontraron ingredientes en la base de datos'); return; }
  closeFoodPicker();
  renderPlanRoot(currentPatient);
  const mName = MEALS.find(m => m.key === _pickerMeal)?.label.replace(/^\S+\s/, '') || _pickerMeal;
  toast(`${r.nombre} agregado a ${mName} ✓`);
}

function toggleExclusion(alimId, excluido) {
  const a = _alimentos.find(x => x.id === alimId);
  if (!a || !currentPatient) return;
  a.excluido = excluido;
  renderPickerContent();
  fetch('api/alimentos.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paciente_id: currentPatient.id, alimento_id: alimId, excluido }),
  }).catch(() => {});
}

function addFoodToMeal(alimId) {
  const a = _alimentos.find(x => x.id === alimId);
  if (!a || !_pickerMeal) return;
  const porEl    = $(`#por-${alimId}`);
  const porciones = porEl ? parseFloat(porEl.value) : 1;
  _planSel[_pickerMeal].push({ ...a, alimento_id: a.id, porciones });
  closeFoodPicker();
  renderPlanRoot(currentPatient);
  const mName = MEALS.find(m => m.key === _pickerMeal)?.label.replace(/^\S+\s/, '') || _pickerMeal;
  toast(`${a.nombre} agregado a ${mName} ✓`);
}

// ── Modificar porciones / quitar ─────────────────────
function changePortion(mealKey, idx, val) {
  if (!_planSel[mealKey]?.[idx]) return;
  _planSel[mealKey][idx].porciones = parseFloat(val);
  renderPlanRoot(currentPatient);
}

function removeFoodItem(mealKey, idx) {
  _planSel[mealKey].splice(idx, 1);
  renderPlanRoot(currentPatient);
}

function setPlanAct(val) {
  _planAct = val;
  if (currentPatient) renderPlanRoot(currentPatient);
}

// ── Guardar plan ──────────────────────────────────────
async function guardarPlan() {
  if (!currentPatient) return;
  const p  = currentPatient;
  const T  = planTargets(p, _planAct);
  const sel = Object.entries(_planSel).flatMap(([tiempo, items]) =>
    items.map(it => ({ alimento_id: it.alimento_id || it.id, tiempo, porciones: it.porciones }))
  );

  const btn = document.querySelector('[onclick="guardarPlan()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/plan.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: p.id,
        actividad:   _planAct,
        calorias:    T.kcal,
        proteina:    T.prot,
        carbos:      T.carbs,
        grasas:      T.grasas,
        fibra:       T.fibra,
        descripcion: '',
        seleccion:   sel,
      }),
    });
    if (!res.ok) throw new Error();
    toast('Plan guardado ✓');
  } catch (e) {
    toast('Error al guardar plan');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar plan'; }
  }
}

// ── Suplementación ────────────────────────────────────
function renderSupleList(lista) {
  if (!lista || !lista.length) {
    return `<div style="text-align:center;padding:20px 10px;color:var(--text-m);font-size:12px">
      <div style="font-size:24px;margin-bottom:6px;opacity:.4">💊</div>
      Sin suplementos registrados
    </div>`;
  }
  return lista.map((s, i) => {
    const etiqueta = [s.dosis, s.frecuencia].filter(Boolean).join(' · ');
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;${i < lista.length - 1 ? 'border-bottom:1px solid var(--cream-d)' : ''}">
      <div>
        <div style="font-size:12px;font-weight:500;color:var(--forest)">🟢 ${s.nombre}</div>
        ${etiqueta ? `<div style="font-size:11px;color:var(--text-m);margin-top:1px">${etiqueta}</div>` : ''}
        ${s.razon   ? `<div style="font-size:11px;color:var(--text-m);font-style:italic">${s.razon}</div>` : ''}
      </div>
      <button onclick="borrarSuple(${s.id})"
        style="background:none;border:none;color:var(--text-m);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:4px"
        title="Eliminar">✕</button>
    </div>`;
  }).join('');
}

function openSupleModal() {
  ['#suple-nombre','#suple-dosis','#suple-razon'].forEach(s => { const el = $(s); if (el) el.value = ''; });
  const frec = $('#suple-frecuencia');
  if (frec) frec.value = 'AM';
  openModal('suple-modal');
}

async function guardarSuple() {
  const nombre = ($('#suple-nombre') || {}).value?.trim();
  if (!nombre) { toast('Escribe el nombre del suplemento'); return; }

  const btn = $('#suple-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/suplementacion.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: currentPatient.id,
        nombre,
        dosis:      ($('#suple-dosis')      || {}).value?.trim() || '',
        frecuencia: ($('#suple-frecuencia') || {}).value || '',
        razon:      ($('#suple-razon')      || {}).value?.trim() || '',
      }),
    });
    if (!res.ok) throw new Error();
    const nuevo = await res.json();
    if (!currentPatient.suplementacion) currentPatient.suplementacion = [];
    currentPatient.suplementacion.push({
      id: nuevo.id, nombre,
      dosis:      ($('#suple-dosis')      || {}).value?.trim() || '',
      frecuencia: ($('#suple-frecuencia') || {}).value || '',
      razon:      ($('#suple-razon')      || {}).value?.trim() || '',
    });
    const list = $('#suple-list');
    if (list) list.innerHTML = renderSupleList(currentPatient.suplementacion);
    closeModal('suple-modal');
    toast('Suplemento agregado ✓');
  } catch (e) {
    toast('Error al guardar');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
  }
}

async function borrarSuple(id) {
  try {
    await fetch(`api/suplementacion.php?id=${id}`, { method: 'DELETE' });
    currentPatient.suplementacion = (currentPatient.suplementacion || []).filter(s => s.id !== id);
    const list = $('#suple-list');
    if (list) list.innerHTML = renderSupleList(currentPatient.suplementacion);
    toast('Suplemento eliminado');
  } catch (e) {
    toast('Error al eliminar');
  }
}

// ── Edición de recetas ────────────────────────────────
function recRemoveIng(rIdx, iIdx) {
  getRecMut()[rIdx].ing.splice(iIdx, 1);
  renderPickerContent();
}

function recToggleAddIng(rIdx) {
  _recAddOpen  = _recAddOpen === rIdx ? null : rIdx;
  _recAddQuery = '';
  _recAddCat   = 'Todos';
  renderPickerContent();
  if (_recAddOpen === rIdx) {
    setTimeout(() => {
      const el = $(`#rec-srch-${rIdx}`);
      if (el) el.focus();
      recSearchIng(rIdx);
    }, 30);
  }
}

function recSearchIng(rIdx) {
  const el = $(`#rec-res-${rIdx}`);
  if (!el) return;
  const q = (_recAddQuery || '').toLowerCase().trim();

  const results = _alimentos.filter(a =>
    !a.excluido &&
    (_recAddCat === 'Todos' || a.categoria === _recAddCat) &&
    (!q || a.nombre.toLowerCase().includes(q))
  ).slice(0, 30);

  if (!results.length) {
    el.innerHTML = `<div style="font-size:11px;color:var(--text-l);padding:8px">Sin resultados</div>`;
    return;
  }

  el.innerHTML = results.map(a => {
    const col = CAT_COL[a.categoria] || { bg:'var(--sage-ll)', fg:'var(--sage)', bar:'var(--sage)' };
    return `
      <div onclick="recAddIng(${rIdx},${a.id})"
           style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:8px;
                  cursor:pointer;transition:background .1s;border-bottom:1px solid var(--cream-d)"
           onmouseover="this.style.background='var(--white)'"
           onmouseout="this.style.background='transparent'">
        <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;background:${col.bg};
                    border:1px solid ${col.bar}22;display:flex;align-items:center;justify-content:center;
                    font-size:20px">${foodEmoji(a)}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:12px;font-weight:600;color:var(--forest)">${a.nombre}</span>
            <span style="font-size:9.5px;padding:1px 7px;border-radius:20px;background:${col.bg};color:${col.fg};font-weight:500">${a.categoria}</span>
          </div>
          <div style="font-size:10px;color:var(--text-l);margin-top:2px">${a.porcion_desc} · <b style="color:var(--forest)">${a.calorias} kcal</b></div>
          <div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap">
            <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--terra-l);color:var(--terra);font-weight:600">🥩 P ${a.proteina}g</span>
            <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--gold-l);color:var(--gold);font-weight:600">🌾 C ${a.carbos}g</span>
            <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--blush-l);color:var(--blush);font-weight:600">🫒 G ${a.grasas}g</span>
            <span style="font-size:9.5px;padding:1px 6px;border-radius:6px;background:var(--sage-ll);color:var(--sage);font-weight:600">🌿 F ${a.fibra}g</span>
          </div>
        </div>
      </div>`;
  }).join('');
}

function recSetCat(rIdx, cat) {
  _recAddCat = cat;
  renderPickerContent();
  setTimeout(() => recSearchIng(rIdx), 30);
}

function recAddIng(rIdx, alimId) {
  const food = _alimentos.find(a => a.id === alimId);
  if (!food) return;
  getRecMut()[rIdx].ing.push({
    alimId: alimId,
    label:  food.nombre,
    emoji:  foodEmoji(food),
    qty:    1,
    step:   0.5,
    min:    0,
    max:    10,
  });
  _recAddOpen  = null;
  _recAddQuery = '';
  renderPickerContent();
}

// ── Exportar plan como PDF ────────────────────────────
function generarPlanPDF() {
  const p = currentPatient;
  if (!p) return;

  const T       = planTargets(p, _planAct);
  const C       = planTotals();
  const fecha   = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const logoUrl = new URL('assets/img/logo.png', window.location.href).href;

  const MEAL_LABELS = {
    desayuno:    '🌅 Desayuno · 7:30 am',
    colacion_am: '🍎 Colación AM · 10:30 am',
    comida:      '🍽 Comida · 2:00 pm',
    colacion_pm: '🥑 Colación PM · 5:30 pm',
    cena:        '🌙 Cena · 8:00 pm',
  };
  const MEAL_COLORS = {
    desayuno: '#d4a843', colacion_am: '#c4714a', comida: '#4a7c59',
    colacion_pm: '#c4627a', cena: '#4a6fa5',
  };

  const mealsHtml = MEALS.map(m => {
    const items = _planSel[m.key] || [];
    if (!items.length) return '';
    const mKcal = Math.round(items.reduce((s, i) => s + i.calorias * i.porciones, 0));
    const color = MEAL_COLORS[m.key];
    const rows  = items.map(it => {
      const kcal  = Math.round(it.calorias * it.porciones);
      const prot  = +(it.proteina * it.porciones).toFixed(1);
      const carbs = +(it.carbos   * it.porciones).toFixed(1);
      const gras  = +(it.grasas   * it.porciones).toFixed(1);
      return `<tr>
        <td style="padding:5px 8px;font-size:9pt;color:#2c4a35">${it.nombre}</td>
        <td style="padding:5px 8px;font-size:9pt;color:#777;text-align:center">${it.porcion_desc} ×${it.porciones}</td>
        <td style="padding:5px 8px;font-size:9pt;font-weight:600;color:#2c4a35;text-align:center">${kcal}</td>
        <td style="padding:5px 8px;font-size:9pt;color:#9e5a3a;text-align:center">${prot}g</td>
        <td style="padding:5px 8px;font-size:9pt;color:#8a6a14;text-align:center">${carbs}g</td>
        <td style="padding:5px 8px;font-size:9pt;color:#9e3a5a;text-align:center">${gras}g</td>
      </tr>`;
    }).join('');
    return `<div style="margin-bottom:14px;border:1.5px solid ${color}33;border-radius:10px;overflow:hidden">
      <div style="background:${color}18;border-left:4px solid ${color};padding:8px 14px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:10.5pt;font-weight:700;color:${color}">${MEAL_LABELS[m.key]}</span>
        <span style="font-size:9pt;font-weight:600;color:#555">${mKcal} kcal</span>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#fafaf8">
            <th style="padding:4px 8px;font-size:8pt;color:#999;text-align:left;font-weight:500">Alimento</th>
            <th style="padding:4px 8px;font-size:8pt;color:#999;text-align:center;font-weight:500">Porción</th>
            <th style="padding:4px 8px;font-size:8pt;color:#999;text-align:center;font-weight:500">Kcal</th>
            <th style="padding:4px 8px;font-size:8pt;color:#c4714a;text-align:center;font-weight:500">Prot</th>
            <th style="padding:4px 8px;font-size:8pt;color:#d4a843;text-align:center;font-weight:500">Carbs</th>
            <th style="padding:4px 8px;font-size:8pt;color:#c4627a;text-align:center;font-weight:500">Grasas</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }).filter(Boolean).join('');

  const supleHtml = (p.suplementacion || []).length
    ? `<div style="margin-top:14px;border:1.5px solid #4a7c5933;border-radius:10px;overflow:hidden">
        <div style="background:#4a7c5918;border-left:4px solid #4a7c59;padding:8px 14px">
          <span style="font-size:10.5pt;font-weight:700;color:#4a7c59">💊 Suplementación</span>
        </div>
        <div style="padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px">
          ${(p.suplementacion || []).map(s =>
            `<span style="font-size:9pt;padding:3px 10px;border-radius:20px;background:#f0f7f2;border:1px solid #4a7c5944;color:#2c4a35">
              ${s.nombre}${s.dosis ? ' · ' + s.dosis : ''}${s.frecuencia ? ' · ' + s.frecuencia : ''}
            </span>`).join('')}
        </div>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Plan de Alimentación · ${p.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { margin:0; size:A4; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:10pt; color:#2c2c2c;
         line-height:1.5; padding:1.2cm 1.8cm; width:21cm; }
  .header { border-bottom:2.5px solid #4a7c59; padding-bottom:12px; margin-bottom:14px;
            display:flex; align-items:center; gap:16px; }
  .brand-txt { font-size:20pt; font-weight:700; color:#2c4a35; line-height:1.1; }
  .brand-txt em { color:#c4714a; font-style:normal; }
  .sub { font-size:8.5pt; color:#888; margin-top:3px; }
  .info-bar { display:flex; gap:0; margin-bottom:14px; border:1.5px solid #e8e4dc; border-radius:10px; overflow:hidden; }
  .info-cell { flex:1; padding:10px 14px; border-right:1px solid #e8e4dc; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:7.5pt; text-transform:uppercase; letter-spacing:.6px; color:#aaa; font-weight:600; margin-bottom:3px; }
  .info-cell .val { font-size:11pt; font-weight:700; color:#2c4a35; }
  .macros { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }
  .macro-box { border-radius:8px; padding:10px 12px; text-align:center; }
  .macro-box .mv { font-size:16pt; font-weight:700; line-height:1; }
  .macro-box .ml { font-size:7.5pt; text-transform:uppercase; letter-spacing:.5px; margin-top:3px; opacity:.7; }
  .footer { text-align:center; font-size:7.5pt; color:#ccc; border-top:1px solid #eee;
            padding-top:8px; margin-top:14px; }
</style>
</head>
<body>

<div class="header">
  <img src="${logoUrl}" style="width:60px;height:60px;object-fit:contain;flex-shrink:0" alt="GestaNut">
  <div>
    <div class="brand-txt">Gesta<em>Nut</em></div>
    <div class="sub">Diana Zavala · Nutrióloga · Cédula 15304166</div>
    <div class="sub">667 305 6211 · @gestanut · Culiacán, Sinaloa</div>
  </div>
  <div style="margin-left:auto;text-align:right">
    <div style="font-size:8pt;color:#aaa">Plan de Alimentación</div>
    <div style="font-size:8.5pt;font-weight:600;color:#4a7c59">${fecha}</div>
  </div>
</div>

<div class="info-bar">
  <div class="info-cell"><div class="lbl">Paciente</div><div class="val">${p.name}</div></div>
  <div class="info-cell"><div class="lbl">Calorías diarias</div><div class="val">${T.kcal} kcal</div></div>
  <div class="info-cell"><div class="lbl">Actividad</div><div class="val">${ACT_OPTS.find(o=>o.val===_planAct)?.label || 'Moderado'}</div></div>
  <div class="info-cell"><div class="lbl">Hidratación</div><div class="val">${T.agua} L / día</div></div>
</div>

<div class="macros">
  <div class="macro-box" style="background:#fff5f0;border:1.5px solid #c4714a33">
    <div class="mv" style="color:#c4714a">${T.prot}g</div>
    <div class="ml" style="color:#c4714a">🥩 Proteína</div>
  </div>
  <div class="macro-box" style="background:#fffbf0;border:1.5px solid #d4a84333">
    <div class="mv" style="color:#d4a843">${T.carbs}g</div>
    <div class="ml" style="color:#d4a843">🌾 Carbohidratos</div>
  </div>
  <div class="macro-box" style="background:#fff5f8;border:1.5px solid #c4627a33">
    <div class="mv" style="color:#c4627a">${T.grasas}g</div>
    <div class="ml" style="color:#c4627a">🫒 Grasas</div>
  </div>
  <div class="macro-box" style="background:#f0f7f2;border:1.5px solid #4a7c5933">
    <div class="mv" style="color:#4a7c59">${T.fibra}g</div>
    <div class="ml" style="color:#4a7c59">🌿 Fibra</div>
  </div>
</div>

${mealsHtml || '<div style="text-align:center;padding:30px;color:#aaa;font-size:11pt">Sin alimentos registrados en el plan</div>'}

${supleHtml}

<div style="margin-top:14px;padding:10px 14px;background:#f0f7ff;border-radius:8px;border:1px solid #4a6fa533;display:flex;align-items:center;gap:10px">
  <span style="font-size:18pt">💧</span>
  <div>
    <div style="font-size:10pt;font-weight:700;color:#4a6fa5">Hidratación: ${T.agua} litros de agua al día</div>
    <div style="font-size:8.5pt;color:#777;margin-top:2px">Distribuida a lo largo del día · Evita bebidas azucaradas</div>
  </div>
</div>

<div class="footer">
  GestaNut · Diana Zavala · Nutrióloga · ${fecha} · Este plan es personalizado y exclusivo para ${p.name}
</div>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=860,height=960,scrollbars=yes');
  if (!win) { toast('⚠️ Permite ventanas emergentes para exportar el PDF'); return; }
  win.document.write(html);
  win.document.close();
}

// ── Enviar plan por WhatsApp ──────────────────────────
function enviarPlanWA() {
  const p = currentPatient;
  if (!p) return;
  const nombre = p.name.split(' ')[0];
  const msg    = `Hola ${nombre}! Aqui te comparto tu plan de alimentacion:\nCualquier duda me avisas. Vamos con todo!`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
