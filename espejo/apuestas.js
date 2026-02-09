// espejo/apuestas.js
window.historialApuestas = window.historialApuestas || [];

window.registrarApuesta = function() {
    const stake = +bet_stake.value;
    if (!sel_local.value || !sel_visitante.value || stake <= 0) {
        return alert("Faltan datos.");
    }

    const odds = +bet_odds.value || 0;
    let decimal = 1;
    if (odds > 0) decimal = odds / 100 + 1;
    else if (odds < 0) decimal = 100 / Math.abs(odds) + 1;

    let ganancia = 0;
    if (bet_status.value === 'won') ganancia = stake * decimal - stake;
    else if (bet_status.value === 'lost') ganancia = -stake;

    historialApuestas.unshift({
        id: Date.now(),
        liga: sel_liga.value,
        evento: `${sel_local.value} vs ${sel_visitante.value}`,
        mercado: bet_market.value,
        stake,
        odds,
        ganancia,
        estado: bet_status.value
    });

    betForm.reset();
    actualizarDashboard();
    cambiarVista('menu');
};
