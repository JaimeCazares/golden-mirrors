// ══════════════════════════════════════════════════════
// VIEW · Calculadoras clínicas
// ══════════════════════════════════════════════════════
VIEWS.calculadoras = () => `<div class="view active">
  <div class="g4 mb">
    ${[['⚖️','IMC','imc'],['🔥','Calorías','kcal'],['💧','Agua','water'],['🤰','Gestacional','gest']].map(([i, l, k]) => `<div class="panel" style="padding:22px;cursor:pointer;border:2px solid transparent;transition:all .2s" onclick="document.getElementById('c-${k}').scrollIntoView({behavior:'smooth'})" onmouseover="this.style.borderColor='var(--sage)'" onmouseout="this.style.borderColor='transparent'"><div style="font-size:32px;margin-bottom:10px">${i}</div><div style="font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--forest);font-weight:600">${l}</div></div>`).join('')}
  </div>

  <!-- IMC -->
  <div class="panel mb" id="c-imc">
    <div class="panel-head"><div class="panel-title"><span class="pt-icon">⚖️</span>Índice de Masa Corporal</div></div>
    <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="field"><label class="field-label">Peso (kg)</label><input class="input" type="number" id="imc-w" value="65" oninput="recalcIMC()"></div>
        <div class="field"><label class="field-label">Altura (m)</label><input class="input" type="number" step="0.01" id="imc-h" value="1.65" oninput="recalcIMC()"></div>
      </div>
      <div style="background:linear-gradient(135deg,var(--sage-ll),var(--cream));border-radius:var(--r);padding:24px;text-align:center">
        <div class="muted-sm" style="text-transform:uppercase;letter-spacing:1px;font-size:10px;margin-bottom:6px">IMC</div>
        <div id="imc-r" style="font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:600;color:var(--forest);line-height:1">23.9</div>
        <div id="imc-c" style="font-size:14px;font-weight:500;color:var(--sage);margin-bottom:14px">Peso normal</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">
          ${[
            ['#e8f1f7', 'var(--info)',    '&lt;18.5', 'Bajo'],
            ['var(--sage-ll)', 'var(--sage)', '18.5-25', 'Normal'],
            ['var(--gold-l)', '#8a6a14',   '25-30',  'Sobrepeso'],
            ['var(--terra-l)', 'var(--terra-d)', '≥30', 'Obesidad'],
          ].map(([bg, co, r, l]) => `<div style="padding:6px 3px;background:${bg};border-radius:6px;font-size:9px;color:${co};text-align:center">${r}<br>${l}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- KCAL -->
  <div class="panel mb" id="c-kcal">
    <div class="panel-head"><div class="panel-title"><span class="pt-icon">🔥</span>Requerimiento calórico · Mifflin-St Jeor</div></div>
    <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div>
        <div class="field-row">
          <div class="field"><label class="field-label">Peso (kg)</label><input class="input" type="number" id="kc-w" value="65" oninput="recalcKcal()"></div>
          <div class="field"><label class="field-label">Altura (m)</label><input class="input" type="number" step="0.01" id="kc-h" value="1.65" oninput="recalcKcal()"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Edad</label><input class="input" type="number" id="kc-age" value="30" oninput="recalcKcal()"></div>
          <div class="field"><label class="field-label">Sexo</label><select class="select" id="kc-sex" onchange="recalcKcal()">
            <option value="femenino" selected>Femenino</option><option value="masculino">Masculino</option>
          </select></div>
        </div>
        <div class="field-row">
          <div class="field" style="flex:1"><label class="field-label">Actividad</label><select class="select" id="kc-act" onchange="recalcKcal()">
            <option value="1.2">Sedentaria</option><option value="1.375">Ligera</option>
            <option value="1.55" selected>Moderada</option><option value="1.725">Activa</option><option value="1.9">Muy activa</option>
          </select></div>
        </div>
        <div class="field"><label class="field-label">Objetivo</label><select class="select" id="kc-goal" onchange="recalcKcal()">
          <option value="0.85">Pérdida de peso (-15%)</option><option value="1" selected>Mantenimiento</option>
          <option value="1.1">Recomposición (+10%)</option><option value="1.15">Ganancia muscular (+15%)</option>
        </select></div>
      </div>
      <div style="background:linear-gradient(135deg,var(--terra-l),var(--cream));border-radius:var(--r);padding:24px">
        <div style="text-align:center;margin-bottom:16px">
          <div class="muted-sm" style="text-transform:uppercase;letter-spacing:1px;font-size:10px">Calorías diarias</div>
          <div id="kc-tot" style="font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:600;color:var(--terra-d);line-height:1;margin:6px 0">2,015</div>
          <div class="muted-sm" id="kc-tmb">TMB: 1,300 kcal</div>
        </div>
        <div id="kc-macros" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px dashed rgba(196,113,74,.3);padding-top:14px"></div>
      </div>
    </div>
  </div>

  <!-- AGUA + GESTACIONAL -->
  <div class="g2 mb">
    <div class="panel" id="c-water">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">💧</span>Hidratación diaria</div></div>
      <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center">
        <div>
          <div class="field"><label class="field-label">Peso (kg)</label><input class="input" type="number" id="aw-w" value="65" oninput="recalcWater()"></div>
          <div class="field"><label class="field-label">Actividad física</label><select class="select" id="aw-act" onchange="recalcWater()">
            <option value="0">Sedentaria</option><option value="350">Ligera (30 min/día)</option>
            <option value="700">Moderada (1 hr/día)</option><option value="1000">Intensa (+1 hr/día)</option>
          </select></div>
          <div class="field"><label class="field-label">Embarazo</label><select class="select" id="aw-preg" onchange="recalcWater()">
            <option value="0">No</option><option value="13">1er trim.</option><option value="20">2do trim.</option><option value="32">3er trim.</option>
          </select></div>
        </div>
        <div style="background:linear-gradient(135deg,var(--info-l),var(--cream));border-radius:var(--r);padding:20px;text-align:center">
          <div style="font-size:36px">💧</div>
          <div id="aw-r" style="font-family:'Cormorant Garamond',serif;font-size:40px;color:var(--info);font-weight:600;line-height:1">2.3 L</div>
          <div class="muted-sm" id="aw-l" style="margin-top:6px">≈ 9 vasos de 250ml</div>
        </div>
      </div>
    </div>
    <div class="panel" id="c-gest">
      <div class="panel-head"><div class="panel-title"><span class="pt-icon">🤰</span>Ganancia gestacional · IOM 2009</div></div>
      <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center">
        <div>
          <div class="field"><label class="field-label">Peso pre-embarazo (kg)</label><input class="input" type="number" id="gst-w" value="62" oninput="recalcGest()"></div>
          <div class="field"><label class="field-label">Altura (m)</label><input class="input" type="number" step="0.01" id="gst-h" value="1.65" oninput="recalcGest()"></div>
        </div>
        <div style="background:linear-gradient(135deg,var(--blush-l),var(--cream));border-radius:var(--r);padding:20px">
          <div class="muted-sm" style="font-size:10px;text-transform:uppercase;letter-spacing:1px">Rango ideal total</div>
          <div id="gst-r" style="font-family:'Cormorant Garamond',serif;font-size:28px;color:#9e3a5a;font-weight:600;line-height:1;margin:6px 0">11.5 - 16 kg</div>
          <div class="muted-sm" id="gst-c">IMC pre: 22.8 · Normal</div>
          <div style="margin-top:10px;font-size:11px;color:var(--text-m)">Por semana: <strong id="gst-s">~0.5 kg/sem</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>`;

function recalcIMC() {
  const w = parseFloat($('#imc-w')?.value) || 65;
  const h = parseFloat($('#imc-h')?.value) || 1.65;
  const i = calcIMC(w, h);
  const c = imcCat(i);
  if ($('#imc-r')) $('#imc-r').textContent = i;
  if ($('#imc-c')) { $('#imc-c').textContent = c.label; $('#imc-c').style.color = c.c; }
}

function recalcKcal() {
  const w    = parseFloat($('#kc-w')?.value)   || 65;
  const h    = parseFloat($('#kc-h')?.value)   || 1.65;
  const a    = parseInt($('#kc-age')?.value)   || 30;
  const sex  = $('#kc-sex')?.value             || 'femenino';
  const act  = parseFloat($('#kc-act')?.value) || 1.55;
  const goal = parseFloat($('#kc-goal')?.value) || 1;
  const tmb  = calcTMB(w, h, a, sex);
  const tot  = Math.round(tmb * act * goal);
  if ($('#kc-tot')) $('#kc-tot').textContent = tot.toLocaleString();
  if ($('#kc-tmb')) $('#kc-tmb').textContent = `TMB: ${tmb.toLocaleString()} kcal · GET: ${Math.round(tmb * act).toLocaleString()} kcal`;
  if ($('#kc-macros')) $('#kc-macros').innerHTML = [
    ['Proteína', Math.round(tot * .30 / 4) + 'g', 'sage'],
    ['Carbos',   Math.round(tot * .45 / 4) + 'g', 'gold'],
    ['Grasa',    Math.round(tot * .25 / 9) + 'g', 'terra'],
  ].map(([l, v, c]) => `<div style="text-align:center;background:var(--white);border-radius:var(--rs);padding:10px"><div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:var(--${c})">${v}</div><div class="muted-sm" style="font-size:10px">${l}</div></div>`).join('');
}

function recalcWater() {
  const w   = parseFloat($('#aw-w')?.value)    || 65;
  const act = parseInt($('#aw-act')?.value)    || 0;
  const sem = parseInt($('#aw-preg')?.value)   || 0;
  const ml  = calcWater(w, sem, act);
  if ($('#aw-r')) $('#aw-r').textContent = (ml / 1000).toFixed(1) + ' L';
  if ($('#aw-l')) $('#aw-l').textContent = `≈ ${Math.round(ml / 250)} vasos de 250ml`;
}

function recalcGest() {
  const w   = parseFloat($('#gst-w')?.value) || 62;
  const h   = parseFloat($('#gst-h')?.value) || 1.65;
  const imc = parseFloat(calcIMC(w, h));
  const g   = calcGanancia(imc);
  if ($('#gst-r')) $('#gst-r').textContent = `${g.min} - ${g.max} kg`;
  if ($('#gst-c')) $('#gst-c').textContent = `IMC pre: ${imc} · ${g.l}`;
  if ($('#gst-s')) $('#gst-s').textContent = imc < 25 ? '~0.5 kg/sem' : imc < 30 ? '~0.3 kg/sem' : '~0.2 kg/sem';
}
