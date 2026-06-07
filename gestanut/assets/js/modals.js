// ══════════════════════════════════════════════════════
// MODALS · Inyección, apertura y cierre
// ══════════════════════════════════════════════════════
function injectModals() {
  $('#modal-root').innerHTML = `
  <!-- NUEVA PACIENTE -->
  <div class="modal-overlay" id="newpx-modal">
    <div class="modal" style="max-width:640px">
      <div class="modal-head"><div class="modal-title">Nuevo <em>paciente</em></div><button class="modal-close" onclick="closeModal('newpx-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Nombre completo*</label><input id="np-nombre" class="input" placeholder="Ej. Laura García Méndez"></div>
        <div class="field-row"><div class="field"><label class="field-label">WhatsApp*</label><input id="np-phone" class="input" placeholder="667 123 4567"></div><div class="field"><label class="field-label">Tipo de consulta*</label><select id="np-tipo" class="select"><option>Materno-infantil</option><option>Recomposición</option><option>Pérdida de peso</option><option>Control de peso</option></select></div></div>
        <div class="field"><label class="field-label">Modalidad</label><select id="np-modalidad" class="select"><option>Presencial</option><option>Online</option></select></div>
        <div style="background:var(--sage-lll);border-radius:var(--rs);padding:12px 16px;margin-top:4px;border-left:3px solid var(--sage)">
          <div style="font-size:12px;font-weight:600;color:var(--forest);margin-bottom:4px">📋 Datos clínicos en primera consulta</div>
          <div style="font-size:11px;color:var(--text-m)">Peso, talla, medidas, objetivo y demás datos clínicos se registran al abrir la primera consulta del expediente.</div>
        </div>
        <div style="background:var(--terra-l);border-radius:var(--rs);padding:12px 16px;margin-top:8px;border-left:3px solid var(--terra)">
          <div style="font-size:12px;font-weight:600;color:var(--terra-d);margin-bottom:4px">⚠️ Consentimiento informado</div>
          <div style="font-size:11px;color:var(--text-m)">Se generará automáticamente al crear el expediente. Recuerda obtener la firma en la primera consulta.</div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('newpx-modal')">Cancelar</button>
        <button id="np-submit" class="btn btn-primary" onclick="crearPaciente()">Crear expediente</button>
      </div>
    </div>
  </div>

  <!-- NUEVA CITA -->
  <div class="modal-overlay" id="appt-modal">
    <div class="modal" style="max-width:560px">
      <div class="modal-head"><div class="modal-title">Agendar <em>cita</em></div><button class="modal-close" onclick="closeModal('appt-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Paciente</label><select id="appt-paciente" class="select">${PATIENTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div class="field-row"><div class="field"><label class="field-label">Fecha</label><input id="appt-fecha" class="input" type="date" value="${localToday()}"></div><div class="field"><label class="field-label">Hora</label><select id="appt-hora" class="select">${['8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t => `<option>${t}</option>`).join('')}</select></div></div>
        <div class="field"><label class="field-label">Modalidad</label><div style="display:flex;gap:12px"><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="appt-mod" value="presencial" checked> Presencial</label><label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="appt-mod" value="online"> Online</label></div></div>
        <div class="field"><label class="field-label">Tipo de consulta</label><select id="appt-tipo" class="select"><option>Control / Seguimiento</option><option>Primera consulta</option><option>Urgencia</option></select></div>
        <div class="field"><label class="field-label">Notas previas</label><textarea id="appt-notas" class="textarea" style="min-height:60px" placeholder="Ej. Traer estudios de laboratorio recientes..."></textarea></div>
        <div style="background:var(--sage-lll);border-radius:var(--rs);padding:10px 14px;font-size:12px;color:var(--text-m)">💬 Se enviará recordatorio por WhatsApp 24h antes</div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('appt-modal')">Cancelar</button>
        <button id="appt-submit" class="btn btn-primary" onclick="guardarCita()">Confirmar cita</button>
      </div>
    </div>
  </div>

  <!-- ENVIAR PLAN -->
  <div class="modal-overlay" id="send-plan-modal">
    <div class="modal" style="max-width:580px">
      <div class="modal-head"><div class="modal-title">Enviar <em>plan</em> por WhatsApp</div><button class="modal-close" onclick="closeModal('send-plan-modal')">✕</button></div>
      <div class="modal-body">
        <div id="send-plan-preview" style="background:var(--sage-lll);border-radius:var(--rs);padding:18px;border-left:4px solid var(--sage);font-size:13px;line-height:1.9;white-space:pre-wrap;margin-bottom:14px">Cargando...</div>
        <div class="field"><label class="field-label">Mensaje adicional (opcional)</label><textarea class="textarea" id="plan-extra" placeholder="Ej. Cualquier duda, escríbeme. ¡Tú puedes! 💪"></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('send-plan-modal')">Cancelar</button>
        <div id="plan-wa-btn"></div>
      </div>
    </div>
  </div>

  <!-- RECIBO -->
  <div class="modal-overlay" id="receipt-modal">
    <div class="modal" style="max-width:520px">
      <div class="modal-head"><div class="modal-title">Generar <em>recibo</em></div><button class="modal-close" onclick="closeModal('receipt-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field-row" style="margin-bottom:14px">
          <div class="field"><label class="field-label">Concepto</label><input id="rcpt-concepto-in" class="input" value="Consulta nutricional" oninput="rcptUpdate()"></div>
          <div class="field" style="max-width:130px"><label class="field-label">Monto ($)</label><input id="rcpt-monto-in" class="input" type="number" min="0" placeholder="400" oninput="rcptUpdate()"></div>
        </div>
        <div id="receipt-preview" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(26,51,40,.18)">
          <!-- Header -->
          <div style="background:#1a3328;padding:28px 24px 22px;text-align:center;position:relative;overflow:hidden">
            <div style="position:absolute;top:-24px;right:-24px;width:90px;height:90px;border-radius:50%;background:rgba(107,158,120,.12)"></div>
            <div style="position:absolute;bottom:-36px;left:-28px;width:110px;height:110px;border-radius:50%;background:rgba(107,158,120,.09)"></div>
            <div style="font-size:20px;margin-bottom:6px;position:relative">🌿</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;color:#faf6ef;letter-spacing:1px;position:relative">GestaNut</div>
            <div style="width:36px;height:1px;background:rgba(107,158,120,.6);margin:8px auto 10px;position:relative"></div>
            <div style="font-size:10px;color:rgba(250,246,239,.6);letter-spacing:.6px;text-transform:uppercase;position:relative">Diana Zavala · Nutrióloga · Cédula 15304166</div>
            <div style="font-size:10px;color:rgba(250,246,239,.45);margin-top:3px;position:relative">667 305 6211 · @gestanut</div>
          </div>
          <!-- Tear edge -->
          <div style="background:#1a3328;line-height:0">
            <svg viewBox="0 0 400 14" preserveAspectRatio="none" style="width:100%;height:14px;display:block"><polygon points="0,14 10,0 20,14 30,0 40,14 50,0 60,14 70,0 80,14 90,0 100,14 110,0 120,14 130,0 140,14 150,0 160,14 170,0 180,14 190,0 200,14 210,0 220,14 230,0 240,14 250,0 260,14 270,0 280,14 290,0 300,14 310,0 320,14 330,0 340,14 350,0 360,14 370,0 380,14 390,0 400,14" fill="#ffffff"/></svg>
          </div>
          <!-- Body -->
          <div style="background:#fff;padding:18px 24px 22px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span style="font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:#8a9e84;font-weight:500">Recibo de Pago</span>
              <span style="font-size:11px;font-weight:600;background:#eef5ee;color:#1a3328;padding:3px 10px;border-radius:20px" id="rcpt-folio">#REC-0000</span>
            </div>
            <div style="border-top:1px dashed rgba(107,158,120,.3);padding-top:4px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px dashed rgba(107,158,120,.15);font-size:12px">
                <span style="color:#8a9e84">Fecha</span><span style="color:#1a2418" id="rcpt-fecha">—</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;font-size:12px">
                <span style="color:#8a9e84">Concepto</span><span style="color:#1a2418;font-weight:500;text-align:right;max-width:60%" id="rcpt-concepto">Consulta nutricional</span>
              </div>
            </div>
            <div style="margin-top:14px;background:#1a3328;border-radius:10px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:11px;color:rgba(250,246,239,.6);text-transform:uppercase;letter-spacing:.6px">Total</span>
              <span style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:600;color:#faf6ef" id="rcpt-total">$—</span>
            </div>
            <div style="margin-top:12px;text-align:center;font-size:10px;color:#8a9e84;letter-spacing:.3px">Comprobante informal · No es factura fiscal</div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('receipt-modal')">Cerrar</button>
        <button class="btn btn-sage" onclick="rcptGuardar()">💾 Guardar PDF</button>
        <button class="btn btn-outline" onclick="rcptWhatsApp()" title="Enviar texto por WhatsApp">📤 Texto</button>
        <button class="btn btn-primary" onclick="rcptShareImage()" title="Enviar imagen por WhatsApp">🖼️ Imagen</button>
      </div>
    </div>
  </div>

  <!-- NUEVO MOVIMIENTO FINANZAS -->
  <div class="modal-overlay" id="finanza-modal">
    <div class="modal" style="max-width:480px">
      <div class="modal-head"><div class="modal-title">Nuevo <em>movimiento</em></div><button class="modal-close" onclick="closeModal('finanza-modal')">&#x2715;</button></div>
      <div class="modal-body">
        <div class="field">
          <label class="field-label">Tipo</label>
          <div style="display:flex;gap:12px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="fin-tipo" id="fin-tipo-in" value="in" checked> Ingreso</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="fin-tipo" id="fin-tipo-out" value="out"> Gasto</label>
          </div>
        </div>
        <div class="field"><label class="field-label">Concepto*</label><input id="fin-concepto" class="input" placeholder="Ej. Consulta prenatal · Sofia Lopez"></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Monto (MXN)*</label><input id="fin-monto" class="input" type="number" min="1" placeholder="400"></div>
          <div class="field"><label class="field-label">Fecha*</label><input id="fin-fecha" class="input" type="date" value="${localToday()}"></div>
        </div>
        <div class="field">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="fin-pagado" checked> Ya esta pagado
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('finanza-modal')">Cancelar</button>
        <button id="fin-submit" class="btn btn-primary" onclick="guardarMovimiento()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- CONSENTIMIENTO -->
  <div class="modal-overlay" id="consent-modal">
    <div class="modal" style="max-width:680px">
      <div class="modal-head"><div class="modal-title">Consentimiento <em>informado</em></div><button class="modal-close" onclick="closeModal('consent-modal')">✕</button></div>
      <div class="modal-body">
        <div style="background:var(--white);border:1px solid rgba(107,158,120,.15);border-radius:var(--rs);padding:28px;font-size:12.5px;line-height:2;color:var(--text);font-family:'DM Sans',sans-serif;max-height:55vh;overflow-y:auto">
          <div style="text-align:center;margin-bottom:20px">
            <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--forest)">CARTA DE CONSENTIMIENTO INFORMADO</div>
            <div style="font-size:11px;color:var(--text-m);margin-top:4px">Consulta Nutricional · GestaNut</div>
          </div>
          <p><strong>NUTRIÓLOGA:</strong> Diana Zavala Lic. en Nutrición, Cédula Profesional: 15304166</p>
          <p><strong>DESCRIPCIÓN DE SERVICIOS:</strong> Consulta nutricional individualizada que incluye evaluación antropométrica, anamnesis alimentaria, elaboración de plan de alimentación personalizado, seguimiento y control del estado nutricional.</p>
          <p><strong>BENEFICIOS ESPERADOS:</strong> Mejora del estado nutricional, alcance de objetivos de peso o composición corporal, educación alimentaria y hábitos saludables sostenibles.</p>
          <p><strong>RIESGOS Y LIMITACIONES:</strong> La nutrición es una ciencia individualizada. Los resultados pueden variar según la adherencia al plan, condiciones de salud concomitantes y otros factores. La nutrióloga no es responsable del tratamiento médico de enfermedades diagnosticadas.</p>
          <p><strong>CONFIDENCIALIDAD:</strong> Toda la información proporcionada por la paciente será tratada con estricta confidencialidad, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
          <p><strong>COMPROMISO DE LA PACIENTE:</strong> Proporcionar información veraz sobre su historial médico y alimentario, seguir las indicaciones del plan alimentario y comunicar cualquier reacción adversa.</p>
          <div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:28px">
            <div><div style="border-top:1px solid var(--text-l);padding-top:6px;font-size:11px;color:var(--text-m)">Firma de la paciente</div><div style="height:50px"></div></div>
            <div><div style="border-top:1px solid var(--text-l);padding-top:6px;font-size:11px;color:var(--text-m)">Diana Zavala · Nutrióloga</div><div style="height:50px"></div></div>
          </div>
          <div style="text-align:center;margin-top:16px;font-size:11px;color:var(--text-l)">Culiacán, Sinaloa · Fecha: ________________</div>
        </div>
        <div class="field" style="margin-top:14px"><label class="field-label">Paciente</label><select class="select">${PATIENTS.map(p => `<option>${p.name}</option>`).join('')}</select></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('consent-modal')">Cerrar</button>
        <button class="btn btn-sage" onclick="descargarConsentimientoPDF($('#consent-modal .select')?.value)">📥 Descargar PDF</button>
        <button class="btn btn-primary" onclick="closeModal('consent-modal');toast('📤 Consentimiento enviado por WhatsApp ✓')">📤 Enviar por WhatsApp</button>
      </div>
    </div>
  </div>

  <!-- HISTORIA CLÍNICA -->
  <div class="modal-overlay" id="historia-modal" onclick="historiaOverlayClick(event)">
    <div class="modal" style="max-width:680px">
      <div class="modal-head"><div class="modal-title">Editar <em>historia clínica</em></div><button class="modal-close" onclick="cerrarHistoriaConFirmacion()">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Motivo de consulta</label><input id="hc-motivo" class="input" placeholder="Motivo principal"></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Antecedentes patológicos</label><input id="hc-ant" class="input" placeholder="Enfermedades previas"></div>
          <div class="field"><label class="field-label">Alergias</label><input id="hc-aleg" class="input" placeholder="Alergias conocidas"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Intolerancias alimentarias</label><input id="hc-into" class="input" placeholder="Intolerancias"></div>
          <div class="field"><label class="field-label">Medicamentos actuales</label><input id="hc-med" class="input" placeholder="Medicamentos"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Cirugías previas</label><input id="hc-cir" class="input" placeholder="Cirugías"></div>
          <div class="field"><label class="field-label">Antecedentes familiares</label><input id="hc-fam" class="input" placeholder="Antecedentes familiares"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Actividad física</label><input id="hc-act" class="input" placeholder="Tipo y frecuencia"></div>
          <div class="field"><label class="field-label">Ocupación</label><input id="hc-ocu" class="input" placeholder="Ocupación"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Estado civil</label><select id="hc-ecivil" class="select"><option value="">—</option><option>Soltero/a</option><option>Casado/a</option><option>Unión libre</option><option>Divorciado/a</option><option>Separado/a</option><option>Viudo/a</option></select></div>
          <div class="field"><label class="field-label">Tabaquismo</label><select id="hc-tab" class="select"><option value="No">No</option><option value="exfumador">Exfumador/a</option><option value="actual">Fumador/a actual</option></select></div>
          <div class="field"><label class="field-label">Alcohol</label>
            <select id="hc-alc" class="select" onchange="hcAlcoholChange()">
              <option value="No">No</option>
              <option value="Solo fin de semana">Solo fin de semana</option>
              <option value="Moderado">Moderado</option>
              <option value="Otro">Otro...</option>
            </select>
            <input id="hc-alc-otro" class="input" style="display:none;margin-top:6px" placeholder="Especifica cómo...">
          </div>
        </div>
        <div class="field"><label class="field-label">Biografía / Notas generales</label><textarea id="hc-bio" class="textarea" style="min-height:70px" placeholder="Notas sobre el paciente..."></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="cerrarHistoriaConFirmacion()">Cancelar</button>
        <button id="hc-submit" class="btn btn-primary" onclick="guardarHistoria()">Guardar historia</button>
      </div>
    </div>
  </div>

  <!-- DATOS BÁSICOS (durante la primera consulta) -->
  <div class="modal-overlay" id="datos-basicos-modal">
    <div class="modal" style="max-width:520px">
      <div class="modal-head"><div class="modal-title">Datos <em>del paciente</em></div><button class="modal-close" onclick="closeModal('datos-basicos-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field-row">
          <div class="field"><label class="field-label">Edad (años)*</label><input id="db-edad" class="input" type="number" min="1" max="120" placeholder="28"></div>
          <div class="field"><label class="field-label">Peso (kg)</label><input id="db-peso" class="input" type="number" step="0.1" min="1" placeholder="70.0"></div>
          <div class="field"><label class="field-label">Altura (m)*</label><input id="db-altura" class="input" type="number" step="0.01" min="0.5" max="2.5" placeholder="1.62"></div>
        </div>
        <div class="field">
          <label class="field-label">Sexo*</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label id="db-sexo-f" onclick="setDbSexo('femenino')" style="display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 16px;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:500;transition:all .15s;background:var(--terra-l);color:var(--terra-d);border:1.5px solid var(--terra)">
              <input type="radio" name="db-sexo" value="femenino" checked style="display:none"> ♀ Femenino
            </label>
            <label id="db-sexo-m" onclick="setDbSexo('masculino')" style="display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 16px;border-radius:var(--rs);cursor:pointer;font-size:13px;font-weight:500;transition:all .15s;background:var(--cream);color:var(--text-m);border:1.5px solid transparent">
              <input type="radio" name="db-sexo" value="masculino" style="display:none"> ♂ Masculino
            </label>
          </div>
        </div>
        <div style="font-size:11px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px">Medidas corporales <span style="font-weight:400;text-transform:none;letter-spacing:0">(opcional)</span></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Cintura (cm)</label><input id="db-cintura" class="input" type="number" step="0.1" placeholder="80"></div>
          <div class="field"><label class="field-label">Cadera (cm)</label><input id="db-cadera" class="input" type="number" step="0.1" placeholder="100"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Brazo (cm)</label><input id="db-brazo" class="input" type="number" step="0.1" placeholder="28"></div>
          <div class="field"><label class="field-label">Muslo (cm)</label><input id="db-muslo" class="input" type="number" step="0.1" placeholder="55"></div>
        </div>
        <div class="field"><label class="field-label">Objetivo principal</label><input id="db-objetivo" class="input" placeholder="Ej. Bajar 8 kg para diciembre"></div>
        <div id="db-materno-section" style="display:none;margin-top:4px">
          <div style="font-size:11px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px">Datos de embarazo <span style="font-weight:400;text-transform:none;letter-spacing:0">(materno-infantil)</span></div>
          <div class="field-row">
            <div class="field"><label class="field-label">Semanas de gestación</label><input id="db-semanas" class="input" type="number" min="1" max="42" placeholder="28"></div>
            <div class="field"><label class="field-label">Peso pre-embarazo (kg)</label><input id="db-preemb" class="input" type="number" step="0.1" min="30" placeholder="65.0"></div>
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);cursor:pointer;padding:6px 0">
            <input type="checkbox" id="db-dg" style="width:15px;height:15px;accent-color:var(--terra)"> Diabetes gestacional
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('datos-basicos-modal')">Cancelar</button>
        <button id="db-submit" class="btn btn-primary" onclick="guardarDatosBasicos()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- REGISTRO UNIFICADO (peso + medidas corporales) -->
  <div class="modal-overlay" id="registro-modal">
    <div class="modal" style="max-width:480px">
      <div class="modal-head"><div class="modal-title">Nuevo <em>registro</em></div><button class="modal-close" onclick="closeModal('registro-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field-row">
          <div class="field"><label class="field-label">Fecha*</label><input id="reg-fecha" class="input" type="date"></div>
          <div class="field"><label class="field-label">Peso (kg)*</label><input id="reg-peso" class="input" type="number" step="0.1" placeholder="72.5"></div>
        </div>
        <div style="font-size:11px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.5px;margin:10px 0 6px">Medidas corporales <span style="font-weight:400;text-transform:none;letter-spacing:0">(opcional)</span></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Cintura (cm)</label><input id="reg-cintura" class="input" type="number" step="0.1" placeholder="80"></div>
          <div class="field"><label class="field-label">Cadera (cm)</label><input id="reg-cadera" class="input" type="number" step="0.1" placeholder="100"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">Brazo (cm)</label><input id="reg-brazo" class="input" type="number" step="0.1" placeholder="28"></div>
          <div class="field"><label class="field-label">Muslo (cm)</label><input id="reg-muslo" class="input" type="number" step="0.1" placeholder="55"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="field-label">% Grasa (opcional)</label><input id="reg-grasa" class="input" type="number" step="0.1" placeholder="28.5"></div>
          <div class="field"></div>
        </div>
        <div class="field"><label class="field-label">Nota</label><textarea id="reg-nota" class="textarea" style="min-height:55px" placeholder="Ej. Se nota más energía, ropa más holgada..."></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('registro-modal')">Cancelar</button>
        <button id="reg-submit" class="btn btn-primary" onclick="guardarRegistro()">Guardar registro</button>
      </div>
    </div>
  </div>

  <!-- PLAN NUTRICIONAL (solo descripción) -->
  <div class="modal-overlay" id="plan-edit-modal">
    <div class="modal" style="max-width:560px">
      <div class="modal-head"><div class="modal-title">Editar <em>plan nutricional</em></div><button class="modal-close" onclick="closeModal('plan-edit-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Descripción del plan</label><textarea id="plan-desc" class="textarea" style="min-height:100px" placeholder="Ej: 2,200 kcal · 6 tiempos · Hierro 45mg..."></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('plan-edit-modal')">Cancelar</button>
        <button id="plan-edit-submit" class="btn btn-primary" onclick="guardarPlanDesc()">Guardar descripción</button>
      </div>
    </div>
  </div>

  <!-- REGISTRO DE GLUCOSA -->
  <div class="modal-overlay" id="glucosa-modal">
    <div class="modal" style="max-width:480px">
      <div class="modal-head"><div class="modal-title">Registrar <em>glucosa</em></div><button class="modal-close" onclick="closeModal('glucosa-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Fecha*</label><input id="gluc-fecha" class="input" type="date"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="field"><label class="field-label">Ayuno (mg/dL)</label><input id="gluc-ayuno" class="input" type="number" placeholder="92"></div>
          <div class="field"><label class="field-label">Pre-comida</label><input id="gluc-pre" class="input" type="number" placeholder="100"></div>
          <div class="field"><label class="field-label">Post-comida</label><input id="gluc-post" class="input" type="number" placeholder="140"></div>
          <div class="field"><label class="field-label">Pre-cena</label><input id="gluc-prec" class="input" type="number" placeholder="100"></div>
          <div class="field"><label class="field-label">Post-cena</label><input id="gluc-postc" class="input" type="number" placeholder="120"></div>
        </div>
        <div class="field" style="margin-top:4px"><label class="field-label">Nota</label><textarea id="gluc-nota" class="textarea" style="min-height:55px" placeholder="Observaciones del día..."></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('glucosa-modal')">Cancelar</button>
        <button id="gluc-submit" class="btn btn-primary" onclick="guardarGlucosa()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- RECUENTO 24H -->
  <div class="modal-overlay" id="recuento-modal">
    <div class="modal" style="max-width:580px">
      <div class="modal-head"><div class="modal-title">Nuevo <em>recuento 24h</em></div><button class="modal-close" onclick="closeModal('recuento-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field-row">
          <div class="field"><label class="field-label">Fecha*</label><input id="rec-fecha" class="input" type="date"></div>
          <div class="field"><label class="field-label">Agua total</label><input id="rec-agua" class="input" placeholder="Ej. 1.5 L"></div>
        </div>
        <div id="rec-tiempos">
          <div class="field-label" style="margin-bottom:6px">Tiempos de comida</div>
        </div>
        <button class="btn btn-outline btn-xs" style="margin-top:4px" onclick="addTiempoRecuento()">+ Agregar tiempo</button>
        <div class="field" style="margin-top:12px"><label class="field-label">Nota general</label><textarea id="rec-nota" class="textarea" style="min-height:55px" placeholder="Observaciones del recuento..."></textarea></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('recuento-modal')">Cancelar</button>
        <button id="rec-submit" class="btn btn-primary" onclick="guardarRecuento()">Guardar recuento</button>
      </div>
    </div>
  </div>

  <!-- SUPLEMENTO -->
  <div class="modal-overlay" id="suple-modal">
    <div class="modal" style="max-width:420px">
      <div class="modal-head"><div class="modal-title">Agregar <em>suplemento</em></div><button class="modal-close" onclick="closeModal('suple-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field"><label class="field-label">Suplemento*</label><input id="suple-nombre" class="input" placeholder="Ej. Omega 3, Vitamina D, Hierro..."></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Dosis</label><input id="suple-dosis" class="input" placeholder="Ej. 1g, 600mcg, 2000UI"></div>
          <div class="field"><label class="field-label">Momento</label>
            <select id="suple-frecuencia" class="select">
              <option>AM</option><option>PM</option><option>con comida</option><option>con cena</option><option>diario</option><option>en ayunas</option>
            </select>
          </div>
        </div>
        <div class="field"><label class="field-label">Razón / indicación (opcional)</label><input id="suple-razon" class="input" placeholder="Ej. Deficiencia de vitamina D"></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('suple-modal')">Cancelar</button>
        <button id="suple-submit" class="btn btn-primary" onclick="guardarSuple()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- LABORATORIO -->
  <div class="modal-overlay" id="lab-modal">
    <div class="modal" style="max-width:480px">
      <div class="modal-head"><div class="modal-title">Agregar <em>resultado</em></div><button class="modal-close" onclick="closeModal('lab-modal')">✕</button></div>
      <div class="modal-body">
        <div class="field-row">
          <div class="field"><label class="field-label">Fecha*</label><input id="lab-fecha" class="input" type="date"></div>
          <div class="field"><label class="field-label">Estado*</label>
            <select id="lab-status" class="select">
              <option value="ok">Normal</option>
              <option value="warn">Revisar</option>
              <option value="alert">Atención</option>
            </select>
          </div>
        </div>
        <div class="field"><label class="field-label">Prueba / Análisis*</label><input id="lab-prueba" class="input" placeholder="Ej. Hemoglobina, Glucosa, Ferritina..."></div>
        <div class="field-row">
          <div class="field"><label class="field-label">Resultado*</label><input id="lab-valor" class="input" placeholder="Ej. 12.8"></div>
          <div class="field"><label class="field-label">Rango de referencia</label><input id="lab-rango" class="input" placeholder="Ej. 12-16 g/dL"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-outline" onclick="closeModal('lab-modal')">Cancelar</button>
        <button id="lab-submit" class="btn btn-primary" onclick="guardarLaboratorio()">Guardar resultado</button>
      </div>
    </div>
  </div>`;
}

