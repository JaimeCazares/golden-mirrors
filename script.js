// ===============================
// VARIABLES GLOBALES
// ===============================
let registros = JSON.parse(localStorage.getItem("registros")) || [];
let ligaSeleccionada = "todas";

const partidosContainer = document.getElementById("partidosContainer");
const modal = document.getElementById("modal");
const abrirModalBtn = document.getElementById("abrirModalBtn");
const cerrarModalBtn = document.getElementById("cerrarModalBtn");
const guardarBtn = document.getElementById("guardarRegistro");
const borrarTodoBtn = document.getElementById("borrarTodoBtn");

// ===============================
// MOSTRAR REGISTROS
// ===============================
function mostrarRegistros() {
  partidosContainer.innerHTML = "";

  const filtrados = registros.filter(
    (p) => ligaSeleccionada === "todas" || p.liga === ligaSeleccionada
  );

  if (filtrados.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.classList.add("mensaje-vacio");
    mensaje.innerHTML =
      ligaSeleccionada === "todas"
        ? "❌ No hay registros todavía."
        : `❌ No hay registros para <strong>${ligaSeleccionada}</strong>.`;
    partidosContainer.appendChild(mensaje);
    return;
  }

  filtrados.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("partido-card");
    card.dataset.id = p.id;
    card.dataset.partido = p.partido;
    card.dataset.liga = p.liga;
    card.dataset.historial = JSON.stringify(p.historial || []);

    // === Header ===
    const header = document.createElement("h3");
header.innerHTML = `${p.partido} <span class="fecha-texto">${p.liga}</span> <br><small>📅 Jornada ${p.jornada || "-"}</small>`;


    const editarBtn = document.createElement("button");
editarBtn.textContent = "✏️";
editarBtn.classList.add("editar-btn");
editarBtn.onclick = (e) => {
  e.stopPropagation();
  editarRegistro(p.id);
};

const historialBtn = document.createElement("button");
historialBtn.textContent = "📊";
historialBtn.classList.add("historial-btn");
historialBtn.onclick = (e) => {
  e.stopPropagation();
  verHistorial(p); // 👈 muestra el historial del partido
};

const eliminarBtn = document.createElement("button");
eliminarBtn.textContent = "🗑️";
eliminarBtn.classList.add("eliminar-btn");
eliminarBtn.onclick = (e) => {
  e.stopPropagation();
  eliminarRegistro(p.id);
};

header.appendChild(editarBtn);
header.appendChild(historialBtn);
header.appendChild(eliminarBtn);

    card.appendChild(header);

    // === Columnas: Original y Reciente ===
    const original = p.momiosOriginales || p.historial?.[0];
    const actual = p.historial?.[p.historial.length - 1];

    const columnasDiv = document.createElement("div");
    columnasDiv.style.display = "grid";
    columnasDiv.style.gridTemplateColumns = "1fr 1fr";
    columnasDiv.style.gap = "10px";
    columnasDiv.style.marginTop = "8px";

    const originalBox = document.createElement("div");
originalBox.classList.add("momios-box");
originalBox.innerHTML = `
  <h4>Original</h4>
  <p class="fecha-registro">🕒 ${original?.fecha || "Sin fecha"}</p>
  <table class='tabla-compacta'>
    <tr><th>Local</th><td>${original?.local1xbet || "-"}</td></tr>
    <tr><th>Empate</th><td>${original?.empate1xbet || "-"}</td></tr>
    <tr><th>Visita</th><td>${original?.visita1xbet || "-"}</td></tr>
    <tr><th>1X</th><td>${original?.x11xbet || "-"}</td></tr>
    <tr><th>2X</th><td>${original?.x21xbet || "-"}</td></tr>
    <tr><th class="mas-de">Más de ${original?.masGoles1xbet || "-"}</th><td>${original?.cuotaMas1xbet || "-"}</td></tr>
    <tr><th class="menos-de">Menos de ${original?.menosGoles1xbet || "-"}</th><td>${original?.cuotaMenos1xbet || "-"}</td></tr>
    <tr><th>Ambos anotan: Sí</th><td>${original?.ambosSi1xbet || "-"}</td></tr>
    <tr><th>Ambos anotan: No</th><td>${original?.ambosNo1xbet || "-"}</td></tr>
  </table>`;

const actualBox = document.createElement("div");
actualBox.classList.add("momios-box");
actualBox.innerHTML = `
  <h4>Reciente</h4>
  <p class="fecha-registro">🕒 ${actual?.fecha || "Sin fecha"}</p>
  <table class='tabla-compacta'>
    <tr><th>Local</th><td>${actual?.local1xbet || "-"}</td></tr>
    <tr><th>Empate</th><td>${actual?.empate1xbet || "-"}</td></tr>
    <tr><th>Visita</th><td>${actual?.visita1xbet || "-"}</td></tr>
    <tr><th>1X</th><td>${actual?.x11xbet || "-"}</td></tr>
    <tr><th>2X</th><td>${actual?.x21xbet || "-"}</td></tr>
    <tr><th class="mas-de">Más de ${actual?.masGoles1xbet || "-"}</th><td>${actual?.cuotaMas1xbet || "-"}</td></tr>
    <tr><th class="menos-de">Menos de ${actual?.menosGoles1xbet || "-"}</th><td>${actual?.cuotaMenos1xbet || "-"}</td></tr>
    <tr><th>Ambos anotan: Sí</th><td>${actual?.ambosSi1xbet || "-"}</td></tr>
    <tr><th>Ambos anotan: No</th><td>${actual?.ambosNo1xbet || "-"}</td></tr>
  </table>`;


    columnasDiv.appendChild(originalBox);
    columnasDiv.appendChild(actualBox);
    card.appendChild(columnasDiv);

    // === Gráfica dentro de la tarjeta ===
    const chartCanvas = document.createElement("canvas");
    chartCanvas.height = 100;
    card.appendChild(chartCanvas);
    card.addEventListener("click", () => mostrarGraficaPartido(p));

    partidosContainer.appendChild(card);

    // === Dibujar mini gráfica ===
    if (p.historial && p.historial.length > 1) {
      const labels = p.historial.map((m, i) => `#${i + 1}`);
      const dataLocal = p.historial.map((m) => parseFloat(m.local1xbet));
      const dataEmpate = p.historial.map((m) => parseFloat(m.empate1xbet));
      const dataVisita = p.historial.map((m) => parseFloat(m.visita1xbet));

      new Chart(chartCanvas, {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Local", data: dataLocal, borderColor: "#00e0ff", borderWidth: 2 },
            { label: "Empate", data: dataEmpate, borderColor: "#ffb703", borderWidth: 2 },
            { label: "Visita", data: dataVisita, borderColor: "#ff6b6b", borderWidth: 2 },
          ],
        },
        options: {
          plugins: { legend: { labels: { color: "#fff" } } },
          scales: {
            x: { ticks: { color: "#fff" } },
            y: { ticks: { color: "#fff" } },
          },
        },
      });
    }
