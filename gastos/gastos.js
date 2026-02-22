let saldoEfectivo = 0;
let saldoDebito = 0;
let modoActual = 'gasto';

// NUEVA FUNCIÓN: Darle formato bonito a la fecha
function formatearFecha(fechaSql) {
    if (!fechaSql) return '';
    // Reemplaza espacio por 'T' para que funcione bien en todos los navegadores
    let d = new Date(fechaSql.replace(' ', 'T')); 
    if (isNaN(d)) return fechaSql; 
    
    return d.toLocaleDateString('es-MX', { 
        day: '2-digit', month: 'short', 
        hour: '2-digit', minute: '2-digit', hour12: true 
    });
}

function initGastos() {
    fetch('gastos/api_gastos.php?accion=obtener')
        .then(response => {
            if (!response.ok) throw new Error("Error en la red o archivo PHP");
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert("Error de BD: " + data.error);
                return;
            }

            if (data.saldos) {
                saldoEfectivo = parseFloat(data.saldos.efectivo) || 0;
                saldoDebito = parseFloat(data.saldos.debito) || 0;
            }

            actualizarVisuales();

            const lista = document.getElementById('lista-gastos');
            lista.innerHTML = ''; 
            if (data.historial && data.historial.length > 0) {
                data.historial.forEach(item => {
                    // Ahora también mandamos item.fecha
                    agregarItemVisual(item.id, item.descripcion, item.monto, item.metodo, item.tipo || 'gasto', item.fecha);
                });
            }
        })
        .catch(error => console.error("Error cargando gastos:", error));
}

function toggleModo() {
    const btnModo = document.getElementById('btn-modo');
    const descInput = document.getElementById('gasto-desc');
    const btnAñadir = document.querySelector('.btn-add-gasto');

    if (modoActual === 'gasto') {
        modoActual = 'ingreso';
        btnModo.innerHTML = 'Modo: INGRESO 📈';
        btnModo.className = 'btn-modo modo-ingreso';
        descInput.placeholder = "Descripción del ingreso:";
        btnAñadir.style.background = '#00ff88';
        btnAñadir.innerText = "SUMAR";
    } else {
        modoActual = 'gasto';
        btnModo.innerHTML = 'Modo: GASTO 📉';
        btnModo.className = 'btn-modo modo-gasto';
        descInput.placeholder = "¿En qué gastaste?";
        btnAñadir.style.background = '#ffcc00';
        btnAñadir.innerText = "AÑADIR";
    }
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
        body: JSON.stringify({ descripcion: desc, monto: monto, metodo: metodo, tipo: modoActual })
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === 'ok') {
            if (modoActual === 'ingreso') {
                if (metodo === 'efectivo') saldoEfectivo += monto;
                else saldoDebito += monto;
            } else {
                if (metodo === 'efectivo') saldoEfectivo -= monto;
                else saldoDebito -= monto;
            }
            
            actualizarVisuales();
            // Pasamos la fecha recién creada que nos manda el PHP
            agregarItemVisual(response.id, desc, monto, metodo, modoActual, response.fecha, true);
            
            descInput.value = "";
            montoInput.value = "";
        } else {
            alert("No se pudo guardar: " + (response.error || "Error desconocido"));
        }
    });
}

function actualizarVisuales() {
    document.getElementById('saldo-efectivo').innerText = `$${saldoEfectivo.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    document.getElementById('saldo-debito').innerText = `$${saldoDebito.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
}

// Actualizamos los parámetros para recibir 'fecha'
function agregarItemVisual(id, desc, monto, metodo, tipo = 'gasto', fecha = '', esNuevo = false) {
    const lista = document.getElementById('lista-gastos');
    const nuevoItem = document.createElement('div');
    nuevoItem.className = 'gasto-item';
    nuevoItem.dataset.id = id;
    
    const colorTexto = tipo === 'ingreso' ? '#00ff88' : '#ff4444';
    const signo = tipo === 'ingreso' ? '+' : '-';
    const fechaMostrar = formatearFecha(fecha);
    
    // Agregamos el div para la fecha debajo de la descripción
    nuevoItem.innerHTML = `
        <div class="gasto-info" style="display: flex; flex-direction: column;">
            <div>
                <span>${desc}</span>
                <small style="color: #64748b; margin-left:5px;">(${metodo})</small>
            </div>
            <small style="color: #475569; font-size: 11px; margin-top: 3px;">📅 ${fechaMostrar}</small>
        </div>
        <div class="gasto-acciones">
            <strong style="color: ${colorTexto};">${signo}$${parseFloat(monto).toFixed(2)}</strong> 
            <button class="btn-tres-puntos" onclick="abrirMenuFlotante(${id}, ${monto}, '${metodo}', '${tipo}', this, event)">⋮</button>
        </div>
    `;
    
    if (esNuevo) lista.prepend(nuevoItem); 
    else lista.appendChild(nuevoItem);     
}

function eliminarGasto(id, monto, metodo, tipo) {
    fetch('gastos/api_gastos.php?accion=eliminar', {
        method: 'POST',
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            if (tipo === 'ingreso') {
                if (metodo === 'efectivo') saldoEfectivo -= monto;
                else saldoDebito -= monto;
            } else {
                if (metodo === 'efectivo') saldoEfectivo += monto;
                else saldoDebito += monto;
            }
            
            actualizarVisuales();
            const item = document.querySelector(`.gasto-item[data-id="${id}"]`);
            if (item) item.remove();
        }
    });
}

function abrirMenuFlotante(id, monto, metodo, tipo, botonElement, event) {
    event.stopPropagation();
    
    const menuViejo = document.getElementById('menu-flotante-unico');
    if (menuViejo) menuViejo.remove();

    const coordenadas = botonElement.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'menu-flotante-unico';
    menu.className = 'menu-desplegable-flotante';
    
    menu.style.position = 'fixed';
    menu.style.top = (coordenadas.top - 40) + 'px'; 
    
    // AQUÍ ESTÁ EL CAMBIO: Restamos 75px para aventarlo a la izquierda del botón
    menu.style.left = (coordenadas.left - 75) + 'px'; 
    
    menu.style.zIndex = '99999';

    menu.innerHTML = `
        <button class="btn-eliminar-menu" onclick="eliminarGasto(${id}, ${monto}, '${metodo}', '${tipo}')">
            Eliminar
        </button>
    `;

    document.body.appendChild(menu);
}

document.addEventListener('click', function() {
    const menu = document.getElementById('menu-flotante-unico');
    if (menu) menu.remove();
});