function syncApptTipo() {
  const sel     = $('#appt-paciente');
  const tipoSel = $('#appt-tipo');
  if (!sel || !tipoSel) return;
  const p = PATIENTS.find(p => p.id === parseInt(sel.value));
  tipoSel.value = (p && p.ultimaVisita === '—') ? 'Primera consulta' : 'Control / Seguimiento';
}

function openModal(id) {
  const m = $('#' + id);
  if (m) m.classList.add('open');
  if (id === 'appt-modal') {
    const sel = $('#appt-paciente');
    if (sel) {
      sel.innerHTML = PATIENTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
      if (currentPatient) sel.value = currentPatient.id;
      sel.onchange = syncApptTipo;
      syncApptTipo();
    }
  }
  if (id === 'receipt-modal' && currentReceipt) {
    $('#rcpt-concepto').textContent = currentReceipt.concepto;
    $('#rcpt-total').textContent = fmt$(currentReceipt.monto);
  }
}

function closeModal(id) {
  const m = $('#' + id);
  if (m) m.classList.remove('open');
}

function openLabModal() {
  const input = $('#lab-fecha');
  if (input) input.value = localToday();
  ['#lab-prueba','#lab-valor','#lab-rango'].forEach(s => { const el = $(s); if (el) el.value = ''; });
  const st = $('#lab-status'); if (st) st.value = 'ok';
  openModal('lab-modal');
}

