// ══════════════════════════════════════════════════════
// VIEW · Agenda — mes / semana / día / trimestre
// ══════════════════════════════════════════════════════

const MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES7 = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const HOURS_GRID = [8,9,10,11,12,13,14,15,16,17];

let agendaViewMode = 'month';
let agendaOffset   = 0;

function agendaNav(delta)    { agendaOffset += delta; showView('agenda'); }
function agendaSetView(mode) { agendaViewMode = mode; agendaOffset = 0; showView('agenda'); }

// ─── Helpers ──────────────────────────────────────────

function getWeekNumber(d) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay() || 7));
  const ys = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil((((dt - ys) / 86400000) + 1) / 7);
}

function toDateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function fmtHour(h) {
  return h < 12 ? h + 'am' : h === 12 ? '12pm' : (h - 12) + 'pm';
}

function getMonthGrid(year, month) {
  const firstDay    = new Date(year, month, 1);
  let startDow      = firstDay.getDay();
  startDow          = startDow === 0 ? 6 : startDow - 1;
  const prevLast    = new Date(year, month, 0).getDate();
  const lastDate    = new Date(year, month + 1, 0).getDate();
  const cells       = [];

  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, prevLast - i), other: true });
  for (let i = 1; i <= lastDate; i++)
    cells.push({ date: new Date(year, month, i), other: false });
  const rem = (7 - cells.length % 7) % 7;
  for (let i = 1; i <= rem; i++)
    cells.push({ date: new Date(year, month + 1, i), other: true });
  return cells;
}

