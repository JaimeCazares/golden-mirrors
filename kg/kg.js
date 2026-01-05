function initKg() {

  const listaPesos = document.querySelectorAll("#listaPesos li");
  const pesoSeleccionado = document.getElementById("pesoSeleccionado");
  const editarBtn = document.getElementById("editarPesoBtn");

  if (!listaPesos.length || !pesoSeleccionado || !editarBtn) {
    console.error("❌ Elementos de kg no encontrados");
    return;
  }

  listaPesos.forEach(li => {
    li.addEventListener("click", () => {
      pesoSeleccionado.textContent = li.dataset.peso + " kg";
    });
  });

  editarBtn.addEventListener("click", () => {
    const nuevoPeso = prompt("Ingrese nuevo peso:");
    if (nuevoPeso && !isNaN(nuevoPeso)) {
      pesoSeleccionado.textContent = nuevoPeso + " kg";
    }
  });
}
