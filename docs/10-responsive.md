# Diseño responsive de la estructura base

> **Historia de usuario:** HU-10 · Sprint 3
> **Objetivo específico:** 2 — Desarrollar los módulos del prototipo funcional.
> **Requisito asociado:** RNF-03 (adaptabilidad a distintos dispositivos).
> **Depende de:** [HU-09 · navegación e inicio](09-navegacion-e-inicio.md).

Los tres anchos de referencia son los de RNF-03 y los mismos en que se diseñó el prototipo:
**360 px** (móvil), **768 px** (tableta) y **1366 px** (escritorio).

---

## 1. Cómo se adapta

Las medidas que cambian con el ancho están en `src/styles/variables.css`, no repartidas por
las hojas de estilo. Un componente no decide su margen: usa `var(--margen)` y el valor
correcto llega solo.

| Variable | 360 px | 768 px | 1366 px | Para qué |
| --- | --- | --- | --- | --- |
| `--margen` | 16 px | 24 px | 32 px | Margen lateral de la rejilla |
| `--espacio-tarjetas` | 16 px | 18 px | 20 px | Separación entre tarjetas, la misma entre filas que entre columnas |
| `--toque-minimo` | 44 px | 44 px | 44 px | Área mínima de todo elemento interactivo |

Son los valores de [`05-prototipo-interfaz.md` §4](05-prototipo-interfaz.md).

## 2. El menú compacto

Por debajo de **768 px** el menú se repliega tras un botón; a partir de 768 se muestra
completo y en horizontal.

Quién decide eso es el CSS, no el componente. React solo guarda si el panel está abierto;
la consulta de medios oculta el botón y despliega el menú a partir de 768 px. Esto evita el
defecto clásico de los menús que se controlan desde JavaScript: **encoger la ventana con el
panel abierto y volver a ampliarla no deja un menú a medias**, porque en escritorio el
estado deja de tener efecto.

El comportamiento comprobado a 360 px:

| Comprobación | Resultado |
| --- | --- |
| Área de toque del botón | 100 × 44 px |
| `aria-expanded` refleja el estado | `false` → `true` → `false` |
| `aria-controls` apunta al panel | correcto |
| Contenido del panel | Eventos, Actores culturales, Hubs, Mapa, Ingresar |
| **Escape** cierra y devuelve el foco al botón | correcto |
| Navegar a una vista cierra el panel | correcto |

Las dos últimas no son adorno: sin ellas, quien navega con teclado se queda dentro de un
panel que ya no ve, y quien toca un enlace se queda con el menú tapando la vista que acaba
de abrir.

**El punto de corte dispara donde debe.** A 767 px el botón está visible y los accesos van
en una columna; a 768 px el menú es completo. En el prototipo de HU-06 este mismo punto
falló por 2 px a causa del borde del contenedor, así que se comprobó el píxel exacto.

## 2 bis. El menú que no cabía (corregido el 26/08/2026)

La comprobación de la sección 2 se hizo **sin sesión iniciada**: el panel que se midió lleva
cinco elementos —Eventos, Actores culturales, Hubs, Mapa, Ingresar—. El menú de un actor
cultural lleva ocho: los cuatro accesos públicos, «Mi perfil», «Mis publicaciones», su nombre
y «Cerrar sesión». Ese nunca se midió, y es el que se rompió.

Es el mismo punto ciego que HU-18 encontró en sus reglas: allí todas las pruebas cubrían
perfiles **que existen** y ninguna la cuenta recién creada; aquí todas las medidas cubrían
la cabecera **de un visitante** y ninguna la de quien ha entrado. Lo que no se mide es
siempre el caso que no se pensó.

### Lo que fallaba

`.cabecera__interior` heredaba de `.contenedor` un ancho máximo de **1200 px**, que descontado
el margen deja 1.152 px útiles. El menú completo de un actor mide:

| Pieza | Ancho |
| --- | --- |
| Marca (placa, logotipo y nombre) | 254 px |
| Seis enlaces con sus separaciones | 650 px |
| Nombre, rol y «Cerrar sesión» | 269 px |
| Separaciones y filo del bloque de sesión | 36 px |
| **Total** | **1.210 px** |

Faltaban 58 px, y **ninguna pantalla los aportaba**: por encima de 1200 px el tope congela la
barra, así que ampliar la ventana no daba ni un píxel más de sitio. El menú se partía en dos
filas y la marca, comprimida, escribía «Hub Cultural» en dos líneas.

