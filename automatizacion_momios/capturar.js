// automatizacion_momios/capturar.js — corre en la PC de casa (Task Scheduler, 7:15am
// y 7:15pm) para reemplazar la toma manual de capturas: abre cada casa de apuestas
// (páginas públicas, sin login), les toma screenshot, y reusa EXACTAMENTE el mismo
// pipeline que ya usa el dashboard al subir imágenes a mano:
//   extraer_momios.php (extrae con IA) -> validar_momios.php (verifica c/u contra su
//   imagen, igual que mmVerificarExtraidos en momios.js) -> guardar_lote (guarda).
// No hay credenciales que guardar: las 3 páginas de momios son públicas.
//
// Las URLs de abajo apuntan a una ronda específica del torneo — cuando cambie de
// fase (grupos -> eliminación) o las casas reorganicen sus IDs, van a quedar
// obsoletas. Por eso cada casa se valida por separado: si una imagen no arroja
// ningún partido, se registra como advertencia en vez de fallar todo el proceso.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://goldentechcln.com/momios';

// Playdoit y BetVIP quedaron fuera a propósito: ambos bloquean el navegador
// automatizado con el reto anti-bot de Cloudflare ("Acceso bloqueado" / "Performing
// security verification"), confirmado en pruebas reales — no es un problema de
// tiempos de espera, es detección activa. Esos 2 se siguen subiendo a mano como
// hasta ahora (el botón "Cargar imágenes" del dashboard). Si en el futuro cambian
// de protección anti-bot y quieres reintentarlos, se agregan aquí igual que Codere.
const CASAS = [
    { nombre: 'Codere', url: 'https://apuestas.codere.mx/es_MX/t/19161/UEFA-Champions-League' },
];

const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function logLinea(lineas, texto) {
    const ahora = new Date();
    const ts = ahora.toISOString().replace('T', ' ').slice(0, 19);
    const linea = `[${ts}] ${texto}`;
    console.log(linea);
    lineas.push(linea);
}

function guardarLog(lineas) {
    const hoy = new Date().toISOString().slice(0, 10);
    const archivo = path.join(LOG_DIR, `${hoy}.log`);
    fs.appendFileSync(archivo, lineas.join('\n') + '\n\n', 'utf8');
}

function turnoActual() {
    return new Date().getHours() < 13 ? 'manana' : 'tarde';
}

