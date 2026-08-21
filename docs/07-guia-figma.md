# Guía de construcción del prototipo en Figma

> **Historia:** HU-06 · Sprint 2
> **Requisitos:** RNF-01, RNF-03, RNF-07

Todas las decisiones de diseño ya están tomadas y verificadas en
[`05-prototipo-interfaz.md`](05-prototipo-interfaz.md) y en la maqueta
[`prototipo/index.html`](prototipo/index.html). Esta guía es solo la traducción a Figma:
qué crear, con qué valores y en qué orden. **No hay nada que decidir mientras se sigue.**

> ⚡ **Vía rápida: no hace falta construirlo a mano.**
> [`../figma-plugin/`](../figma-plugin/) contiene un plugin que crea los estilos, los
> componentes, las 27 pantallas y los 151 enlaces de navegación de una sola pasada. Se
> importa desde *Plugins → Development → Import plugin from manifest…* y se pulsa
> **Construir**. Instrucciones en [`../figma-plugin/README.md`](../figma-plugin/README.md).
>
> Esta guía sigue siendo la referencia de **qué valor lleva cada cosa**: el plugin la
> implementa, y sirve para revisar o retocar a mano lo que el plugin genere.

Ten la maqueta abierta al lado mientras construyes: es la referencia visual exacta y ya
tiene el contenido cultural redactado, así que los textos se copian de ahí y no hay que
inventarlos.

Tiempo estimado: **4 a 5 horas** repartibles entre los dos.

---

## Paso 0 · Crear el archivo y las páginas

Archivo nuevo llamado **`Hub Cultural Santa Marta — Prototipo`**, con cuatro páginas:

| Página | Contenido |
| --- | --- |
| `🎨 Estilos` | Paleta, tipografías y rejillas. Se construye primero. |
| `🧩 Componentes` | Botones, campos, tarjetas, insignias, chips. |
| `📱 Vistas` | Las 7 vistas obligatorias en los 3 anchos. |
| `🔗 Flujo` | Los enlaces de navegación entre pantallas. |

---

## Paso 1 · Estilos de color

En la página `🎨 Estilos`, dibuja un rectángulo por color, aplícale el valor y guárdalo como
**estilo de color** con el nombre exacto de la tabla. Usar los nombres tal cual importa:
cuando haya que cambiar un tono, se cambia el estilo y se propaga solo.

| Nombre del estilo | Hex | Uso |
| --- | --- | --- |
| `marca/azul-profundo` | `#0B3C5D` | Encabezado, pie, títulos de cifras |
| `marca/turquesa-oscuro` | `#0A5F5E` | Acción principal: botones, enlaces, foco |
| `marca/turquesa` | `#0E7C7B` | Acentos y fondos de estado |
| `estado/terracota` | `#B04A2F` | Error y publicación devuelta |
| `estado/ocre` | `#8A5A17` | Pendiente de aprobación |
| `fondo/arena` | `#F7F3EC` | Fondo de página |
| `fondo/blanco` | `#FFFFFF` | Tarjetas y formularios |
| `texto/negro` | `#14181C` | Títulos |
| `texto/cuerpo` | `#3A3F45` | Párrafos |
| `texto/apagado` | `#5C666F` | Metadatos y pistas de campo |
| `linea/borde` | `#D5CFC4` | Bordes y separadores |

Y los seis tintes de categoría, que solo se usan en las miniaturas y los marcadores del mapa:

| Nombre | Hex |
| --- | --- |
| `categoria/musica` | `#B04A2F` |
| `categoria/saberes` | `#8A5A17` |
| `categoria/patrimonio` | `#0B3C5D` |
| `categoria/gastronomia` | `#0A5F5E` |
| `categoria/artes` | `#0E7C7B` |
| `categoria/artesania` | `#6E4A2E` |

> Los contrastes de todos estos pares ya están calculados y superan 4,5 : 1
> (`05-prototipo-interfaz.md` §3). **No sustituyas ningún tono por otro más claro** sin
> recalcular: es el tercer criterio de aceptación de HU-06 y se vuelve a verificar en HU-32.