function mostrarGraficaPartido(p) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content historial">
      <span class="close">&times;</span>
      <h2>${p.partido}</h2>
      <canvas id="graficaMomiosDetalle" width="550" height="300"></canvas>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close").addEventListener("click", () => modal.remove());

  const ctx = modal.querySelector("#graficaMomiosDetalle").getContext("2d");

  if (p.historial && p.historial.length > 1) {
    const labels = p.historial.map((m) => m.fecha || "");
    const dataLocal = p.historial.map((m) => parseFloat(m.local1xbet));
    const dataEmpate = p.historial.map((m) => parseFloat(m.empate1xbet));
    const dataVisita = p.historial.map((m) => parseFloat(m.visita1xbet));

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Local", data: dataLocal, borderColor: "#00e0ff", borderWidth: 2 },
          { label: "Empate", data: dataEmpate, borderColor: "#ffb703", borderWidth: 2 },
          { label: "Visita", data: dataVisita, borderColor: "#ff6b6b", borderWidth: 2 },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: { ticks: { color: "#fff" } },
          y: { ticks: { color: "#fff" } },
        },
      },
    });
  }
}

    // === CLICK EN LA TARJETA → mostrar gráfico ampliado ===
    card.addEventListener("click", () => {
      mostrarGraficaPartido(p);
    });
  });
}
// ===============================
// EDITAR REGISTRO
// ===============================
function editarRegistro(id) {
  const registro = registros.find((r) => r.id === id);
  if (!registro) {
    alert("❌ No se encontró el registro a editar.");
    return;
  }

  // 🔹 Llenar formulario con datos actuales
  document.getElementById("partido").value = registro.partido || "";
  document.getElementById("ligaSelect").value = registro.liga || "";
  document.getElementById("jornadaInput").value = registro.jornada || "";


  const momios = registro.historial?.[registro.historial.length - 1] || registro.momiosOriginales;

  document.getElementById("local1xbet").value = momios.local1xbet || "";
  document.getElementById("empate1xbet").value = momios.empate1xbet || "";
  document.getElementById("visita1xbet").value = momios.visita1xbet || "";
  document.getElementById("x11xbet").value = momios.x11xbet || "";
  document.getElementById("x21xbet").value = momios.x21xbet || "";
  document.getElementById("ambosSi1xbet").value = momios.ambosSi1xbet || "";
  document.getElementById("ambosNo1xbet").value = momios.ambosNo1xbet || "";
  document.getElementById("masGoles1xbet").value = momios.masGoles1xbet || "";
  document.getElementById("cuotaMas1xbet").value = momios.cuotaMas1xbet || "";
  document.getElementById("menosGoles1xbet").value = momios.menosGoles1xbet || "";
  document.getElementById("cuotaMenos1xbet").value = momios.cuotaMenos1xbet || "";

  // 🔹 Marcar modal como "modo edición"
  modal.dataset.editandoId = id;

  // 🔹 Abrir modal
  modal.style.display = "flex";

  // 🔹 Mostrar aviso visual
  mostrarAviso("✏️ Modo edición activo");
}

