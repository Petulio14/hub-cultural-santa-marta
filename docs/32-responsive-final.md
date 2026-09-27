# Optimización final del diseño responsive

> **Historia de usuario:** HU-33 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RNF-03.
> **Depende de:** HU-30.

Tercera historia del **Sprint 7**. Vuelve sobre lo que [HU-10](10-responsive.md) dejó hecho
en el Sprint 3 y lo revisa con las ocho vistas que entonces no existían, a **360 píxeles**,
que es el ancho que pide el criterio y uno más estrecho que los 375 con los que se venía
comprobando.

| Criterio de aceptación | Cómo quedó |
| --- | --- |
| Ninguna vista desborda a 360 px | Ya se cumplía en las siete públicas. Medido y anotado |
| Las tablas del panel, legibles en móvil | **No se cumplía.** Un tercio quedaba fuera, y era la columna de los botones |
| El mapa con una altura útil en móvil | El alto ya era 60 % de la ventana. Lo que fallaba era **dónde empieza** |

---

## 1. Primer criterio · ya se cumplía, y ahora está medido

> Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces
> ninguna debe presentar desbordamiento horizontal.

Las siete vistas públicas a 360 px:

| Vista | `scrollWidth` | `clientWidth` | Desborda |
| --- | --- | --- | --- |
| `/` | 360 | 360 | no |
| `/eventos` | 360 | 360 | no |
| `/actores` | 360 | 360 | no |
| `/hubs` | 360 | 360 | no |
| `/mapa` | 360 | 360 | no |
| `/ingreso` | 360 | 360 | no |
| `/politica-de-datos` | 360 | 360 | no |

No es casualidad y conviene decir por qué, porque es lo que hay que conservar: **todas las
rejillas del proyecto usan `minmax(min(100%, Npx), 1fr)`**. El `min(100%, …)` es lo que
impide que una columna de 280 o 360 px se imponga sobre una pantalla más estrecha que ella;
sin él, `minmax(280px, 1fr)` desborda a 360 en cuanto la caja tiene margen.

El medidor que se escribió para esto no se conforma con comparar los dos anchos: recorre
todos los elementos, se queda con los que sobresalen y descarta a los hijos de otro que ya
sobresale, para señalar la caja culpable y no sus veinte descendientes. Aplicado a las siete
vistas devuelve tres cosas, y ninguna es un defecto:

- `a.saltar-al-contenido`, en `left: -9999px`. Es el salto al contenido, escondido a
  propósito hasta que recibe el foco.
- `img.leaflet-tile` y `div.leaflet-marker-icon`, dentro del mapa. El lienzo lleva
  `overflow: hidden`, así que lo que asoma queda recortado y no empuja la página.

**Lo que no se pudo medir en vivo** son las cuatro vistas privadas. Para la del panel se
montó un banco de pruebas con su CSS y su marcado reales, que es de donde salen los números
de la sección siguiente; las otras tres usan las mismas piezas de formulario que `/ingreso`,
ya medida.

---

## 2. Segundo criterio · la tabla se iba por el lado

> Dadas las tablas del panel de administración, cuando se visualicen en móvil, entonces
> deben adaptarse a un formato legible.

Hay una sola tabla en el proyecto, la de categorías del panel. Y conviene empezar por un
detalle de trazabilidad: **la maqueta ya decía que tenía que apilarse**. La verificación
automatizada del prototipo, en [05 §6](05-prototipo-interfaz.md), lleva desde el Sprint 2 una
fila que dice «Tabla del panel como tarjetas apiladas en móvil (HU-33): correcta».

Lo que pasó es que HU-17, que implementó el panel en el Sprint 4, resolvió el ancho de otra
manera, y nadie volvió a comparar con la maqueta. Así que esta sección no es un cambio de
criterio: es el código alcanzando a lo que el prototipo aprobado ya especificaba.

La solución que había era esta:

```css
.categorias {
  display: block;
  width: 100%;
  overflow-x: auto;
}
```

Es decir: la tabla no se encoge, se desplaza de lado dentro de su propia caja. La nota que lo
acompañaba decía que así «se conserva la relación entre la fila y su encabezado».

### Lo que se midió