---

## Paso 2 · Estilos de texto

Las tres familias están en el catálogo de Figma; no hay que instalar nada. Guarda cada fila
como **estilo de texto** con su nombre.

| Nombre del estilo | Familia | Tamaño | Grosor | Interlineado | Notas |
| --- | --- | --- | --- | --- | --- |
| `titulo/h1-movil` | Archivo | 26 | 700 | 115 % | |
| `titulo/h1-escritorio` | Archivo | 32 | 700 | 115 % | desde 768 px |
| `titulo/h2-movil` | Archivo | 19 | 600 | 130 % | |
| `titulo/h2-escritorio` | Archivo | 21 | 600 | 130 % | desde 768 px |
| `titulo/h3` | Archivo | 16 | 600 | 130 % | título de tarjeta: 16,5 |
| `cuerpo/normal` | Source Sans 3 | 15 | 400 | 150 % | texto por defecto |
| `cuerpo/fuerte` | Source Sans 3 | 15 | 600 | 150 % | |
| `cuerpo/pequeno` | Source Sans 3 | 13,5 | 400 | 145 % | descripciones de tarjeta |
| `cuerpo/meta` | Source Sans 3 | 13 | 400 | 140 % | fecha, lugar, categoría |
| `cuerpo/pista` | Source Sans 3 | 12,5 | 400 | 140 % | ayudas de campo |
| `etiqueta/eyebrow` | IBM Plex Mono | 10,5 | 500 | 140 % | MAYÚSCULAS, tracking 10 % |
| `etiqueta/dato` | IBM Plex Mono | 12,5 | 400 | 140 % | coordenadas, contadores |

Los títulos llevan **tracking −1,5 %**; el `eyebrow` va en mayúsculas con tracking +10 %.
Ningún texto de contenido baja de 14 px salvo los metadatos, que es lo permitido.

---

## Paso 3 · Rejillas de columna

Tres estilos de rejilla, uno por ancho de RNF-03:

| Estilo | Ancho del marco | Columnas | Margen | Canal |
| --- | --- | --- | --- | --- |
| `rejilla/360` | 360 | 4 | 16 | 16 |
| `rejilla/768` | 768 | 8 | 24 | 18 |
| `rejilla/1366` | 1366 | 12 | 32 | 20 |

Espaciado base **8 px**: todos los márgenes y separaciones son múltiplos de 8, salvo los
internos de los controles (10, 11, 14) que vienen de la altura de toque.

Radios: **8** en tarjetas, mapas y paneles; **5** en botones y campos; **99** en chips e
insignias de estado.

---

## Paso 4 · Componentes

Constrúyelos en `🧩 Componentes` **antes que las vistas**. Cada uno con `Auto Layout`, para
que al cambiarlo cambien las siete vistas a la vez.

> El plugin crea como conjuntos de componentes con variantes los cuatro que se repiten
> idénticos: **Boton**, **Insignia**, **Chip** y **Campo**. **Tarjeta**, **Cabecera** y
> **Pie** los genera como frames, porque su composición cambia con el ancho y un componente
> con tres variantes de tamaño estorba más de lo que ayuda. Si los quieres como
> componentes, `Ctrl+Alt+K` sobre uno de ellos.

| Componente | Variantes | Medidas clave |
| --- | --- | --- |
| `Boton` | `principal`, `secundario`, `riesgo` × `normal`, `pequeño` × `activo`, `deshabilitado` | normal: alto mínimo 44, relleno 11 × 20, texto 15/600. pequeño: 13,5, relleno 8 × 14, alto 36 — **44 en móvil** |
| `Campo` | `normal`, `error`, `con-pista` | alto mínimo 44, relleno 10 × 12, borde 1,5 `linea/borde`, radio 5. En error el borde pasa a `estado/terracota` |
| `Tarjeta` | una sola | radio 8, borde 1 `linea/borde`, fondo `fondo/blanco`. Miniatura en proporción 16 : 10 |
| `Insignia` | `pendiente`, `aprobado`, `devuelto` | radio 99, relleno 3 × 9, texto 12/600, punto de 6 px a la izquierda **y texto siempre visible** |
| `Chip` | `normal`, `activo`, `removible` | radio 99, alto 32 — **44 en móvil**, texto 13 |
| `Cabecera` | `movil`, `escritorio` | fondo `marca/azul-profundo`, relleno 14 × 20. En móvil hamburguesa de 44 × 44; desde 768 menú horizontal |
| `Pie` | una sola | fondo `marca/azul-profundo`, relleno 18 × 20, texto 13 |