// ===============================
// ELIMINAR REGISTRO
// ===============================
function eliminarRegistro(id) {
  const registro = registros.find((r) => r.id === id);
  if (!registro) {
    alert("❌ No se encontró el registro.");
    return;
  }

  // 🔹 Confirmación antes de eliminar
  const confirmar = confirm(`¿Seguro que deseas eliminar el partido "${registro.partido}"?`);
  if (!confirmar) return;

  // 🔹 Efecto visual (animación de desvanecimiento)
  const card = Array.from(partidosContainer.children).find((el) =>
  el.dataset.id == id
);


  if (card) {
    card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.9)";
    setTimeout(() => {
      // 🔹 Eliminar del arreglo
      registros = registros.filter((r) => r.id !== id);
      localStorage.setItem("registros", JSON.stringify(registros));

      // 🔹 Actualizar vista
      mostrarRegistros();
      mostrarAviso("🗑️ Registro eliminado");
    }, 400);
  } else {
    // 🔹 En caso de que no se encuentre el elemento visual
    registros = registros.filter((r) => r.id !== id);
    localStorage.setItem("registros", JSON.stringify(registros));
    mostrarRegistros();
    mostrarAviso("🗑️ Registro eliminado");
  }
}

// ===============================
// GUARDAR REGISTRO (borde rojo vacío / verde al escribir)
// ===============================
function guardarRegistro() {
  const inputs = document.querySelectorAll("#modal input, #modal select");
  let camposInvalidos = [];

  // Quitar estilos previos
  inputs.forEach((el) => {
    el.classList.remove("invalid", "valid");
    el.style.border = "1px solid #ccc"; // reset
  });

  // Validar campos vacíos
  inputs.forEach((input) => {
    if (!input.value.trim()) {
      camposInvalidos.push(input);
      input.classList.add("invalid");
      input.style.border = "2px solid red"; // 🔴 borde rojo si vacío
    } else {
      input.classList.add("valid");
      input.style.border = "2px solid green"; // 🟢 verde si tiene valor
    }
  });

  // Si hay campos vacíos, mostrar mensaje y detener
  if (camposInvalidos.length > 0) {
    document.getElementById("mensajeError").textContent =
      "⚠️ Debes completar todos los campos antes de guardar.";
    camposInvalidos[0].focus();
    return;
  }

  // Si pasa la validación, seguir con el guardado normal
  const datosMomios = {
    local1xbet: document.getElementById("local1xbet").value.trim(),
    empate1xbet: document.getElementById("empate1xbet").value.trim(),
    visita1xbet: document.getElementById("visita1xbet").value.trim(),
    x11xbet: document.getElementById("x11xbet").value.trim(),
    x21xbet: document.getElementById("x21xbet").value.trim(),
    ambosSi1xbet: document.getElementById("ambosSi1xbet").value.trim(),
    ambosNo1xbet: document.getElementById("ambosNo1xbet").value.trim(),
    masGoles1xbet: document.getElementById("masGoles1xbet").value.trim(),
    cuotaMas1xbet: document.getElementById("cuotaMas1xbet").value.trim(),
    menosGoles1xbet: document.getElementById("menosGoles1xbet").value.trim(),
    cuotaMenos1xbet: document.getElementById("cuotaMenos1xbet").value.trim(),
    fecha: new Date().toLocaleString(),
  };

  const partido = document.getElementById("partido").value.trim();
  const liga = document.getElementById("ligaSelect").value.trim();
  const jornada = document.getElementById("jornadaInput").value.trim();
  const editandoId = modal.dataset.editandoId;

  if (editandoId) {
    // 🟡 Editando → solo agregar al historial
    const idx = registros.findIndex((r) => r.id == editandoId);
    if (idx !== -1) {
      registros[idx].historial.push(datosMomios);
      registros[idx].momios = datosMomios;
      registros[idx].fechaEdicion = Date.now();
      mostrarAviso("📊 Nuevos momios agregados al historial");
    }
    delete modal.dataset.editandoId;
  } else {
    // 🆕 Nuevo registro
    const nuevo = {
      id: Date.now(),
      partido,
      liga,
      jornada, // ✅ nueva propiedad
      momiosOriginales: datosMomios,
      momios: datosMomios,
      historial: [datosMomios],
    };
    registros.push(nuevo);
    mostrarAviso("✅ Registro guardado correctamente");
  }

  localStorage.setItem("registros", JSON.stringify(registros));
  cerrarModal();
  mostrarRegistros();
  limpiarFormulario();
  document.getElementById("jornadaInput").value = "";

  document.getElementById("mensajeError").textContent = "";
}

