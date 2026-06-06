// ══════════════════════════════════════════════════════
// GOOGLE CALENDAR · OAuth2 + sincronización de eventos
// ══════════════════════════════════════════════════════
const GCAL_CLIENT_ID_KEY = 'gcal_client_id';
const GCAL_TOKEN_KEY     = 'gcal_token';
const GCAL_EXPIRY_KEY    = 'gcal_token_expiry';

// Mapeo de colorId de Google Calendar a la paleta de la app
const GCAL_COLOR_MAP = {
  '1': 'info',   // Lavender
  '2': 'sage',   // Sage
  '3': 'blush',  // Grape
  '4': 'blush',  // Flamingo
  '5': 'gold',   // Banana
  '6': 'terra',  // Tangerine
  '7': 'info',   // Peacock
  '8': 'sage',   // Graphite
  '9': 'info',   // Blueberry
  '10': 'sage',  // Basil
  '11': 'terra', // Tomato
};

function gcalHasSetup() {
  return !!localStorage.getItem(GCAL_CLIENT_ID_KEY);
}

function gcalIsConnected() {
  const token  = localStorage.getItem(GCAL_TOKEN_KEY);
  const expiry = localStorage.getItem(GCAL_EXPIRY_KEY);
  return !!(token && expiry && Date.now() < parseInt(expiry));
}

function gcalSilentReconnect() {
  const clientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
  if (!clientId || !window.google?.accounts?.oauth2) return;
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/calendar',
    prompt: '',
    callback: (resp) => {
      if (resp.error) return;
      localStorage.setItem(GCAL_TOKEN_KEY, resp.access_token);
      localStorage.setItem(GCAL_EXPIRY_KEY, String(Date.now() + resp.expires_in * 1000));
      if (currentView === 'agenda') loadAgendaGcalEvents();
    },
  });
  client.requestAccessToken({ prompt: '' });
}

function gcalConnect() {
  const clientId = localStorage.getItem(GCAL_CLIENT_ID_KEY);
  if (!clientId) {
    _gcalShowSetupModal();
    return;
  }
  _gcalRequestToken(clientId);
}

function _gcalRequestToken(clientId) {
  if (!window.google?.accounts?.oauth2) {
    toast('⚠️ La biblioteca de Google aún no cargó. Intenta en unos segundos.');
    return;
  }
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/calendar',
    callback: (resp) => {
      if (resp.error) {
        toast('⚠️ Error de autorización: ' + resp.error);
        return;
      }
      localStorage.setItem(GCAL_TOKEN_KEY, resp.access_token);
      localStorage.setItem(GCAL_EXPIRY_KEY, String(Date.now() + resp.expires_in * 1000));
      toast('Google Calendar conectado ✓ · Cargando citas...');
      if (currentView === 'agenda') {
        showView('agenda');
      } else if (currentView === 'config') {
        showView('config');
      }
    },
  });
  client.requestAccessToken();
}

function gcalDisconnect() {
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  if (token && window.google?.accounts?.oauth2) {
    google.accounts.oauth2.revoke(token, () => {});
  }
  localStorage.removeItem(GCAL_TOKEN_KEY);
  localStorage.removeItem(GCAL_EXPIRY_KEY);
  localStorage.removeItem(GCAL_CLIENT_ID_KEY);
  toast('Google Calendar desconectado');
  if (currentView === 'agenda') showView('agenda');
  if (currentView === 'config') showView('config');
}

async function gcalFetchWeekEvents(startDate, endDate) {
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  if (!token) return [];
  try {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 401) {
      localStorage.removeItem(GCAL_TOKEN_KEY);
      localStorage.removeItem(GCAL_EXPIRY_KEY);
      toast('⚠️ Sesión de Google expirada. Reconecta el calendario.');
      if (currentView === 'agenda') showView('agenda');
      return [];
    }
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    console.error('gcalFetchWeekEvents:', e);
    toast('⚠️ No se pudieron cargar los eventos de Google Calendar');
    return [];
  }
}

async function gcalDeleteEventsByPatientName(nombre) {
  if (!gcalIsConnected()) return;
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  try {
    const past   = new Date(); past.setFullYear(past.getFullYear() - 1);
    const future = new Date(); future.setFullYear(future.getFullYear() + 2);
    const params = new URLSearchParams({
      timeMin: past.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: 'true',
      maxResults: '250',
      q: nombre,
    });
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + params,
      { headers: { Authorization: 'Bearer ' + token } }
    );
    if (!res.ok) return;
    const data   = await res.json();
    const events = (data.items || []).filter(ev => ev.summary && ev.summary.startsWith(nombre));
    for (const ev of events) {
      try {
        await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(ev.id),
          { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }
        );
      } catch (e) {}
    }
  } catch (e) {
    console.error('gcalDeleteEventsByPatientName:', e);
  }
}

