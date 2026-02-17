let saldoEfectivo = 0;
let saldoDebito = 0;

function initGastos() {
    console.log("Iniciando módulo de gastos...");
    
    // Llamada a la API
    fetch('gastos/api_gastos.php?accion=obtener')
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la red o archivo PHP no encontrado");
            }
            return response.json(); // Intentar convertir a JSON
        })
        .then(data => {
            console.log("Datos recibidos:", data); // Ver en consola F12

            if (data.error) {
                alert("Error de BD: " + data.error);
                return;
            }

            // Asignar valores con protección (si vienen vacíos, pone 0)
            if (data.saldos) {
                saldoEfectivo = parseFloat(data.saldos.efectivo) || 0;
                saldoDebito = parseFloat(data.saldos.debito) || 0;
            }

            actualizarVisuales();

            // Cargar historial
            const lista = document.getElementById('lista-gastos');
            lista.innerHTML = ''; 
            if (data.historial && data.historial.length > 0) {
                data.historial.forEach(item => {
                    agregarItemVisual(item.descripcion, item.monto, item.metodo);
                });
            }
        })
        .catch(error => {
            console.error("Error cargando gastos:", error);
            // Si hay error, no bloqueamos la app, solo avisamos en consola
        });
}

function procesarGasto() {
    const descInput = document.getElementById('gasto-desc');
    const montoInput = document.getElementById('gasto-monto');
    const metodoInput = document.getElementById('gasto-metodo');

    const desc = descInput.value;
    const monto = parseFloat(montoInput.value);
    const metodo = metodoInput.value;

    if (!desc || isNaN(monto)) return alert("Pon una descripción y cantidad");

    fetch('gastos/api_gastos.php?accion=registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: desc, monto: monto, metodo: metodo })
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === 'ok') {
            if (metodo === 'efectivo') saldoEfectivo -= monto;
            else saldoDebito -= monto;
            
            actualizarVisuales();
            agregarItemVisual(desc, monto, metodo, true);
            descInput.value = "";
            montoInput.value = "";
        } else {
            alert("No se pudo guardar: " + (response.error || "Error desconocido"));
        }
    });
}

function editarSaldo(tipo) {
    let nuevoMonto = prompt(`Ingresa el saldo REAL en ${tipo.toUpperCase()}:`);
    
    if (nuevoMonto !== null && !isNaN(nuevoMonto) && nuevoMonto.trim() !== "") {
        nuevoMonto = parseFloat(nuevoMonto);

        fetch('gastos/api_gastos.php?accion=editar_saldo', {
            method: 'POST',
            body: JSON.stringify({ tipo: tipo, monto: nuevoMonto })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'ok'){
                if (tipo === 'efectivo') saldoEfectivo = nuevoMonto;
                else saldoDebito = nuevoMonto;
                actualizarVisuales();
            }
        });
    }
}

function actualizarVisuales() {
    // Usamos toLocaleString para que ponga comas (ej. 1,000.00)
    document.getElementById('saldo-efectivo').innerText = `$${saldoEfectivo.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    document.getElementById('saldo-debito').innerText = `$${saldoDebito.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
}

function agregarItemVisual(desc, monto, metodo, esNuevo = false) {
    const lista = document.getElementById('lista-gastos');
    const nuevoItem = document.createElement('div');
    nuevoItem.className = 'gasto-item';
    
    nuevoItem.innerHTML = `
        <span>${desc}</span>
        <span>
            <strong style="color: #ff4444;">-$${parseFloat(monto).toFixed(2)}</strong> 
            <small style="color: #64748b; margin-left:5px;">(${metodo})</small>
        </span>
    `;
    
    if (esNuevo) lista.prepend(nuevoItem); 
    else lista.appendChild(nuevoItem);     
}