---
name: golden-tech-negocio
description: Este repo (Golden-Mirrors) también es la herramienta interna del negocio Golden Tech de Jaime — venta de páginas web y sistemas a negocios locales de Culiacán.
metadata:
  type: project
---

Este repositorio no es solo un proyecto de software: dentro de él vive el negocio real de Jaime, "Golden Tech"
(taller de servicio técnico en Culiacán, Sinaloa, que también hace páginas web y sistemas para negocios
locales). Convive con proyectos personales del propio Jaime (`deuda/`, `gastos/`, `kg/`, `ruleta/`, `escalera/`,
`ahorrovaleria/`, `espejo/`).

**Piezas del negocio Golden Tech dentro del repo:**
- `clientes/` — Panel de Clientes: CRM de prospectos de páginas web/sistemas, con un modal "Guía de venta"
  (mensajes de WhatsApp por etapa, manejo de objeciones, cierre) y una pestaña "Cómo investigar" que duplica en
  la UI el contenido de la skill `investigar-negocio`. Esa guía se corta justo en "checklist final antes de
  empezar a construir" — no cubre construcción ni upsells, por eso se creó la skill `construir-landing`.
- `gestanut/` — sitio real ya entregado y en producción: landing pública (`index.html`) + sistema con login
  (`login.php`, `session_init.php`) y API PHP por módulo (`api/*.php`: citas, pacientes, historia, documentos,
  planes, etc.) para Diana Zavala, nutrióloga. Es la referencia de patrón visual (landing) y de patrón técnico
  (sistema con backend) para nuevos clientes — ver [[construir-landing]].
- `.claude/skills/investigar-negocio` y `.claude/skills/construir-landing` — pipeline de dos pasos: investigar
  (reunir info pública de Google/Facebook/Instagram/competencia) → construir (generar la landing real + sugerir
  qué "sistema" adicional ofrecer, con tabla de sistemas y qué código del repo reutilizar para cada uno).

**Por qué importa:** cuando Jaime pida investigar/cotizar/construir para un prospecto, o pregunte qué sistema
ofrecerle, el contexto correcto es este negocio de Golden Tech, no un proyecto de software genérico — y ya
existen patrones/código reutilizable en el propio repo (no hay que proponer stack nuevo, es PHP + MySQL +
JS vanilla, autocontenido, sin frameworks).

**Cómo aplicar:** antes de recomendar reutilizar un archivo específico de `gestanut/` o `admin.php` como base,
confirmar que sigue existiendo con ese nombre (el repo cambia). Los precios que Jaime cotiza son siempre punto
de partida a validar por él, nunca una cifra fija de mercado.