async function guardarLaboratorio() {
  const fechaRaw = ($('#lab-fecha')  || {}).value;
  const prueba   = ($('#lab-prueba') || {}).value?.trim();
  const valor    = ($('#lab-valor')  || {}).value?.trim();
  const rango    = ($('#lab-rango')  || {}).value?.trim();
  const status   = ($('#lab-status') || {}).value;

  if (!fechaRaw || !prueba || !valor) { toast('Completa los campos obligatorios'); return; }

  const btn = $('#lab-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/laboratorios.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paciente_id: currentPatient.id, fecha: fechaRaw, prueba, valor, rango: rango || '—', status }),
    });
    if (!res.ok) throw new Error('Error servidor');
    const nuevo = await res.json();
    if (!currentPatient.laboratorio) currentPatient.laboratorio = [];
    currentPatient.laboratorio.unshift(nuevo);
    closeModal('lab-modal');
    toast('Resultado registrado ✓');
    setCTab('laboratorio');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar resultado'; }
  }
}

// ─── Historia clínica ──────────────────────────────────
function openHistoriaModal() {
  const h = currentPatient?.historia || {};
  const fields = { 'hc-motivo':h.motivo,'hc-ant':h.antecedentes,'hc-aleg':h.alergias,'hc-into':h.intolerancias,
    'hc-med':h.medicamentos,'hc-cir':h.cirugias,'hc-fam':h.patFam,'hc-act':h.actFisica,
    'hc-ocu':h.ocupacion,'hc-ecivil':h.estadoCivil,'hc-bio':h.bio };
  Object.entries(fields).forEach(([id, v]) => { const el = $('#' + id); if (el) el.value = v || ''; });
  const tab = $('#hc-tab'); if (tab) tab.value = h.tabaco || 'No';
  const knownAlc = ['No','Solo fin de semana','Moderado'];
  const alcVal = h.alcohol || 'No';
  const alcSel = $('#hc-alc'); const alcInp = $('#hc-alc-otro');
  if (alcSel) {
    if (knownAlc.includes(alcVal)) { alcSel.value = alcVal; if (alcInp) { alcInp.style.display = 'none'; alcInp.value = ''; } }
    else { alcSel.value = 'Otro'; if (alcInp) { alcInp.style.display = 'block'; alcInp.value = alcVal !== 'No' ? alcVal : ''; } }
  }
  openModal('historia-modal');
}

