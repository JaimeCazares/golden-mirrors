const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");
const cuponOverlay = document.getElementById("cuponOverlay");
const cerrarCupon = document.getElementById("cerrarCupon");
const folioSpan = document.getElementById("folioCupon");

let total = 0;

/* =========================
   FORZAR CUPÓN OCULTO
   ========================= */
if (cuponOverlay) {
  cuponOverlay.style.display = "none";
}

/* =========================
   CERRAR CUPÓN
   ========================= */
if (cerrarCupon) {
  cerrarCupon.onclick = () => {
    cuponOverlay.style.display = "none";
  };
}

/* =========================
   CARGAR AHORROS
   ========================= */
fetch("obtener_ahorro.php")
  .then(res => res.json())
  .then(retos => {

    retos.forEach(reto => {

      let marcadasActuales = reto.marcadas;
      let restantes = reto.total_veces - marcadasActuales;
      total += marcadasActuales * reto.monto;

      const grupo = document.createElement("div");
      grupo.className = "grupo";

      if (restantes === 0) {
        grupo.classList.add("completado");
      }

      const header = document.createElement("div");
      header.className = "grupo-header";
      header.innerHTML = `
        <span>$${reto.monto}</span>
        <span id="rest-${reto.monto}">
          ${restantes === 0
            ? "COMPLETADO 💚"
            : `Restantes: ${restantes} de ${reto.total_veces} ▼`}
        </span>
      `;

      const checks = document.createElement("div");
      checks.className = "checks";
      checks.dataset.monto = reto.monto;

      header.onclick = () => {
        checks.style.display =
          checks.style.display === "flex" ? "none" : "flex";
      };

      for (let i = 0; i < reto.total_veces; i++) {
        const check = document.createElement("input");
        check.type = "checkbox";

        if (i < marcadasActuales) check.checked = true;

        check.onchange = () => {

          const marcadasAntes = marcadasActuales;
          marcadasActuales =
            [...checks.children].filter(c => c.checked).length;

          restantes = reto.total_veces - marcadasActuales;

          /* ===== recalcular total ===== */
          total = 0;
          document.querySelectorAll(".checks").forEach(grp => {
            const monto = grp.dataset.monto;
            const count =
              [...grp.children].filter(c => c.checked).length;
            total += monto * count;
          });

          totalSpan.textContent = `$${total.toLocaleString()}`;

          const restSpan =
            document.getElementById(`rest-${reto.monto}`);

          /* ===== TRANSICIÓN A COMPLETADO ===== */
          if (
            marcadasAntes < reto.total_veces &&
            marcadasActuales === reto.total_veces
          ) {

            grupo.classList.add("completado");
            grupo.style.backgroundColor = "#e6f8ec";
            grupo.style.border = "2px solid #6fcf97";
            grupo.style.boxShadow =
              "0 6px 14px rgba(47, 143, 91, 0.25)";

            restSpan.textContent = "COMPLETADO 💚";

            /* ===== GUARDAR CUPÓN EN BD ===== */
            fetch("guardar_cupon.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: `monto=${reto.monto}`
            })
              .then(res => res.json())
              .then(data => {
  if (data.ok && folioSpan) {
    folioSpan.textContent = `– Folio: ${data.folio}`;
    cuponOverlay.style.display = "flex";
  }
});


          } else if (marcadasActuales < reto.total_veces) {

            grupo.classList.remove("completado");
            grupo.style.backgroundColor = "";
            grupo.style.border = "";
            grupo.style.boxShadow = "";

            restSpan.textContent =
              `Restantes: ${restantes} de ${reto.total_veces} ▼`;
          }

          guardar(reto.monto, marcadasActuales);
        };

        checks.appendChild(check);
      }

      grupo.appendChild(header);
      grupo.appendChild(checks);
      lista.appendChild(grupo);
    });

    totalSpan.textContent = `$${total.toLocaleString()}`;
  });

/* =========================
   GUARDAR AHORRO EN BD
   ========================= */
function guardar(monto, marcadas) {
  const datos = new FormData();
  datos.append("monto", monto);
  datos.append("marcadas", marcadas);

  fetch("guardar_ahorro.php", {
    method: "POST",
    body: datos
  });
}
