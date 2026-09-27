// ===============================
// HISTORIAL DE REGISTROS POR JORNADA
// ===============================

// Abrir modal de historial
const abrirHistorialBtn = document.getElementById("abrirHistorialBtn");
const modalHistorial = document.getElementById("modalHistorial");
const cerrarHistorial = document.getElementById("cerrarHistorial");
const filtrarHistorialBtn = document.getElementById("filtrarHistorialBtn");

abrirHistorialBtn.addEventListener("click", () => {
  modalHistorial.style.display = "block";
});

cerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none";
});


// Filtrar historial
filtrarHistorialBtn.addEventListener("click", () => {
  const ligaSeleccionada = document.getElementById("histLigaSelect").value;
  const jornadaSeleccionada = document.getElementById("histJornadaInput").value.trim();
  const resultadosDiv = document.getElementById("historialResultados");

  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  let filtrados = registros;

  if (ligaSeleccionada !== "todas") {
    filtrados = filtrados.filter(r => r.liga === ligaSeleccionada);
  }

  if (jornadaSeleccionada) {
    filtrados = filtrados.filter(r => r.jornada === jornadaSeleccionada);
  }

  if (filtrados.length === 0) {
    resultadosDiv.innerHTML = "<p>❌ No hay registros para esos filtros.</p>";
    return;
  }

  resultadosDiv.innerHTML = filtrados.map(r => `
    <div style="border:1px solid #ccc; padding:8px; margin-bottom:6px; border-radius:8px;">
      <strong>${r.partido}</strong><br>
      <small>${r.liga} - Jornada ${r.jornada}</small><br>
      <span>${r.fecha}</span>
    </div>
  `).join("");
});