Encima había una regla que subía el logotipo de 26 a 30 px de alto a partir de **1366 px**.
Como es una imagen apaisada, eso son **18 px más de ancho**, cobrados justo en la resolución
de portátil más común. Por eso el defecto se veía aparecer exactamente entre 1365 y 1366 px,
y por eso parecía un problema de ese ancho cuando en realidad venía de mucho antes.

### La corrección

Tres cambios, ninguno en el componente de React:

| Cambio | Por qué |
| --- | --- |
| La cabecera usa `--ancho-cabecera` (1600 px) en lugar del tope del contenido | Una barra de navegación no es un párrafo: el tope de 1200 px existe para que una línea de texto no se vuelva ilegible, y a un menú le hace falta lo contrario |
| `flex-shrink: 0` en la marca, desde 768 px | Es el camino de vuelta al inicio desde cualquier vista (HU-09) y no debe partirse; quien cede es el menú, que sabe repartirse en filas |
| Fuera el `@media (min-width: 1366px)` del logotipo | Un adorno de 4 px de alto no vale una fila de menú |

El selector es `.cabecera .cabecera__interior` y lleva el padre por delante a propósito:
`.contenedor` y `.cabecera__interior` son las dos una sola clase, empatan en especificidad y
decidiría el orden en que Vite junta las hojas. Es la misma trampa que costó una corrección
en la tarjeta del directorio de actores.

### Medido después

Con el menú de un actor cultural, contando filas de enlaces y altura de la cabecera:

| Ancho de ventana | Antes | Después |
| --- | --- | --- |
| 1024 px | 2 filas · 112 px · marca partida | 2 filas · 112 px · marca entera |
| 1200 px | 2 filas · 112 px · marca partida | 2 filas · 112 px · marca entera |
| 1280 px | 2 filas · 112 px | **1 fila · 64 px** |
| 1365 px | 2 filas · 112 px | **1 fila · 64 px** |
| 1366 px | 2 filas · 112 px | **1 fila · 64 px** |
| 1920 px | 2 filas · 112 px | **1 fila · 64 px** |
| 2560 px | 2 filas · 112 px | **1 fila · 64 px** |

Sin desbordamiento horizontal en ninguno.

**Entre 768 y 1257 px el menú sigue ocupando dos filas**, y se deja así a conciencia: es el
reparto que `flex-wrap` hace a propósito, todos los enlaces quedan visibles y la marca ya no
se parte. Esconder el menú tras el botón hasta 1258 px sería mover el punto de corte que
HU-10 fijó en 768 px, y eso es una decisión de diseño, no la corrección de un defecto.

### Lo que se lleva a HU-33

La medición de la sección 4 recorre las rutas **públicas** con la ventana redimensionada.
Cuando se repita en HU-33 tiene que recorrerlas **con sesión iniciada en cada uno de los tres
roles**, porque el menú —que es lo que más ancho pide de toda la estructura— depende del rol
y no de la ruta.

## 2 ter. Tres logotipos en la cabecera (19/09/2026)

La marca pasa de un logotipo a tres: **Tecnológico de Antioquia**, **Universidad Autónoma
del Estado de México** y **Universidad del Magdalena**, en la misma placa blanca y separados
por un filete, porque son tres instituciones y no una marca compuesta.

Eso son 86 px más de marca —de 254 a 340—, y la marca es justamente lo que la sección 2 bis
dejó sin ceder ancho. Así que había que decidir otra vez quién cede.

### Lo que dejó de estar prohibido

El `flex-wrap: nowrap` que la cabecera tenía desde 768 px. Con una marca de 254 px sobraba
sitio y daba igual; con 340 deja de dar igual, porque prohibido repartirse en filas lo único
que el menú podía hacer al quedarse sin espacio era **encogerse y partirse por dentro**.

Quitarlo no cambia la regla de 2 bis —quien cede sigue siendo el menú— sino **cómo** cede:
el menú que no cabe al lado de la marca baja entero a la fila siguiente, donde dispone del
ancho completo, en lugar de estrujarse en su caja hasta romperse.

Donde más se nota es a 768 px, y sale ganando: la cabecera crece seis píxeles y el menú
pierde una fila entera. La medición está debajo.

Esos seis píxeles son la placa, que es más alta porque los dos sellos son casi cuadrados y
el logotipo del Tecnológico es apaisado: a la misma altura los sellos se verían más pequeños
de lo que son, y se compensa subiéndolos un poco, que es como se equilibra un conjunto de
logotipos —por masa óptica y no por medida.

