const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");

let total = 0;

fetch("obtener_ahorro.php")
  .then(res => res.json())
  .then(retos => {

    retos.forEach(reto => {
      let restantes = reto.total_veces - reto.marcadas;
      total += reto.marcadas * reto.monto;

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
        checks.style.display = checks.style.display === "flex" ? "none" : "flex";
      };

      for (let i = 0; i < reto.total_veces; i++) {
        const check = document.createElement("input");
        check.type = "checkbox";

        if (i < reto.marcadas) check.checked = true;

        check.onchange = () => {
          const marcadas = [...checks.children].filter(c => c.checked).length;
          restantes = reto.total_veces - marcadas;

          total = 0;
          document.querySelectorAll(".checks").forEach(grp => {
            const monto = grp.dataset.monto;
            const count = [...grp.children].filter(c => c.checked).length;
            total += monto * count;
          });

          totalSpan.textContent = `$${total.toLocaleString()}`;

          const restSpan = document.getElementById(`rest-${reto.monto}`);

          if (restantes === 0) {
            grupo.classList.add("completado");
            restSpan.textContent = "COMPLETADO 💚";
          } else {
            grupo.classList.remove("completado");
            restSpan.textContent =
              `Restantes: ${restantes} de ${reto.total_veces} ▼`;
          }

          guardar(reto.monto, marcadas);
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