// ===============================
// HISTORIAL (versión mejorada)
// ===============================
function verHistorial(partido) {
  // Eliminar un historial anterior si existe
const anterior = document.getElementById("modalHistorial");
if (anterior) anterior.remove();

  const modalHist = document.createElement("div");
modalHist.classList.add("modal");
modalHist.id = "modalHistorial"; // ✅ esto hace que el ESC funcione

  modalHist.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    padding: 20px;
  `;

  modalHist.innerHTML = `
    <div class="modal-content" style="
      width: 100%;
      height: 100%;
      background: #1a1a2e;
      border-radius: 10px;
      padding: 70px;
      overflow-y: auto;
      color: #fff;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
      position: relative;
      animation: fadeIn 0.3s ease-in-out;
    ">
      <span class="close" id="cerrarHist" style="
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 26px;
        cursor: pointer;
        color: #ff5f5f;
      ">&times;</span>
      <h2 style="margin-top: 0; text-align: center;">📊 Historial de ${partido.partido}</h2>
      <table class="tabla-compacta" style="width:80%;margin-top:5px;border-collapse:collapse;">
        <tr style="background:#162447;">
          <th>#</th><th>Fecha</th><th>Local</th><th>Empate</th><th>Visita</th><th>1X</th><th>2X</th><th>Más</th><th>Menos</th><th>ambosSi1xbet</th><th>ambosNo1xbet</th>
        </tr>
        ${partido.historial
          ?.map(
            (m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.fecha}</td>
              <td>${m.local1xbet}</td>
              <td>${m.empate1xbet}</td>
              <td>${m.visita1xbet}</td>
              <td>${m.x11xbet}</td>
              <td>${m.x21xbet}</td>
              <td>${m.cuotaMas1xbet}</td>
              <td>${m.cuotaMenos1xbet}</td>
              <td>${m.ambosSi1xbet}</td>
              <td>${m.ambosNo1xbet}</td>
            </tr>`
          )
          .join("") || ""}
      </table>
    </div>
  `;

  document.body.appendChild(modalHist);
   // Función para cerrar modal y remover listener
  const cerrarModal = () => {
    modalHist.remove();
    document.removeEventListener("keydown", onEscPress);
  };
// Listener ESC
  const onEscPress = (e) => {
    if (e.key === "Escape") cerrarModal();
  };

  document.addEventListener("keydown", onEscPress);
  // cerrar modal
  modalHist.querySelector("#cerrarHist").onclick = () => modalHist.remove();
  modalHist.addEventListener("click", (e) => {
    if (e.target === modalHist) modalHist.remove();
  });
}


// ===============================
// UTILIDADES
// ===============================
function limpiarFormulario() {
  document.querySelectorAll("#modal input, #modal select").forEach((el) => {
    el.value = "";
    el.classList.remove("valid", "invalid"); // 🧽 limpiar colores de validación
  });
  document.getElementById("mensajeError").textContent = "";
}

function abrirModal() {
  limpiarFormulario(); // 🧹 limpiar antes de mostrar
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
}
function mostrarAviso(texto) {
  const aviso = document.createElement("div");
  aviso.textContent = texto;
  Object.assign(aviso.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#00b4d8",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    zIndex: "2000",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });
  document.body.appendChild(aviso);
  setTimeout(() => (aviso.style.opacity = "1"), 50);
  setTimeout(() => {
    aviso.style.opacity = "0";
    setTimeout(() => aviso.remove(), 300);
  }, 2000);
}

// ===============================
// EVENTOS
// ===============================
abrirModalBtn.addEventListener("click", abrirModal);
cerrarModalBtn.addEventListener("click", cerrarModal);
guardarBtn.addEventListener("click", guardarRegistro);
window.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});
borrarTodoBtn.addEventListener("click", () => {
  const pass = prompt("🔐 Introduce la contraseña para borrar todos los registros:");
  if (pass === null) return;
  if (pass === "Cazares7") {
    if (confirm("⚠️ ¿Seguro que quieres borrar todos los registros?")) {
      localStorage.removeItem("registros");
      registros = [];
      mostrarRegistros();
      alert("🗑️ Todos los registros han sido eliminados.");
    }
  } else alert("❌ Contraseña incorrecta.");
});

// ===============================
// VALIDACIÓN EN TIEMPO REAL + SINCRONIZACIÓN OVER/UNDER
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("#modal input, #modal select");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value.trim() !== "") {
        input.classList.remove("invalid");
        input.classList.add("valid");
        input.style.border = "2px solid green"; // 🟢
      } else {
        input.classList.remove("valid");
        input.classList.add("invalid");
        input.style.border = "2px solid red"; // 🔴
      }
    });
  });

  // 🔹 Sincronizar Over ↔ Under
  const over = document.getElementById("masGoles1xbet");
  const under = document.getElementById("menosGoles1xbet");

  if (over && under) {
    over.addEventListener("input", () => {
      under.value = over.value;

      // ✅ Si el over tiene valor, marcar ambos como válidos
      if (over.value.trim() !== "") {
        over.classList.remove("invalid");
        over.classList.add("valid");
        under.classList.remove("invalid");
        under.classList.add("valid");
      } else {
        over.classList.remove("valid");
        under.classList.remove("valid");
      }
    });
  }
});
// ===============================
// ATAJO DE TECLADO: NUEVO REGISTRO (Alt + N)
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key.toLowerCase() === "n") {
    e.preventDefault(); // evita conflictos con otros atajos

    limpiarFormulario(); // 🧹 limpia valores y validaciones
    modal.removeAttribute("data-editando-id"); // asegura que sea un nuevo registro
    abrirModal(); // abre el modal

    // 🧭 Enfocar automáticamente el primer input del modal
    setTimeout(() => {
      const primerInput = modal.querySelector("input, select, textarea");
      if (primerInput) primerInput.focus();
    }, 100); // pequeño retardo para asegurar que el modal ya se renderizó
  }
});



