const lista = document.getElementById("listaDeudas");
const totalEl = document.getElementById("totalDeuda");
const editarBtn = document.getElementById("editarBtn");

let modoEditar = false;

// 🔹 Cargar estado desde la base de datos
document.addEventListener("DOMContentLoaded", () => {
  fetch("obtenerDeudas.php")
    .then(res => res.json())
    .then(data => {
      const deudas = lista.querySelectorAll("li");

      deudas.forEach(li => {
        const nombre = li.textContent.split("=")[0].trim();
        if (data[nombre] == 1) {
          li.classList.add("pagada");
        }
      });

      actualizarTotal();
    });
});

// 🔹 Cambiar modo edición
editarBtn.addEventListener("click", () => {
  modoEditar = !modoEditar;
  editarBtn.textContent = modoEditar ? "✅" : "✏️";
  editarBtn.classList.toggle("modo-listo", modoEditar);
});

// 🔹 Marcar/desmarcar deudas
lista.addEventListener("click", (e) => {
  if (!modoEditar || e.target.tagName !== "LI") return;

  e.target.classList.toggle("pagada");

  guardarEstado(e.target);
  actualizarTotal();
});

// 🔹 Guardar una sola deuda en la BD
function guardarEstado(li) {
  const nombre = li.textContent.split("=")[0].trim();
  const pagada = li.classList.contains("pagada") ? 1 : 0;

  const datos = new FormData();
  datos.append("nombre", nombre);
  datos.append("pagada", pagada);

  fetch("guardarDeuda.php", {
    method: "POST",
    body: datos
  });
}

// 🔹 Calcular total restante
function actualizarTotal() {
  const deudas = lista.querySelectorAll("li");
  let total = 0;
  let pagadas = 0;

  deudas.forEach(li => {
    const monto = parseInt(li.dataset.monto);
    if (!li.classList.contains("pagada")) {
      total += monto;
    } else {
      pagadas++;
    }
  });

  totalEl.textContent = `TOTAL = $${total.toLocaleString()}`;
  totalEl.classList.toggle("completo", pagadas === deudas.length);
}
