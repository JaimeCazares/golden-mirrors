const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");
const cuponOverlay = document.getElementById("cuponOverlay");
const cerrarCupon = document.getElementById("cerrarCupon");
const folioSpan = document.getElementById("folioCupon");

let total = 0;

/* =========================
   SEGURIDAD BÁSICA
   ========================= */
if (!lista || !totalSpan || !cuponOverlay || !folioSpan) {
  console.error("FALTAN ELEMENTOS DEL DOM");
}

/* =========================
   CUPÓN OCULTO AL INICIO
   ========================= */
cuponOverlay.style.display = "none";

/* =========================
   CERRAR CUPÓN
   ========================= */
cerrarCupon.onclick = () => {
  cuponOverlay.style.display = "none";
};

/* =========================
   CARGAR AHORROS
   ========================= */
fetch("obtener_ahorro.php")
  .then(res => res.json())
  .then(retos => {

    retos.forEach(reto => {

      let marcadasActuales = Number(reto.marcadas);
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
            const monto = Number(grp.dataset.monto);
            const count =
              [...grp.children].filter(c => c.checked).length;
            total += monto * count;
          });

          totalSpan.textContent = `$${total.toLocaleString()}`;

          const restSpan =
            document.getElementById(`rest-${reto.monto}`);

          /* ===== COMPLETADO ===== */
          if (
            marcadasAntes < reto.total_veces &&
            marcadasActuales === reto.total_veces
          ) {
            console.log("COMPLETADO → MOSTRAR CUPÓN");

            grupo.classList.add("completado");
            restSpan.textContent = "COMPLETADO 💚";

            /* ===== MOSTRAR CUPÓN (SIN DEPENDER DE PHP) ===== */
            folioSpan.textContent = "";
            cuponOverlay.style.display = "flex";

            /* ===== GUARDAR CUPÓN EN BD (NO BLOQUEA UI) ===== */
            fetch("guardar_cupon.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: `monto=${reto.monto}`
            })
              .then(r => r.json())
              .then(d => {
                if (d && d.folio) {
                  folioSpan.textContent = `– Folio: ${d.folio}`;
                }
              })
              .catch(err => {
                console.warn("Cupón no guardado, UI sigue:", err);
              });

          } else if (marcadasActuales < reto.total_veces) {
            grupo.classList.remove("completado");
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
  })
  .catch(err => {
    console.error("ERROR CARGANDO AHORROS:", err);
  });

/* =========================
   GUARDAR AHORRO
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
