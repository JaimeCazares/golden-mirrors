// ══════════════════════════════════════════════════════
// VIEW · Consentimientos informados
// ══════════════════════════════════════════════════════

function descargarConsentimientoPDF(patientName) {
  const nombre  = patientName || '___________________________________';
  const fecha   = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const logoUrl = new URL('assets/img/logo.png', window.location.href).href;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Consentimiento Informado · ${nombre}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  /* margin:0 en @page elimina el área donde el browser imprime "about:blank" y la fecha */
  @page { margin: 0; size: A4; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    color: #2c2c2c;
    line-height: 1.8;
    padding: 1.5cm 2cm;
    width: 21cm;
    height: 29.7cm;
    display: flex;
    flex-direction: column;
  }
  .header { border-bottom: 2px solid #4a7c59; padding-bottom: 12px; margin-bottom: 16px; display:flex; align-items:center; gap:18px; }
  .header-logo { width: 72px; height: 72px; object-fit: contain; flex-shrink:0; }
  .brand-txt { font-size: 22pt; font-weight: 700; color: #2c4a35; letter-spacing: 0.5px; line-height:1.1; }
  .brand-txt em { color: #c4714a; font-style: normal; }
  .sub { font-size: 9pt; color: #777; margin-top: 4px; }
  h1 { font-size: 12pt; text-align: center; letter-spacing: 0.8px; margin-bottom: 3px; color: #1a3025; text-transform: uppercase; }
  .subtitle { text-align:center; font-size:9pt; color:#aaa; margin-bottom:14px; }
  h2 { font-size: 10pt; color: #4a7c59; margin: 14px 0 4px; font-variant: small-caps; letter-spacing: 0.5px; }
  p  { margin-bottom: 0; text-align: justify; }
  .datos { display: flex; gap: 18px; margin: 12px 0 4px; }
  .dato  { flex: 1; border-left: 3px solid #4a7c59; padding: 4px 0 4px 10px; }
  .dato span { display: block; font-size: 8pt; color: #888; margin-bottom: 1px; text-transform: uppercase; letter-spacing: 0.5px; }
  .dato strong { font-size: 10pt; }
  .spacer { flex: 1; }
  .closing { text-align: justify; margin-top: 14px; }
  .signatures { display: flex; justify-content: space-around; gap: 50px; margin-bottom: 4px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-space { height: 65px; }
  .sig-line { border-top: 1.5px solid #999; padding-top: 6px; font-size: 9pt; color: #555; }
  .sig-name  { font-size: 8.5pt; color: #888; margin-top: 3px; }
  .footer { text-align: center; font-size: 8pt; color: #ccc; border-top: 1px solid #eee; padding-top: 8px; margin-top: 10px; }
</style>
</head>
<body>

<div class="header">
  <img src="${logoUrl}" class="header-logo" alt="GestaNut">
  <div>
    <div class="brand-txt">Gesta<em>Nut</em></div>
    <div class="sub">Diana Zavala · Nutrióloga · Cédula Profesional 15304166</div>
    <div class="sub">667 305 6211 · @gestanut · Culiacán, Sinaloa</div>
  </div>
</div>

<h1>Carta de Consentimiento Informado</h1>
<div class="subtitle">Consulta Nutricional · GestaNut</div>

<div class="datos">
  <div class="dato"><span>Paciente</span><strong>${nombre}</strong></div>
  <div class="dato"><span>Fecha</span><strong>${fecha}</strong></div>
  <div class="dato"><span>Nutrióloga</span><strong>Diana Zavala · Lic. Nutrición</strong></div>
</div>

<h2>1. Descripción de servicios</h2>
<p>La consulta nutricional individualizada incluye evaluación antropométrica, anamnesis alimentaria, elaboración de plan de alimentación personalizado, seguimiento y control del estado nutricional.</p>

<h2>2. Beneficios esperados</h2>
<p>Mejora del estado nutricional, alcance de objetivos de peso o composición corporal, educación alimentaria y adopción de hábitos saludables y sostenibles a largo plazo.</p>

<h2>3. Riesgos y limitaciones</h2>
<p>La nutrición es una ciencia individualizada. Los resultados pueden variar según la adherencia al plan alimentario, condiciones de salud concomitantes y otros factores. La nutrióloga no es responsable del tratamiento médico de enfermedades diagnosticadas por un médico.</p>

<h2>4. Confidencialidad</h2>
<p>Toda la información proporcionada por la paciente será tratada con estricta confidencialidad, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>

<h2>5. Compromiso de la paciente</h2>
<p>La paciente se compromete a proporcionar información veraz sobre su historial médico y alimentario, seguir las indicaciones del plan de alimentación y comunicar cualquier reacción adversa o cambio en su estado de salud.</p>

<p class="closing">La suscrita declara haber leído y comprendido el presente documento en su totalidad, y otorga su consentimiento libre, voluntario e informado para recibir los servicios de consulta nutricional descritos anteriormente.</p>

<div class="spacer"></div>

<div class="signatures">
  <div class="sig-box">
    <div class="sig-space"></div>
    <div class="sig-line">Firma de la paciente</div>
    <div class="sig-name">${nombre}</div>
  </div>
  <div class="sig-box">
    <div class="sig-space"></div>
    <div class="sig-line">Diana Zavala · Nutrióloga</div>
    <div class="sig-name">Cédula Profesional: 15304166</div>
  </div>
</div>

<div class="footer">Culiacán, Sinaloa · ${fecha} · GestaNut · Todos los derechos reservados</div>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=900,scrollbars=yes');
  if (!win) {
    toast('⚠️ Permite ventanas emergentes en tu navegador para descargar el PDF');
    return;
  }
  win.document.write(html);
  win.document.close();
}
function _consentWA(id) {
  const p = PATIENTS.find(x => x.id === id);
  if (!p) return;
  // Primero abre el PDF para que el usuario lo guarde
  descargarConsentimientoPDF(p.name);
  // Luego abre WhatsApp sin número para elegir contacto y adjuntar el PDF
  const msg = `Hola ${p.name.split(' ')[0]}! Te comparto tu consentimiento informado de GestaNut. Por favor firmalo y enviame una foto o el archivo firmado. Gracias!`;
  setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'), 800);
}

function marcarFirmado(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,application/pdf';
  input.onchange = async () => {
    if (!input.files.length) return;
    const p = PATIENTS.find(x => x.id === id);
    if (!p) return;
    try {
      const res  = await fetch('api/consentimientos.php', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ paciente_id: id })
      });
      const data = await res.json();
      if (!data.ok) throw new Error();
      const fecha = new Date(data.fecha + 'T12:00:00')
        .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
      p.consentimiento = { firmado: true, fecha };
      toast('Consentimiento guardado en la BD ✓');
      showView('consentimientos');
    } catch {
      toast('⚠️ Error al guardar en la base de datos');
    }
  };
  input.click();
}

VIEWS.consentimientos = () => {
  const nFirmados  = PATIENTS.filter(p => p.consentimiento.firmado).length;
  const pendientes = PATIENTS.filter(p => !p.consentimiento.firmado);
  const primoPend  = pendientes[0];
  return `<div class="view active">
  <div class="g2 mb">
    <div class="stat-card green"><div class="stat-deco"></div><div class="stat-icon-w">✅</div><div class="stat-val">${nFirmados}</div><div class="stat-label">Consentimientos firmados</div></div>
    <div class="stat-card terra"><div class="stat-deco"></div><div class="stat-icon-w">⚠️</div><div class="stat-val">${pendientes.length}</div><div class="stat-label">Pendientes</div>${primoPend ? `<div class="stat-trend down">${primoPend.name}</div>` : ''}</div>
  </div>
  <div class="g-21">
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title"><span class="pt-icon">📝</span>Consentimientos de pacientes</div>
      </div>
      <div class="panel-body" style="padding:0">
        ${PATIENTS.map(p => `<div style="display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--cream-d)">
          <div class="avatar av-sm ${p.av}">${p.ini}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">${p.name}</div>
            <div class="muted-sm" style="font-size:11px">${p.historia.motivo}</div>
          </div>
          ${p.consentimiento.firmado
            ? `<div style="text-align:right"><span class="badge b-green">✓ Firmado</span><div class="muted-sm" style="font-size:10px;margin-top:3px">${p.consentimiento.fecha}</div></div>`
            : `<div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
                 <button class="btn btn-terra btn-xs" onclick="descargarConsentimientoPDF(PATIENTS.find(x=>x.id===${p.id})?.name)">Generar PDF →</button>
                 <div style="display:flex;gap:5px">
                   <button class="btn btn-outline btn-xs" onclick="_consentWA(${p.id})">📤 WhatsApp</button>
                   <button class="btn btn-sage btn-xs" onclick="marcarFirmado(${p.id})">✓ Firmado</button>
                 </div>
               </div>`}
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div class="panel mb-sm">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">📄</span>Plantilla de consentimiento</div></div>
        <div class="panel-body">
          <div style="background:var(--sage-lll);border-radius:var(--rs);padding:16px;font-size:12px;line-height:1.9;color:var(--text)">
            <div style="font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:600;text-align:center;margin-bottom:12px">CARTA DE CONSENTIMIENTO INFORMADO</div>
            <div style="margin-bottom:8px"><strong>Nutrióloga:</strong> Diana Zavala · Cédula: 15304166</div>
            <div style="margin-bottom:8px"><strong>Servicios:</strong> Consulta nutricional, elaboración de plan de alimentación personalizado, seguimiento y evaluación antropométrica.</div>
            <div style="margin-bottom:8px"><strong>Confidencialidad:</strong> Toda la información proporcionada será tratada con estricta confidencialidad conforme a la Ley Federal de Protección de Datos Personales.</div>
            <div style="color:var(--text-l);font-size:11px;margin-top:12px;text-align:center">La paciente declara haber leído y comprendido el presente documento...</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-sage btn-sm" style="flex:1" onclick="descargarConsentimientoPDF()">📥 Descargar PDF</button>
            <button class="btn btn-outline btn-sm" onclick="toast('Consentimiento enviado por WhatsApp ✓')">📤 Enviar</button>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title" style="font-size:15px"><span class="pt-icon">💡</span>¿Por qué es importante?</div></div>
        <div class="panel-body">
          ${['Protege legalmente tu práctica', 'Cumple con la NOM-012 de ética médica', 'Establece expectativas claras', 'Genera confianza en la paciente', 'Requerido para ejercer formalmente']
            .map(t => `<div style="font-size:12px;padding:7px 0;border-bottom:1px solid var(--cream-d);display:flex;align-items:center;gap:8px"><span style="color:var(--sage)">✓</span>${t}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;
};