> **La insignia de estado nunca comunica solo con color.** Lleva siempre su texto
> (`Pendiente`, `Aprobado`, `Devuelto`). Es un requisito de accesibilidad, no una
> preferencia estética.

### Regla de las áreas de toque

En los marcos de 360 px, **ningún elemento interactivo baja de 44 × 44**. Esto ya falló una
vez en la maqueta —los chips de filtro y la paginación se quedaban en 32 y 40— y es el
criterio de aceptación de HU-10. Al construir las variantes móviles, mide.

---

## Paso 5 · Las vistas

Un marco por vista y por ancho. Las 7 obligatorias dan **21 marcos**; el plugin construye
además V-8 y V-9, con lo que quedan **27**. Nómbralos `V-1 · Inicio · 360` y así.
Aplica a cada uno su estilo de rejilla.

Orden de construcción, elegido para que cada vista reutilice lo de la anterior:

| # | Vista | Qué trae de nuevo | Referencia en la maqueta |
| --- | --- | --- | --- |
| 1 | **V-1 Inicio** | Héroe, los cuatro accesos, rejilla de tarjetas | `#v1` |
| 2 | **V-2 Catálogo** | Barra de filtros, chips activos, paginación, estado vacío | `#v2` |
| 3 | **V-3 Detalle** | Disposición a dos columnas, mapa reducido, panel del actor | `#v3` |
| 4 | **V-4 Perfil de actor** | Cabecera de perfil con retrato | `#v4` |
| 5 | **V-5 Directorio de hubs** | Lista con líneas de trabajo como etiquetas | `#v5` |
| 6 | **V-6 Mapa** | Mapa a altura útil, marcadores, ficha emergente | `#v6` |
| 7 | **V-7 Panel de administración** | Pestañas, tabla, cifras, barras de indicadores | `#v7` |

Dos vistas de soporte, opcionales para cerrar HU-06 pero necesarias antes del Sprint 4:
**V-8 Ingreso y registro** (`#v8`) y **V-9 Mis publicaciones** (`#v9`).

### Lo que cambia entre anchos

| | 360 | 768 | 1366 |
| --- | --- | --- | --- |
| Menú | hamburguesa | horizontal | horizontal |
| Accesos del inicio | 2 columnas | 4 | 4 |
| Tarjetas por fila | 1 | 2 | 3 |
| Filtros del catálogo | apilados | 4 columnas | 4 columnas |
| Detalle de evento | 1 columna | 1 columna | 2 columnas (1,55 : 1) |
| Tabla del panel | **tarjetas apiladas** con la etiqueta de cada dato | tabla | tabla |
| Retrato del perfil | ancho completo | 168 px fijos | 168 px fijos |
| Mapa | alto 340 | 440 | 440 |

La tabla del panel es el caso que más se olvida: en móvil **no** es una tabla con desbordamiento
lateral, sino una tarjeta por fila con cada dato etiquetado. Míralo en la maqueta poniendo
V-7 a 360.

### Textos

Cópialos de la maqueta. Ya están escritos con contenido cultural real de Santa Marta —taller
de tejido en Bonda, cumbia en el Parque de los Novios, ruta del cacao en Minca— y con los
mensajes de error redactados. **No uses texto de relleno:** el prototipo se presenta al asesor
y en la prueba de usabilidad, y el contenido falso distorsiona lo que la gente entiende.

---

## Paso 6 · Hacerlo navegable

El segundo criterio de aceptación pide que el prototipo sea **navegable entre pantallas
mediante enlaces**. En el modo *Prototype*, con los marcos de 1366:

