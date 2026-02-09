// espejo/dashboard.js
window.actualizarDashboard = function() {
    let total = 0, profit = 0;

    historialApuestas.forEach(a => {
        if (a.estado !== 'void') total += a.stake;
        profit += a.ganancia;
    });

    total_invested.textContent = `$${total.toFixed(2)}`;
    net_profit.textContent = `$${profit.toFixed(2)}`;
    net_profit.style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
    user_balance.textContent = `$${profit.toFixed(2)}`;
};
