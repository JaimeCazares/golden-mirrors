document.addEventListener("DOMContentLoaded", () => {
  const listaPesos = document.querySelectorAll("#listaPesos li");
  const pesoSeleccionado = document.getElementById("pesoSeleccionado");

  listaPesos.forEach(li => {
    li.addEventListener("click", () => {
      pesoSeleccionado.textContent = li.dataset.peso + " kg";
    });
  });

  const editarBtn = document.getElementById("editarPesoBtn");
  editarBtn.addEventListener("click", () => {
    const nuevoPeso = prompt("Ingrese nuevo peso:");
    if (nuevoPeso && !isNaN(nuevoPeso)) {
      pesoSeleccionado.textContent = nuevoPeso + " kg";
    }
  });
});
