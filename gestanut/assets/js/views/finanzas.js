// ══════════════════════════════════════════════════════
// VIEW · Finanzas
// ══════════════════════════════════════════════════════
VIEWS.finanzas = () => {
  const ing = FINANZAS.filter(m => m.tipo === 'in').reduce((s, m) => s + m.monto, 0);
  const gas = FINANZAS.filter(m => m.tipo === 'out').reduce((s, m) => s + m.monto, 0);
  return `<div class="view active">
    <div class="g3 mb">
      <div class="panel" style="background:var(--forest);border:none;padding:24px;border-radius:var(--r);position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(107,158,120,.18)"></div>
        <div style="position:relative;z-index:1;color:var(--cream)">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sage-l);margin-bottom:4px">Ingresos · Mayo</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:600;line-height:1;margin:6px 0">${fmt$(ing)}</div>
          <div style="color:rgba(250,246,239,.65);font-size:12px">${FINANZAS.filter(m => m.tipo === 'in').length} consultas</div>
        </div>
      </div>
      <div class="panel" style="padding:24px">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--terra);margin-bottom:4px">Gastos</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:600;color:var(--terra-d);line-height:1;margin:6px 0">${fmt$(gas)}</div>
        <div class="muted-sm">${FINANZAS.filter(m => m.tipo === 'out').length} movimientos</div>
      </div>
      <div class="panel" style="background:linear-gradient(135deg,var(--sage),var(--forest-l));border:none;padding:24px;border-radius:var(--r)">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--sage-l);margin-bottom:4px">Utilidad neta</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:600;color:var(--cream);line-height:1;margin:6px 0">${fmt$(ing - gas)}</div>
        <div style="color:rgba(250,246,239,.7);font-size:12px">↑ 18% vs Abril</div>
      </div>
    </div>
    <div class="g-21">
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span class="pt-icon">📋</span>Movimientos · Mayo 2025</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline btn-xs" onclick="exportFinanzasCSV()">📊 Excel</button>
            <button class="btn btn-sage btn-xs" onclick="openModal('finanza-modal')">+ Registrar</button>
          </div>
        </div>
        <div style="max-height:460px;overflow-y:auto">
          <table style="width:100%;border-collapse:collapse">
            ${FINANZAS.map(m => `<tr style="border-bottom:1px solid var(--cream-d)">
              <td style="padding:11px 14px;font-size:11px;color:var(--text-m);width:72px">${m.fecha}</td>
              <td style="padding:11px 6px;font-size:13px">${m.concepto}</td>
              <td style="padding:11px 14px;text-align:right">
                <div style="font-weight:600;color:${m.tipo === 'in' ? 'var(--sage)' : 'var(--terra)'};font-family:'Cormorant Garamond',serif;font-size:16px">${m.tipo === 'in' ? '+' : '-'}${fmt$(m.monto)}</div>
              </td>
              <td style="padding:11px 14px;text-align:right">
                ${m.tipo === 'in' ? `<button class="btn btn-xs btn-outline" onclick="openReceipt(${m.id})" title="Generar recibo">🧾</button>` : ''}
              </td>
            </tr>`).join('')}
          </table>
        </div>
      </div>
      <div>
        <div class="panel mb-sm">
          <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💰</span>Pendientes de cobro</div></div>
          <div class="panel-body" style="padding:0">
            ${[
              { n: 'Sofía López', h: 'Hoy 9:00 AM',         m: 400, av: 'av-c3', ini: 'SL' },
              { n: 'Karla Vega',  h: 'Hoy 3:00 PM · Online', m: 350, av: 'av-c3', ini: 'KV' },
            ].map(p => `<div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--cream-d)">
              <div class="avatar av-sm ${p.av}">${p.ini}</div>
              <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500">${p.n}</div><div class="muted-sm" style="font-size:11px">${p.h}</div></div>
              <span class="badge b-gold">${fmt$(p.m)}</span>
            </div>`).join('')}
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📊</span>Por tipo · Mayo</div></div>
          <div class="panel-body">
            ${[
              ['Prenatales',    1600, 33, 'blush'],
              ['Recomposición',  900, 19, 'sage'],
              ['Control peso',  1300, 27, 'terra'],
              ['Online',         630, 13, 'gold'],
            ].map(([l, v, p, c]) => `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>${l}</span><span style="font-weight:600">${fmt$(v)}</span></div><div class="progress"><div class="progress-fill" style="width:${p}%;background:var(--${c})"></div></div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
};