async function guardarHistoria() {
  const btn = $('#hc-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  const get = id => ($('#' + id) || {}).value?.trim() || '';
  try {
    const res = await fetch('api/historia.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: currentPatient.id,
        motivo: get('hc-motivo'), antecedentes: get('hc-ant'), alergias: get('hc-aleg'),
        intolerancias: get('hc-into'), medicamentos: get('hc-med'), cirugias: get('hc-cir'),
        patFam: get('hc-fam'), actFisica: get('hc-act'), ocupacion: get('hc-ocu'),
        estadoCivil: get('hc-ecivil'), tabaco: ($('#hc-tab')||{}).value || 'No',
        alcohol: _getAlcohol(), bio: get('hc-bio'),
      }),
    });
    if (!res.ok) throw new Error();
    // Actualizar local
    currentPatient.historia = {
      motivo: get('hc-motivo'), antecedentes: get('hc-ant'), alergias: get('hc-aleg'),
      intolerancias: get('hc-into'), medicamentos: get('hc-med'), cirugias: get('hc-cir'),
      patFam: get('hc-fam'), actFisica: get('hc-act'), ocupacion: get('hc-ocu'),
      estadoCivil: get('hc-ecivil'), tabaco: ($('#hc-tab')||{}).value || 'No',
      alcohol: _getAlcohol(), bio: get('hc-bio'),
    };
    closeModal('historia-modal');
    toast('Historia clínica guardada ✓');
    setCTab('historia');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar historia'; }
  }
}

