let historialApuestas = [];

// AL CARGAR: INICIA EN MENU
document.addEventListener('DOMContentLoaded', () => {
    actualizarDashboard();
    cambiarVista('menu'); 
});

// --- NAVEGACIÓN ---
function cambiarVista(vista) {
    const menu = document.getElementById('view_menu');
    const form = document.getElementById('view_form');
    const history = document.getElementById('view_history');

    menu.classList.add('hidden');
    form.classList.add('hidden');
    history.classList.add('hidden');

    if (vista === 'menu') {
        menu.classList.remove('hidden');
    } else if (vista === 'form') {
        form.classList.remove('hidden');
    } else if (vista === 'history') {
        history.classList.remove('hidden');
        renderizarHistorial();
    }
}

// --- LÓGICA DE APUESTAS ---
function registrarApuesta() {
    const evento = document.getElementById('bet_event').value;
    const mercado = document.getElementById('bet_market').value;
    const stake = parseFloat(document.getElementById('bet_stake').value) || 0;
    const odds = parseFloat(document.getElementById('bet_odds').value) || 0;
    const estado = document.getElementById('bet_status').value;

    if (!evento || stake <= 0) return alert("Datos incompletos.");

    let decimal = 1;
    if (odds > 0) decimal = (odds / 100) + 1;
    else if (odds < 0) decimal = (100 / Math.abs(odds)) + 1;

    let ganancia = 0;
    if (estado === 'won') ganancia = (stake * decimal) - stake;
    else if (estado === 'lost') ganancia = -stake;

    const nuevaApuesta = {
        id: Date.now(),
        evento, mercado, stake, odds, ganancia, estado
    };

    historialApuestas.unshift(nuevaApuesta);
    document.getElementById('betForm').reset();
    actualizarDashboard();
    
    // Feedback rápido
    cambiarVista('menu');
}

function renderizarHistorial() {
    const lista = document.getElementById('history_list');
    const emptyMsg = document.getElementById('empty_msg');
    lista.innerHTML = '';

    if (historialApuestas.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    historialApuestas.forEach(a => {
        let tagClass = a.estado; 
        let tagText = a.estado === 'won' ? 'Win' : a.estado === 'lost' ? 'Loss' : a.estado === 'pending' ? 'Pend' : 'Void';
        let colorGanancia = a.ganancia > 0 ? '#22c55e' : a.ganancia < 0 ? '#ef4444' : '#94a3b8';
        let signo = a.ganancia > 0 ? '+' : '';

        lista.innerHTML += `
            <tr>
                <td><strong>${a.evento}</strong><br><small style="color:#64748b">${a.mercado}</small></td>
                <td><span class="tag ${tagClass}">${tagText}</span></td>
                <td>$${a.stake}</td>
                <td style="color:${colorGanancia}; font-weight:bold;">${signo}$${a.ganancia.toFixed(2)}</td>
                <td><button onclick="eliminarApuesta(${a.id})" style="border:none;background:none;cursor:pointer;opacity:0.6;">🗑️</button></td>
            </tr>
        `;
    });
}

function actualizarDashboard() {
    let total = 0, profit = 0;
    historialApuestas.forEach(a => {
        if (a.estado !== 'void') total += a.stake;
        profit += a.ganancia;
    });

    // Bank base ficticio
    const bankInicial = 0; 

    document.getElementById('total_invested').innerText = `$${total.toFixed(2)}`;
    document.getElementById('net_profit').innerText = `$${profit.toFixed(2)}`;
    document.getElementById('net_profit').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
    document.getElementById('user_balance').innerText = `$${(bankInicial + profit).toFixed(2)}`;
}

function eliminarApuesta(id) {
    if(confirm("¿Eliminar?")) {
        historialApuestas = historialApuestas.filter(a => a.id !== id);
        renderizarHistorial();
        actualizarDashboard();
    }
}

function limpiarHistorial() {
    if(confirm("¿Borrar Todo?")) {
        historialApuestas = [];
        renderizarHistorial();
        actualizarDashboard();
    }
}