---
name: construir-landing
description: Construye la landing page real (archivo HTML autocontenido) de un negocio prospecto o cliente de Golden Tech, a partir de información ya reunida — el brief de la skill investigar-negocio, texto o capturas de su Perfil de Negocio de Google, o de sus redes (Facebook/Instagram) pegadas en el chat. Sigue el patrón visual ya probado en gestanut/index.html (nav, hero con WhatsApp, franja de marquee, servicios, proceso, reseñas reales, FAQ, contacto, botón flotante). Al terminar, sugiere qué "sistemas" adicionales ofrecerle (agenda, catálogo, panel de administración, expediente de clientes, cotizador, membresías) para subir el ticket y ganar trabajo recurrente. Úsala cuando el usuario ya tiene información del negocio (propia, o pegada de Google/Facebook/Instagram) y quiere pasar a construir el sitio, o cuando pregunta qué sistema ofrecerle a un prospecto o cliente.
---

# Construir la landing page de un negocio (y qué más ofrecerle)

Esta skill es la continuación de `investigar-negocio`: esa reúne la información, esta la convierte en el
archivo real. Es para Golden Tech (Jaime, Culiacán, Sinaloa) — negocios locales que necesitan una página
rápida, simple, profesional, que sí les traiga clientes.

## Cuándo usar esta skill

- El usuario pega información de un negocio (texto, captura de Google Business Profile, Facebook, Instagram)
  y quiere que se convierta en una landing page.
- Ya existe un brief de `investigar-negocio` y el usuario dice que ya tiene luz verde para construir.
- El usuario pregunta qué "sistema" (más allá de la página) ofrecerle a un prospecto o cliente específico.

## Regla de oro (heredada de investigar-negocio)

**Nunca inventes nada.** Ni testimonios, ni precios, ni años de experiencia, ni certificaciones, ni fotos que
no existen. Todo dato que falte se dice explícitamente en el entregable como "falta — pedir al cliente", nunca
se rellena con algo creíble pero inventado. Si el usuario pega una captura de pantalla (como un resultado de
Google), léela con cuidado completa antes de asumir nada — a veces contradice información previa (p. ej. un
negocio que antes no tenía sitio y ahora sí lo tiene: si pasa, avísalo, no ignores el dato nuevo).

## Paso 1 — Confirmar qué información ya se tiene

Antes de escribir una sola línea de HTML, ordena lo que ya llegó (de investigar-negocio, o de lo que el
usuario acaba de pegar):
- Nombre exacto, giro, zona/dirección, teléfono/WhatsApp, horario.
- Calificación y 3-6 reseñas reales que se puedan citar (guarda el texto exacto, no lo parafrasees si lo vas
  a mostrar como testimonio).
- Redes oficiales, tono de marca, colores/logo si hay.
- Fotos reales disponibles (sí/no — esto decide si se usa foto real o placeholder, ver Paso 5).

Si falta algo crítico para arrancar (nombre, giro, contacto), pregúntalo antes de seguir. Si falta algo
secundario (fotos, textos definitivos), sigue construyendo con lo que hay y lo marcas como pendiente en el
entregable — no detengas todo el trabajo por eso.

## Paso 2 — Estructura de secciones y paleta

Usa el esqueleto de secciones por giro y las reglas de paleta/tipografía ya definidas en la skill
`investigar-negocio` (y replicadas en el panel `clientes/` → botón "Guía de venta" → pestaña "Cómo
investigar", secciones 6 y 7). No los repitas de memoria ni inventes otro esquema: ábrelos si hace falta
confirmar el orden de secciones o la lógica de color para ese giro específico.

## Paso 3 — Construir el archivo (patrón visual de Golden Tech)

El sitio de referencia ya construido y en producción es `gestanut/index.html` (Diana Zavala, nutrióloga).
Sigue ese mismo patrón, adaptado al negocio y giro actuales — no reinventes el sistema visual desde cero:

- **Un solo archivo HTML autocontenido**: `<style>` inline en el `<head>`, JS vanilla al final del `<body>`,
  sin frameworks ni dependencias externas (solo Google Fonts vía `preconnect` si aplica). Debe abrir y verse
  bien con solo hacer doble clic o servirlo desde XAMPP, sin build step.
- **Paleta como CSS custom properties** en `:root` (`--primario`, `--primario-oscuro`, `--acento`, `--fondo`,
  `--texto`, `--texto-medio`, etc.) — nunca colores sueltos hardcodeados por todo el CSS.
- **Nav fijo** con logo/nombre, links a anclas de cada sección, botón CTA a WhatsApp, y menú hamburguesa en
  móvil (breakpoint ~900px).
- **Hero de dos columnas** (una columna en móvil): eyebrow (giro + zona), título con la promesa principal,
  descripción corta, botón grande a WhatsApp con mensaje prellenado (`https://wa.me/52NUMERO?text=...`
  URL-encoded), badges cortos de puntos fuertes reales.
- **Franja marquee** opcional con palabras clave del negocio en scroll continuo (refuerza SEO/skim visual).
- **Secciones según el giro** (ver Paso 2): "Sobre el negocio/profesional", servicios en cards, "cómo
  funciona"/proceso en pasos, una caja de precio o rango con CTA (si el cliente dio precios o política de
  precios), reseñas reales en cards (cita textual + nombre/tipo de cliente), FAQ tipo acordeón construido con
  las dudas repetidas reales que se encontraron en reseñas/comentarios.
