// espejo/ui.js

// Función para mostrar/ocultar vistas
window.cambiarVista = function(vistaName) {
    const dashboard = document.getElementById('view_dashboard');
    const menu = document.getElementById('view_menu');
    const form = document.getElementById('view_form');
    const hist = document.getElementById('view_history');

    // Ocultar todo
    dashboard?.classList.add('hidden');
    menu?.classList.add('hidden');
    form?.classList.add('hidden');
    hist?.classList.add('hidden');

    // Mostrar dashboard siempre
    dashboard?.classList.remove('hidden');

    if (vistaName === 'menu') {
        menu?.classList.remove('hidden');
    } 
    else if (vistaName === 'form') {
        form?.classList.remove('hidden');
    } 
    else if (vistaName === 'history') {
        hist?.classList.remove('hidden');
        window.renderizarHistorial?.();
    }
};


// Cargar las opciones en el select de ligas desde datos.js
window.cargarLigas = function() {
    const selLiga = document.getElementById('sel_liga');
    if (!selLiga) return;

    // Limpiar (manteniendo la opción por defecto)
    selLiga.innerHTML = '<option value="">Selecciona Liga...</option>';

    // Verificar que existen datos
    if (window.datosDeportivos) {
        for (const nombreLiga in window.datosDeportivos) {
            const option = document.createElement('option');
            option.value = nombreLiga;
            option.textContent = nombreLiga;
            selLiga.appendChild(option);
        }
    } else {
        console.error("Error: No se encontró window.datosDeportivos");
    }
};

// Actualizar los equipos cuando cambia la liga
window.actualizarEquipos = function() {
    console.log("--- 🕵️‍♂️ INICIANDO RASTREO DE EQUIPOS ---");
    
    const selLiga = document.getElementById('sel_liga');
    const selLocal = document.getElementById('sel_local');
    const selVisita = document.getElementById('sel_visitante');
    const imgLiga = document.getElementById('img_liga');
    const imgLocal = document.getElementById('img_local');
    const imgVisit = document.getElementById('img_visit');

    console.log("1. Lo que el código cree que seleccionaste:", selLiga.value);

    // Resetear selects y logos
    selLocal.innerHTML = '<option value="">Local</option>';
    selVisita.innerHTML = '<option value="">Visita</option>';
    if(imgLocal) imgLocal.style.opacity = '0';
    if(imgVisit) imgVisit.style.opacity = '0';
    if(imgLiga) { imgLiga.style.opacity = '0'; imgLiga.src = ''; }

    const ligaSeleccionada = selLiga.value;

    // VALIDACIÓN 1: ¿Está vacío?
    if (!ligaSeleccionada) {
        console.error("❌ ERROR: El valor de la liga está vacío. El 'data-value' de tu HTML NO coincide con el 'value' del select.");
        return; 
    }

    // VALIDACIÓN 2: ¿Existe en datos.js?
    if (!window.datosDeportivos[ligaSeleccionada]) {
        console.error(`❌ ERROR: El texto "${ligaSeleccionada}" no existe en tu archivo datos.js`);
        console.log("Las ligas que SÍ existen en datos.js son:", Object.keys(window.datosDeportivos));
        return;
    }

    console.log("✅ Liga encontrada correctamente. Cargando", window.datosDeportivos[ligaSeleccionada].equipos.length, "equipos...");

    const datosLiga = window.datosDeportivos[ligaSeleccionada];

    if (datosLiga.logo && imgLiga) {
        imgLiga.src = datosLiga.logo;
        imgLiga.style.opacity = '1';
    }

    const equiposOrdenados = [...datosLiga.equipos].sort((a, b) => a.nombre.localeCompare(b.nombre));

    equiposOrdenados.forEach(equipo => {
        const optLocal = document.createElement('option');
        optLocal.value = equipo.nombre;
        optLocal.textContent = equipo.nombre;
        optLocal.setAttribute('data-logo', equipo.logo || '');
        selLocal.appendChild(optLocal);

        const optVisita = optLocal.cloneNode(true);
        selVisita.appendChild(optVisita);
    });
    
    console.log("✅ Equipos cargados y listos en pantalla.");
};

// Actualizar el logo del equipo seleccionado
window.actualizarLogoEquipo = function(tipo) {
    let select, img;
    
    if (tipo === 'local') {
        select = document.getElementById('sel_local');
        img = document.getElementById('img_local');
    } else {
        select = document.getElementById('sel_visitante');
        img = document.getElementById('img_visit');
    }

    if (!select || !img) return;

    // Obtener la opción seleccionada
    const opcion = select.options[select.selectedIndex];
    
    // Leer el atributo data-logo
    const urlLogo = opcion ? opcion.getAttribute('data-logo') : '';

    if (urlLogo) {
        img.src = urlLogo;
        img.style.opacity = '1';
    } else {
        img.style.opacity = '0';
        img.src = '';
    }
};