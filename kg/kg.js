function initKg() {

  const listaPesos = document.querySelectorAll("#listaPesos li");
  const pesoSeleccionado = document.getElementById("pesoSeleccionado");

  const btnHistorial = document.getElementById("verHistorialKg");
  const modalKg = document.getElementById("modalKg");
  const cerrarKgModal = document.getElementById("cerrarKgModal");

  const historialKgLista = document.getElementById("historialKgLista");
  const nuevoPeso = document.getElementById("nuevoPeso");

  const fotoFrente = document.getElementById("fotoFrente");
  const fotoLado   = document.getElementById("fotoLado");
  const fotoAtras  = document.getElementById("fotoAtras");

  const guardarPesoHistorial = document.getElementById("guardarPesoHistorial");

  let modoEdicion = false;
  let pesoActual = 0;

  // =========================
  // POSICIÓN BOTÓN HISTORIAL
  // =========================
  function posicionarBotonHistorial() {
    const ref = pesoSeleccionado.getBoundingClientRect();
    btnHistorial.style.left = ref.left + window.scrollX + "px";
    btnHistorial.style.top  = ref.bottom + window.scrollY + 6 + "px";
  }

  posicionarBotonHistorial();
  window.addEventListener("resize", posicionarBotonHistorial);
  window.addEventListener("scroll", posicionarBotonHistorial);

  // =========================
  // PESO ACTUAL
  // =========================
  fetch("kg/obtenerKg.php", { cache: "no-store" })
    .then(res => res.json())
    .then(data => {
      pesoActual = parseFloat(data.peso) || 0;
      if (pesoActual > 0) {
        pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";
      }
      actualizarIndicador();
    });

  pesoSeleccionado.addEventListener("click", () => {
    if (modoEdicion) return;
    modoEdicion = true;

    pesoSeleccionado.innerHTML = `
      <input type="number" step="0.01" id="inputPeso" value="${pesoActual || ""}">
    `;

    const input = document.getElementById("inputPeso");
    input.focus();

    input.addEventListener("keydown", e => {
      if (e.key === "Enter") guardarPesoActual(input.value);
    });

    input.addEventListener("blur", () => guardarPesoActual(input.value));
  });

  listaPesos.forEach(li => {
    li.addEventListener("mousedown", e => {
      if (!modoEdicion) return;
      e.preventDefault();
      guardarPesoActual(li.dataset.peso);
    });
  });

  function guardarPesoActual(valor) {
    valor = parseFloat(valor);

    if (!valor || isNaN(valor)) {
      pesoSeleccionado.textContent = "PESO";
      pesoActual = 0;
    } else {
      pesoActual = valor;
      pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";

      const datos = new FormData();
      datos.append("peso", pesoActual);

      fetch("kg/guardarKg.php", {
        method: "POST",
        body: datos
      });
    }

    modoEdicion = false;
    actualizarIndicador();
  }

  function actualizarIndicador() {
    listaPesos.forEach(li => {
      li.classList.remove("superior", "actual");
      const pesoLi = parseFloat(li.dataset.peso);
      if (!pesoActual) return;

      if (Math.round(pesoLi) === Math.round(pesoActual)) {
        li.classList.add("actual");
      } else if (pesoLi > pesoActual) {
        li.classList.add("superior");
      }
    });
  }

  // =========================
  // MODAL
  // =========================
  btnHistorial.addEventListener("click", () => {
    modalKg.style.display = "flex";
    cargarHistorialKg();
  });

  cerrarKgModal.addEventListener("click", () => {
    modalKg.style.display = "none";
  });

  // =========================
  // HISTORIAL
  // =========================
  function cargarHistorialKg() {
    historialKgLista.innerHTML = "Cargando...";

    fetch("kg/obtenerHistorialKg.php", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (!data.length) {
          historialKgLista.innerHTML = "<p>Sin registros</p>";
          return;
        }

        historialKgLista.innerHTML = data.map(item => `
          <div class="card-historial">
            <strong>Semana ${item.semana}</strong><br>
            📅 ${item.fecha}<br>
            ⚖️ ${item.peso} kg
            <div>
              ${item.foto_frente ? `<button onclick="verFoto('${item.foto_frente}')">📸 Frente</button>` : ""}
              ${item.foto_lado   ? `<button onclick="verFoto('${item.foto_lado}')">📸 Lado</button>` : ""}
              ${item.foto_atras  ? `<button onclick="verFoto('${item.foto_atras}')">📸 Atrás</button>` : ""}
            </div>
          </div>
        `).join("");
      });
  }

  // =========================
  // GUARDAR REGISTRO
  // =========================
  guardarPesoHistorial.addEventListener("click", () => {
    const peso = parseFloat(nuevoPeso.value);
    if (!peso || isNaN(peso)) {
      alert("Ingresa un peso válido");
      return;
    }

    const datos = new FormData();
    datos.append("peso", peso);

    if (fotoFrente.files[0]) datos.append("foto_frente", fotoFrente.files[0]);
    if (fotoLado.files[0])   datos.append("foto_lado", fotoLado.files[0]);
    if (fotoAtras.files[0])  datos.append("foto_atras", fotoAtras.files[0]);

    fetch("kg/guardarHistorialKg.php", {
      method: "POST",
      body: datos
    })
    .then(res => res.json())
    .then(resp => {
      if (!resp.ok) {
        alert("❌ Error al guardar");
        return;
      }

      alert("✅ Registro guardado");
      nuevoPeso.value = "";
      fotoFrente.value = "";
      fotoLado.value = "";
      fotoAtras.value = "";
      cargarHistorialKg();
    });
  });
}

function verFoto(ruta) {
  window.open(ruta, "_blank");
}

document.addEventListener("DOMContentLoaded", initKg);
