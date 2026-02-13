// script.js (Global)

const modulosCargados = {}; 
let seccionActual = 'inicio';

async function cambiarPestana(nombre) {
    console.log("Navegando a:", nombre);

    // --- 1. VISUAL BOTONES ---
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('activo'));
    const botones = document.querySelectorAll('.nav-btn');
    if (nombre === 'inicio') botones[0]?.classList.add('activo');
    if (nombre === 'escalera') botones[1]?.classList.add('activo');
    if (nombre === 'espejo') botones[2]?.classList.add('activo');
    if (nombre === 'registro') botones[3]?.classList.add('activo');

    // --- 2. VISUAL VISTAS ---
    const vistaInicio = document.getElementById('vista-inicio');
    const vistaDinamica = document.getElementById('vista-dinamica');
    const contenedor = document.getElementById('contenido-modulo'); 

    // MODO INICIO
    if (nombre === 'inicio') {
        if (vistaDinamica) vistaDinamica.style.display = 'none';
        if (vistaInicio) vistaInicio.style.display = 'block';
        seccionActual = 'inicio';
        return;
    }

    // MODO DINÁMICO
    if (vistaInicio) vistaInicio.style.display = 'none';
    if (vistaDinamica) vistaDinamica.style.display = 'block';

    // SI YA ESTAMOS AQUÍ Y YA CARGÓ, NO RECARGAR
    if (seccionActual === nombre && contenedor.innerHTML.trim().length > 50) {
        // Reiniciar lógica específica si es necesario
        if (nombre === 'espejo' && typeof window.initEspejo === 'function') {
            window.initEspejo();
        }
        return;
    }

    // --- 3. CARGA ---
    try {
        seccionActual = nombre;
        contenedor.innerHTML = '<div style="display:flex;height:300px;align-items:center;justify-content:center;color:#fff;">Cargando...</div>';

        // Fetch HTML
        const response = await fetch(`${nombre}/${nombre}.html?v=${Date.now()}`);
        if (!response.ok) throw new Error("Error cargando HTML");
        const html = await response.text();

        // Inyectar HTML
        contenedor.innerHTML = html;

        // --- 4. INICIAR LÓGICA ---
        
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
                script.onload = () => { if(typeof initEscalera === 'function') initEscalera(); };
                document.body.appendChild(script);
                modulosCargados['escalera'] = true;
            } else {
                if(typeof initEscalera === 'function') initEscalera();
            }
        }

    } catch (e) {
        console.error(e);
        contenedor.innerHTML = `<p style="color:red;text-align:center;">Error: ${e.message}</p>`;
    }
}