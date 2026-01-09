alert("ahorro.js cargado");

const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");

let total = 0;

/* CARGAR DATOS */
fetch("obtener_ahorro.php")
  .then(res => res.json())
  .then(retos => {

    retos.forEach(reto => {
      let restantes = reto.total_veces - reto.marcadas;
      total += reto.marcadas * reto.monto;

      const grupo = document.createElement("div");
      grupo.className = "grupo";

      const header = document.createElement("div");
      header.className = "grupo-header";
      header.innerHTML = `
        <span>$${reto.monto}</span>
        <span id="rest-${reto.monto}">
          Restantes: ${restantes} ▼
        </span>
      `;

      const checks = document.createElement("div");
      checks.className = "checks";

      header.onclick = () => {
        checks.style.display = checks.style.display === "flex" ? "none" : "flex";
      };

      for (let i = 0; i < reto.total_veces; i++) {
        const check = document.createElement("input");
        check.type = "checkbox";

        if (i < reto.marcadas) check.checked = true;

        check.onchange = () => {
          let marcadas = [...checks.children].filter(c => c.checked).length;
          restantes = reto.total_veces - marcadas;

          total = 0;
          document.querySelectorAll(".checks").forEach(grp => {
            const monto = grp.dataset.monto;
            const count = [...grp.children].filter(c => c.checked).length;
            total += monto * count;
          });

          totalSpan.textContent = `$${total.toLocaleString()}`;
          document.getElementById(`rest-${reto.monto}`).textContent =
            `Restantes: ${restantes} ▼`;

          guardar(reto.monto, marcadas);
        };

        checks.appendChild(check);
      }

      checks.dataset.monto = reto.monto;

      grupo.appendChild(header);
      grupo.appendChild(checks);
      lista.appendChild(grupo);
    });

    totalSpan.textContent = `$${total.toLocaleString()}`;
  });

/* GUARDAR EN BD */
function guardar(monto, marcadas) {
  const datos = new FormData();
  datos.append("monto", monto);
  datos.append("marcadas", marcadas);

  fetch("guardar_ahorro.php", {
    method: "POST",
    body: datos
  });
}