async function gcalDeleteEvent(eventId) {
  if (!confirm('¿Eliminar este evento de Google Calendar?')) return;
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  if (!token) { toast('⚠️ Sesión expirada. Reconecta Google Calendar.'); return; }
  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(eventId),
      { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }
    );
    if (res.status === 204 || res.ok) {
      toast('Evento eliminado ✓');
      loadAgendaGcalEvents();
    } else if (res.status === 401) {
      localStorage.removeItem(GCAL_TOKEN_KEY);
      localStorage.removeItem(GCAL_EXPIRY_KEY);
      toast('⚠️ Sesión expirada. Reconecta Google Calendar.');
    } else {
      toast('⚠️ No se pudo eliminar el evento.');
    }
  } catch (e) {
    toast('⚠️ Error al eliminar el evento.');
  }
}

async function loadAgendaGcalEvents() {
  if (!gcalIsConnected()) {
    if (gcalHasSetup()) gcalSilentReconnect();
    return;
  }

  // Determine date range and column map based on active view
  const useChips = agendaViewMode === 'month' || agendaViewMode === 'quarter';
  let rangeStart, rangeEnd, colMap = {};

  if (agendaViewMode === 'day') {
    const d   = getDayDate(agendaOffset);
    rangeStart = new Date(d);
    rangeEnd   = new Date(d); rangeEnd.setDate(rangeEnd.getDate() + 1);
    colMap[toDateStr(d)] = 0;

  } else if (agendaViewMode === 'week') {
    const days = getWeekDates(agendaOffset);
    rangeStart = new Date(days[0]);
    rangeEnd   = new Date(days[6]); rangeEnd.setDate(rangeEnd.getDate() + 1);
    days.forEach((d, i) => { colMap[toDateStr(d)] = i; });

  } else if (agendaViewMode === 'month') {
    const ym    = getOffsetMonth(agendaOffset);
    const cells = getMonthGrid(ym.year, ym.month);
    rangeStart  = new Date(cells[0].date);
    rangeEnd    = new Date(cells[cells.length - 1].date); rangeEnd.setDate(rangeEnd.getDate() + 1);

  } else if (agendaViewMode === 'quarter') {
    const base   = agendaOffset * 3;
    const m0     = getOffsetMonth(base);
    const m2     = getOffsetMonth(base + 2);
    const cells0 = getMonthGrid(m0.year, m0.month);
    const cells2 = getMonthGrid(m2.year, m2.month);
    rangeStart   = new Date(cells0[0].date);
    rangeEnd     = new Date(cells2[cells2.length - 1].date); rangeEnd.setDate(rangeEnd.getDate() + 1);
  }

  const events = await gcalFetchWeekEvents(rangeStart, rangeEnd);

  const colStyle = {
    sage:  { bg: 'var(--sage-ll)',  border: 'var(--sage)'  },
    blush: { bg: 'var(--blush-l)', border: 'var(--blush)' },
    terra: { bg: 'var(--terra-l)', border: 'var(--terra)' },
    gold:  { bg: 'var(--gold-l)',  border: 'var(--gold)'  },
    info:  { bg: 'var(--info-l)',  border: 'var(--info)'  },
  };

  $$('.gcal-event').forEach(el => el.remove());

  for (const ev of events) {
    const dtStart = ev.start?.dateTime || (ev.start?.date ? ev.start.date + 'T00:00:00' : null);
    if (!dtStart) continue;

    const evStart = new Date(dtStart);
    const ds      = toDateStr(evStart);

    if (useChips) {
      const cell = document.getElementById('agenda-day-' + ds);
      if (!cell) continue;
      const container = cell.querySelector('.agenda-chips');
      if (!container) continue;
      const chip = document.createElement('div');
      chip.className = 'gcal-event';
      chip.style.cssText = 'font-size:10px;background:var(--sage-ll);border-left:2px solid var(--sage);border-radius:3px;padding:2px 4px 2px 5px;display:flex;align-items:center;gap:4px;overflow:hidden;cursor:pointer;min-width:0;';
      chip.title = ev.summary || 'Sin título';

      const label = document.createElement('span');
      label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;';
      label.textContent = (ev.start?.dateTime ? evStart.getHours() + ':' + String(evStart.getMinutes()).padStart(2,'0') + ' ' : '') + (ev.summary || 'Sin título');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '×';
      btn.title = 'Eliminar de Google Calendar';
      btn.style.cssText = 'flex-shrink:0;background:none;border:none;cursor:pointer;color:#c0392b;font-size:14px;font-weight:bold;line-height:1;padding:0 1px;display:inline-block;';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        gcalDeleteEvent(ev.id);
      });

      chip.appendChild(label);
      chip.appendChild(btn);
      container.appendChild(chip);

    } else {
      const colIdx = colMap[ds];
      if (colIdx === undefined) continue;
      const col = document.getElementById('agenda-col-' + colIdx);
      if (!col) continue;

      const evEnd    = ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(evStart.getTime() + 3600000);
      const startH   = evStart.getHours() + evStart.getMinutes() / 60;
      const endH     = evEnd.getHours()   + evEnd.getMinutes()   / 60;
      const topPx    = Math.round((startH - 8) * 55);
      const heightPx = Math.max(22, Math.round((endH - startH) * 55) - 4);

      if (topPx < 0 || topPx > 550) continue;

      const colorKey = GCAL_COLOR_MAP[ev.colorId] || 'sage';
      const cs       = colStyle[colorKey];
      const timeStr  = `${evStart.getHours()}:${String(evStart.getMinutes()).padStart(2, '0')}`;

      const div = document.createElement('div');
      div.className = 'gcal-event';
      div.style.cssText = `position:absolute;left:3px;right:3px;top:${topPx}px;height:${heightPx}px;background:${cs.bg};border-left:3px solid ${cs.border};border-radius:6px;padding:6px 8px;cursor:pointer;transition:transform .2s;overflow:hidden`;
      div.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:2px;">' +
          '<div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">' + (ev.summary || 'Sin título') + '</div>' +
          '<button class="gcal-del-btn" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:14px;font-weight:bold;line-height:1;padding:0 1px;flex-shrink:0;" title="Eliminar de Google Calendar">×</button>' +
        '</div>' +
        '<div style="font-size:10px;opacity:.75;">' + timeStr + '</div>';
      div.querySelector('.gcal-del-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        gcalDeleteEvent(ev.id);
      });
      div.addEventListener('mouseover', () => { div.style.transform = 'scale(1.02)'; });
      div.addEventListener('mouseout',  () => { div.style.transform = ''; });
      col.appendChild(div);
    }
  }
}