// ── 1) Capturar screenshot de cada casa ──
// OJO: 'networkidle' no sirve para sitios de momios en vivo (siguen pidiendo datos
// de fondo sin parar) — se espera solo a que cargue el DOM + un margen fijo. Cada
// captura se guarda en logs/ para poder revisar qué vio el script si algo sale mal.
async function capturarTodas(lineas) {
    const browser = await chromium.launch({ headless: true });
    const capturas = []; // { nombre, buffer }
    const marcaTiempo = new Date().toISOString().replace(/[:.]/g, '-');

    for (const casa of CASAS) {
        const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
        try {
            await page.goto(casa.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await page.waitForTimeout(8000); // margen para que cargue el contenido (SPA / momios en vivo)
            // Sin fullPage: estos sitios tienen menús laterales larguísimos que hacen la
            // página entera gigante y dejan la tabla de momios como una franja minúscula
            // e ilegible para la IA — la tabla ya está visible dentro del viewport normal.
            const buffer = await page.screenshot({ fullPage: false, type: 'png' });
            fs.writeFileSync(path.join(LOG_DIR, `${marcaTiempo}_${casa.nombre}.png`), buffer);
            capturas.push({ nombre: casa.nombre, buffer });
            logLinea(lineas, `${casa.nombre}: captura OK (${Math.round(buffer.length / 1024)}KB)`);
        } catch (e) {
            logLinea(lineas, `✗ ${casa.nombre}: error al capturar — ${e.message} — URL: ${casa.url}`);
            const buffer = await page.screenshot({ fullPage: true, type: 'png' }).catch(() => null);
            if (buffer) fs.writeFileSync(path.join(LOG_DIR, `${marcaTiempo}_${casa.nombre}_FALLO.png`), buffer);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    return capturas;
}

// ── 2) Extraer momios de todas las imágenes de un jalón (misma API que el dashboard) ──
async function extraerMomios(capturas, lineas) {
    const formData = new FormData();
    capturas.forEach(c => {
        formData.append('imagenes[]', new Blob([c.buffer], { type: 'image/png' }), `${c.nombre}.png`);
    });

    const res = await fetch(`${API_BASE}/extraer_momios.php`, { method: 'POST', body: formData });
    const json = await res.json();

    if (json.error && (!json.partidos || !json.partidos.length)) {
        logLinea(lineas, `✗ Extracción falló: ${json.error}`);
        return [];
    }
    if (!Array.isArray(json.partidos)) {
        logLinea(lineas, '✗ Extracción: respuesta inválida de extraer_momios.php');
        return [];
    }

    const casas = [...new Set(json.partidos.map(p => p.casa_apuestas).filter(Boolean))];
    logLinea(lineas, `Extracción: ${json.partidos.length} partido(s) detectado(s) — ${casas.join(', ') || 'sin casa identificada'}`);
    fs.writeFileSync(path.join(LOG_DIR, 'ultima_extraccion_debug.json'), JSON.stringify(json, null, 2));
    if (json.errores && json.errores.length) {
        json.errores.forEach(e => logLinea(lineas, `  ⚠ ${e}`));
    }

    // Aviso temprano de URL probablemente desactualizada: una imagen que se capturó
    // bien pero de la que no salió NINGÚN partido.
    capturas.forEach((c, i) => {
        const deEstaImagen = json.partidos.filter(p => p._img === i);
        if (!deEstaImagen.length) {
            logLinea(lineas, `  ⚠ ${c.nombre}: 0 partidos extraídos de su imagen — posible URL desactualizada (revisar manualmente)`);
        }
    });

    return json.partidos;
}

// ── 3) Verificar cada partido contra su imagen de origen (igual que mmVerificarExtraidos) ──
async function verificarMomios(partidos, capturas, lineas) {
    const porImagen = {};
    partidos.forEach((p, i) => {
        if (p._img === undefined || p._img === null || !capturas[p._img]) return;
        (porImagen[p._img] = porImagen[p._img] || []).push(i);
    });

    let corregidos = 0, sinVerificar = 0;

    for (const imgIdx of Object.keys(porImagen)) {
        const indices = porImagen[imgIdx];
        const casa = capturas[imgIdx].nombre;
        try {
            const formData = new FormData();
            formData.append('imagen', new Blob([capturas[imgIdx].buffer], { type: 'image/png' }), `${casa}.png`);
            formData.append('partidos', JSON.stringify(indices.map(i => partidos[i])));

            const res = await fetch(`${API_BASE}/validar_momios.php`, { method: 'POST', body: formData });
            const json = await res.json();

            if (json.error || !Array.isArray(json.resultados)) {
                indices.forEach(() => sinVerificar++);
                logLinea(lineas, `  ⚠ ${casa}: no se pudo verificar — ${json.error || 'respuesta inválida'}`);
                continue;
            }

            indices.forEach((i, k) => {
                const p = partidos[i];
                const r = json.resultados[k];
                if (!p || !r || r.coincide) return;
                const campos = ['equipo_local', 'equipo_visitante', 'hora_partido', 'momio_local', 'momio_empate', 'momio_visitante'];
                const cambios = [];
                campos.forEach(campo => {
                    const corregido = r.correcciones ? r.correcciones[campo] : null;
                    if (corregido === null || corregido === undefined) return;
                    if (String(corregido) === String(p[campo] ?? '')) return;
                    cambios.push(`${campo}: ${p[campo] ?? '—'} -> ${corregido}`);
                    p[campo] = corregido;
                });
                if (cambios.length) {
                    corregidos++;
                    logLinea(lineas, `  ⚠ ${casa} (${p.equipo_local} vs ${p.equipo_visitante}) corregido: ${cambios.join(' · ')}`);
                }
            });
        } catch (e) {
            indices.forEach(() => sinVerificar++);
            logLinea(lineas, `  ⚠ ${casa}: error de verificación — ${e.message}`);
        }
    }

    logLinea(lineas, `Verificación: ${partidos.length - corregidos - sinVerificar} OK, ${corregidos} corregido(s), ${sinVerificar} sin verificar`);
    return partidos;
}

// ── 4) Guardar todo (igual que mmGuardarTodosExtraidos) ──
async function guardarLote(partidos, lineas) {
    if (!partidos.length) {
        logLinea(lineas, 'Nada que guardar.');
        return;
    }
    const res = await fetch(`${API_BASE}/api_momios.php?accion=guardar_lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turno: turnoActual(), registros: partidos }),
    });
    const json = await res.json();
    if (json.error) {
        logLinea(lineas, `✗ Guardado falló: ${json.error}`);
        return;
    }
    let msg = `Guardado: ${json.guardados} guardado(s)`;
    if (json.omitidos) msg += `, ${json.omitidos} omitido(s)`;
    logLinea(lineas, msg);
}

async function main() {
    const lineas = [];
    const inicio = Date.now();
    logLinea(lineas, '=== Captura automática iniciada ===');

    try {
        const capturas = await capturarTodas(lineas);
        if (!capturas.length) {
            logLinea(lineas, '✗ No se logró capturar ninguna casa. Abortando.');
            process.exitCode = 1;
            return;
        }

        const partidos = await extraerMomios(capturas, lineas);
        if (!partidos.length) {
            logLinea(lineas, '✗ No se extrajo ningún partido de ninguna casa. Posible caída general o cambio de layout.');
            process.exitCode = 1;
            return;
        }

        await verificarMomios(partidos, capturas, lineas);
        await guardarLote(partidos, lineas);
    } catch (e) {
        logLinea(lineas, `✗ Error inesperado: ${e.stack || e.message}`);
        process.exitCode = 1;
    } finally {
        const seg = ((Date.now() - inicio) / 1000).toFixed(1);
        logLinea(lineas, `=== Fin (${seg}s) ===`);
        guardarLog(lineas);
    }
}

main();
