---
name: design-context
description: Cómo está armado y cómo se ve el sitio de Salmon (salmonwallet.io). Cargala antes de tocar UI, estilos, animaciones o copy de este repo, y antes de buscar referencias visuales.
---

# Design context — salmon-website

## Cómo se ve

La estética vigente está en `docs/visual-language.md`: leela antes de diseñar. En corto: página blanca, tarjetas crema que se abren con el scroll, DM Sans enorme y apretada, un solo acento naranja con degradé, la wallet oscura real dentro de los celulares, movimiento lento.

## Cómo está armado (las trampas)

- La home es `app/route.ts`: sirve el template minificado `app/source.html` con una cadena de `.replace`, un bloque de CSS en el `<head>` y un script al final. No hay componentes React en la home.
- El JS del template mide posiciones en `window.onload` y al redimensionar (clip de las tarjetas, lista de pasos, logo del nav). Lo que cambie tamaños después de `onload` desalinea esas medidas.
- CSS global del template que pisa todo: `iframe { position:absolute; width:100%; height:100% }` y `.section h2` con tamaño, interlineado y padding enormes. Un iframe o un `h2` nuevo necesita sus propios valores con más especificidad.
- React solo corre en páginas de Next. Next 16 bloquea `react-dom/server` en `app/`, así que los mocks de la wallet se muestran como iframes de `/phone-preview` y `/powerup-rows`.
- Los mocks (`components/hero/mock-kit.tsx` y vecinos) son ports de componentes de `salmon-wallet-frontend`: sacá los componentes y los íconos (Phosphor bold) de ahí, no los inventes. `u(px)` devuelve `cqw` sobre un diseño de 440 de ancho: el contenedor necesita `@container`.
- Celular = `@media (max-width: 750px)` y la clase `.shim-null` del template. Un cambio pedido para celular va dentro de esas reglas para no mover desktop.
- Aviso de cookies: `components/consent/consent.ts`, compartido por la home y las páginas de Next.
- Legales: el texto vive en `lib/legal-powerups-content.mjs`, generado desde el SOT con `scripts/sync-powerups-legal.mjs`. Nunca se edita a mano.

## Copy

- Nunca "permissionless".
- Ningún número, auditoría ni rating sin verificar (memoria `unverified-proof-claims`).
- Estrategia y audiencia: `.claude/product-marketing.md`.

## Verificar

Los previews de Vercel no se pueden abrir. Probá con un build de producción local (`npm run build && npx next start -p 3100`) y capturas con `node scripts/shot.mjs`, en 402×874 y 1440×900 como mínimo.
