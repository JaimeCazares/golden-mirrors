// script.js (Global CORREGIDO)

const modulosCargados = {};
let seccionActual = 'inicio';

function toggleNavExtra() {
    document.getElementById('dock-nav')?.classList.toggle('abierto');
}

async function cambiarPestana(nombre) {
    console.log("Navegando a:", nombre);

    const vistaInicio = document.getElementById('vista-inicio');
    const vistaDinamica = document.getElementById('vista-dinamica');
    const contenedor = document.getElementById('contenido-modulo');

    document.getElementById('dock-nav')?.classList.remove('abierto');

    // =========================
    // 1️⃣ BOTONES DOCK
    // =========================
    document.querySelectorAll('.nav-btn')
        .forEach(btn => btn.classList.remove('activo'));

    const mapa = {
        nutricion: 0,
        inicio: 1,
        escalera: 2,
        espejo: 3,
        registro: 4
    };

    document.querySelectorAll('.nav-btn')[mapa[nombre]]
        ?.classList.add('activo');


    // =========================
    // 2️⃣ CONTROL DE VISTAS
    // =========================
    document.querySelectorAll('.vista-principal')
        .forEach(v => v.classList.remove('activa'));

    if (nombre === 'inicio') {
        vistaInicio?.classList.add('activa');
        seccionActual = 'inicio';
        return;
    }

    vistaDinamica?.classList.add('activa');


    // =========================
    // 3️⃣ EVITAR RECARGA INNECESARIA
    // =========================
    if (seccionActual === nombre &&
        contenedor.innerHTML.trim().length > 50) {

        if (nombre === 'espejo' &&
            typeof window.initEspejo === 'function') {
            window.initEspejo();
        }

        return;
    }


    // =========================
    // 4️⃣ CARGA HTML
    // =========================
    try {

        seccionActual = nombre;

        contenedor.innerHTML =
            '<div style="display:flex;height:300px;align-items:center;justify-content:center;color:#fff;">Cargando...</div>';

        const response = await fetch(`${nombre}/${nombre}.html?v=${Date.now()}`);
        if (!response.ok) throw new Error("Error cargando HTML");

        const html = await response.text();
        contenedor.innerHTML = html;


        // =========================
        // 5️⃣ INICIALIZAR MÓDULOS
        // =========================

        // === ESPEJO ===
        if (nombre === 'espejo') {

            if (!modulosCargados['espejo']) {

                const scripts = [
                    'espejo/datos.js',
                    'espejo/ui.js',
                    'espejo/apuestas.js',
                    'espejo/historial.js',
                    'espejo/dashboard.js',
                    'espejo/espejo.js'
                ];

                let cargados = 0;

                scripts.forEach(src => {
                    const s = document.createElement('script');
                    s.src = `${src}?v=${Date.now()}`;
                    s.onload = () => {
                        cargados++;
                        if (cargados === scripts.length) {
                            if (typeof window.initEspejo === 'function') {
                                window.initEspejo();
                            }
                        }
                    };
                    document.body.appendChild(s);
                });

                modulosCargados['espejo'] = true;

            } else {
                if (typeof window.initEspejo === 'function') {
                    window.initEspejo();
                }
            }
        }


        // === ESCALERA ===
        if (nombre === 'escalera') {

            if (!modulosCargados['escalera']) {

                const script = document.createElement('script');
                script.src = `escalera/escalera.js?v=${Date.now()}`;
                script.onload = () => {
                    if (typeof initEscalera === 'function') {
                        initEscalera();
                    }
                };

                document.body.appendChild(script);
                modulosCargados['escalera'] = true;

            } else {
                if (typeof initEscalera === 'function') {
                    initEscalera();
                }
            }
        }

        // === NUTRICION ===
        if (nombre === 'nutricion') {
            if (!modulosCargados['nutricion']) {
                const scripts = [
                    'nutricion/alimentos_data.js',
                    'nutricion/nutricion.js'
                ];

                let cargados = 0;

                scripts.forEach(src => {
                    const s = document.createElement('script');
                    s.src = `${src}?v=${Date.now()}`;
                    s.onload = () => {
                        cargados++;
                        if (cargados === scripts.length) {
                            if (typeof initNutricion === 'function') initNutricion();
                        }
                    };
                    document.body.appendChild(s);
                });

                modulosCargados['nutricion'] = true;
            } else {
                if (typeof initNutricion === 'function') initNutricion();
            }
        }

    } catch (e) {
        console.error(e);
        contenedor.innerHTML =
            `<p style="color:red;text-align:center;">Error: ${e.message}</p>`;
    }
}
