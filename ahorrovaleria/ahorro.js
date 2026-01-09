const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");
const cuponOverlay = document.getElementById("cuponOverlay");
const cerrarCupon = document.getElementById("cerrarCupon");
const folioSpan = document.getElementById("folioCupon");

let total = 0;

cuponOverlay.style.display = "none";

cerrarCupon.onclick = () => {
  cuponOverlay.style.display = "none";
};

fetch("obtener_ahorro.php")
  .then(res => res.json())
  .then(retos => {

    retos.forEach(reto => {

      let marcadasActuales = Number(reto.marcadas);
      let totalVeces = Number(reto.total_veces);
      let restantes = totalVeces - marcadasActuales;

      total += marcadasActuales * Number(reto.monto);

      const grupo = document.createElement("div");
      grupo.className = "grupo";

      /* 🔥 BLINDAJE REAL */
      const estaCompletado = marcadasActuales >= totalVeces && totalVeces > 0;

      if (estaCompletado) {
        grupo.classList.add("completado");
      }

      const header = document.createElement("div");
      header.className = "grupo-header";
      header.innerHTML = `
        <span>$${reto.monto}</span>
        <span id="rest-${reto.monto}">
          ${estaCompletado
            ? "COMPLETADO 💚"
            : `Restantes: ${restantes} de ${totalVeces} ▼`}
        </span>
      `;

      const checks = document.createElement("div");
      checks.className = "checks";
      checks.dataset.monto = reto.monto;

      header.onclick = () => {
        checks.style.display =
          checks.style.display === "flex" ? "none" : "flex";
      };

      for (let i = 0; i < totalVeces; i++) {
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = i < marcadasActuales;

        check.onchange = () => {

          marcadasActuales =
            [...checks.children].filter(c => c.checked).length;

          restantes = totalVeces - marcadasActuales;

          total = 0;
          document.querySelectorAll(".checks").forEach(grp => {
            const monto = Number(grp.dataset.monto);
            const count = [...grp.children].filter(c => c.checked).length;
            total += monto * count;
          });

          totalSpan.textContent = `$${total.toLocaleString()}`;

          const restSpan = document.getElementById(`rest-${reto.monto}`);

          if (marcadasActuales >= totalVeces) {
            grupo.classList.add("completado");
            restSpan.textContent = "COMPLETADO 💚";

            folioSpan.textContent = "";
            cuponOverlay.style.display = "flex";

            fetch("guardar_cupon.php", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `monto=${reto.monto}`
            })
              .then(r => r.json())
              .then(d => {
                if (d?.folio) {
                  folioSpan.textContent = `– Folio: ${d.folio}`;
                }
              });

          } else {
            grupo.classList.remove("completado");
            restSpan.textContent =
              `Restantes: ${restantes} de ${totalVeces} ▼`;
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

function guardar(monto, marcadas) {
  const datos = new FormData();
  datos.append("monto", monto);
  datos.append("marcadas", marcadas);

  fetch("guardar_ahorro.php", {
    method: "POST",
    body: datos
  });
}