function openReceipt(id) {
  currentReceipt = FINANZAS.find(m => m.id === id);
  openModal('receipt-modal');
}

function exportFinanzasCSV() {
  if (typeof ExcelJS === 'undefined') {
    toast('Preparando exportación...');
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
    s.onload = _doExportFinanzas;
    document.head.appendChild(s);
    return;
  }
  _doExportFinanzas();
}

async function _doExportFinanzas() {
  const ing = FINANZAS.filter(m => m.tipo === 'in').reduce((s, m) => s + m.monto, 0);
  const gas = FINANZAS.filter(m => m.tipo === 'out').reduce((s, m) => s + m.monto, 0);
  const mes = new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'GestaNut';
  const ws = wb.addWorksheet('Finanzas', { views: [{ showGridLines: false }] });

  ws.columns = [{ width: 13 }, { width: 34 }, { width: 13 }, { width: 18 }];

  // Helpers
  const F  = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const Fo = (o)    => ({ name: 'Calibri', ...o });
  const B  = (c = 'FFD4E4CC') => ({ top:{style:'thin',color:{argb:c}}, left:{style:'thin',color:{argb:c}}, bottom:{style:'thin',color:{argb:c}}, right:{style:'thin',color:{argb:c}} });
  const A  = (h = 'left', v = 'middle', indent = 0) => ({ horizontal: h, vertical: v, indent });
  const sc = (addr, font, fill, alignment, border, numFmt) => {
    const c = ws.getCell(addr);
    if (font)      c.font      = font;
    if (fill)      c.fill      = fill;
    if (alignment) c.alignment = alignment;
    if (border)    c.border    = border;
    if (numFmt)    c.numFmt    = numFmt;
    return c;
  };

  // ── Row 1: Título ──────────────────────────────────────
  ws.addRow(['GestaNut · Reporte de Finanzas', '', '', '']);
  ws.mergeCells('A1:D1');
  ws.getRow(1).height = 42;
  sc('A1', Fo({ bold:true, size:18, color:{argb:'FFFAF6EF'} }), F('FF1A3328'), A('left','middle',2));

  // ── Row 2: Subtítulo ───────────────────────────────────
  ws.addRow([`${mes.charAt(0).toUpperCase()+mes.slice(1)} · Diana Zavala · Nutrióloga`, '', '', '']);
  ws.mergeCells('A2:D2');
  ws.getRow(2).height = 22;
  sc('A2', Fo({ size:11, color:{argb:'FFC8DFC8'} }), F('FF2D5240'), A('left','middle',2));

  // ── Row 3: Espaciado ───────────────────────────────────
  ws.addRow([]); ws.getRow(3).height = 10;

  // ── Rows 4-5: Tarjetas resumen ─────────────────────────
  ws.addRow(['INGRESOS', 'GASTOS', 'UTILIDAD NETA', '']);
  ws.mergeCells('C4:D4');
  ws.getRow(4).height = 18;

  ws.addRow([ing, gas, ing - gas, '']);
  ws.mergeCells('C5:D5');
  ws.getRow(5).height = 36;

  [
    ['A4','A5', ing,       'FF1A7A4A','FFE6F9F0','FFC8E8D8'],
    ['B4','B5', gas,       'FFC4714A','FFF5EBE4','FFF0D0B8'],
    ['C4','C5', ing - gas, 'FF1A3328','FFEEF5EE','FFC8D8C8'],
  ].forEach(([la, va, val, fg, bg, bc]) => {
    sc(la, Fo({ bold:true, size:9,  color:{argb:fg} }), F(bg), A('center','bottom'), B(bc));
    sc(va, Fo({ bold:true, size:22, color:{argb:fg} }), F(bg), A('center','middle'), B(bc), '"$"#,##0');
    ws.getCell(va).value = val;
  });

  // ── Row 6: Espaciado ───────────────────────────────────
  ws.addRow([]); ws.getRow(6).height = 10;

  // ── Row 7: Encabezados tabla ───────────────────────────
  ws.addRow(['FECHA', 'CONCEPTO', 'TIPO', 'MONTO']);
  ws.getRow(7).height = 26;
  [['A7','left',1],['B7','left',1],['C7','center',0],['D7','right',0]].forEach(([addr,h,i]) => {
    sc(addr, Fo({ bold:true, size:9, color:{argb:'FFC8DFC8'} }), F('FF1A3328'), A(h,'middle',i));
  });

  // ── Filas de datos ─────────────────────────────────────
  FINANZAS.forEach((m, idx) => {
    const isIn = m.tipo === 'in';
    const bg   = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF7FAF6';
    const row  = ws.addRow([m.fecha, m.concepto, isIn ? 'Ingreso' : 'Gasto', isIn ? m.monto : -m.monto]);
    row.height = 20;
    const rn   = row.number;

    sc(`A${rn}`, Fo({ size:11, color:{argb:'FF4A5E44'} }),  F(bg), A('left','middle',1),   B());
    sc(`B${rn}`, Fo({ size:12, color:{argb:'FF1A2418'} }),  F(bg), A('left','middle',1),   B());
    sc(`C${rn}`,
      Fo({ bold:true, size:10, color:{argb: isIn ? 'FF1A7A4A' : 'FFC0392B'} }),
      F(isIn ? 'FFE6F9F0' : 'FFFDF0EE'), A('center','middle'), B());
    const cM = ws.getCell(`D${rn}`);
    cM.font      = Fo({ bold:true, size:13, color:{argb: isIn ? 'FF1A7A4A' : 'FFC0392B'} });
    cM.fill      = F(bg);
    cM.numFmt    = '"$"#,##0';
    cM.alignment = A('right','middle');
    cM.border    = B();
  });

  // ── Espaciado antes de totales ─────────────────────────
  const sp = ws.addRow([]); sp.height = 10;

  // ── Totales ────────────────────────────────────────────
  [
    ['Total ingresos', ing,       'FF1A7A4A','FFE6F9F0','FFC8E8D8'],
    ['Total gastos',   gas,        'FFC0392B','FFFDF0EE','FFF5D0C8'],
    ['Utilidad neta',  ing - gas,  'FFFAF6EF','FF1A3328','FF2D5240'],
  ].forEach(([label, value, fg, bg, bc]) => {
    const row = ws.addRow(['', label, '', value]);
    row.height = 24;
    const rn  = row.number;
    ws.mergeCells(`B${rn}:C${rn}`);

    sc(`B${rn}`, Fo({ bold:true, size:11, color:{argb:fg} }), F(bg), A('right','middle'), B(bc));
    const cV = ws.getCell(`D${rn}`);
    cV.value     = value;
    cV.font      = Fo({ bold:true, size:14, color:{argb:fg} });
    cV.fill      = F(bg);
    cV.numFmt    = '"$"#,##0';
    cV.alignment = A('right','middle');
    cV.border    = B(bc);
  });

  // ── Footer ─────────────────────────────────────────────
  ws.addRow([]);
  const fRow = ws.addRow([`Generado por GestaNut · ${new Date().toLocaleDateString('es-MX',{year:'numeric',month:'long',day:'numeric'})}`]);
  fRow.height = 20;
  const fn = fRow.number;
  ws.mergeCells(`A${fn}:D${fn}`);
  sc(`A${fn}`, Fo({ italic:true, size:10, color:{argb:'FF8A9E84'} }), null, A('center','middle'));

  // ── Descarga ───────────────────────────────────────────
  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `GestaNut_Finanzas_${new Date().toISOString().slice(0,7)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Reporte exportado ✅');
}
