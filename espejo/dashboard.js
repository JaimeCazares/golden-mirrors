// espejo/dashboard.js

window.actualizarDashboard = function() {
    console.log("Actualizando dashboard...");

    // Elementos del DOM
    const elTotal = document.getElementById('total_invested');
    const elProfit = document.getElementById('net_profit');
    const elBalance = document.getElementById('user_balance');

    if (!elTotal || !elProfit || !elBalance) return;

    let totalInvested = 0;
    let netProfit = 0;

    // Recorrer historial global
    const apuestas = window.historialApuestas || [];
    
    apuestas.forEach(bet => {
        // Sumar al invertido solo si no es anulada
        if (bet.estado !== 'void' && bet.estado !== 'pending') {
            totalInvested += bet.stake;
        }
        // Sumar ganancia/pérdida (ya viene con signo negativo si se perdió)
        if (bet.estado === 'won' || bet.estado === 'lost') {
            netProfit += bet.ganancia;
        }
    });

    // Formatear moneda
    const fmt = (num) => `$${num.toFixed(2)}`;

    elTotal.textContent = fmt(totalInvested);
    elProfit.textContent = fmt(netProfit);
    
    // Color según ganancia
    if (netProfit >= 0) {
        elProfit.style.color = 'var(--success)';
    } else {
        elProfit.style.color = 'var(--danger)';
    }

    // Balance (Bank) simulado (base + profit)
    // Aquí podrías sumar un bank inicial si quisieras
    elBalance.textContent = fmt(netProfit); 
};