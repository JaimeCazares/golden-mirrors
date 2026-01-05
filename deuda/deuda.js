function initDeuda() {

  const socket = io("http://localhost:3000");

  const lista = document.getElementById("listaDeudas");
  const totalEl = document.getElementById("totalDeuda");
  const editarBtn = document.getElementById("editarBtn");

  if (!lista || !totalEl || !editarBtn) {
    console.error("❌ Elementos de deuda no encontrados");
    return;
  }

  let modoEditar = false;

  socket.on("actualizar_deudas", cargarDeudas);

  editarBtn.addEventListener("click", () => {
    modoEditar = !modoEditar;
    editarBtn.textContent = modoEditar ? "✅" : "✏️";
    editarBtn.classList.toggle("modo-listo", modoEditar);
  });

  lista.addEventListener("click", e => {
    if (!modoEditar || e.target.tagName !== "LI") return;
    e.target.classList.toggle("pagada");
    guardarEstado(e.target);
    actualizarTotal();
  });

  cargarDeudas();

  function cargarDeudas() {
    fetch("deuda/obtenerDeuda.php", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        lista.querySelectorAll("li").forEach(li => {
          const nombre = li.textContent.split("=")[0].trim();
          li.classList.toggle("pagada", data[nombre] == 1);
        });
        actualizarTotal();
      });
  }

  function guardarEstado(li) {
    const nombre = li.textContent.split("=")[0].trim();
    const pagada = li.classList.contains("pagada") ? 1 : 0;

    const datos = new FormData();
    datos.append("nombre", nombre);
    datos.append("pagada", pagada);

    fetch("deuda/guardarDeuda.php", {
      method: "POST",
      body: datos
    }).then(() => socket.emit("actualizar_deudas"));
  }

  function actualizarTotal() {
    let total = 0;
    let pagadas = 0;

    lista.querySelectorAll("li").forEach(li => {
      const monto = parseInt(li.dataset.monto);
      if (!li.classList.contains("pagada")) total += monto;
      else pagadas++;
    });

    totalEl.textContent = `TOTAL = $${total.toLocaleString()}`;
    totalEl.classList.toggle("completo", pagadas === lista.children.length);
  }
}
