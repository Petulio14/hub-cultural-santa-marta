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