function getOffsetMonth(offset) {
  const t = new Date();
  const d = new Date(t.getFullYear(), t.getMonth() + offset, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function getWeekDates(offset) {
  const today   = new Date();
  const dow     = today.getDay();
  const fromMon = dow === 0 ? 6 : dow - 1;
  const monday  = new Date(today);
  monday.setDate(today.getDate() - fromMon + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getDayDate(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

// ─── Sub-renders ──────────────────────────────────────

function renderMonthCells(cells, today, small) {
  const cellH  = small ? '70px'      : '100px';
  const numSz  = small ? '10px'      : '13px';
  const pad    = small ? '4px 5px'   : '7px 8px';
  const dotW   = small ? '17px'      : '21px';
  let html     = '';

  for (let i = 0; i < cells.length; i += 7) {
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);">';
    cells.slice(i, i + 7).forEach(function(cell) {
      const d       = cell.date;
      const other   = cell.other;
      const isToday = d.getTime() === today.getTime();
      const ds      = toDateStr(d);
      const numStyle = isToday
        ? 'background:var(--sage);color:#fff;border-radius:50%;width:' + dotW + ';height:' + dotW + ';display:inline-flex;align-items:center;justify-content:center;font-size:' + numSz + ';font-weight:700;flex-shrink:0;'
        : 'font-size:' + numSz + ';font-weight:500;color:var(--text);';
      html +=
        '<div id="agenda-day-' + ds + '" style="box-sizing:border-box;padding:' + pad + ';border-right:1px solid rgba(107,158,120,.06);border-bottom:1px solid rgba(107,158,120,.06);height:' + cellH + ';overflow:hidden;' + (other ? 'opacity:.35;' : '') + '">' +
          '<div style="' + numStyle + 'margin-bottom:3px;">' + d.getDate() + '</div>' +
          '<div class="agenda-chips" style="display:flex;flex-direction:column;gap:2px;overflow:hidden;"></div>' +
        '</div>';
    });
    html += '</div>';
  }
  return html;
}

function renderTimeGrid(days) {
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  const cols   = days.length;
  const grid   = '56px repeat(' + cols + ',1fr)';
  let header   = '<div style="display:grid;grid-template-columns:' + grid + ';border-bottom:1px solid rgba(107,158,120,.1);"><div></div>';

  days.forEach(function(d, i) {
    const isToday = d.getTime() === today.getTime();
    const name    = DAY_NAMES7[cols === 1 ? d.getDay() === 0 ? 6 : d.getDay() - 1 : i];
    header +=
      '<div style="padding:14px 10px;text-align:center;border-right:1px solid rgba(107,158,120,.06);' + (isToday ? 'background:var(--sage-lll)' : '') + '">' +
        '<div style="font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">' + name + '</div>' +
        '<div style="font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:600;">' + d.getDate() + '</div>' +
      '</div>';
  });
  header += '</div>';

  let body = '<div style="display:grid;grid-template-columns:' + grid + ';min-height:500px;">';
  body += '<div>' + HOURS_GRID.map(function(h) {
    return '<div style="height:55px;display:flex;align-items:flex-start;justify-content:flex-end;padding:5px 8px 0;border-bottom:1px solid var(--cream-d);"><span style="font-size:10px;color:var(--text-l);">' + fmtHour(h) + '</span></div>';
  }).join('') + '</div>';

  days.forEach(function(d, di) {
    const isToday = d.getTime() === today.getTime();
    body +=
      '<div id="agenda-col-' + di + '" data-date="' + toDateStr(d) + '" style="position:relative;border-right:1px solid rgba(107,158,120,.06);' + (isToday ? 'background:rgba(107,158,120,.02)' : '') + '">' +
        HOURS_GRID.map(function() { return '<div style="height:55px;border-bottom:1px solid var(--cream-d);"></div>'; }).join('') +
      '</div>';
  });
  body += '</div>';
  return header + body;
}

// ─── Main view ────────────────────────────────────────

VIEWS.agenda = function() {
  const today       = new Date(); today.setHours(0, 0, 0, 0);
  const isConnected = typeof gcalHasSetup === 'function' && gcalHasSetup();

  const viewDefs = [
    { key: 'month',   label: 'Mes'       },
    { key: 'week',    label: 'Semana'    },
    { key: 'day',     label: 'Día'       },
    { key: 'quarter', label: 'Trimestre' },
  ];
  const viewBtns = viewDefs.map(function(v) {
    const active = agendaViewMode === v.key ? 'btn-primary' : 'btn-outline';
    return '<button class="btn btn-xs ' + active + '" onclick="agendaSetView(\'' + v.key + '\')">' + v.label + '</button>';
  }).join('');

  let title = '', subtitle = '', grid = '';

  if (agendaViewMode === 'month') {
    const ym    = getOffsetMonth(agendaOffset);
    const cells = getMonthGrid(ym.year, ym.month);
    title    = MONTHS_ES[ym.month] + ' ' + ym.year;
    const dayHeader =
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid rgba(107,158,120,.1);">' +
        DAY_NAMES7.map(function(n) {
          return '<div style="padding:10px;text-align:center;font-size:10px;color:var(--text-m);text-transform:uppercase;letter-spacing:1px;">' + n + '</div>';
        }).join('') +
      '</div>';
    grid = '<div class="panel" style="overflow:hidden;">' + dayHeader + renderMonthCells(cells, today, false) + '</div>';

  } else if (agendaViewMode === 'week') {
    const days  = getWeekDates(agendaOffset);
    const wn    = getWeekNumber(days[0]);
    const first = days[0], last = days[6];
    const sameM = first.getMonth() === last.getMonth();
    title    = (sameM ? MONTHS_ES[first.getMonth()] : MONTHS_ES[first.getMonth()] + ' – ' + MONTHS_ES[last.getMonth()]) + ' ' + last.getFullYear();
    title   += ' · <em style="color:var(--terra)">Semana ' + wn + '</em>';
    subtitle = sameM
      ? first.getDate() + ' al ' + last.getDate() + ' de ' + MONTHS_ES[last.getMonth()].toLowerCase()
      : first.getDate() + ' ' + MONTHS_ES[first.getMonth()].toLowerCase().slice(0, 3) + ' – ' + last.getDate() + ' ' + MONTHS_ES[last.getMonth()].toLowerCase().slice(0, 3);
    grid = '<div class="panel">' + renderTimeGrid(days) + '</div>';

  } else if (agendaViewMode === 'day') {
    const d    = getDayDate(agendaOffset);
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    title    = d.toLocaleDateString('es-MX', opts).replace(/^\w/, function(c) { return c.toUpperCase(); });
    grid     = '<div class="panel">' + renderTimeGrid([d]) + '</div>';

  } else if (agendaViewMode === 'quarter') {
    const base   = agendaOffset * 3;
    const months3 = [0, 1, 2].map(function(i) { return getOffsetMonth(base + i); });
    title = MONTHS_ES[months3[0].month] + ' – ' + MONTHS_ES[months3[2].month] + ' ' + months3[2].year;
    let quarterHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);">';
    months3.forEach(function(ym, mi) {
      const cells    = getMonthGrid(ym.year, ym.month);
      const dayHead  = '<div style="display:grid;grid-template-columns:repeat(7,1fr);">' +
        DAY_NAMES7.map(function(n) {
          return '<div style="padding:5px 3px;text-align:center;font-size:9px;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;">' + n + '</div>';
        }).join('') + '</div>';
      quarterHtml +=
        '<div style="border-right:' + (mi < 2 ? '1px solid rgba(107,158,120,.12)' : 'none') + ';padding:12px 8px;">' +
          '<div style="text-align:center;font-family:\'Cormorant Garamond\',serif;font-size:16px;font-weight:600;padding-bottom:8px;color:var(--forest);">' + MONTHS_ES[ym.month] + ' ' + ym.year + '</div>' +
          dayHead +
          renderMonthCells(cells, today, true) +
        '</div>';
    });
    quarterHtml += '</div>';
    grid = '<div class="panel" style="overflow:hidden;">' + quarterHtml + '</div>';
  }

  const gcalBtns = isConnected
    ? '<span class="badge b-sage"><span class="dot-pulse"></span>&nbsp;Google Calendar sync</span>' +
      '<button class="btn btn-outline btn-xs" style="font-size:11px;" onclick="gcalDisconnect()">Desconectar</button>'
    : '<button class="btn btn-outline btn-sm" onclick="gcalConnect()">📅 Conectar Google Calendar</button>';

  const gcalBanner = !isConnected
    ? '<div style="margin-top:16px;background:var(--sage-lll);border-radius:var(--rs);padding:16px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
        '<div style="font-size:32px;">📅</div>' +
        '<div style="flex:1;min-width:200px;">' +
          '<div style="font-weight:500;font-size:14px;margin-bottom:4px;">Conecta Google Calendar para ver tus citas aquí</div>' +
          '<div style="font-size:12px;color:var(--text-m);">Sincroniza tu agenda automáticamente y visualiza todas tus citas en una sola vista.</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" onclick="gcalConnect()">Conectar ahora</button>' +
      '</div>'
    : '';

  return '<div class="view active">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:12px;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<button class="btn-icon" onclick="agendaNav(-1)">‹</button>' +
        '<div>' +
          '<div style="font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:600;color:var(--forest);">' + title + '</div>' +
          (subtitle ? '<div class="muted-sm">' + subtitle + '</div>' : '') +
        '</div>' +
        '<button class="btn-icon" onclick="agendaNav(1)">›</button>' +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
        '<div style="display:flex;gap:4px;">' + viewBtns + '</div>' +
        gcalBtns +
        '<button class="btn btn-primary btn-sm" onclick="openModal(\'appt-modal\')">+ Nueva cita</button>' +
      '</div>' +
    '</div>' +
    grid +
    gcalBanner +
  '</div>';
};

// ─── Load citas ───────────────────────────────────────

async function eliminarCita(id) {
  if (!confirm('¿Eliminar esta cita?')) return;
  try {
    const res = await fetch('api/citas.php?id=' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    toast('Cita eliminada ✓');
    loadAgendaCitas();
  } catch (e) {
    toast('No se pudo eliminar. Revisa la conexión.');
  }
}

async function loadAgendaCitas() {
  let desde, hasta;
  const colMap = {};

  if (agendaViewMode === 'day') {
    const d   = getDayDate(agendaOffset);
    desde     = hasta = toDateStr(d);
    colMap[desde] = 0;

  } else if (agendaViewMode === 'week') {
    const days = getWeekDates(agendaOffset);
    desde      = toDateStr(days[0]);
    hasta      = toDateStr(days[6]);
    days.forEach(function(d, i) { colMap[toDateStr(d)] = i; });

  } else if (agendaViewMode === 'month') {
    const ym    = getOffsetMonth(agendaOffset);
    const cells = getMonthGrid(ym.year, ym.month);
    desde       = toDateStr(cells[0].date);
    hasta       = toDateStr(cells[cells.length - 1].date);

  } else if (agendaViewMode === 'quarter') {
    const base   = agendaOffset * 3;
    const cells0 = getMonthGrid.apply(null, (function() { const m = getOffsetMonth(base);     return [m.year, m.month]; })());
    const cells2 = getMonthGrid.apply(null, (function() { const m = getOffsetMonth(base + 2); return [m.year, m.month]; })());
    desde = toDateStr(cells0[0].date);
    hasta = toDateStr(cells2[cells2.length - 1].date);
  }

  let citas = [];
  try {
    const res = await fetch('api/citas.php?desde=' + desde + '&hasta=' + hasta);
    if (res.ok) citas = await res.json();
  } catch (e) { return; }

  $$('.local-cita').forEach(function(el) { el.remove(); });
  $$('.local-chip').forEach(function(el) { el.remove(); });

  const useChips = agendaViewMode === 'month' || agendaViewMode === 'quarter';

  for (const c of citas) {
    const evDate = new Date(c.fecha + 'T00:00:00');
    const ds     = toDateStr(evDate);

    if (useChips) {
      const cell = document.getElementById('agenda-day-' + ds);
      if (!cell) continue;
      const container = cell.querySelector('.agenda-chips');
      if (!container) continue;
      const chip = document.createElement('div');
      chip.className = 'local-chip';
      chip.style.cssText = 'font-size:10px;background:var(--blush-l);border-left:2px solid var(--blush);border-radius:3px;padding:2px 4px 2px 5px;display:flex;align-items:center;gap:4px;overflow:hidden;cursor:pointer;min-width:0;';
      chip.title = c.paciente_nombre + ' · ' + c.tipo_consulta;

      const label = document.createElement('span');
      label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;';
      label.textContent = c.hora.slice(0, 5) + ' ' + c.paciente_nombre;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.title = 'Eliminar cita';
      btn.style.cssText = 'flex-shrink:0;background:none;border:none;cursor:pointer;color:#c0392b;font-size:14px;font-weight:bold;line-height:1;padding:0 1px;display:inline-block;';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        eliminarCita(c.id);
      });

      chip.appendChild(label);
      chip.appendChild(btn);
      container.appendChild(chip);
    } else {
      const di = colMap[ds];
      if (di === undefined) continue;
      const col = document.getElementById('agenda-col-' + di);
      if (!col) continue;

      const parts = c.hora.split(':');
      const h = parseInt(parts[0]), m = parseInt(parts[1]);
      const topPx = Math.round((h + m / 60 - 8) * 55);
      if (topPx < 0 || topPx > 550) continue;

      const div = document.createElement('div');
      div.className = 'local-cita';
      div.style.cssText = 'position:absolute;left:3px;right:3px;top:' + topPx + 'px;height:46px;background:var(--blush-l);border-left:3px solid var(--blush);border-radius:6px;padding:6px 8px;cursor:pointer;transition:transform .2s;overflow:hidden;';
      div.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:2px;">' +
          '<div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">' + c.paciente_nombre + '</div>' +
          '<button onclick="event.stopPropagation();eliminarCita(' + c.id + ')" style="background:none;border:none;cursor:pointer;color:var(--terra);font-size:13px;line-height:1;padding:0;opacity:.5;flex-shrink:0;" title="Eliminar cita">✕</button>' +
        '</div>' +
        '<div style="font-size:10px;opacity:.75;">' + h + ':' + String(m).padStart(2, '0') + ' · ' + c.tipo_consulta + '</div>';
      div.addEventListener('mouseover', function() { div.style.transform = 'scale(1.02)'; });
      div.addEventListener('mouseout',  function() { div.style.transform = ''; });
      col.appendChild(div);
    }
  }
}
