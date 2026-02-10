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
    const selLiga = document.getElementById('sel_liga');
    const selLocal = document.getElementById('sel_local');
    const selVisita = document.getElementById('sel_visitante');
    
    const imgLiga = document.getElementById('img_liga');
    const imgLocal = document.getElementById('img_local');
    const imgVisit = document.getElementById('img_visit');

    // Resetear selects y logos
    selLocal.innerHTML = '<option value="">Local</option>';
    selVisita.innerHTML = '<option value="">Visita</option>';
    imgLocal.style.opacity = '0';
    imgVisit.style.opacity = '0';
    imgLiga.style.opacity = '0';
    imgLiga.src = '';

    const ligaSeleccionada = selLiga.value;

    if (ligaSeleccionada && window.datosDeportivos[ligaSeleccionada]) {
        const datosLiga = window.datosDeportivos[ligaSeleccionada];

        // 1. Poner logo de la liga
        if (datosLiga.logo) {
            imgLiga.src = datosLiga.logo;
            imgLiga.style.opacity = '1';
        }

        // 2. Llenar equipos (ordenados alfabéticamente)
        const equiposOrdenados = [...datosLiga.equipos].sort((a, b) => a.nombre.localeCompare(b.nombre));

        equiposOrdenados.forEach(equipo => {
            // Crear opción para select LOCAL
            const optLocal = document.createElement('option');
            optLocal.value = equipo.nombre; // Usamos el nombre como valor
            optLocal.textContent = equipo.nombre;
            optLocal.setAttribute('data-logo', equipo.logo || ''); // Guardamos el logo en un atributo data
            selLocal.appendChild(optLocal);

            // Clonar opción para select VISITA
            const optVisita = optLocal.cloneNode(true);
            selVisita.appendChild(optVisita);
        });
    }
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