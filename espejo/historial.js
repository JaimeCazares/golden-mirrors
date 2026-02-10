// espejo/historial.js
window.renderizarHistorial = function() {
    const lista = document.getElementById('history_list');
    const emptyMsg = document.getElementById('empty_msg');
    if (!lista) return;

    lista.innerHTML = '';

    if (historialApuestas.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    historialApuestas.forEach(a => {
        const color = a.ganancia > 0 ? '#22c55e' : a.ganancia < 0 ? '#ef4444' : '#94a3b8';
        const signo = a.ganancia > 0 ? '+' : '';

        const logoLiga = datosDeportivos[a.liga]?.logo || '';

        lista.innerHTML += `
        <tr>
          <td>
            ${logoLiga ? `<img src="${logoLiga}" style="width:12px">` : ''}
            <strong>${a.match}</strong><br>
            <small>${a.mercado}</small>
          </td>
          <td>$${a.stake}</td>
          <td style="color:${color};font-weight:bold;">${signo}$${a.ganancia.toFixed(2)}</td>
          <td>
            <button onclick="eliminarApuesta(${a.id})">🗑️</button>
          </td>
        </tr>`;
    });
};

window.eliminarApuesta = function(id) {
    if (!confirm("¿Eliminar apuesta?")) return;
    historialApuestas = historialApuestas.filter(a => a.id !== id);
    renderizarHistorial();
    actualizarDashboard();
};

window.limpiarHistorial = function() {
    if (!confirm("¿Borrar TODO?")) return;
    historialApuestas = [];
    renderizarHistorial();
    actualizarDashboard();
};
