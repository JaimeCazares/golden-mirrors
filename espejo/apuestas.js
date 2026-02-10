// espejo/apuestas.js

// Inicializar array global si no existe
window.historialApuestas = window.historialApuestas || [];

window.registrarApuesta = function() {
    console.log("Registrando apuesta...");

    // Obtener elementos de forma segura
    const selLiga = document.getElementById('sel_liga');
    const selLocal = document.getElementById('sel_local');
    const selVisitante = document.getElementById('sel_visitante');
    const betStake = document.getElementById('bet_stake');
    const betOdds = document.getElementById('bet_odds');
    const betMarket = document.getElementById('bet_market');
    const betStatus = document.getElementById('bet_status');
    const form = document.getElementById('betForm');

    // Validaciones básicas
    if (!selLocal.value || !selVisitante.value || !betStake.value) {
        alert("Faltan datos obligatorios (Equipos o Monto).");
        return;
    }

    const stake = parseFloat(betStake.value);
    const odds = parseFloat(betOdds.value) || 0;
    
    // Cálculo de cuota decimal (aprox)
    let decimal = 1.0;
    if (odds > 0) {
        decimal = (odds / 100) + 1;
    } else if (odds < 0) {
        decimal = (100 / Math.abs(odds)) + 1;
    }

    // Cálculo de ganancia/pérdida
    let ganancia = 0;
    const estado = betStatus.value;
    
    if (estado === 'won') {
        ganancia = (stake * decimal) - stake;
    } else if (estado === 'lost') {
        ganancia = -stake;
    } else {
        ganancia = 0; // Void o Pending
    }

    // Crear objeto de apuesta
    const nuevaApuesta = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        liga: selLiga.value,
        match: `${selLocal.value} vs ${selVisitante.value}`,
        mercado: betMarket.value,
        stake: stake,
        odds: odds,
        ganancia: ganancia,
        estado: estado
    };

    // Guardar en array global
    window.historialApuestas.unshift(nuevaApuesta);

    console.log("Apuesta guardada:", nuevaApuesta);

    // Limpiar y salir
    form.reset();
    
    // Actualizar UI
    if (window.actualizarDashboard) window.actualizarDashboard();
    if (window.cambiarVista) window.cambiarVista('menu');
};