// ===============================
// CERRAR MODAL CON TECLA ESC
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") {
    cerrarModal();
  }
});


// ===============================
// INICIO
// ===============================
registros = registros.filter((p) => p.partido && p.liga);
localStorage.setItem("registros", JSON.stringify(registros));
// ===============================
// FILTROS DE LIGAS
// ===============================
document.querySelectorAll(".filtro-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    ligaSeleccionada = btn.dataset.liga;
    mostrarRegistros();
  });
});


mostrarRegistros();
// ===============================
// TARJETAS CLICABLES CON MODAL
// ===============================
let grafica; // referencia global a la gráfica activa

// Función para abrir modal

// Cerrar modal
document.getElementById('cerrarModal').addEventListener('click', () => {
  document.getElementById('detalleModal').style.display = 'none';
});

// Detectar clic en tarjeta
document.addEventListener('click', (e) => {
  const card = e.target.closest('.partido-card');
  if (card) {
    // extraer datos del dataset o del objeto usado en mostrarRegistros()
    const partido = {
      local: card.dataset.local || 'Equipo A',
      visitante: card.dataset.visitante || 'Equipo B',
      momiosLocal: JSON.parse(card.dataset.momiosLocal || '[2.1,2.0,1.9,2.3]'),
      momiosVisitante: JSON.parse(card.dataset.momiosVisitante || '[3.1,3.0,3.3,3.2]')
    };
    abrirModal(partido);
  }
});
function mostrarGraficaPartido(p) {
  // 🔹 Eliminar overlay previo si existe
  const existente = document.querySelector(".modal-overlay");
  if (existente) existente.remove();

  // 🔹 Crear overlay centrado
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  // 🔹 Contenido del modal
  const modal = document.createElement("div");
  modal.classList.add("modal-content");
  modal.innerHTML = `
    <span class="modal-close">&times;</span>
    <h2>${p.partido}</h2>
    <canvas id="graficaMomiosDetalle" width="600" height="300"></canvas>
  `;

  // Agregar al DOM
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 🔹 Cerrar modal
  modal.querySelector(".modal-close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // 🔹 Crear gráfica
  const ctx = modal.querySelector("#graficaMomiosDetalle").getContext("2d");

  if (p.historial && p.historial.length > 1) {
    const labels = p.historial.map((m) => m.fecha || "");
    const dataLocal = p.historial.map((m) => parseFloat(m.local1xbet));
    const dataEmpate = p.historial.map((m) => parseFloat(m.empate1xbet));
    const dataVisita = p.historial.map((m) => parseFloat(m.visita1xbet));

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Local", data: dataLocal, borderColor: "#00e0ff", borderWidth: 2 },
          { label: "Empate", data: dataEmpate, borderColor: "#ffb703", borderWidth: 2 },
          { label: "Visita", data: dataVisita, borderColor: "#ff6b6b", borderWidth: 2 },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: { ticks: { color: "#fff" } },
          y: { ticks: { color: "#fff" } },
        },
      },
    });
  }
}