| A 360 px | Antes |
| --- | --- |
| Ancho de la tabla | **531 px** |
| Ancho de su caja | 326 px |
| Lo que quedaba fuera | 205 px, es decir **la columna «Acciones» entera** |
| `tabIndex` de la caja que se desplaza | **−1** |

Dos cosas, y la segunda es la grave.

La primera es que desplazarse de lado **no es «adaptarse a un formato legible»**, que es lo
que pide el criterio: es conservar el formato de escritorio y pedirle a quien mira una
pantalla de 360 px que lo recorra a trozos. Y lo que quedaba fuera no era un dato accesorio:
eran los dos botones de cada fila.

La segunda es que **una caja que se desplaza tiene que poder recibir el foco**. Sin
`tabindex`, quien navega con teclado no tiene forma de desplazarla, y por tanto no tiene
forma de llegar a esos botones (WCAG 2.1.1). Esto no se dedujo leyendo el CSS: se leyó
`tabIndex` sobre la caja en el navegador, y vale −1.

### Lo que hay ahora

Por debajo de 768 px cada fila se convierte en una tarjeta: el nombre de la categoría la
encabeza y debajo van las publicaciones, el estado y los botones, cada uno con el nombre de
su columna escrito al lado.

| A 360 px | Antes | Después |
| --- | --- | --- |
| Ancho de la tabla | 531 px | **326 px** |
| Desplazamiento lateral | sí | **no** |
| Botones dentro de la pantalla | no | **sí**, el más a la derecha acaba en 273 px |
| Alto de cada botón | 47 px | 47 px (el mínimo de toque de HU-10 son 44) |

A partir de 768 px vuelve a ser una tabla, y **más tabla que antes**: `display: table`,
`table-row` y `table-cell`, comprobado en el navegador. El `display: block` anterior se
aplicaba a todos los anchos, también en escritorio, donde no hacía ninguna falta.

### El precio, dicho

Apilar una tabla con CSS tiene un costo que conviene no esconder: **por debajo de 768 px
esto deja de ser una tabla también para un lector de pantalla**, porque poner `display:
block` sobre las filas y las celdas se lleva por delante sus papeles.

Por eso el rótulo de cada celda es **texto de verdad** dentro de la celda y no un `::before`
con `content`: lo que hay en un pseudoelemento unos lectores lo leen y otros no, y aquí la
diferencia entre leerlo y no leerlo es la diferencia entre «3» y «Publicaciones: 3». Lo que
se pierde en estructura se recupera escrito, y ninguna cifra queda sin decir de qué es.

Son tres `span` ocultos en escritorio. La alternativa —mantener la tabla intacta y envolverla
en una caja con `tabindex="0"` y su nombre— conserva la estructura a todos los anchos y deja
el desplazamiento lateral, que es justo lo que el criterio no quiere.

---

## 3. Tercer criterio · el mapa no era bajo, empezaba tarde

> Dado el mapa, cuando se abra en móvil, entonces debe ocupar una altura útil que permita su
> manipulación.

El lienzo mide **`60dvh`** con un mínimo de 360 px, y `68dvh` a partir de 768. Eso son 384 px
en un teléfono de 640 y 468 en uno de 780: el 60 % de la ventana. Como altura, el criterio
estaba cumplido desde HU-30.

Lo que no estaba bien es dónde empieza. Medido a **360 × 640**, antes de tocar nada:

| Pieza | Alto |
| --- | --- |
| Cabecera | 118 px |
| Aire sobre el título | 24 px |
| Título | 30 + 12 px |
| Presentación | 74 + 16 px |
| Filtro de categoría | 73 + 12 px |
| Recuento de actividades | 74 + 16 px |
| Aviso del gesto de dos dedos | 72 + 10 px |
| **El lienzo empieza en** | **533 px** |

En una pantalla de 640 eso deja **107 px de mapa a la vista** al abrir la página: el 17 % del
alto del lienzo. Se abre el mapa cultural y lo que se ve es una franja.

### Lo que no se podía hacer

