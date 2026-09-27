// ===============================
// SISTEMA DE APUESTAS - LOCALSTORAGE + PANEL
// ===============================

// Datos principales
let ap_invertido = 0;
let ap_bank = 1000;
let ap_ganancias = 0;
let ap_enjuego = 0;

// Cargar apuestas guardadas
let ap_apuestas = JSON.parse(localStorage.getItem("ap_apuestas")) || [];

// Actualiza los totales y el panel
function ap_actualizarPanel() {
  document.getElementById("ap_invertido").textContent = "$" + ap_invertido;
  document.getElementById("ap_bank").textContent = "$" + ap_bank;
  document.getElementById("ap_ganancias").textContent = "$" + ap_ganancias;
  document.getElementById("ap_enjuego").textContent = "$" + ap_enjuego;
}

// Muestra las apuestas activas
function ap_mostrarApuestas() {
  const lista = document.getElementById("ap_lista");
  lista.innerHTML = "";

  if (ap_apuestas.length === 0) {
    lista.innerHTML = "<li>No hay apuestas activas</li>";
    return;
  }

  ap_apuestas.forEach((a, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${a.liga}</strong> - ${a.partido} <br>
      ${a.apuesta} | 💵 ${a.monto} | 🎯 ${a.ganancia} 
      <button class="ap_btn_eliminar" data-i="${i}">❌</button>
    `;
    lista.appendChild(li);
  });

  // Evento para eliminar apuestas
  document.querySelectorAll(".ap_btn_eliminar").forEach(btn => {
    btn.onclick = e => {
      const idx = e.target.dataset.i;
      const apuesta = ap_apuestas[idx];
      ap_bank += apuesta.monto;
      ap_invertido -= apuesta.monto;
      ap_enjuego -= apuesta.ganancia;

      ap_apuestas.splice(idx, 1);
      localStorage.setItem("ap_apuestas", JSON.stringify(ap_apuestas));

      ap_actualizarPanel();
      ap_mostrarApuestas();
    };
  });
}

// Guardar apuesta nueva
function ap_guardarApuesta() {
  const liga = document.getElementById("ap_liga").value;
  const partido = document.getElementById("ap_partido").value;
  const apuesta = document.getElementById("ap_apuesta").value;
  const monto = parseFloat(document.getElementById("ap_monto").value);
  const ganancia = parseFloat(document.getElementById("ap_ganancia").value);

  if (!liga || !partido || !apuesta || isNaN(monto) || isNaN(ganancia)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  const nueva = { liga, partido, apuesta, monto, ganancia };
  ap_apuestas.push(nueva);
  localStorage.setItem("ap_apuestas", JSON.stringify(ap_apuestas));

  ap_invertido += monto;
  ap_enjuego += ganancia;
  ap_bank -= monto;

  ap_actualizarPanel();
  ap_mostrarApuestas();
  ap_cerrarVentana();
  ap_limpiarCampos();
}

// Limpia los inputs
function ap_limpiarCampos() {
  document.getElementById("ap_partido").value = "";
  document.getElementById("ap_apuesta").value = "";
  document.getElementById("ap_monto").value = "";
  document.getElementById("ap_ganancia").value = "";
}

// Mostrar / Ocultar ventana
function ap_abrirVentana() {
  document.getElementById("ap_ventana").style.display = "block";
}
function ap_cerrarVentana() {
  document.getElementById("ap_ventana").style.display = "none";
}

// Eventos
document.getElementById("ap_btn_nueva").onclick = ap_abrirVentana;
document.getElementById("ap_btn_cancelar").onclick = ap_cerrarVentana;
document.getElementById("ap_btn_guardar").onclick = ap_guardarApuesta;

// Inicializar
ap_mostrarApuestas();
ap_actualizarPanel();
