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
| Por debajo de **768 px** el menú se presenta en su versión compacta. | Sección 2, comprobado además en el píxel exacto del punto de corte. |
| En móvil, el área de toque no baja de **44 × 44 px**. | Sección 3: ningún elemento interactivo visible por debajo del umbral. |

---

*Elaboración propia (2026).*
