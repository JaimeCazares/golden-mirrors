const retos = [
  { veces: 6,  monto: 500 },
  { veces: 12, monto: 200 },
  { veces: 22, monto: 100 },
  { veces: 26, monto: 50 },
  { veces: 28, monto: 20 },
  { veces: 26, monto: 10 },
  { veces: 36, monto: 5 },
  { veces: 42, monto: 2 },
  { veces: 50, monto: 1 }
];

const lista = document.getElementById("listaAhorro");
const totalSpan = document.getElementById("total");

let total = 0;

retos.forEach(reto => {
  for (let i = 0; i < reto.veces; i++) {
    const div = document.createElement("div");
    div.className = "item";

    const label = document.createElement("label");
    label.textContent = `$${reto.monto}`;

    const check = document.createElement("input");
    check.type = "checkbox";

    check.addEventListener("change", () => {
      total += check.checked ? reto.monto : -reto.monto;
      totalSpan.textContent = `$${total.toLocaleString()}`;
    });

    div.appendChild(label);
    div.appendChild(check);
    lista.appendChild(div);
  }
});
