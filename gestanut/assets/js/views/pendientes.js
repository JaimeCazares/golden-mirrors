// ══════════════════════════════════════════════════════
// VIEW · Pendientes — Notas y listas personales
// ══════════════════════════════════════════════════════
(function () {

  var PENDIENTES = [];
  var _loaded    = false;

  // ── API ──
  function _apiGet() {
    return fetch('api/pendientes.php').then(r => r.json());
  }
  function _apiPost(body) {
    return fetch('api/pendientes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json());
  }
  function _apiPatch(body) {
    return fetch('api/pendientes.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json());
  }
  function _apiDelete(id) {
    return fetch('api/pendientes.php?id=' + id, { method: 'DELETE' }).then(r => r.json());
  }

  // ── UTILS ──
  function _esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _fmtFecha(ts) {
    if (!ts) return '';
    const d = new Date(ts.replace(' ','T'));
    return d.toLocaleDateString('es-MX', {day:'2-digit',month:'short',year:'numeric'});
  }
  function _rerender() {
    const area = $('#content-area');
    if (area && currentView === 'pendientes') area.innerHTML = VIEWS.pendientes();
  }

  // ── COLOR MAP ──
  const BG = {
    sage:'var(--sage-ll)', gold:'var(--gold-l)', terra:'var(--terra-l)',
    blush:'var(--blush-l)', info:'var(--info-l)', cream:'var(--cream-d)'
  };

  // ── CARD RENDERERS ──
  function _cardNota(n) {
    const bg = BG[n.color] || BG.sage;
    return `
    <div class="pend-card" style="background:${bg};border-color:transparent">
      <div class="pend-card-head">
        <div class="pend-card-title">${_esc(n.titulo) || 'Sin título'}</div>
        <div style="display:flex;gap:4px">
          <button class="btn-icon" onclick="pEditNote(${n.id})" title="Editar">✏️</button>
          <button class="btn-icon pend-del" onclick="pDeleteItem(${n.id})" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="pend-card-body">${_esc(n.contenido).replace(/\n/g,'<br>')}</div>
      <div class="pend-card-meta">${_fmtFecha(n.created_at)}</div>
    </div>`;
  }

  function _cardLista(l) {
    const items  = l.items || [];
    const done   = items.filter(i => i.done).length;
    const total  = items.length;
    const allDone = total > 0 && done === total;
    return `
    <div class="pend-card" data-plist="${l.id}">
      <div class="pend-card-head">
        <div class="pend-card-title">☑&nbsp;${_esc(l.titulo)}</div>
        <button class="btn-icon pend-del" onclick="pDeleteItem(${l.id})" title="Eliminar">🗑</button>
      </div>
      <div class="pend-card-body" id="plist-body-${l.id}">
        ${items.length === 0
          ? '<div class="pend-empty-hint">Agrega el primer elemento abajo</div>'
          : items.map(it => `
            <label class="pend-check${it.done?' done':''}">
              <input type="checkbox" ${it.done?'checked':''} onchange="pToggleItem(${l.id},${it.id})">
              <span>${_esc(it.texto)}</span>
            </label>`).join('')}
      </div>
      <div class="pend-add-row">
        <input type="text" class="pend-add-input" id="pnew-${l.id}"
          placeholder="Agregar elemento..." onkeydown="if(event.key==='Enter')pAddItem(${l.id})">
        <button class="btn btn-sage btn-xs" onclick="pAddItem(${l.id})">+</button>
      </div>
      <div class="pend-card-meta" id="plist-meta-${l.id}" ${total===0?'style="display:none"':''}>
        ${done}/${total} completados${allDone?' · ✓ ¡Listo!':''}
      </div>
    </div>`;
  }

  // ── MAIN VIEW ──
  VIEWS.pendientes = () => {
    if (!_loaded) {
      return `<div class="view active">
        <div class="pend-toolbar">
          <button class="btn btn-primary" onclick="pOpenModal('nota')">✏️&nbsp; Nueva nota</button>
          <button class="btn btn-sage"    onclick="pOpenModal('lista')">☑️&nbsp; Nueva lista</button>
        </div>
        <div style="text-align:center;padding:72px 24px;color:var(--text-l)">
          <div style="font-size:36px;margin-bottom:12px">⏳</div>
          <div>Cargando pendientes...</div>
        </div>
      </div>`;
    }

    const items = PENDIENTES;
    const cards = items.map(it => it.tipo === 'nota' ? _cardNota(it) : _cardLista(it)).join('');

    _ensureModal();
    return `<div class="view active">
      <div class="pend-toolbar">
        <button class="btn btn-primary" onclick="pOpenModal('nota')">✏️&nbsp; Nueva nota</button>
        <button class="btn btn-sage"    onclick="pOpenModal('lista')">☑️&nbsp; Nueva lista</button>
        ${items.length > 0 ? `<span class="pend-count">${items.length} elemento${items.length!==1?'s':''}</span>` : ''}
      </div>

      ${items.length === 0
        ? `<div class="panel" style="text-align:center;padding:72px 24px">
            <div style="font-size:56px;margin-bottom:18px">📌</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:8px">Sin pendientes</div>
            <div class="muted-sm">Crea una nota rápida o una lista de tareas</div>
          </div>`
        : `<div class="pend-grid">${cards}</div>`}
    </div>`;
  };

  // ── MIGRACIÓN única desde localStorage ──
  function _migrateLS() {
    const raw = localStorage.getItem('gestanut-pend');
    if (!raw) return Promise.resolve();
    try {
      const old = JSON.parse(raw);
      if (!old.items || !old.items.length) { localStorage.removeItem('gestanut-pend'); return Promise.resolve(); }
      const posts = old.items.slice().reverse().map(it =>
        _apiPost({ tipo: it.tipo || 'nota', titulo: it.titulo || '', contenido: it.contenido || '', color: it.color || 'sage', items: it.items || [] })
      );
      return Promise.all(posts).then(() => localStorage.removeItem('gestanut-pend'));
    } catch(e) { return Promise.resolve(); }
  }

  // ── INIT (nav.js llama esto al mostrar la vista) ──
  window.initPendientes = function () {
    _loaded = false;
    _rerender();
    _migrateLS().then(() => _apiGet()).then(data => {
      PENDIENTES = data;
      _loaded    = true;
      _rerender();
    }).catch(() => {
      _loaded = true;
      toast('Error al cargar pendientes', '⚠️');
      _rerender();
    });
  };

  // ── MODAL (appendeado al body para evitar el bug de transform en .view) ──
  var _tipo   = 'nota';
  var _color  = 'sage';
  var _editId = null;

  function _ensureModal() {
    if (document.getElementById('pend-modal')) return;
    const div = document.createElement('div');
    div.id        = 'pend-modal';
    div.className = 'pend-modal-overlay';
    div.addEventListener('click', e => { if (e.target === div) pCloseModal(); });
    div.innerHTML = `
      <div class="panel pend-modal-box">
        <div class="pend-modal-head">
          <div id="pend-modal-title" class="panel-title" style="font-size:20px"></div>
          <button class="btn-icon" onclick="pCloseModal()">✕</button>
        </div>
        <div id="pend-nota-fields">
          <div class="field">
            <label class="field-label">Título</label>
            <input type="text" id="pend-nota-titulo" class="input" placeholder="Dale un título a tu nota...">
          </div>
          <div class="field">
            <label class="field-label">Contenido</label>
            <textarea id="pend-nota-contenido" class="textarea" rows="5"
              placeholder="Escribe tus apuntes aquí..."></textarea>
          </div>
          <div class="field">
            <label class="field-label">Color</label>
            <div style="display:flex;gap:10px;margin-top:4px">
              <button type="button" class="pend-color-btn selected" data-color="sage"  style="background:${BG.sage}"  onclick="pSelectColor(this)"></button>
              <button type="button" class="pend-color-btn" data-color="gold"  style="background:${BG.gold}"  onclick="pSelectColor(this)"></button>
              <button type="button" class="pend-color-btn" data-color="terra" style="background:${BG.terra}" onclick="pSelectColor(this)"></button>
              <button type="button" class="pend-color-btn" data-color="blush" style="background:${BG.blush}" onclick="pSelectColor(this)"></button>
              <button type="button" class="pend-color-btn" data-color="info"  style="background:${BG.info}"  onclick="pSelectColor(this)"></button>
              <button type="button" class="pend-color-btn" data-color="cream" style="background:${BG.cream}" onclick="pSelectColor(this)"></button>
            </div>
          </div>
        </div>
        <div id="pend-lista-fields" style="display:none">
          <div class="field">
            <label class="field-label">Nombre de la lista</label>
            <input type="text" id="pend-lista-titulo" class="input"
              placeholder="Ej: Lista de compras, Tareas de la semana...">
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-outline" onclick="pCloseModal()">Cancelar</button>
          <button class="btn btn-primary" id="pend-save-btn" onclick="pSave()">Guardar</button>
        </div>
      </div>`;
    document.body.appendChild(div);
  }

  window.pOpenModal = function (tipo) {
    _tipo   = tipo;
    _color  = 'sage';
    _editId = null;
    _ensureModal();
    const modal = document.getElementById('pend-modal');
    if (!modal) return;
    document.getElementById('pend-modal-title').textContent   = tipo === 'nota' ? 'Nueva nota' : 'Nueva lista';
    document.getElementById('pend-save-btn').textContent      = 'Guardar';
    document.getElementById('pend-nota-fields').style.display  = tipo === 'nota'  ? '' : 'none';
    document.getElementById('pend-lista-fields').style.display = tipo === 'lista' ? '' : 'none';
    if (tipo === 'nota') {
      document.getElementById('pend-nota-titulo').value    = '';
      document.getElementById('pend-nota-contenido').value = '';
      document.querySelectorAll('.pend-color-btn').forEach(b =>
        b.classList.toggle('selected', b.dataset.color === 'sage'));
    } else {
      document.getElementById('pend-lista-titulo').value = '';
    }
    modal.classList.add('open');
    setTimeout(() => {
      const first = tipo === 'nota'
        ? document.getElementById('pend-nota-titulo')
        : document.getElementById('pend-lista-titulo');
      if (first) first.focus();
    }, 60);
  };

  window.pEditNote = function (id) {
    const nota = PENDIENTES.find(i => i.id === id);
    if (!nota) return;
    _tipo   = 'nota';
    _color  = nota.color || 'sage';
    _editId = id;
    _ensureModal();
    const modal = document.getElementById('pend-modal');
    if (!modal) return;
    document.getElementById('pend-modal-title').textContent  = 'Editar nota';
    document.getElementById('pend-save-btn').textContent     = 'Guardar cambios';
    document.getElementById('pend-nota-fields').style.display  = '';
    document.getElementById('pend-lista-fields').style.display = 'none';
    document.getElementById('pend-nota-titulo').value    = nota.titulo || '';
    document.getElementById('pend-nota-contenido').value = nota.contenido || '';
    document.querySelectorAll('.pend-color-btn').forEach(b =>
      b.classList.toggle('selected', b.dataset.color === _color));
    modal.classList.add('open');
    setTimeout(() => document.getElementById('pend-nota-titulo').focus(), 60);
  };

  window.pCloseModal = function () {
    const modal = document.getElementById('pend-modal');
    if (modal) modal.classList.remove('open');
  };

  window.pSelectColor = function (btn) {
    _color = btn.dataset.color;
    document.querySelectorAll('.pend-color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };

  window.pSave = function () {
    const saveBtn = document.getElementById('pend-save-btn');
    if (saveBtn) saveBtn.disabled = true;

    let body;
    if (_tipo === 'nota') {
      const titulo    = document.getElementById('pend-nota-titulo')?.value.trim()    || '';
      const contenido = document.getElementById('pend-nota-contenido')?.value.trim() || '';
      if (!titulo && !contenido) {
        toast('Escribe algo en la nota', '⚠️');
        if (saveBtn) saveBtn.disabled = false;
        return;
      }
      body = { titulo, contenido, color: _color };
    } else {
      const titulo = document.getElementById('pend-lista-titulo')?.value.trim();
      if (!titulo) {
        toast('Ponle un nombre a la lista', '⚠️');
        if (saveBtn) saveBtn.disabled = false;
        return;
      }
      body = { tipo: 'lista', titulo, contenido: '', color: 'sage', items: [] };
    }

    if (_editId) {
      _apiPatch({ id: _editId, ...body }).then(() => {
        const nota = PENDIENTES.find(i => i.id === _editId);
        if (nota) { nota.titulo = body.titulo; nota.contenido = body.contenido; nota.color = body.color; }
        pCloseModal();
        _rerender();
        toast('Nota actualizada', '✅');
      }).catch(() => {
        toast('Error al guardar', '⚠️');
        if (saveBtn) saveBtn.disabled = false;
      });
    } else {
      _apiPost({ tipo: _tipo, ...body, items: [] }).then(row => {
        PENDIENTES.unshift(row);
        pCloseModal();
        _rerender();
        toast(_tipo === 'nota' ? 'Nota guardada' : 'Lista creada', '✅');
      }).catch(() => {
        toast('Error al guardar', '⚠️');
        if (saveBtn) saveBtn.disabled = false;
      });
    }
  };

  // ── ACCIONES ──

  window.pDeleteItem = function (id) {
    if (!confirm('¿Eliminar este elemento?')) return;
    _apiDelete(id).then(() => {
      PENDIENTES = PENDIENTES.filter(i => i.id !== id);
      _rerender();
      toast('Eliminado', '🗑');
    }).catch(() => toast('Error al eliminar', '⚠️'));
  };

  window.pToggleItem = function (listId, itemId) {
    const list = PENDIENTES.find(i => i.id === listId);
    if (!list) return;
    const item = (list.items || []).find(i => i.id === itemId);
    if (!item) return;
    item.done = !item.done;

    // Actualizar DOM sin re-render completo
    const card = document.querySelector(`[data-plist="${listId}"]`);
    if (card) {
      const idx = list.items.findIndex(i => i.id === itemId);
      const labels = card.querySelectorAll('.pend-check');
      if (labels[idx]) labels[idx].classList.toggle('done', item.done);
      const done  = list.items.filter(i => i.done).length;
      const total = list.items.length;
      const meta  = document.getElementById(`plist-meta-${listId}`);
      if (meta) {
        meta.style.display = '';
        meta.textContent   = `${done}/${total} completados${done === total ? ' · ✓ ¡Listo!' : ''}`;
      }
    }

    // Sincronizar con BD en segundo plano
    _apiPatch({ id: listId, items: list.items });
  };

  window.pAddItem = function (listId) {
    const input = document.getElementById(`pnew-${listId}`);
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) return;

    const list = PENDIENTES.find(i => i.id === listId);
    if (!list) return;
    if (!list.items) list.items = [];

    const itemId = list.items.length ? Math.max(...list.items.map(i => i.id)) + 1 : 1;
    list.items.push({ id: itemId, texto, done: false });
    input.value = '';

    // Actualizar DOM sin re-render completo
    const body = document.getElementById(`plist-body-${listId}`);
    if (body) {
      body.innerHTML = list.items.map(it => `
        <label class="pend-check${it.done?' done':''}">
          <input type="checkbox" ${it.done?'checked':''} onchange="pToggleItem(${listId},${it.id})">
          <span>${_esc(it.texto)}</span>
        </label>`).join('');
    }
    const done  = list.items.filter(i => i.done).length;
    const total = list.items.length;
    const meta  = document.getElementById(`plist-meta-${listId}`);
    if (meta) { meta.style.display = ''; meta.textContent = `${done}/${total} completados`; }
    input.focus();

    // Sincronizar con BD en segundo plano
    _apiPatch({ id: listId, items: list.items });
  };

})();