### Medido en los tres anchos

Con el menú del actor cultural, que es el más largo que existe:

| Ancho | Caso | Alto de la cabecera | Filas del menú |
| --- | --- | --- | --- |
| 360 px | visitante | 118 → 118 px | menú compacto, tras el botón |
| 360 px | actor | 118 → 118 px | menú compacto, tras el botón |
| 768 px | visitante | 112 → **118 px** | 2 → **1** |
| 768 px | actor | 160 → **166 px** | 3 → **2** |
| 1366 px | visitante | 64 → 64 px | 1 → 1 |
| 1366 px | actor | 64 → 64 px | 1 → 1 |

Sin desbordamiento horizontal en ninguno de los seis casos.

**A 1366 px no cambia nada**, que era lo que había que comprobar: es el ancho que la sección
2 bis costó y el que la sección 3 mide. El menú de un actor pide ahora 1.320 px para caber
en una fila y el de un visitante 907; antes eran 1.234 y 821.

**A 360 px tampoco cambia el número de filas.** La cabecera de un teléfono ya ocupaba dos
antes de esto: con un solo logotipo la marca medía 217 px y el botón «Menú» pedía 100, que
con los 16 de separación son 333 sobre los 328 disponibles. Se quedaba a cinco píxeles. Lo
que sí cambia es dónde queda el botón: antes caía pegado a la izquierda, debajo de los
logotipos, como si se hubiera descolgado; ahora un margen automático lo lleva al borde
derecho, que es donde se busca un menú.

### El enlace al inicio

Dejó de ser la marca entera y pasó a ser **el nombre del sitio**. Los logotipos ya no están
dentro del enlace, y cada uno conserva su `alt` con el nombre de la institución: son la
atribución académica del trabajo, no adorno. El motivo está en
[`docs/09` §3](09-navegacion-e-inicio.md).

### Lo que queda anotado

El logotipo de la UAEMex es un SVG de **365 KB** —130 KB comprimido— para dibujar 28 px de
alto: es un trazado automático de 820 recorridos. Comprimido contra comprimido son **once
veces la hoja de estilos entera del proyecto**, y viaja en la cabecera de todas las vistas.