Ninguna de esas piezas sobra. El aviso del gesto hay que leerlo **antes** de tocar el mapa,
que es la razón por la que HU-30 lo puso encima y no dentro. El recuento dice cuántas
actividades hay publicadas sin situar, que es lo que explica por qué el mapa enseña menos de
las que trae el catálogo. Y esconder en el teléfono lo que se enseña en el escritorio sería
darle menos a quien ya tiene menos pantalla.

Tampoco se reordenó para subir el mapa por encima del recuento. Se puede hacer con `order`
en una línea de CSS, y habría sido un error: el recuento lleva dentro un enlace al catálogo,
así que el tabulador lo alcanzaría antes de algo que en pantalla está después. Es exactamente
el desajuste entre orden visual y orden de foco que [HU-32](31-accesibilidad.md) acaba de
limpiar en otros sitios.

### Lo que sí

Dejar de gastar en aire y en cuerpo de letra lo que hace falta para el mapa, solo por debajo
de 768 px:

- el aire sobre el título baja de 24 a 16 px, que es la unidad de la rejilla a 360 (y esto lo
  gana **cada vista**, no solo el mapa);
- los márgenes entre las cuatro piezas bajan a 6, 10, 8 y 10;
- la presentación y el recuento pasan a 15 px de cuerpo;
- el aviso del gesto pasa a 14 px y menos relleno: de 72 px a 61, porque a 16 px eran tres
  líneas y a 14 caben en dos. Es el bloque que más ocupaba, y **solo existe en el teléfono**
  —habla del gesto de dos dedos—, así que apretarlo no le quita nada a nadie en escritorio.

### El resultado

| | Empieza en | Alto del lienzo | **Visible al abrir** |
| --- | --- | --- | --- |
| 360 × 640, antes | 533 px | 384 px | **107 px** |
| 360 × 640, después | **480 px** | 384 px | **160 px** (+50 %) |
| 360 × 780, antes | 533 px | 468 px | 247 px |
| 360 × 780, después | **480 px** | 468 px | **300 px** (+21 %) |

En escritorio no cambia nada: comprobado a 1280 px, la presentación sigue a 16 px, el aire
sobre el título sigue en 24 y el lienzo mide 544.

**Lo que queda en pie, dicho con su número:** en una pantalla de 640 px el mapa sigue
necesitando un desplazamiento para verse entero. Con 480 px de cosas encima y 384 de mapa, la
página mide 1240 px y la ventana 640. Eso no lo arregla el espaciado; lo arreglaría quitar
contenido, y ya está dicho por qué no se quita.

### Y de paso, el área de toque que HU-10 contó cuando no había nada que contar

Al recorrer las siete vistas a 360 px se contaron además los elementos interactivos por
debajo de los **44 × 44 px** que HU-10 fijó como área mínima de toque. Salieron ocho.

Esto merece decirse con cuidado, porque [10 §3](10-responsive.md) declara «**0 elementos por
debajo del umbral**» en los tres anchos. Aquel cero era verdad: se midió en el Sprint 3,
cuando las vistas eran marcadores de posición. Hoy tienen tarjetas, enlaces y un mapa.

De los ocho, **seis son enlaces dentro de un texto**: el título de una tarjeta del catálogo,
el nombre de un actor, la palabra «catálogo» del recuento y los dos créditos del mapa. WCAG
2.2 exime expresamente los objetivos que van en una frase o en un bloque de texto —si no,
habría que separar cada enlace de su párrafo— y la regla de HU-10 apuntaba a los controles,
no a la tipografía.

Los otros dos sí eran controles: **los botones de acercar y alejar del mapa, de 30 × 30 px**.
Y son justamente los que el tercer criterio pide que funcionen, porque acercar y alejar es la
mitad de manipular un mapa; con un dedo sobre 30 px se falla, y fallar sobre un mapa
significa arrastrarlo sin querer. Pasan a 44 × 44 por debajo de 768 px, y se quedan en 30 en
escritorio, donde con ratón se aciertan de sobra y agrandarlos taparía mapa.

Eso costó una segunda pasada: la primera regla no ganaba. Leaflet detecta la pantalla táctil,
se pone la clase `.leaflet-touch` y sube sus botones a 30 px con un selector más específico
que el que se había escrito. Se vio midiendo —seguían en 30— y no leyendo el CSS.