| Desde | Elemento | Hacia |
| --- | --- | --- |
| V-1 | cada uno de los 4 accesos | V-2, V-4, V-5, V-6 |
| V-1 | menú superior | V-2, V-4, V-5, V-6 |
| V-2 | una tarjeta del catálogo | V-3 |
| V-3 | «Volver al catálogo» | V-2 |
| V-3 | nombre del actor / «Ver perfil completo» | V-4 |
| V-3 | mapa reducido | V-6 |
| V-4 | una publicación del listado | V-3 |
| V-5 | «Ver en el mapa» | V-6 |
| V-6 | «Ver detalle» de la ficha | V-3 |
| todas | logotipo y enlace del pie | V-1 |
| V-1 | «Ingresar» | V-8 |
| V-8 | «Crear cuenta» | V-9 |
| V-8 | «Entrar como actor cultural» | V-9 |
| V-8 | «Entrar como administrador» | **V-7** |

V-7 es la única vista con rol restringido y por tanto la única que no cuelga de la
navegación pública. Si no se enlaza desde el ingreso, se queda construida pero sin
ninguna vía de entrada; es exactamente lo que ocurrió en la revisión del 21/08/2026.

Transición **Instant** en todos. Una animación aquí no aporta nada y ralentiza la revisión.

Comprueba después dos cosas, no una:

1. Lo que exige HU-09: **desde cualquier vista interna tiene que haber siempre un camino
   visible de vuelta al inicio**. Recorre las siete y verifícalo.
2. Lo contrario: **que a cada vista se pueda llegar desde Inicio**. El plugin lo audita
   recorriendo el grafo de enlaces, pero si construyes a mano hay que comprobarlo a mano.

---

## Paso 7 · Presentar y registrar

1. *Share* → **Anyone with the link → can view**. Copia el enlace.
2. Pégalo en la §7 de [`05-prototipo-interfaz.md`](05-prototipo-interfaz.md) y en el issue
   [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6).
3. Preséntalo en la Sprint Review y **anota la retroalimentación del asesor como comentario
   en el issue**. Ese comentario es el cuarto criterio de aceptación: sin él la historia no
   cierra aunque el archivo esté impecable.

---

## Verificación antes de dar HU-06 por terminada

Las ocho primeras las comprueba el propio plugin y quedaron verificadas en la ejecución
del 20/08/2026, cuyo informe está en el issue [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6).

| # | Comprobación | Estado |
| --- | --- | --- |
| 1 | Existen las 7 vistas obligatorias | ✅ 27 pantallas (9 vistas × 3 anchos) |
| 2 | Cada una en 360, 768 y 1366 | ✅ ancho exacto en las 27 |
| 3 | El prototipo navega entre pantallas | ✅ 130 enlaces conectados |
| 4 | Desde toda vista interna se vuelve al inicio | ✅ enlace en el pie de las 27 |
| 5 | Todo color sale de un estilo, ninguno suelto | ✅ 17 estilos aplicados |
| 6 | En los marcos de 360, ningún control mide menos de 44 × 44 | ✅ ninguno por debajo |
| 7 | Ninguna vista de 360 desborda en horizontal | ✅ ningún desbordamiento |
| 8 | Toda imagen tiene previsto su texto alternativo | ✅ va en el nombre de cada nodo de imagen |
| 9 | Revisión visual: jerarquía, alineación, legibilidad | ⬜ **no la puede hacer el plugin** |
| 10 | Enlace anotado en el issue y en el documento 05 | ✅ |
| 11 | Retroalimentación del asesor registrada en el issue | ⬜ |

**Prototipo navegable en Figma:** https://www.figma.com/proto/wAfJjgLhVl2owhFtxZ2PjN/Hub-Cultural-Santa-Marta-%E2%80%94-Prototipo?node-id=17-10047&starting-point-node-id=17%3A9189&scaling=min-zoom&content-scaling=fixed&t=pbQnxU0nW6OzSUZt-1

---

*Elaboración propia (2026).*
