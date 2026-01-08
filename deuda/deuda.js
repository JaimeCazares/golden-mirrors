function initDeuda() {

  const lista = document.getElementById("listaDeudas");
  const totalEl = document.getElementById("totalDeuda");
  const editarBtn = document.getElementById("editarBtn");

  let modoEditar = false;

  editarBtn.addEventListener("click", () => {
    modoEditar = !modoEditar;
    editarBtn.textContent = modoEditar ? "✅" : "✏️";
  });

  lista.addEventListener("click", e => {
    if (!modoEditar || e.target.tagName !== "LI") return;
    e.target.classList.toggle("pagada");
    guardarEstado(e.target);
    actualizarTotal();
  });

  cargarDeudas();

  function cargarDeudas() {
    fetch("deuda/obtenerDeudas.php", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        lista.querySelectorAll("li").forEach(li => {
          const id = li.dataset.id;
          li.classList.toggle("pagada", data[li.dataset.id] == 1);
        });
        actualizarTotal();
      });
  }

  function guardarEstado(li) {
  const id = li.dataset.id;
  const pagada = li.classList.contains("pagada") ? 1 : 0;

  const datos = new FormData();
  datos.append("id", id);
  datos.append("pagada", pagada);

  fetch("deuda/guardarDeuda.php", {
    method: "POST",
    body: datos
  });
}


  function actualizarTotal() {
    let total = 0;

    lista.querySelectorAll("li").forEach(li => {
      const monto = parseInt(li.dataset.monto);
      if (!li.classList.contains("pagada")) total += monto;
    });

    totalEl.textContent = `TOTAL = $${total.toLocaleString()}`;
  }
}