---

## 4. Verificación

| Qué | Resultado |
| --- | --- |
| `npm run verificar` | cuatro reglas, sin incidencias |
| `npm run probar` | 300 casos |
| `npm run build` | limpio |
| `python herramientas/medir-contraste.py` | los 21 pares, sin cambios |

En el navegador, a **360 × 640**, **360 × 780**, **900** y **1280 px**:

- las siete vistas públicas, sin desbordamiento horizontal en ninguna;
- la tabla del panel apilada por debajo de 768 y tabla de verdad por encima, con sus botones
  dentro de la pantalla y por encima del área mínima de toque;
- el mapa con el 60 % de la ventana y 160 px visibles al abrir en la pantalla más pequeña;
- sus botones de zoom a 44 × 44 px en el teléfono y a 30 × 30 en escritorio;
- sin errores en consola.

### El banco de pruebas del panel

El panel exige sesión de administrador y el servidor de desarrollo autentica contra el
Firebase real, así que la tabla se midió en un archivo estático que carga **el CSS real del
proyecto** —`variables.css`, `global.css` y `PanelAdministracion.css` sin tocar— con el mismo
marcado que genera `FilaDeCategoria.jsx` y dos filas de ejemplo, una activa y otra retirada.

Lo que se comprueba así es exactamente lo que cambió, que es CSS. Lo que **no** se comprueba
es la vista montada con React y datos de verdad: eso sigue pendiente del recorrido con cuenta
de administrador, igual que en [HU-31](30-validacion-y-errores.md) y
[HU-32](31-accesibilidad.md).

---

## 5. Dos cosas que estaban mal apuntadas a esta historia

Al cerrar HU-31 y HU-32 quedaron dos asuntos anotados «para HU-33». Al llegar aquí no
encajan, y dejarlos apuntados a una historia que no los va a resolver es peor que no
apuntarlos:

- **La escritura sin conexión** ([30 §7](30-validacion-y-errores.md)). Firestore encola las
  escrituras y las resuelve de forma optimista, así que «Guardar» sin red responde que sí. Es
  un defecto de comportamiento, no de diseño adaptable, y **HU-33 es RNF-03**. Su sitio es el
  registro de hallazgos de **HU-35**, cuyo cuarto criterio pide precisamente eso: que todo
  caso fallido quede como hallazgo con su severidad.
- **El aviso de contenido servido desde la caché** ([31 §7](31-accesibilidad.md)). Lo mismo:
  es de la misma familia que el anterior y va al mismo sitio.

### Y una medida que conviene dejar escrita

No es de esta historia —**es RNF-04, tiempo de carga**, cuyas historias (HU-09 y HU-25) están
cerradas— pero se midió al revisar lo que descarga un teléfono:

| Archivo | En disco | Comprimido |
| --- | --- | --- |
| `dist/assets/index-*.js` | 1 098 KB | ~334 KB |
| `public/UAEMex.svg` | 357 KB | **131 KB** |
| `public/UDM.png` | 40 KB | 40 KB |
| `public/logo-tdea.png` | 9 KB | 9 KB |

El escudo de la UAEMex son **820 trazos vectoriales** —ni una imagen incrustada, ni decimales
de más que se puedan recortar— y se dibuja a 24 píxeles de alto. Es el segundo archivo más
pesado del sitio y se descarga en **todas** las páginas.

No se toca aquí, y no por descuido: es una marca institucional y sustituirla o rasterizarla es
una decisión del autor del trabajo, no de quien ajusta el CSS. Queda medido y anotado como
hallazgo para HU-35.

---

## 6. Lo que queda fuera

- **Un teléfono de verdad.** Todo lo de aquí es emulación de viewport. Los `dvh` del mapa
  existen precisamente por algo que solo pasa en un móvil real —la barra del navegador que
  aparece y desaparece— y eso no se puede comprobar emulando.
- **Las tres vistas privadas de formulario** (`MiPerfil`, `MiHub`, `MisPublicaciones`), que
  usan las mismas piezas ya medidas en `/ingreso` pero no se recorrieron enteras.
- **Anchos intermedios poco comunes**, como 320 px. El criterio dice 360 y a 360 se midió.