function _getAlcohol() {
  const sel = $('#hc-alc'); const inp = $('#hc-alc-otro');
  if (!sel) return 'No';
  return sel.value === 'Otro' ? (inp?.value.trim() || 'Otro') : sel.value;
}

function hcAlcoholChange() {
  const sel = $('#hc-alc'); const inp = $('#hc-alc-otro');
  if (!sel || !inp) return;
  inp.style.display = sel.value === 'Otro' ? 'block' : 'none';
  if (sel.value !== 'Otro') inp.value = '';
  if (sel.value === 'Otro') setTimeout(() => inp.focus(), 50);
}

function historiaOverlayClick(e) {
  if (e.target !== e.currentTarget) return;
  cerrarHistoriaConFirmacion();
}

function cerrarHistoriaConFirmacion() {
  const ids = ['hc-motivo','hc-ant','hc-aleg','hc-into','hc-med','hc-cir','hc-fam','hc-act','hc-ocu','hc-bio'];
  const alcOtro = $('#hc-alc-otro');
  const hasDatos = ids.some(id => { const el = $('#'+id); return el && el.value.trim(); })
                || (alcOtro && alcOtro.style.display !== 'none' && alcOtro.value.trim());
  if (!hasDatos) { closeModal('historia-modal'); return; }
  if (confirm('¿Seguro que quieres salir? Los cambios no guardados se perderán.')) {
    closeModal('historia-modal');
  }
}

// ─── Registro unificado (peso + medidas corporales) ────
function openRegistroModal() {
  const today = localToday();
  const fecha = $('#reg-fecha'); if (fecha) fecha.value = today;
  ['reg-peso','reg-cintura','reg-cadera','reg-brazo','reg-muslo','reg-grasa','reg-nota'].forEach(id => {
    const el = $('#' + id); if (el) el.value = '';
  });
  openModal('registro-modal');
}

async function guardarRegistro() {
  const fechaRaw = ($('#reg-fecha') || {}).value;
  const pesoRaw  = ($('#reg-peso')  || {}).value;
  if (!fechaRaw || !pesoRaw) { toast('Fecha y peso son obligatorios'); return; }

  const btn = $('#reg-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    // 1. Guardar peso (inserta nueva fila en mediciones)
    const r1 = await fetch('api/progreso.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: currentPatient.id,
        fecha:  fechaRaw,
        peso:   parseFloat(pesoRaw),
        grasa:  ($('#reg-grasa')||{}).value || '',
        nota:   ($('#reg-nota') ||{}).value?.trim() || '',
        altura: currentPatient.height,
      }),
    });
    if (!r1.ok) throw new Error('Error al guardar peso');

    // 2. Si hay medidas, actualizarlas en la misma fila (upsert por fecha)
    const cintura = ($('#reg-cintura')||{}).value;
    const cadera  = ($('#reg-cadera') ||{}).value;
    const brazo   = ($('#reg-brazo')  ||{}).value;
    const muslo   = ($('#reg-muslo')  ||{}).value;
    if (cintura || cadera || brazo || muslo) {
      const r2 = await fetch('api/mediciones.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: currentPatient.id,
          fecha: fechaRaw,
          cintura: cintura || '',
          cadera:  cadera  || '',
          brazo:   brazo   || '',
          muslo:   muslo   || '',
        }),
      });
      if (!r2.ok) throw new Error('Error al guardar medidas');
    }

    // 3. Recargar detalle completo
    const res3 = await fetch(`api/paciente.php?id=${currentPatient.id}`);
    if (res3.ok) {
      const detail = await res3.json();
      Object.assign(currentPatient, detail);
      if (detail.weight) currentPatient.weight = detail.weight;
    }

    closeModal('registro-modal');
    toast('Registro guardado ✓');
    setCTab('progreso');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar registro'; }
  }
}

// ─── Plan nutricional (descripción corta) ─────────────
function openPlanModal() {
  const el = $('#plan-desc');
  if (el) el.value = currentPatient?.plan || '';
  openModal('plan-edit-modal');
}

async function guardarPlanDesc() {
  const desc = ($('#plan-desc')||{}).value?.trim();
  if (!desc) { toast('Escribe la descripción del plan'); return; }
  const btn = $('#plan-edit-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const res = await fetch('api/plan.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paciente_id: currentPatient.id, descripcion: desc }),
    });
    if (!res.ok) throw new Error();
    currentPatient.plan = desc;
    closeModal('plan-edit-modal');
    toast('Descripción del plan guardada ✓');
    setCTab('plan');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar descripción'; }
  }
}

// ─── Recuento 24h ──────────────────────────────────────
let _recTiempos = [];

function openRecuentoModal() {
  const input = $('#rec-fecha');
  if (input) input.value = localToday();
  const agua = $('#rec-agua'); if (agua) agua.value = '';
  const nota = $('#rec-nota'); if (nota) nota.value = '';
  _recTiempos = [];
  const cont = $('#rec-tiempos');
  if (cont) cont.innerHTML = '<div class="field-label" style="margin-bottom:6px">Tiempos de comida</div>';
  // Agregar 5 tiempos por defecto
  ['Desayuno','Colación AM','Comida','Colación PM','Cena'].forEach(t => addTiempoRecuento(t));
  openModal('recuento-modal');
}