function _gcalShowSetupModal() {
  if (!$('#gcal-setup-modal')) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div class="modal-overlay" id="gcal-setup-modal">
      <div class="modal" style="max-width:540px">
        <div class="modal-head">
          <div class="modal-title">Conectar <em>Google Calendar</em></div>
          <button class="modal-close" onclick="closeModal('gcal-setup-modal')">✕</button>
        </div>
        <div class="modal-body">
          <div style="background:var(--sage-lll);border-radius:var(--rs);padding:14px 16px;font-size:12px;color:var(--text-m);margin-bottom:16px;line-height:1.9">
            <div style="font-weight:600;color:var(--forest);margin-bottom:8px">Pasos para obtener tu ID de cliente:</div>
            <ol style="margin:0;padding-left:18px">
              <li>Entra a <strong>console.cloud.google.com</strong></li>
              <li>Crea un proyecto nuevo y habilita la <strong>Google Calendar API</strong></li>
              <li>Ve a "Credenciales" → "Crear credenciales" → <strong>ID de cliente OAuth 2.0</strong></li>
              <li>Tipo de aplicación: <strong>Aplicación web</strong></li>
              <li>En "Orígenes de JavaScript autorizados" agrega:<br>
                <code style="background:var(--cream-d);padding:2px 6px;border-radius:3px;font-size:11px">http://localhost</code>
              </li>
              <li>Copia el <strong>ID de cliente</strong> generado y pégalo aquí abajo</li>
            </ol>
          </div>
          <div class="field">
            <label class="field-label">ID de cliente OAuth 2.0</label>
            <input id="gcal-client-id-input" class="input" placeholder="123456789-xxxxxxxxxxxx.apps.googleusercontent.com">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-outline" onclick="closeModal('gcal-setup-modal')">Cancelar</button>
          <button class="btn btn-primary" onclick="_gcalSaveClientId()">Guardar y conectar</button>
        </div>
      </div>
    </div>`;
    document.getElementById('modal-root').appendChild(wrapper.firstElementChild);
  }
  openModal('gcal-setup-modal');
}

function _gcalSaveClientId() {
  const input = $('#gcal-client-id-input');
  const id = input?.value?.trim();
  if (!id || !id.includes('.apps.googleusercontent.com')) {
    toast('⚠️ Ingresa un ID de cliente válido de Google');
    return;
  }
  localStorage.setItem(GCAL_CLIENT_ID_KEY, id);
  closeModal('gcal-setup-modal');
  _gcalRequestToken(id);
}

async function gcalCreateEvent(cita) {
  if (!gcalIsConnected()) return;
  const token = localStorage.getItem(GCAL_TOKEN_KEY);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [h, m] = cita.hora.split(':').map(Number);
  const pad = n => String(n).padStart(2, '0');
  const startStr = `${cita.fecha}T${pad(h)}:${pad(m)}:00`;
  const endDate = new Date(`${cita.fecha}T${pad(h)}:${pad(m)}:00`);
  endDate.setMinutes(endDate.getMinutes() + 60);
  const endStr = `${cita.fecha}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;

  const event = {
    summary: `${cita.paciente_nombre} · ${cita.tipo_consulta}`,
    description: cita.notas || '',
    start: { dateTime: startStr, timeZone: tz },
    end:   { dateTime: endStr,   timeZone: tz },
    colorId: '11',
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (res.status === 401) {
      localStorage.removeItem(GCAL_TOKEN_KEY);
      localStorage.removeItem(GCAL_EXPIRY_KEY);
    }
  } catch (e) {
    console.error('gcalCreateEvent:', e);
  }
}