RNF-04 pide que la vista principal cargue en **menos de tres segundos en conexión 4G**, así
que esto no es un detalle estético. No se toca aquí porque no es un defecto de diseño
responsive y porque sustituir el archivo de una marca institucional no es una decisión de
maquetación; queda anotado como lo primero que hay que aligerar, y el sitio natural para
hacerlo es [HU-33](https://github.com/Petulio14/hub-cultural-santa-marta/issues/33), que
vuelve sobre esta misma cabecera.

## 2 quater. El fondo de las vistas (19/09/2026)

Tres vistas dejan de tener el fondo de arena liso y pasan a tener una imagen **nítida pero
muy clara** por debajo de todo: `/` (inicio), `/actores` y `/mapa`. Las demás se quedan
como estaban. Lo que se cambia respecto de lo especificado en
[`docs/05` §4 bis](05-prototipo-interfaz.md) está anotado allí.

La capa es `position: fixed` y no un `background` del `body`. Dos motivos: el body mide lo
que mide el contenido, así que en una vista larga la imagen se estiraría o se repetiría; y
`background-attachment: fixed`, que sería la forma de evitarlo, es justo lo que los
navegadores de iOS pintan a tirones al desplazar.

### Primero desenfocada, y no se veía

La primera versión (PR #97) desenfocaba la imagen hasta dejarla en manchas de color. Al
verla publicada el autor la descartó: *las imágenes no se ven*. Y era cierto; a esa
intensidad lo que quedaba era un degradado cálido, no una escena. Se sustituye por la
imagen nítida y desvanecida, que es lo que se pedía.

### Nítida cambia el problema del contraste

Desenfocada, cada píxel era el promedio de sus vecinos y los oscuros se diluían. Nítida no:
**las tres imágenes tienen píxeles negros puros**, `#000000`, en pelo, sombras y contornos.
El texto tiene que leerse también encima de ellos, así que lo que decide cuánto se puede
ver la imagen es ese píxel.

Y hay un segundo factor que solo aparece midiendo el archivo real: la compresión JPEG deja
**halos más oscuros alrededor de los bordes nítidos**. Un negro desvanecido al 15 % debería
quedarse en `#d2cec9`; en el archivo comprimido aparecía `#c7c2bc`. Una medición que
simulase el desvanecido sin comprimir habría dado por bueno un fondo que no lo es.

Medido sobre los tres archivos ya comprimidos, con el enlace (`--turquesa-oscuro`), que es
el color más justo de los que caen encima:

| Imagen visible | Peor contraste del enlace | Peso de las tres |
| --- | --- | --- |
| 15 % | **4,22 : 1** ✗ | 321 KB |
| 13 % | 4,57 : 1 | 289 KB |
| **12 %** | **4,71 : 1** | **273 KB** |

Se queda en **12 %**. El 13 % pasa, pero por cinco centésimas, y un límite no es un margen.
Subir la calidad del JPEG apenas mueve el número —4,73 en lugar de 4,71 al 12 %— y cuesta
un 45 % más de peso: lo que manda es cuánto se ve la imagen.

### El desvanecido va dentro del archivo

[`herramientas/preparar-fondos.py`](../herramientas/preparar-fondos.py) reduce cada original
a 1600 px, lo funde con el color de arena dejando visible el 12 % y lo guarda en JPEG. No se
hace con un velo de CSS encima por peso: una imagen con tan poco contraste interno comprime
mucho mejor.

| Imagen | Original | Nítida a todo color | Servida, ya desvanecida |
| --- | --- | --- | --- |
| `fondo-inicio.jpg` | 2,70 MB | 269 KB | **86 KB** |
| `fondo-actores.jpg` | 2,80 MB | 282 KB | **83 KB** |
| `fondo-mapa.jpg` | 3,25 MB | 355 KB | **105 KB** |

Cada vista descarga solo la suya. Los originales viven en `recursos/fondos/`, fuera de
`public/`: todo lo que hay en esa carpeta se copia a `dist/` y se publica.

El color de arena **no se escribe en el guion**: lo lee de `src/styles/variables.css`. Si
`--arena` cambia, basta con volver a ejecutarlo; la regla de que ningún color se escribe
fuera de la paleta se mantiene también aquí.

### El contraste, medido sobre lo que se sirve

[`herramientas/medir-fondos.py`](../herramientas/medir-fondos.py) abre los tres `fondo-*.jpg`
tal como se publican y busca el **peor píxel de las tres**, que resulta ser `#d5ccc3`. No
simula nada y no mira dónde cae el texto: mira el peor sitio donde podría caer.

| Color de texto | Sobre el peor píxel | WCAG 4,5 : 1 |
| --- | --- | --- |
| `--turquesa-oscuro` (enlaces) | 4,71 : 1 | pasa |
| `--gris-texto` | 6,70 : 1 | pasa |
| `--negro-texto` | 11,26 : 1 | pasa |

Esos tres son los que **de verdad** caen sobre el fondo. Recorriendo las tres vistas en el
navegador y quedándose con los elementos cuyo fondo heredado es la página, no aparece
ningún otro color:

```
/         negro-texto 25,6px/700  ← «Cuatro formas de empezar»
/actores  negro-texto 36px/700 · gris-texto 16px/400 · negro-texto 16px/600
/mapa     negro-texto 36px/700 · gris-texto 16px/400 · negro-texto 16px/600
          turquesa-oscuro 16px/600  ← el enlace «catálogo» del recuento
```

**`--terracota` no está en la tabla y es a propósito:** solo se usa en avisos y errores, y
todos van dentro de una caja blanca. Si algún día un texto en terracota queda sobre el
fondo, hay que añadirlo al guion y volver a medir; está escrito en su cabecera para que no
dependa de acordarse.

### Lo que el contraste no mide

La razón de WCAG compara dos colores; no sabe si detrás del texto hay una superficie lisa o
una escena con bordes. Una imagen nítida, aunque sea muy clara, **compite** con la letra de
una forma que un degradado no hacía. En el mapa se nota más: la ilustración trae escrito su
propio rótulo «SANTA MARTA» y queda detrás del título de la vista. El título se lee —es
negro, grande y está a 11,26 : 1 en el peor punto—, pero es texto sobre texto, y cualquier
revisión de legibilidad de HU-32 debería mirarlo con ojos y no solo con el guion.

### Una trampa del servidor de desarrollo

Al reescribir `Fondo.css` con el servidor en marcha, Vite siguió sirviendo la hoja
**vacía**: la capa existía pero sin posición ni tamaño, y el fondo parecía no funcionar. No
era el CSS, era la caché; se arregla reiniciando `npm run dev`. Se anota porque la primera
sospecha fue la opacidad, y se habría corregido algo que estaba bien.

## 3. Verificación en los tres anchos

Recorriendo las nueve direcciones públicas del enrutador en cada ancho:

```
── 360 movil · 360px          ── 768 tableta · 768px        ── 1366 escritorio · 1366px
desborde maximo: 0 px         desborde maximo: 0 px         desborde maximo: 0 px
elementos bajo 44x44: 0       elementos bajo 44x44: 0       elementos bajo 44x44: 0
menu: compacto                menu: completo                menu: completo
```

Las tres comprobaciones, con detalle:

| Comprobación | 360 | 768 | 1366 |
| --- | --- | --- | --- |
| Desbordamiento horizontal (RNF-03) | 0 px | 0 px | 0 px |
| Elementos interactivos visibles bajo 44 × 44 px | 0 | 0 | 0 |
| Menú | compacto | completo | completo |
| Accesos de la página de inicio | 1 columna | 2 columnas | 4 columnas |
| Separación entre tarjetas | 16 px | 18 px | 20 px |
| Tarjetas de una misma fila | 92 px, iguales | 92 px, iguales | 92 px, iguales |

La última fila es el defecto que el asesor señaló en el prototipo y que costó dos
correcciones en Figma. En CSS lo resuelve la rejilla, que estira cada elemento a la altura
de su fila; y la separación entre filas es la misma que entre columnas porque `gap` no
distingue una de otra, que es justo lo que en la API de Figma sí había que declarar aparte.

## 4. Cómo repetir la medición

La verificación se ejecuta desde la consola del navegador sobre `npm run dev`. Recorre las
rutas, mide el desbordamiento y localiza los elementos interactivos por debajo del umbral
de toque:

```js
const rutas = ['/', '/eventos', '/eventos/abc', '/actores', '/actores/abc',
               '/hubs', '/mapa', '/ingreso', '/no-existe'];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

for (const ruta of rutas) {
  history.pushState({}, '', ruta);
  window.dispatchEvent(new PopStateEvent('popstate'));
  await esperar(60);

  const desborde = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
  const pequenos = [...document.querySelectorAll('a, button, input, select, textarea')]
    .filter((e) => e.offsetParent !== null)
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width < 44 || r.height < 44;
    });

  console.log(ruta, 'desborde', desborde, 'px ·', pequenos.length, 'elementos pequeños');
}
```

Hay que ejecutarla en cada ancho, con el navegador redimensionado a 360, 768 y 1366 px. Se
repetirá en **HU-33**, cuando las vistas tengan contenido real: un texto largo o una imagen
sin límite de ancho son las causas habituales de que aparezca un desbordamiento donde antes
no lo había.

## 5. Lo que aún no se puede verificar

Las vistas de este sprint tienen poco contenido. La medición dice que **la estructura**
—cabecera, menú, rejilla de accesos, pie— se adapta correctamente, no que la aplicación
terminada lo haga. Los elementos que históricamente rompen el diseño responsive todavía no
existen: la tabla del panel de administración, los campos de fecha del catálogo, el mapa y
las imágenes cargadas por los actores culturales. Cada uno llega con su historia y HU-33
cierra la comprobación sobre el conjunto.

## 6. Cierre de HU-10

| Criterio de aceptación | Evidencia |
| --- | --- |
| A 360, 768 y 1366 px el contenido permanece legible y **sin desbordamiento horizontal**. | Sección 3: 0 px en los tres anchos, sobre las nueve rutas públicas. |
| Por debajo de **768 px** el menú se presenta en su versión compacta. | Sección 2, comprobado además en el píxel exacto del punto de corte. Corregido en la sección 2 bis para el menú de un actor, que no se había medido. |
| En móvil, el área de toque no baja de **44 × 44 px**. | Sección 3: ningún elemento interactivo visible por debajo del umbral. |

---

*Elaboración propia (2026).*

* Juan Pablo Vasquez 
Se realizan pruebas de la plataforma en diferentes tamaños de pantalla, verificando su funcionamiento en computador, tablet y celular. Se comprobó que el contenido se adapta correctamente sin generar desplazamiento horizontal, que el menú cambia a su versión compacta en móvil y que los botones y elementos interactivos mantienen un tamaño adecuado para su uso táctil.
Los criterios de aceptación se cumplen .

se anexan las respectivas evidencias de los criteriores a analizar

