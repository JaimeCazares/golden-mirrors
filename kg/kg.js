function initKg() {
    const listaPesos = document.querySelectorAll("#listaPesos li");
    const pesoSeleccionado = document.getElementById("pesoSeleccionado");
    const editarBtnKg = document.getElementById("editarBtnKg");
    const btnHistorial = document.getElementById("verHistorialKg");
    const modalKg = document.getElementById("modalKg");
    const cerrarKgModal = document.getElementById("cerrarKgModal");
    const historialKgLista = document.getElementById("historialKgLista");
    const modalVerFotos = document.getElementById("modalVerFotos");
    const cerrarVerFotos = document.getElementById("cerrarVerFotos");
    const modalAnguloFotos = document.getElementById("modalAnguloFotos");
    const cerrarAnguloFotos = document.getElementById("cerrarAnguloFotos");
    const formHistorial = document.getElementById("formHistorialKg");
    const btnGuardarRegistro = document.getElementById("guardarPesoHistorial");
    const tituloRegistroForm = document.getElementById("tituloRegistroForm");
    const avisoEdicionSemana = document.getElementById("avisoEdicionSemana");
    const cancelarEdicionSemana = document.getElementById("cancelarEdicionSemana");

    let pesoActual = 0;
    let modoEdicion = false;
    let registrosCache = [];

    // --- MANEJO DE ARCHIVOS ORIGINAL ---
    ['Frente', 'Lado', 'Atras'].forEach(id => {
        const input = document.getElementById('foto' + id);
        if(input) {
            input.onchange = function() {
                const label = document.getElementById('fileName' + id);
                if(label) label.textContent = this.files[0] ? this.files[0].name : "Sin archivo";
            };
        }
    });

    // --- CERRAR MODALES ---
    if(cerrarKgModal) cerrarKgModal.onclick = () => modalKg.style.display = "none";
    if(cerrarVerFotos) cerrarVerFotos.onclick = () => modalVerFotos.style.display = "none";
    // Al cerrar el visor de ángulo, se vuelve a mostrar el historial (en vez de depender
    // de que el z-index gane la pelea contra el modal de historial que queda debajo).
    if(cerrarAnguloFotos) cerrarAnguloFotos.onclick = () => {
        modalAnguloFotos.style.display = "none";
        modalKg.style.display = "flex";
    };

    window.onclick = (e) => {
        if (e.target == modalKg) modalKg.style.display = "none";
        if (e.target == modalVerFotos) modalVerFotos.style.display = "none";
    };

    // --- FUNCIONALIDAD ESC SECUENCIAL (CORREGIDO) ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            // El visor de un solo ángulo es el que queda más "encima"
            if (modalAnguloFotos && modalAnguloFotos.style.display === "flex") {
                modalAnguloFotos.style.display = "none";
                modalKg.style.display = "flex";
            }
            // Si el visor de fotos está abierto, cerramos SOLO ese para volver al historial
            else if (modalVerFotos.style.display === "flex") {
                modalVerFotos.style.display = "none";
            }
            // Si el visor de fotos está cerrado pero el historial está abierto, cerramos el historial
            else if (modalKg.style.display === "flex") {
                modalKg.style.display = "none";
            }
        }
    });

    function cargarHistorialKg() {
        if(!historialKgLista) return;
        historialKgLista.innerHTML = "";
        fetch("kg/obtenerHistorialKg.php", { cache: "no-store" })
            .then(res => res.json())
            .then(registros => {
                registrosCache = registros;
                const datosSemana = {};
                registros.forEach(r => { datosSemana[r.semana] = r; });
                const nuevaSemana = document.getElementById("nuevaSemana");
                if (nuevaSemana) {
                    const ultima = registros.reduce((max, r) => Math.max(max, Number(r.semana)), 24);
                    nuevaSemana.value = ultima + 1;
                }
                for (let i = 25; i <= 51; i++) {
                    const btn = document.createElement("div");
                    const data = datosSemana[i];
                    btn.className = data ? "semana-btn completada" : "semana-btn pendiente";
                    btn.innerHTML = `<b>${i}</b><span>${data ? parseFloat(data.peso) : '-'}</span>`;
                    if (data) {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            mostrarVisorRegistro(data);
                        };
                    }
                    historialKgLista.appendChild(btn);
                }
            });
    }

    function fotoOPlaceholder(ruta) {
        if (ruta) return `<img src="${ruta}">`;
        return `<div class="foto-sin-imagen">Sin foto</div>`;
    }

    function generarHTMLFotos(r) {
        return `
            <div style="width:100%; border-bottom: 1px solid #30475e; margin: 15px 0; padding-bottom: 15px; text-align: center;">
                <h4 style="color:#00e0ff; margin-bottom:10px;">Semana ${r.semana} (${r.peso}kg)</h4>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div class="foto-container"><small>Frente</small>${fotoOPlaceholder(r.foto_frente)}</div>
                    <div class="foto-container"><small>Lado</small>${fotoOPlaceholder(r.foto_lado)}</div>
                    <div class="foto-container"><small>Atrás</small>${fotoOPlaceholder(r.foto_atras)}</div>
                </div>
            </div>`;
    }

    function mostrarVisorRegistro(data) {
        document.getElementById("tituloVerFotos").innerText = "Semana " + data.semana;
        document.getElementById("contenedorGaleriaDinamica").innerHTML = `
            <div class="foto-container"><small>Frente</small>${fotoOPlaceholder(data.foto_frente)}</div>
            <div class="foto-container"><small>Lado</small>${fotoOPlaceholder(data.foto_lado)}</div>
            <div class="foto-container"><small>Atrás</small>${fotoOPlaceholder(data.foto_atras)}</div>`;
        document.getElementById("infoPesoModal").innerHTML = `Peso: ${data.peso} kg
            <div style="margin-top:10px;">
                <button type="button" id="btnEditarEstaSemana" class="btn-mini">✏️ Editar esta semana</button>
            </div>`;
        modalVerFotos.style.display = "flex";

        const btnEditar = document.getElementById("btnEditarEstaSemana");
        if (btnEditar) btnEditar.onclick = () => {
            modalVerFotos.style.display = "none";
            entrarModoEdicionSemana(data);
        };
    }

    function entrarModoEdicionSemana(data) {
        document.getElementById("nuevaSemana").value = data.semana;
        document.getElementById("nuevoPeso").value = data.peso;
        ['Frente', 'Lado', 'Atras'].forEach(id => {
            const label = document.getElementById('fileName' + id);
            if (label) label.textContent = "Sin archivo";
        });
        if (tituloRegistroForm) tituloRegistroForm.innerText = "✏️ Editando semana " + data.semana;
        if (avisoEdicionSemana) avisoEdicionSemana.style.display = "block";
        formHistorial.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function salirModoEdicionSemana() {
        if (tituloRegistroForm) tituloRegistroForm.innerText = "➕ Nuevo registro";
        if (avisoEdicionSemana) avisoEdicionSemana.style.display = "none";
        formHistorial.reset();
        cargarHistorialKg();
    }

    if (cancelarEdicionSemana) cancelarEdicionSemana.onclick = (e) => {
        e.preventDefault();
        salirModoEdicionSemana();
    };

    document.getElementById("btnVerTodo").onclick = () => {
        if(registrosCache.length === 0) return alert("No hay registros.");
        document.getElementById("tituloVerFotos").innerText = "🖼️ Mi Progreso Visual Completo";
        document.getElementById("contenedorGaleriaDinamica").innerHTML = registrosCache.map(r => generarHTMLFotos(r)).join('');
        document.getElementById("infoPesoModal").innerText = "";
        modalVerFotos.style.display = "flex";
    };

    document.getElementById("btnAntesDespues").onclick = () => {
        const conFotos = registrosCache.sort((a,b) => a.semana - b.semana);
        if(conFotos.length < 2) return alert("Necesitas al menos 2 registros.");
        const p = conFotos[0], u = conFotos[conFotos.length - 1];
        document.getElementById("tituloVerFotos").innerText = "⚖️ Comparativa Total";
        document.getElementById("contenedorGaleriaDinamica").innerHTML = `
            <div style="width:100%; text-align:center; color:#00e0ff;"><h3>INICIO</h3></div>
            ${generarHTMLFotos(p)}
            <div style="width:100%; margin-top:20px; text-align:center; color:#00e0ff;"><h3>ACTUAL</h3></div>
            ${generarHTMLFotos(u)}`;
        document.getElementById("infoPesoModal").innerText = `Bajada total: ${Math.abs(p.peso - u.peso).toFixed(1)} kg`;
        modalVerFotos.style.display = "flex";
    };

    // --- VISOR DE UN SOLO ÁNGULO (Frente / Lado / Atrás), todas las semanas en fila, pantalla completa ---
    function mostrarAngulo(campo, titulo) {
        if (registrosCache.length === 0) return alert("No hay registros.");
        const ordenado = [...registrosCache].sort((a, b) => a.semana - b.semana);
        document.getElementById("tituloAnguloFotos").innerText = titulo;
        document.getElementById("contenedorAnguloFotos").innerHTML = ordenado.map(r => `
            <div class="angulo-semana-card">
                <h4>Semana ${r.semana} (${r.peso}kg)</h4>
                ${fotoOPlaceholder(r[campo])}
            </div>`).join('');
        modalKg.style.display = "none";
        modalAnguloFotos.style.display = "flex";
    }

    document.getElementById("btnVerFrenteHist").onclick = () => mostrarAngulo("foto_frente", "📷 Frente");
    document.getElementById("btnVerLadoHist").onclick   = () => mostrarAngulo("foto_lado",   "📷 Lado");
    document.getElementById("btnVerAtrasHist").onclick  = () => mostrarAngulo("foto_atras",  "📷 Atrás");

    function actualizarIMC(pesoKg) {
        if (!pesoKg || pesoKg <= 0) return;
        const imc = (pesoKg / (1.83 * 1.83)).toFixed(1);
        const valDisplay = document.getElementById('val-imc');
        const indicador = document.getElementById('imc-indicador');
        if (valDisplay) valDisplay.innerText = imc;
        let porcentaje = Math.max(0, Math.min(100, ((imc - 15) / 25) * 100));
        if (indicador) indicador.style.left = `calc(${porcentaje}% - 8px)`;
    }

    function guardarPesoActual(valor) {
        pesoActual = parseFloat(valor) || 0;
        if(pesoActual > 0) {
            const d = new FormData(); d.append("peso", pesoActual);
            fetch("kg/guardarKg.php", { method: "POST", body: d });
            actualizarIndicador(); actualizarIMC(pesoActual);
            pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg";
        }
        modoEdicion = false; editarBtnKg.innerHTML = "Editar ✏️";
    }

    function actualizarIndicador() {
        listaPesos.forEach(li => {
            li.classList.remove("superior", "actual");
            const p = parseFloat(li.dataset.peso);
            if (Math.abs(p - pesoActual) < 0.1) li.classList.add("actual"); 
            else if (p > pesoActual) li.classList.add("superior"); 
        });
    }

   editarBtnKg.onclick = () => {
        if (modoEdicion) {
            const input = document.getElementById("inputPeso");
            if (input) guardarPesoActual(input.value);
        } else {
            modoEdicion = true; 
            editarBtnKg.innerHTML = "Listo ✅";
            
            // Creamos el input
            pesoSeleccionado.innerHTML = `<input type="number" step="0.01" id="inputPeso" value="${pesoActual}" style="width:70px; text-align:center;">`;
            
            // --- MAGIA AQUÍ ---
            const input = document.getElementById("inputPeso");
            input.focus();  // Pone el cursor en el input
            input.select(); // <--- ESTO selecciona todo el número automáticamente
        }
    };

    btnHistorial.onclick = () => { modalKg.style.display = "flex"; cargarHistorialKg(); };

    btnGuardarRegistro.onclick = () => {
        const formData = new FormData(formHistorial);
        btnGuardarRegistro.disabled = true; btnGuardarRegistro.innerText = "GUARDANDO...";
        fetch("kg/guardarHistorialKg.php", { method: "POST", body: formData })
            .then(res => res.json()).then(data => {
                if (data.ok) { alert("¡Guardado!"); salirModoEdicionSemana(); }
                else alert("Error: " + data.error);
            }).finally(() => { btnGuardarRegistro.disabled = false; btnGuardarRegistro.innerText = "GUARDAR REGISTRO"; });
    };

    fetch("kg/obtenerKg.php", { cache: "no-store" }).then(res => res.json()).then(data => {
        pesoActual = parseFloat(data.peso) || 0;
        if (pesoActual > 0) { pesoSeleccionado.textContent = pesoActual.toFixed(2) + " kg"; actualizarIMC(pesoActual); }
        actualizarIndicador();
    });
}
document.addEventListener("DOMContentLoaded", initKg);