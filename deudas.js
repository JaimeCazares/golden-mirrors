const lista = document.getElementById("listaDeudas");
const totalEl = document.getElementById("totalDeuda");
const editarBtn = document.getElementById("editarBtn");

let modoEditar = false;

// 🔹 Cargar estado guardado al iniciar
document.addEventListener("DOMContentLoaded", () => {
  const estadoGuardado = JSON.parse(localStorage.getItem("deudasPagadas")) || [];
  const deudas = lista.querySelectorAll("li");

  deudas.forEach((li) => {
    if (estadoGuardado.includes(li.textContent)) {
      li.classList.add("pagada");
    }
  });

  actualizarTotal();
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
  guardarEstado();
  actualizarTotal();
});

// 🔹 Guardar estado actual en localStorage
function guardarEstado() {
  const deudasPagadas = Array.from(lista.querySelectorAll(".pagada")).map(
    (li) => li.textContent
  );
  localStorage.setItem("deudasPagadas", JSON.stringify(deudasPagadas));
}

// 🔹 Actualizar total dinámicamente
function actualizarTotal() {
  const deudas = lista.querySelectorAll("li");
  let total = 0;
  let pagadas = 0;

  deudas.forEach((li) => {
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
