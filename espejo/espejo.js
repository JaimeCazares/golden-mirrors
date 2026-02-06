// Variable global para controlar lo invertido
let acumuladoInvertido = 0;

function initEspejo() {
    console.log("Módulo Espejo Inicializado");
    actualizarCalculos();
}

function americanToDecimal(odds) {
    if (odds > 0) return (odds / 100) + 1;
    return (100 / Math.abs(odds)) + 1;
}

// LÓGICA DE REGISTRO
function registrarApuesta(tipo) {
    let monto = 0;

    if (tipo === 'local') {
        monto = parseFloat(document.getElementById('base_stake').value) || 0;
    } else if (tipo === 'empate') {
        // Obtenemos el valor calculado del texto (quitando el signo $)
        let texto = document.getElementById('stake_x').innerText;
        monto = parseFloat(texto.replace('$', '')) || 0;
    } else if (tipo === 'visita') {
        let texto = document.getElementById('stake_2').innerText;
        monto = parseFloat(texto.replace('$', '')) || 0;
    }

    if (monto > 0) {
        // Sumar al acumulado
        acumuladoInvertido += monto;
        
        // Actualizar UI del Header
        document.getElementById('total_invested').innerText = `$${acumuladoInvertido.toFixed(2)}`;
        
        // Feedback visual (opcional: podrías mostrar una alerta pequeña)
        const statusMsg = document.getElementById('status_msg');
        statusMsg.innerText = "Apuesta Registrada";
        statusMsg.style.color = "var(--accent-gold)";
        
        setTimeout(() => {
            statusMsg.innerText = "Esperando...";
            statusMsg.style.color = "#94a3b8";
        }, 2000);
    }
}

function actualizarCalculos() {
    const baseStake = parseFloat(document.getElementById('base_stake').value) || 0;
    const baseOdds = parseFloat(document.getElementById('base_odds').value) || 0;
    const oddsX = parseFloat(document.getElementById('odds_x').value) || 0;
    const odds2 = parseFloat(document.getElementById('odds_2').value) || 0;

    const targetReturn = baseStake * americanToDecimal(baseOdds);
    document.getElementById('target_return').innerText = `$${targetReturn.toFixed(2)}`;

    const stakeX = oddsX !== 0 ? targetReturn / americanToDecimal(oddsX) : 0;
    const stake2 = odds2 !== 0 ? targetReturn / americanToDecimal(odds2) : 0;
    
    document.getElementById('stake_x').innerText = `$${stakeX.toFixed(2)}`;
    document.getElementById('stake_2').innerText = `$${stake2.toFixed(2)}`;

    // Calculamos ganancia libre basada en el acumulado REAL (lo que has registrado)
    // O si prefieres, basada en la simulación actual:
    
    // NOTA: Para este diseño, la "Ganancia Libre" en el header puede ser dinámica
    // basada en los momios actuales antes de registrar.
    
    let inversionSimulada = baseStake + stakeX + stake2;
    let gananciaSimulada = targetReturn - inversionSimulada;

    const netProfitEl = document.getElementById('net_profit');
    netProfitEl.innerText = `$${gananciaSimulada.toFixed(2)}`;
    
    if (gananciaSimulada > 0) {
        netProfitEl.style.color = "var(--success)";
    } else {
        netProfitEl.style.color = "var(--danger)";
    }
}