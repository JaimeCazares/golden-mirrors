function initKg() {
  const listaPesos = document.querySelectorAll("#listaPesos li");
  const pesoSeleccionado = document.getElementById("pesoSeleccionado");
  const btnHistorial = document.getElementById("verHistorialKg");
  const modalKg = document.getElementById("modalKg");
  const cerrarKgModal = document.getElementById("cerrarKgModal");
  const historialKgLista = document.getElementById("historialKgLista");
  const nuevoPeso = document.getElementById("nuevoPeso");
  const guardarPesoHistorial = document.getElementById("guardarPesoHistorial");
  const formHistorial = document.getElementById("formHistorialKg");

  let pesoActual = 0;
  let cacheRegistros = [];
  let bloquearGuardado = false;

  // --- NOTIFICACIONES ---
  function mostrarIndicador(mensaje, tipo) {
    const c = document.getElementById("mensajeRegistro");
    if (!c) return;
    c.textContent = mensaje;
    c.className = tipo === "success" ? "msg-exito" : "msg-error";
    c.style.display = "block";
    setTimeout(() => { c.style.display = "none"; }, 4000);
  }

  // --- CARGAR CUADRÍCULA ---
  function cargarHistorialKg() {
    historialKgLista.innerHTML = "";
    fetch("kg/obtenerHistorialKg.php", { cache: "no-store" })
      .then(res => res.json())
      .then(registros => {
        // Ordenamos por semana ascendente (0, 1, 2...) para asegurar lógica correcta
        cacheRegistros = registros.sort((a, b) => parseInt(a.semana) - parseInt(b.semana));
        
        const datosSemana = {};
        registros.forEach(r => { datosSemana[r.semana] = r; });

        for (let i = 0; i <= 51; i++) {
          const btn = document.createElement("div");
          const data = datosSemana[i];
          btn.className = data ? "semana-btn completada" : "semana-btn pendiente";
          btn.innerHTML = `<b>${i}</b><span>${data ? data.peso : '-'}</span>`;
          if (data) btn.onclick = () => mostrarDetalleSemana(data);
          historialKgLista.appendChild(btn);
        }
      });
  }

  // --- VISOR DE SEMANA INDIVIDUAL (3 FOTOS) ---
  function mostrarDetalleSemana(data) {
    const v = document.createElement("div");
    v.id = "visorActivo"; 
    v.className = "visor-fotos-overlay";
    v.innerHTML = `
      <div class="visor-content">
        <span class="close-visor" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h3 style="text-align:center; color:#00e0ff; margin:0">Semana ${data.semana}</h3>
        <p style="text-align:center; font-size:11px; margin-bottom:10px">⚖️ ${data.peso} kg | 📅 ${data.fecha}</p>
        <div class="fotos-row">
          <div class="foto-box"><span>Frente</span><img src="${data.foto_frente || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Lado</span><img src="${data.foto_lado || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Atrás</span><img src="${data.foto_atras || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
        </div>
      </div>`;
    document.body.appendChild(v);
  }

  // --- BOTÓN PROGRESO (TODAS LAS SEMANAS, 3 FOTOS CADA UNA) ---
  document.getElementById("btnVerTodo").onclick = () => {
    if (cacheRegistros.length === 0) return;
    const v = document.createElement("div");
    v.id = "visorEspecial"; 
    v.className = "visor-fotos-overlay";
    
    // Generamos el HTML con las 3 fotos por cada registro
    const contenidoHTML = cacheRegistros.map(r => `
      <div style="border-bottom:1px solid #333; padding:15px 0;">
        <p style="font-size:14px; font-weight:bold; text-align:center; color:#ddd; margin-bottom:8px;">
            Semana ${r.semana} (${r.peso} kg)
        </p>
        <div class="fotos-row">
          <div class="foto-box"><span>Frente</span><img src="${r.foto_frente || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Lado</span><img src="${r.foto_lado || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Atrás</span><img src="${r.foto_atras || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
        </div>
      </div>
    `).join('');

    v.innerHTML = `
      <div class="visor-content" style="max-height:85vh; overflow-y:auto;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h3 style="text-align:center; color:#00e0ff; position:sticky; top:0; background:#1a1a2e; padding:10px; border-bottom:1px solid #333;">Evolución Completa</h3>
        ${contenidoHTML}
      </div>`;
    document.body.appendChild(v);
  };

  // --- BOTÓN COMPARAR (ANTES Y DESPUÉS, 3 FOTOS CADA UNO) ---
  document.getElementById("btnAntesDespues").onclick = () => {
    if (cacheRegistros.length < 1) return; // Necesitamos al menos 1 registro

    // Lógica corregida: 
    // "Antes" es el primer elemento del array ordenado (Semana 0 o la menor).
    // "Después" es el último elemento del array ordenado (Semana actual/mayor).
    const antes = cacheRegistros[0]; 
    const despues = cacheRegistros[cacheRegistros.length - 1];

    const v = document.createElement("div");
    v.id = "visorEspecial"; 
    v.className = "visor-fotos-overlay";
    v.innerHTML = `
      <div class="visor-content" style="max-height:90vh; overflow-y:auto;">
        <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h3 style="text-align:center; color:#00e0ff; margin-bottom:15px;">Comparativa</h3>
        
        <h4 style="text-align:center; color:#aaa; margin-bottom:5px;">ANTES: Semana ${antes.semana} (${antes.peso}kg)</h4>
        <div class="fotos-row" style="margin-bottom:20px;">
          <div class="foto-box"><span>Frente</span><img src="${antes.foto_frente || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Lado</span><img src="${antes.foto_lado || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Atrás</span><img src="${antes.foto_atras || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
        </div>

        <hr style="border:0; border-top:1px dashed #333; margin:10px 0;">

        <h4 style="text-align:center; color:#4df572; margin-bottom:5px;">AHORA: Semana ${despues.semana} (${despues.peso}kg)</h4>
        <div class="fotos-row">
          <div class="foto-box"><span>Frente</span><img src="${despues.foto_frente || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Lado</span><img src="${despues.foto_lado || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
          <div class="foto-box"><span>Atrás</span><img src="${despues.foto_atras || ''}" onclick="zoomImagen(this.src)" onerror="this.src='img/no-photo.png'"></div>
        </div>

      </div>`;
    document.body.appendChild(v);
  };

  // --- GUARDAR ---
  guardarPesoHistorial.onclick = function(e) {
    e.preventDefault(); 
    if (bloquearGuardado) return;
    const pVal = parseFloat(nuevoPeso.value);
    if (!pVal) { mostrarIndicador("⚠️ Peso inválido", "error"); return; }
    
    bloquearGuardado = true; 
    guardarPesoHistorial.disabled = true;
    
    fetch("kg/guardarHistorialKg.php", { method: "POST", body: new FormData(formHistorial) })
    .then(res => res.json()).then(resp => {
      if (resp.ok) { 
          mostrarIndicador("✅ Guardado!", "success"); 
          formHistorial.reset(); 
          resetFileInputs(); 
          cargarHistorialKg(); 
      }
      else { mostrarIndicador("❌ " + resp.error, "error"); }
    }).finally(() => { bloquearGuardado = false; guardarPesoHistorial.disabled = false; });
  };

  // --- ESCAPE (Cierre Jerárquico) ---
  document.onkeydown = function(e) {
    if (e.key === "Escape") {
      const zoom = document.getElementById("imgZoomOverlay");
      const especial = document.getElementById("visorEspecial");
      const visor = document.getElementById("visorActivo");
      
      if (zoom) zoom.remove();
      else if (especial) especial.remove();
      else if (visor) visor.remove();
      else if (modalKg.style.display === "flex") { 
          modalKg.style.display = "none"; 
          btnHistorial.style.display = "block"; 
          fixBtnPos(); 
      }
    }
  };

  function fixBtnPos() {
    const ref = pesoSeleccionado.getBoundingClientRect();
    btnHistorial.style.left = ref.left + window.scrollX + "px";
    btnHistorial.style.top  = ref.bottom + window.scrollY + 6 + "px";
  }

  btnHistorial.onclick = () => { modalKg.style.display = "flex"; btnHistorial.style.display = "none"; cargarHistorialKg(); };
  cerrarKgModal.onclick = () => { modalKg.style.display = "none"; btnHistorial.style.display = "block"; fixBtnPos(); };

  // Barra superior de pesos
  listaPesos.forEach(li => { li.onclick = () => { 
      pesoActual = parseFloat(li.dataset.peso);
      pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";
      const d = new FormData(); d.append("peso", pesoActual);
      fetch("kg/guardarKg.php", { method: "POST", body: d });
      actualizarIndicador();
  }; });

  function actualizarIndicador() {
    listaPesos.forEach(li => {
      li.classList.remove("superior", "actual");
      const p = parseFloat(li.dataset.peso);
      if (Math.round(p) === Math.round(pesoActual)) li.classList.add("actual");
      else if (p > pesoActual) li.classList.add("superior");
    });
  }

  pesoSeleccionado.onclick = () => {
    if (modoEdicion) return; modoEdicion = true;
    pesoSeleccionado.innerHTML = `<input type="number" step="0.01" id="inputPeso" value="${pesoActual || ""}">`;
    const input = document.getElementById("inputPeso");
    input.focus();
    input.onkeydown = (e) => { if (e.key === "Enter") { guardarPesoActual(input.value); modoEdicion=false; } };
    input.onblur = () => { guardarPesoActual(input.value); modoEdicion=false; };
  };

  function guardarPesoActual(valor) {
      pesoActual = parseFloat(valor);
      pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";
      actualizarIndicador();
  }

  // --- CONFIGURACIÓN INPUTS ARCHIVOS (TEXTO CAMBIANTE) ---
  function setupFileInputs() {
      ['Frente', 'Lado', 'Atras'].forEach(tipo => {
          const input = document.getElementById('foto' + tipo);
          const labelSpan = document.getElementById('fileName' + tipo);
          if(!input) return;
          const container = input.closest('.upload-item-cool');

          input.addEventListener('change', function(e) {
              if (this.files && this.files.length > 0) {
                  labelSpan.textContent = this.files[0].name;
                  container.classList.add('active');
              } else {
                  labelSpan.textContent = "Sin archivo";
                  container.classList.remove('active');
              }
          });
      });
  }

  function resetFileInputs() {
      ['Frente', 'Lado', 'Atras'].forEach(tipo => {
          const labelSpan = document.getElementById('fileName' + tipo);
          const input = document.getElementById('foto' + tipo);
          if(labelSpan) labelSpan.textContent = "Sin archivo";
          if(input) input.closest('.upload-item-cool').classList.remove('active');
      });
  }
  
  setupFileInputs();

  fetch("kg/obtenerKg.php", { cache: "no-store" }).then(res=>res.json()).then(data=>{
    pesoActual = parseFloat(data.peso) || 0;
    if (pesoActual > 0) pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";
    actualizarIndicador(); fixBtnPos();
  });
}

function zoomImagen(src) {
    if(!src || src.includes("undefined") || src === "") return;
    const overlay = document.createElement("div");
    overlay.id = "imgZoomOverlay"; overlay.className = "img-zoom-overlay";
    overlay.innerHTML = `<img src="${src}" class="img-zoom-content">`;
    document.body.appendChild(overlay);
    overlay.onclick = () => overlay.remove();
}
document.addEventListener("DOMContentLoaded", initKg);