function addTiempoRecuento(nombre) {
  const idx = _recTiempos.length;
  _recTiempos.push({ comida: nombre || '', hora: '', alimentos: '' });
  const cont = $('#rec-tiempos');
  if (!cont) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:130px 80px 1fr;gap:6px;margin-bottom:6px;align-items:start';
  div.innerHTML = `<input class="input" style="font-size:12px" placeholder="Tiempo" value="${nombre||''}" onchange="_recTiempos[${idx}].comida=this.value">
    <input class="input" style="font-size:12px" placeholder="Hora" onchange="_recTiempos[${idx}].hora=this.value">
    <input class="input" style="font-size:12px" placeholder="Alimentos consumidos" onchange="_recTiempos[${idx}].alimentos=this.value">`;
  cont.appendChild(div);
}

async function guardarRecuento() {
  const fechaRaw = ($('#rec-fecha')||{}).value;
  if (!fechaRaw) { toast('Selecciona una fecha'); return; }
  const tiempos = _recTiempos.filter(t => t.alimentos.trim());
  const btn = $('#rec-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const res = await fetch('api/recuento.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: currentPatient.id,
        fecha: fechaRaw,
        tiempos: _recTiempos.map(t => ({ comida: t.comida, hora: ($('[onchange*="_recTiempos[' + _recTiempos.indexOf(t) + '].hora"]')||{}).value || t.hora, alimentos: t.alimentos })),
        agua: ($('#rec-agua')||{}).value?.trim() || '',
        nota: ($('#rec-nota')||{}).value?.trim() || '',
      }),
    });
    if (!res.ok) throw new Error();
    // Recargar recuento desde BD
    const res2 = await fetch(`api/recuento.php?paciente_id=${currentPatient.id}`);
    if (res2.ok) currentPatient.recuento24 = await res2.json();
    closeModal('recuento-modal');
    toast('Recuento guardado ✓');
    setCTab('recuento24');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar recuento'; }
  }
}


document.addEventListener('click', e => {
  if (!e.target.classList.contains('modal-overlay')) return;
  if (e.target.id === 'historia-modal') { cerrarHistoriaConFirmacion(); return; }
  e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const historiaAbierta = $('#historia-modal')?.classList.contains('open');
  if (historiaAbierta) { cerrarHistoriaConFirmacion(); return; }
  $$('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

async function quickWA(id) {
  const p = PATIENTS.find(x => x.id === id);
  if (!p) return;

  const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  let fechaMsg = '';
  try {
    const res  = await fetch(`api/citas.php?paciente_id=${id}`);
    const cita = res.ok ? await res.json() : null;
    if (cita && cita.fecha) {
      const d   = new Date(cita.fecha + 'T00:00:00');
      const [hh, mm] = cita.hora.split(':');
      fechaMsg = `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} a las ${parseInt(hh)}:${mm}`;
    }
  } catch (e) {}

  const detalle = fechaMsg ? `el *${fechaMsg}*` : `tu próxima cita`;
  const msg = `Hola ${p.name.split(' ')[0]}! Soy Diana, tu nutrióloga. Te confirmo ${detalle}. ¿Tienes alguna duda antes de tu consulta?`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

function openSendPlan(id) {
  const p = PATIENTS.find(x => x.id === id) || currentPatient;
  if (!p) return;
  const msg = `🌿 *Plan Nutricional · ${p.name}*\n\n*${p.plan}*\n\n📋 _Horarios de comida (${p.semGestacion ? '6' : '5'} tiempos):_\n🌅 7:30 Desayuno\n🥗 10:30 Colación AM\n🍽 2:00 Comida\n🍵 5:30 Colación PM\n🌙 8:00 Cena\n\n💧 Agua: ${(calcWater(p.weight, p.semGestacion || 0) / 1000).toFixed(1)} L/día\n\n_Cualquier duda, escríbeme Diana 🌿_`;
  const prev = $('#send-plan-preview');
  if (prev) prev.textContent = msg;
  const btn = $('#plan-wa-btn');
  if (btn) btn.innerHTML = `<a href="${waLink(p.phone, msg)}" target="_blank" class="btn-wa"><svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>Enviar por WhatsApp</a>`;
  openModal('send-plan-modal');
}

async function guardarMovimiento() {
  const concepto = ($('#fin-concepto') || {}).value?.trim();
  const monto    = ($('#fin-monto')    || {}).value;
  const fecha    = ($('#fin-fecha')    || {}).value;
  const tipo     = document.querySelector('input[name="fin-tipo"]:checked')?.value || 'in';
  const pagado   = ($('#fin-pagado')   || {}).checked;

  if (!concepto || !monto || !fecha) {
    toast('Completa todos los campos obligatorios');
    return;
  }

  const btn = $('#fin-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/finanzas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concepto, monto, fecha, tipo, pagado }),
    });
    if (!res.ok) throw new Error('Error del servidor');
    const nuevo = await res.json();
    FINANZAS.unshift(nuevo);
    closeModal('finanza-modal');
    toast('Movimiento registrado correctamente');
    if (currentView === 'finanzas') showView('finanzas');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexion a la BD.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
  }
}

// ─── Glucosa ───────────────────────────────────────────
function openGlucosaModal() {
  const input = $('#gluc-fecha');
  if (input) input.value = localToday();
  ['gluc-ayuno','gluc-pre','gluc-post','gluc-prec','gluc-postc','gluc-nota'].forEach(id => {
    const el = $('#' + id); if (el) el.value = '';
  });
  openModal('glucosa-modal');
}

async function guardarGlucosa() {
  const fechaRaw = ($('#gluc-fecha') || {}).value;
  if (!fechaRaw) { toast('Selecciona una fecha'); return; }
  const btn = $('#gluc-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const res = await fetch('api/glucosa.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: currentPatient.id,
        fecha:       fechaRaw,
        ayuno:       ($('#gluc-ayuno') ||{}).value || null,
        pre_comida:  ($('#gluc-pre')   ||{}).value || null,
        post_comida: ($('#gluc-post')  ||{}).value || null,
        pre_cena:    ($('#gluc-prec')  ||{}).value || null,
        post_cena:   ($('#gluc-postc') ||{}).value || null,
        nota:        ($('#gluc-nota')  ||{}).value?.trim() || '',
      }),
    });
    if (!res.ok) throw new Error();
    // Recargar datos de glucosa
    const res2 = await fetch(`api/paciente.php?id=${currentPatient.id}`);
    if (res2.ok) { const d = await res2.json(); if (d.glucosaData) currentPatient.glucosaData = d.glucosaData; }
    closeModal('glucosa-modal');
    toast('Registro de glucosa guardado ✓');
    setCTab('glucosa');
  } catch (e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
  }
}

async function guardarCita() {
  const pacienteId = ($('#appt-paciente') || {}).value;
  const fecha      = ($('#appt-fecha')    || {}).value;
  const hora       = ($('#appt-hora')     || {}).value;
  const tipo       = ($('#appt-tipo')     || {}).value;
  const notas      = ($('#appt-notas')    || {}).value?.trim();
  const modalidad  = document.querySelector('input[name="appt-mod"]:checked')?.value || 'presencial';

  if (!pacienteId || !fecha || !hora) {
    toast('⚠️ Selecciona paciente, fecha y hora');
    return;
  }

  const btn = $('#appt-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/citas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paciente_id: pacienteId, fecha, hora: hora + ':00', modalidad, tipo_consulta: tipo, notas }),
    });
    if (!res.ok) throw new Error('Error del servidor');
    const nueva = await res.json();
    // Actualizar proxima cita en memoria
    const DIAS_S  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const MESES_S = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const dCita = new Date(nueva.fecha + 'T00:00:00');
    const [hh, mm] = nueva.hora.split(':');
    const proximaStr = `${DIAS_S[dCita.getDay()]} ${dCita.getDate()} ${MESES_S[dCita.getMonth()]} · ${parseInt(hh)}:${mm}`;
    const pxObj = PATIENTS.find(p => p.id === parseInt(pacienteId));
    if (pxObj) pxObj.proxima = proximaStr;
    if (currentPatient?.id === parseInt(pacienteId)) {
      currentPatient.proxima = proximaStr;
      currentPatient.proximaCita = nueva;
      renderConsulta();
    }
    closeModal('appt-modal');
    toast('Cita agendada ✓');
    if (typeof gcalCreateEvent === 'function') await gcalCreateEvent(nueva);
    if (currentView === 'agenda') {
      if (typeof gcalIsConnected === 'function' && gcalIsConnected()) {
        loadAgendaGcalEvents();
      } else {
        loadAgendaCitas();
      }
    }
  } catch (e) {
    toast('⚠️ No se pudo guardar. Revisa la conexión a la BD.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar cita'; }
  }
}

