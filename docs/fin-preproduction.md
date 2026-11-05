# Aleta de salmón — preproducción

Reemplaza la mano que sostiene el celular en la sección "Real ownership" (`#salmon-card-0`, hoy la foto `public/reference-assets/media/left.png` con el marco del celular incluido). La aleta se genera en Blender 5.2 con un script y se renderiza en capas para la web. Concepto de referencia: una imagen hecha por Luca con un LLM (aleta que envuelve el celular), usada solo para la forma.

## Decisiones del dueño (2026-11-05)

- Colores de una aleta real, no los del concepto (el concepto tiene base naranja y punta gris azulada con manchas, que no existe en el salmón).
- Reemplaza la única mano del sitio.
- Arranca quieta. Después, movimiento de flotación.

## Anatomía (con fuentes al final)

- Aleta: pectoral de salmón del Atlántico, 1 radio simple adelante + 11–16 radios blandos (FishBase). Usamos 15.
- Cada radio se bifurca en dos, una o dos veces, en la mitad lejana a la base; el radio delantero no se bifurca. Con 15 radios y dos bifurcaciones llegan unas 60 puntas al borde: el abanico fino del concepto, anatómicamente correcto.
- Radio: base rígida y lisa, parte lejana segmentada con uniones apenas visibles, se afina hasta un pelo. En el borde, un flequillo de fibras finísimas (actinotriquias).
- Membrana entre radios, más transparente que ellos.
- Color real: aletas "oscuras a pálidas" (Fishes of Australia), translúcidas, sin manchas en la pectoral. El pigmento oscuro aparece primero a lo largo de los radios y se intensifica hacia el borde.
- Doblez: un radio puede curvarse casi 90° respecto de su base, con la curva en la parte flexible. Donde la aleta se dobla sobre el borde, los radios se separan y la membrana queda tensa; donde se juntan, la membrana hace pliegues finos de acordeón.
- Borde sano: casi continuo, con las puntas apenas asomando. Deshilachado leve, sin desgarros.

## Forma

La base de la aleta (donde nacen los radios) apoya sobre la pantalla cerca del borde derecho. Los radios van a la derecha, rodean el borde del celular hacia atrás y se abren en abanico detrás, barriendo hacia abajo a la izquierda. Enrollada y angosta en la base, abierta y con curva suave en la punta.

## Técnica (verificada en Blender 5.2 de esta Mac)

1. Abanico plano paramétrico en Geometry Nodes: `u` = qué radio (0..1), `v` = distancia desde la base (0..1). Radios (curvas → tubos que se afinan) y membrana (grilla) salen de la misma función, así nunca se desfasan. Se guardan `u`, `v` y `ray_id` para el material.
2. Doblez: una curva guía que nace en la pantalla, rodea el borde con margen y barre por detrás. Cada punto se ubica sobre la curva (Sample Curve) con un ancho y un giro que dependen de `v`.
3. Los radios arrancan sobre un arco de 2–3 mm, no en un punto, y un pequeño volumen carnoso tapa el arranque. El giro entra suave.
4. Sin choques: el celular es una caja con medidas exactas; un control de distancia (Geometry Proximity) empuja hacia afuera lo que quede a menos del margen.
5. Material: membrana como una sola superficie con transmisión alta e IOR bajo (1.1). `Thin Wall` existe pero Cycles cuenta su transmisión como difusa y la membrana sale opaca sobre fondo transparente (probado: opacidad 0.79 con Thin Wall, 0.55 sin); radios como tubos vidriosos con capa brillante; pigmento oscuro por `v` y a lo largo de los radios.
6. Render Cycles con GPU Metal, fondo transparente y `film_transparent_glass` (verificado), AgX, ruido adaptativo, rebotes de transmisión altos. Comparar siempre con el render sin quitar ruido.
7. Capas para la web, de atrás hacia adelante: aleta de atrás, celular (pantalla viva en iframe), sombra sobre la pantalla (`mix-blend-mode: multiply`), aleta de adelante. Cada una es un view layer con el celular como holdout o recibidor de sombra.
8. Cámara de lente larga con distancia y desplazamiento calculados para que la pantalla del render calce al píxel con la del sitio. Render al doble de resolución; salida WebP con alfa.

## Integración en la web

- El marco del celular hoy viene en la foto de la mano. Con la aleta, el celular pasa a ser el mismo de CSS que el hero y Powerups (pantalla + bisel con `box-shadow`), y la aleta se renderiza contra esas medidas.
- Flotación (después): las capas y el celular suben y bajan juntos con CSS; una ondulación real de la aleta requiere una secuencia renderizada.

## Etapas

Se cierra una por vez, con aprobación, sin volver atrás:

1. Forma: silueta y doblez en gris, sobre el fondo real de la sección.
2. Detalle: radios, bifurcaciones, segmentos, borde, pliegues.
3. Material: translucidez, pigmento, brillo.
4. Capas e integración en el sitio.

## Riesgos

- Contraste: una aleta real es gris translúcida y el fondo de la sección es oscuro (malva). Puede perderse. Se resuelve con contraluz y luz de borde que hagan brillar los radios; se prueba en la etapa 1 con la silueta y en la 3 con el material.
- Que la aleta atraviese el celular: margen calculado + control de distancia.
- Lo vidrioso sale negro u opaco sin `film_transparent_glass`.
- El quitado de ruido borronea los radios finos.
- Si cambia el tamaño del celular en la web hay que volver a renderizar (un comando).

## Fuentes

- FishBase, Salmo salar: https://www.fishbase.se/physiology/Salmo_salar
- Fishes of Australia, Salmo salar: https://fishesofaustralia.net.au/home/species/3624
- Alben, Madden y Lauder, mecánica de radios: https://pmc.ncbi.nlm.nih.gov/articles/PMC2359861
- Nguyen et al. 2017, radios se segmentan, afinan y bifurcan: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5454310/
- Actinotriquias: https://pmc.ncbi.nlm.nih.gov/articles/PMC6497306
- Bifurcación de radios (pez cebra): https://www.biorxiv.org/content/10.1101/2022.05.09.491182v1.full
- Curvatura de radios: https://sicb.org/?p=34467
- Pigmento en aletas: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4232760/
- Principled BSDF 5.2: https://docs.blender.org/manual/en/5.2/render/shader_nodes/shader/principled.html
- API de interfaz de nodos 5.2: https://docs.blender.org/api/5.2/bpy.types.NodeTreeInterface.html
- Film en Cycles 5.2: https://docs.blender.org/manual/en/5.2/render/cycles/render_settings/film.html
