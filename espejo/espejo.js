// espejo/espejo.js

window.initEspejo = function() {
    console.log("🚀 Iniciando Módulo Espejo...");
    
    // 1. Ir al menú inicial
    if (typeof window.cambiarVista === 'function') {
        window.cambiarVista('menu');
    }

    // 2. Cargar datos (Ligas)
    if (typeof window.cargarLigas === 'function') {
        window.cargarLigas();
    }

    // 3. Actualizar Dashboard
    if (typeof window.actualizarDashboard === 'function') {
        window.actualizarDashboard();
    }

    // 4. Iniciar los escuchadores de eventos (Solo una vez)
    if (!window.espejoListenersActive) {
        setupGlobalListeners();
        window.espejoListenersActive = true;
    }
};

/**
 * Configuración GLOBAL de eventos.
 */
function setupGlobalListeners() {
    
    document.addEventListener('click', function(e) {
        
        // --- A. DETECTAR CLIC EN EL BOTÓN "SELECCIONA LIGA" (TRIGGER) ---
        const trigger = e.target.closest('.custom-select-trigger');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            const wrapper = trigger.closest('.custom-select-wrapper');
            
            // Cerrar otros selectores si hubieran
            document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
                if (el !== wrapper) el.classList.remove('open');
            });

            // Abrir/Cerrar este
            wrapper.classList.toggle('open');
            return;
        }

        // --- B. DETECTAR CLIC EN UNA OPCIÓN DE LA LISTA ---
        const option = e.target.closest('.custom-option');
        if (option) {
            e.preventDefault();
            e.stopPropagation();
            
            const wrapper = option.closest('.custom-select-wrapper');
            const nativeSelect = wrapper.querySelector('.hidden-native-select');
            const triggerContent = wrapper.querySelector('.selected-content');
            
            // 1. Obtener datos de la opción clickeada
            const value = option.getAttribute('data-value');
            const imgEl = option.querySelector('.banner-img');
            const textEl = option.querySelector('.banner-text');

            // 2. ACTUALIZAR VISUALMENTE EL TRIGGER
            if (imgEl && textEl) {
                triggerContent.innerHTML = imgEl.outerHTML + textEl.outerHTML;
            } else {
                triggerContent.innerText = option.innerText;
            }

            // 3. ¡CERRAR EL MENÚ AQUÍ MISMO! (ESTA ES LA SOLUCIÓN)
            // Lo cerramos antes de procesar datos para que la respuesta visual sea instantánea
            wrapper.classList.remove('open');

            // 4. ACTUALIZAR LÓGICA DE DATOS
            if (nativeSelect) {
                nativeSelect.value = value;
                
                // Disparar evento change para que tu sistema cargue los equipos
                const event = new Event('change', { bubbles: true });
                nativeSelect.dispatchEvent(event);
            }
            
            // 5. EJECUTAR LÓGICA EXTERNA (Con protección por si falla)
            try {
                if (typeof window.actualizarEquipos === 'function') {
                    window.actualizarEquipos();
                }
            } catch (err) {
                console.error("Error en actualizarEquipos:", err);
            }

            return;
        }

        // --- C. CLIC FUERA (CERRAR TODO) ---
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
                el.classList.remove('open');
            });
        }
    });

    // Listener ESC para cerrar modales
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            const modalForm = document.getElementById('view_form');
            const modalHist = document.getElementById('view_history');
            
            const openDropdown = document.querySelector('.custom-select-wrapper.open');
            if (openDropdown) {
                openDropdown.classList.remove('open');
                return;
            }

            if (modalForm && !modalForm.classList.contains('hidden')) {
                if(window.cambiarVista) window.cambiarVista('menu');
            }
            if (modalHist && !modalHist.classList.contains('hidden')) {
                if(window.cambiarVista) window.cambiarVista('menu');
            }
        }
    });
}