function openDatosBasicosModal() {
  const p = currentPatient;
  if (!p) return;
  const edad   = $('#db-edad');    if (edad)   edad.value   = p.age    || '';
  const peso   = $('#db-peso');    if (peso)   peso.value   = p.weight || '';
  const altura = $('#db-altura');  if (altura) altura.value = p.height || '';
  const obj    = $('#db-objetivo');if (obj)    obj.value    = p.goal   || '';
  const m = p.measures || {};
  ['cintura','cadera','brazo','muslo'].forEach(k => {
    const el = $('#db-' + k); if (el) el.value = m[k] || '';
  });
  setDbSexo(p.sexo || 'femenino');
  const sec = $('#db-materno-section');
  if (sec) {
    const isMaterna = p.type === 'materna';
    sec.style.display = isMaterna ? '' : 'none';
    if (isMaterna) {
      const dbSem = $('#db-semanas'); if (dbSem) dbSem.value = p.semGestacion  || '';
      const dbPre = $('#db-preemb');  if (dbPre) dbPre.value = p.prePregWeight || '';
      const dbDg  = $('#db-dg');      if (dbDg)  dbDg.checked = !!(p.dg);
    }
  }
  openModal('datos-basicos-modal');
}

async function guardarDatosBasicos() {
  const btn = $('#db-submit');
  const edad   = parseFloat(($('#db-edad')   ||{}).value);
  const pesoVal = ($('#db-peso')  ||{}).value;
  const peso   = pesoVal ? parseFloat(pesoVal) : null;
  const altura = parseFloat(($('#db-altura') ||{}).value);
  const sexo   = (document.querySelector('input[name="db-sexo"]:checked')||{}).value || 'femenino';
  const objetivo = (($('#db-objetivo')||{}).value||'').trim();

  if (!edad || !altura) { toast('⚠️ Edad y altura son obligatorias'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
  try {
    const res = await fetch('api/pacientes.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentPatient.id, edad, sexo, altura, objetivo }),
    });
    if (!res.ok) throw new Error();
    const updated = await res.json();
    currentPatient.age    = updated.age;
    currentPatient.sexo   = updated.sexo;
    currentPatient.height = updated.height;
    currentPatient.goal   = objetivo;
    const px = PATIENTS.find(p => p.id === currentPatient.id);
    if (px) { px.age = updated.age; px.sexo = updated.sexo; px.height = updated.height; }

    const today = localToday();

    if (peso) {
      const rP = await fetch('api/progreso.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: currentPatient.id, fecha: today, peso, altura, grasa: '', nota: '' }),
      });
      if (rP.ok) {
        currentPatient.weight = peso;
        if (px) px.weight = peso;
      }
    }

    const cintura = ($('#db-cintura')||{}).value;
    const cadera  = ($('#db-cadera') ||{}).value;
    const brazo   = ($('#db-brazo')  ||{}).value;
    const muslo   = ($('#db-muslo')  ||{}).value;
    if (cintura || cadera || brazo || muslo) {
      await fetch('api/mediciones.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: currentPatient.id, fecha: today, cintura: cintura||'', cadera: cadera||'', brazo: brazo||'', muslo: muslo||'' }),
      });
    }

    if (currentPatient.type === 'materna') {
      const sem = (($('#db-semanas')||{}).value || '').trim();
      const pre = (($('#db-preemb') ||{}).value || '').trim();
      const dg  = !!(($('#db-dg')||{}).checked);
      await fetch('api/embarazo.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paciente_id: currentPatient.id, semanas_gestacion: sem, peso_preembarazo: pre, diabetes_gestacional: dg }),
      });
    }

    const res3 = await fetch(`api/paciente.php?id=${currentPatient.id}`);
    if (res3.ok) { const d = await res3.json(); Object.assign(currentPatient, d); if (d.weight) currentPatient.weight = d.weight; }

    closeModal('datos-basicos-modal');
    toast('Datos guardados ✓');
    renderConsulta();
  } catch(e) {
    toast('No se pudo guardar. Revisa la conexión.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
  }
}

async function crearPaciente() {
  const nombre   = ($('#np-nombre')   || {}).value?.trim();
  const phone    = ($('#np-phone')    || {}).value?.trim();
  const tipo     = ($('#np-tipo')     || {}).value;
  const modalidad= ($('#np-modalidad')|| {}).value;

  if (!nombre || !phone) {
    toast('⚠️ Completa todos los campos obligatorios');
    return;
  }

  const btn = $('#np-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

  try {
    const res = await fetch('api/pacientes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, whatsapp: phone, tipo_consulta: tipo, modalidad }),
    });
    if (!res.ok) throw new Error('Error del servidor');
    const nueva = await res.json();
    PATIENTS.unshift(buildPatient(nueva));
    closeModal('newpx-modal');
    toast('Paciente registrado/a ✓ · Consentimiento generado');
    // Limpiar campos
    ['np-nombre','np-edad','np-phone'].forEach(id => {
      const el = $('#' + id); if (el) el.value = '';
    });
    if (currentView === 'pacientes') renderGrid();
    actualizarContadores();
  } catch (e) {
    toast('⚠️ No se pudo guardar. Revisa la conexión a la BD.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear expediente'; }
  }
}

function setDbSexo(val) {
  document.querySelectorAll('input[name="db-sexo"]').forEach(r => r.checked = r.value === val);
  const f = $('#db-sexo-f'), m = $('#db-sexo-m');
  if (f) Object.assign(f.style, val === 'femenino'
    ? { background: 'var(--terra-l)', color: 'var(--terra-d)', border: '1.5px solid var(--terra)' }
    : { background: 'var(--cream)',   color: 'var(--text-m)',  border: '1.5px solid transparent' });
  if (m) Object.assign(m.style, val === 'masculino'
    ? { background: 'var(--sage-ll)', color: 'var(--sage)',    border: '1.5px solid var(--sage)' }
    : { background: 'var(--cream)',   color: 'var(--text-m)',  border: '1.5px solid transparent' });
}

function setNpSexo(val) {
  const fLbl = document.getElementById('lbl-sexo-f');
  const mLbl = document.getElementById('lbl-sexo-m');
  fLbl.querySelector('input').checked = val === 'femenino';
  mLbl.querySelector('input').checked = val === 'masculino';
  Object.assign(fLbl.style, val === 'femenino'
    ? { background: 'var(--terra-l)', color: 'var(--terra-d)', fontWeight: '600' }
    : { background: 'transparent', color: 'var(--text-m)', fontWeight: '400' });
  Object.assign(mLbl.style, val === 'masculino'
    ? { background: 'var(--sage-ll)', color: 'var(--sage)', fontWeight: '600' }
    : { background: 'transparent', color: 'var(--text-m)', fontWeight: '400' });
}