- **Contacto final**: botones grandes de WhatsApp e Instagram/Facebook, datos de ubicación/horario, footer
  simple.
- **Botón flotante de WhatsApp** fijo abajo a la derecha en todo el sitio.
- **Animación "reveal" al hacer scroll** vía `IntersectionObserver` (clase `.reveal` → `.reveal.visible`),
  sutil, sin librerías.
- **Mobile-first de verdad**: prueba mentalmente (o revisando el CSS) cómo se ve en una pantalla de 375px de
  ancho antes de darlo por terminado — la mayoría de los clientes de estos negocios entran desde el celular.

## Paso 4 — Fotos y testimonios reales, nunca inventados

- Si el cliente ya mandó fotos o hay fotos reales aprovechables (de Maps/redes con buena resolución y
  permiso de uso), úsalas.
- Si NO hay fotos todavía, usa un bloque placeholder elegante (mismo patrón de `.hero-img-frame` /
  `.about-img` de gestanut: marco con ícono y una nota discreta tipo "foto pendiente"), nunca una foto de
  stock genérica sin avisar que es temporal.
- Los testimonios en la sección de reseñas deben ser **citas reales** encontradas en Google/Facebook/Instagram
  (texto textual o muy ligeramente recortado por espacio, nunca reescrito para sonar mejor). Si no hay
  suficientes reseñas citables, la sección se hace más chica o se omite — no se inventan clientes.

## Paso 5 — Dónde guardarlo y cómo revisarlo

- Crea una carpeta nueva en la raíz del proyecto con el slug en minúsculas del negocio (mismo patrón que
  `gestanut/`, ej. `pena-abogados/`, `taqueria-el-cuate/`).
- Archivo principal: `index.html` dentro de esa carpeta. Si más adelante se le vende un "sistema" con
  backend, ese vive en subcarpetas (`api/`, `assets/`) siguiendo el mismo patrón que `gestanut/`.
- Se revisa localmente en `http://localhost/Golden-Mirrors/<slug>/` (XAMPP ya sirve la raíz del proyecto).

## Paso 6 — Qué "sistemas" ofrecer además de la landing (para subir ticket y ganar recurrencia)

La landing page sola ya es la puerta de entrada — pero el ticket más alto y el ingreso recurrente vienen de
los "sistemas": mini-aplicaciones con login y base de datos. Golden Tech ya tiene el boilerplate resuelto
(reutilízalo, no lo reconstruyas cada vez):

- **Login + sesión**: patrón de `gestanut/login.php` + `session_init.php` (raíz del proyecto).
- **Conexión a base de datos**: patrón de `conexion.php` / `gestanut/api/db.php` + `config.php`.
- **Panel de administración simple**: patrón de `admin.php` + `admin_api.php` (edición de contenido sin
  tocar código).
- **CRUD por módulo vía API PHP**: patrón usado en `gestanut/api/*.php`, `clientes/api_clientes.php`,
  `gastos/api_gastos.php` — un archivo PHP por entidad, tabla MySQL simple, JS del front consumiéndolo con
  fetch.

Esto es clave para que el trabajo sea **eficiente**: construye el sistema una vez, bien, para un giro (por
ejemplo, agenda de citas para consultorios/veterinarias, como ya existe en `gestanut/api/citas.php`), y
revéndelo con ajustes menores de marca a cada negocio nuevo del mismo giro — no lo hagas desde cero cada vez.

