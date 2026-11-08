# Lenguaje visual del sitio

Describe la estética que el sitio ya tiene (noviembre 2026), para que cada sección nueva y cada búsqueda de referencias partan del mismo criterio. Todo sale de `app/route.ts`, que sirve el template `app/source.html` con overrides de CSS.

## En una frase

Producto de consumo premium, luminoso y editorial: página blanca, tarjetas crema que se abren y cierran con el scroll, tipografía enorme y apretada, un solo color de acento (naranja salmón con degradé que oscurece) y objetos que flotan suaves. Más cerca de una marca de salud o de hardware de consumo (referencia entendida, no copiada: hims.com) que de una cripto oscura y técnica.

## Color

- Fondo de página: blanco.
- Tarjetas: crema `#fff7f4` (Powerups), con esquinas muy redondeadas.
- Texto: navy `#10131c`.
- Acento único: naranja. Palabras clave con el degradé `linear-gradient(155deg, #ff7e6d 0%, #ff5c45 55%, #a12a2a 100%)` recortado al texto, que termina más oscuro. Botones en naranja sólido `#ff5c45` con texto blanco semibold y un halo naranja (`box-shadow: 0 8px 30px rgba(255,92,69,.3)`).
- Contraste oscuro puntual: la tarjeta "Real ownership" (vino/navy profundo con texto blanco y naranja) y las pantallas de la wallet, que son oscuras.
- Palabras de fondo de los carruseles: gris claro `#d9d9db`, sirven de textura y no compiten con el título.

## Tipografía

- DM Sans en todo. Títulos en 500, palabra fuerte en 600 ("One wallet."), interletrado negativo marcado (`-.0575em`), centrados.
- Tamaños en `vw`, enormes: el título del hero y "Powerups" a 5.6vw en desktop y 12.3vw en celular; las secciones a 7vw.
- Copy corto, en frases que se leen de un vistazo, con 1 a 3 palabras clave en naranja.

## Forma y profundidad

- Tarjetas que se agrandan y achican: el template anima `clip-path: inset(0 Xpx round Ypx)` con el scroll (64/45 px en desktop, 16/24 px en celular). Al entrar la tarjeta se abre a todo el ancho; al salir vuelve a ser una tarjeta redondeada.
- Losas 3D en perspectiva (`.section-rectangle`): placas rosadas acostadas, con borde blanco y sombra difusa, que flotan despacio (6 s, desfasadas). Llevan un glifo Phosphor en naranja o el logo del partner en negro.
- Celulares con la UI oscura real de la wallet, borde naranja y sombra suave; nada de mockups genéricos.
- Bordes de carruseles y sombras que se desvanecen con máscaras, nunca con cortes duros.

## Movimiento

- Lento y con curva suave (`cubic-bezier(.22,1,.36,1)`); un solo gesto visible por acción, sin cortar al final.
- Carruseles infinitos que se pausan al pasar el mouse; el segundo corre al revés.
- Revelado palabra por palabra en frases de cierre ("Add more when you need more.").
- Demos con scroll pegajoso: el celular queda fijo y los pasos avanzan al costado.
- Respeta `prefers-reduced-motion`.

## Lo que no es

- Ni oscuro de punta a punta ni "terminal de trading": el oscuro es un acento.
- Ni neón, ni glassmorphism, ni gradientes violetas de cripto genérica.
- Direcciones descartadas que no se reviven: núcleo 3D en Spline, metáfora de órbita, metáfora de agua.
- Copy: nunca "permissionless"; ningún número o auditoría sin verificar.

## Criterio para buscar referencias

Una referencia sirve si comparte al menos tres de estos rasgos: fondo claro con tarjetas cálidas, un solo acento de color, tipografía grande y apretada, objetos físicos o 3D suaves que flotan, movimiento lento ligado al scroll, logos de terceros presentados con dignidad (no como una grilla de "partners"). Sirve más si resuelve un problema parecido al nuestro: mostrar integraciones o extensiones de terceros que todavía no están disponibles.
