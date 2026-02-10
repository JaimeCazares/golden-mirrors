// espejo/espejo.js

window.initEspejo = function() {
    console.log("🚀 Iniciando Módulo Espejo...");
    
    // 1. Ir al menú
    if (typeof window.cambiarVista === 'function') {
        window.cambiarVista('menu');
    }

    // 2. Cargar datos
    if (typeof window.cargarLigas === 'function') {
        window.cargarLigas();
    } else {
        console.warn("⚠️ Advertencia: cargarLigas no encontrado.");
    }

    // 3. Actualizar Dashboard inicial (por si hay datos guardados)
    if (typeof window.actualizarDashboard === 'function') {
        window.actualizarDashboard();
    }
};

// Listener ESC (sin cambios, solo asegúrate que esté ahí)
if (!window.escListenerAgregado) {
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            const modalForm = document.getElementById('view_form');
            const modalHist = document.getElementById('view_history');
            if (modalForm && !modalForm.classList.contains('hidden')) {
                if(window.cambiarVista) window.cambiarVista('menu');
            }
            if (modalHist && !modalHist.classList.contains('hidden')) {
                if(window.cambiarVista) window.cambiarVista('menu');
            }
        }
    });
    window.escListenerAgregado = true;
}