| Sistema | Qué hace | A quién ofrecérselo (giros del prospecting) | Por qué lo compran | Base a reutilizar |
|---|---|---|---|---|
| **Agenda/citas en línea** | Cliente agenda cita, dueño ve calendario, confirmación automática | Clínicas, veterinarias, dentistas, spas, barberías, abogados | Menos llamadas perdidas, menos "no-shows", se ve más profesional que agendar por WhatsApp a mano | `gestanut/api/citas.php` |
| **Expediente/historial de cliente** | Ficha por cliente/paciente con historial de visitas, notas, documentos | Veterinarias, consultorios, dentistas, estética, nutriólogos | El negocio no quiere perder ese historial — genera dependencia y relación recurrente contigo (hosting/mantenimiento) | `gestanut/api/pacientes.php`, `historia.php`, `documentos.php` |
| **Catálogo digital con pedido por WhatsApp** | Lista de productos/platillos con fotos y precio; "agregar" arma un mensaje de WhatsApp con el pedido | Restaurantes, taquerías, tiendas/retail, refaccionarias | Vende sin pagar comisión de apps de delivery/terceros; barato de construir, alto valor percibido | patrón simple JS + `localStorage`, sin necesidad de carrito con backend |
| **Cotizador con galería de trabajos** | Galería de proyectos reales + formulario que manda specs del proyecto por WhatsApp/correo | Herrería, carpintería, aluminio/vidrio, tablaroca, pintores, arquitectos | Son ventas de ticket alto donde el cliente sí investiga antes de pedir cotización — portafolio + formulario fácil convierte mejor que solo "llámanos" | formulario simple + `mail()`/wa.me |
| **Panel de administración de contenido** | El dueño edita precios, fotos, promos y horario sin llamarte a ti cada vez | Cualquier giro, especialmente los que cambian promos seguido (restaurantes, retail, salones) | Le ahorra depender de ti para cambios menores; a ti te ahorra soporte repetitivo — cóbralo como upsell o cuota mensual | `admin.php` + `admin_api.php` |
| **Control de membresías/inscripciones** | Roster de miembros, estatus de pago del mes, alertas de vencimiento | Gimnasios, escuelas de artes marciales, estudios de yoga/pilates | Reemplaza la libreta de "quién debe el mes"; argumento muy concreto y fácil de visualizar para el dueño | tabla simple + vista tipo `clientes/clientes.html` |
| **Reseñas centralizadas** | Página que junta testimonios reales ya existentes y linkea directo a dejar reseña nueva en Google | Negocios con buena calificación pero presencia dispersa (varias páginas de Facebook, reseñas repartidas) | Sube calificación/volumen en Google con poco esfuerzo del dueño; fácil de construir y de explicar en la venta | sección estática + link directo a "dejar reseña" de Google |

## Entregable

Al terminar de construir, entrega:

1. **Ruta del archivo generado** y URL local para revisarlo.
2. **Pendientes reales** que el cliente debe mandar (fotos, textos finales, precios) — lista corta y concreta.
3. **1-2 líneas de argumento de venta específico** de ESE negocio (basado en lo que sí se encontró: mejor
   calificación que su competencia, reseñas fuertes, sitio roto anterior, etc.) — no genérico.
4. **1-2 sistemas sugeridos específicamente para este negocio** de la tabla del Paso 6, con el motivo concreto
   por el que a ESE dueño le convendría (no listar los siete, elegir los que de verdad aplican).

Si se está trabajando dentro de este repositorio, ofrece registrar o actualizar el prospecto en el Panel de
Clientes (`clientes/`) con el estado nuevo ("propuesta enviada", etc.) — no escribas directo en la base de
datos, indícale al usuario que lo haga desde el panel o hazlo tú si tiene acceso a la app y lo pide.

## Reglas importantes

- Nunca inventes testimonios, precios, certificaciones ni fotos.
- Cualquier precio o presupuesto que menciones (landing o sistema) es un punto de partida a validar por el
  usuario según su costo y el mercado local, nunca una cifra de mercado verificada.
- El archivo debe quedar ligero y autocontenido — nada de dependencias pesadas ni build steps para un sitio
  que se supone rápido y simple.
- Mobile-first siempre: la mayoría de los clientes de estos negocios entran desde el celular.
