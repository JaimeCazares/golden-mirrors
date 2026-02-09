// espejo/ui.js
window.cambiarVista = function(vista) {
    const menu = document.getElementById('view_menu');
    const form = document.getElementById('view_form');
    const history = document.getElementById('view_history');

    menu?.classList.add('hidden');
    form?.classList.add('hidden');
    history?.classList.add('hidden');

    if (vista === 'menu') menu?.classList.remove('hidden');
    if (vista === 'form') {
        form?.classList.remove('hidden');
        cargarLigas();
    }
    if (vista === 'history') {
        history?.classList.remove('hidden');
        renderizarHistorial();
    }
};

window.cargarLigas = function() {
    const selLiga = document.getElementById('sel_liga');
    if (selLiga.options.length > 1) return;

    for (let liga in datosDeportivos) {
        const opt = document.createElement('option');
        opt.value = liga;
        opt.innerText = liga;
        selLiga.appendChild(opt);
    }
};

window.actualizarEquipos = function() {
    const liga = sel_liga.value;
    sel_local.innerHTML = '<option value="">Local</option>';
    sel_visitante.innerHTML = '<option value="">Visita</option>';

    img_local.style.opacity = '0';
    img_visit.style.opacity = '0';

    if (!datosDeportivos[liga]) return;

    img_liga.src = datosDeportivos[liga].logo || '';
    img_liga.style.opacity = datosDeportivos[liga].logo ? '1' : '0';

    [...datosDeportivos[liga].equipos]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .forEach(eq => {
            const opt = document.createElement('option');
            opt.value = eq.nombre;
            opt.textContent = eq.nombre;
            opt.dataset.logo = eq.logo;
            sel_local.appendChild(opt.cloneNode(true));
            sel_visitante.appendChild(opt);
        });
};

window.actualizarLogoEquipo = function(tipo) {
    const sel = tipo === 'local' ? sel_local : sel_visitante;
    const img = tipo === 'local' ? img_local : img_visit;

    const logo = sel.options[sel.selectedIndex]?.dataset.logo;
    if (logo) {
        img.src = logo;
        img.style.opacity = '1';
    } else img.style.opacity = '0';
};