// ── Recibo ────────────────────────────────────────────
function openReceiptModal(opts = {}) {
  const folio = '#REC-' + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const el = id => document.getElementById(id);
  if (el('rcpt-folio')) el('rcpt-folio').textContent = folio;
  if (el('rcpt-fecha')) el('rcpt-fecha').textContent = fecha;
  const ci = el('rcpt-concepto-in'), mi = el('rcpt-monto-in');
  if (ci) ci.value = opts.concepto || 'Consulta nutricional';
  if (mi) mi.value = opts.monto    || '';
  rcptUpdate();
  openModal('receipt-modal');
}

function rcptUpdate() {
  const el = id => document.getElementById(id);
  const concepto = el('rcpt-concepto-in')?.value || 'Consulta nutricional';
  const monto    = el('rcpt-monto-in')?.value;
  if (el('rcpt-concepto')) el('rcpt-concepto').textContent = concepto;
  if (el('rcpt-total'))    el('rcpt-total').textContent    = monto ? '$' + parseFloat(monto).toLocaleString('es-MX') : '$—';
}

function rcptGuardar() {
  const monto    = document.getElementById('rcpt-monto-in')?.value;
  const concepto = document.getElementById('rcpt-concepto-in')?.value || 'Consulta nutricional';
  const folio    = document.getElementById('rcpt-folio')?.textContent || '';
  const fecha    = document.getElementById('rcpt-fecha')?.textContent  || '';
  if (!monto) { toast('⚠️ Ingresa el monto primero'); return; }
  const total = '$' + parseFloat(monto).toLocaleString('es-MX');
  const win = window.open('', '_blank', 'width=520,height=640');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo GestaNut</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans',sans-serif;background:#f0ece4;display:flex;justify-content:center;align-items:flex-start;padding:40px 20px;min-height:100vh}
      .card{background:#fff;border-radius:16px;overflow:hidden;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(26,51,40,.18)}
      .hd{background:#1a3328;padding:32px 28px 26px;text-align:center;position:relative;overflow:hidden}
      .hd-orb1{position:absolute;top:-28px;right:-28px;width:100px;height:100px;border-radius:50%;background:rgba(107,158,120,.13)}
      .hd-orb2{position:absolute;bottom:-40px;left:-32px;width:120px;height:120px;border-radius:50%;background:rgba(107,158,120,.1)}
      .leaf{font-size:22px;margin-bottom:8px;position:relative}
      .brand{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:#faf6ef;letter-spacing:1px;position:relative}
      .hd-line{width:40px;height:1px;background:rgba(107,158,120,.55);margin:10px auto 12px;position:relative}
      .hd-sub{font-size:10px;color:rgba(250,246,239,.58);letter-spacing:.7px;text-transform:uppercase;position:relative}
      .hd-contact{font-size:10px;color:rgba(250,246,239,.4);margin-top:4px;position:relative}
      .tear{background:#1a3328;line-height:0}
      .body{padding:22px 28px 28px}
      .meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
      .meta-label{font-size:9px;text-transform:uppercase;letter-spacing:1.3px;color:#8a9e84;font-weight:500}
      .folio{font-size:11px;font-weight:600;background:#eef5ee;color:#1a3328;padding:4px 12px;border-radius:20px}
      .rows{border-top:1px dashed rgba(107,158,120,.3);padding-top:4px}
      .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px dashed rgba(107,158,120,.15);font-size:12px}
      .row:last-child{border-bottom:none}
      .row-label{color:#8a9e84}
      .row-val{color:#1a2418;font-weight:500;text-align:right;max-width:60%}
      .total-box{margin-top:16px;background:#1a3328;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
      .total-label{font-size:11px;color:rgba(250,246,239,.6);text-transform:uppercase;letter-spacing:.7px}
      .total-val{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:600;color:#faf6ef}
      .note{margin-top:14px;text-align:center;font-size:10px;color:#8a9e84;letter-spacing:.3px}
      @media print{body{background:#fff;padding:0}  .card{box-shadow:none;border-radius:0;max-width:100%}}
    </style></head><body>
    <div class="card">
      <div class="hd">
        <div class="hd-orb1"></div><div class="hd-orb2"></div>
        <div class="leaf">🌿</div>
        <div class="brand">GestaNut</div>
        <div class="hd-line"></div>
        <div class="hd-sub">Diana Zavala · Nutrióloga · Cédula 15304166</div>
        <div class="hd-contact">667 305 6211 · @gestanut</div>
      </div>
      <div class="tear"><svg viewBox="0 0 400 14" preserveAspectRatio="none" style="width:100%;height:14px;display:block"><polygon points="0,14 10,0 20,14 30,0 40,14 50,0 60,14 70,0 80,14 90,0 100,14 110,0 120,14 130,0 140,14 150,0 160,14 170,0 180,14 190,0 200,14 210,0 220,14 230,0 240,14 250,0 260,14 270,0 280,14 290,0 300,14 310,0 320,14 330,0 340,14 350,0 360,14 370,0 380,14 390,0 400,14" fill="#ffffff"/></svg></div>
      <div class="body">
        <div class="meta"><span class="meta-label">Recibo de Pago</span><span class="folio">${folio}</span></div>
        <div class="rows">
          <div class="row"><span class="row-label">Fecha</span><span class="row-val">${fecha}</span></div>
          <div class="row"><span class="row-label">Concepto</span><span class="row-val">${concepto}</span></div>
        </div>
        <div class="total-box"><span class="total-label">Total</span><span class="total-val">${total}</span></div>
        <div class="note">Comprobante informal de pago · No es factura fiscal</div>
      </div>
    </div>
    <script>window.onload=()=>{window.print()}<\/script>
  </body></html>`);
  win.document.close();
}

function _rcptText() {
  const concepto = document.getElementById('rcpt-concepto-in')?.value || 'Consulta nutricional';
  const folio    = document.getElementById('rcpt-folio')?.textContent  || '';
  const fecha    = document.getElementById('rcpt-fecha')?.textContent   || '';
  const monto    = document.getElementById('rcpt-monto-in')?.value      || '0';
  const total    = '$' + parseFloat(monto).toLocaleString('es-MX');
  return `*GestaNut · Recibo de pago*\n\nFolio: ${folio}\nFecha: ${fecha}\nConcepto: ${concepto}\n\n*Total: ${total}*\n\n_Comprobante informal de pago. No es factura fiscal._`;
}

function rcptWhatsApp() {
  const monto = document.getElementById('rcpt-monto-in')?.value;
  if (!monto) { toast('⚠️ Ingresa el monto primero'); return; }
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(_rcptText()), '_blank');
}

async function rcptShareImage() {
  const monto = document.getElementById('rcpt-monto-in')?.value;
  if (!monto) { toast('⚠️ Ingresa el monto primero'); return; }

  toast('Generando imagen...');

  if (typeof html2canvas === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const preview = document.getElementById('receipt-preview');
  const canvas  = await html2canvas(preview, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });

  canvas.toBlob(async blob => {
    const file = new File([blob], 'recibo-gestanut.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Recibo GestaNut' });
        toast('Imagen compartida ✓');
      } catch (e) {
        if (e.name !== 'AbortError') _rcptDownload(canvas);
      }
    } else {
      _rcptDownload(canvas);
      toast('Imagen descargada · Compártela en WhatsApp 📲');
    }
  }, 'image/png');
}

function _rcptDownload(canvas) {
  const a = document.createElement('a');
  a.download = 'recibo-gestanut.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}
