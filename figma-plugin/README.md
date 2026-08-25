# Generador del prototipo en Figma

Plugin de desarrollo local que construye el prototipo de HU-06 dentro de un archivo de
Figma: los estilos, los componentes, las 27 pantallas y los enlaces de navegación.

No accede a ninguna red. No necesita cuenta de pago ni permisos especiales.

---

## Antes de la primera ejecución: el logotipo

El plugin no tiene acceso a la red —`networkAccess` está en `none`—, así que el logotipo
del Tecnológico de Antioquia hay que dárselo desde su propia ventana:

1. Abre el plugin y pulsa **Elegir…** junto a *Logo institucional*.
2. Selecciona el PNG o el JPG del logotipo.
3. Queda guardado en el almacenamiento local de tu Figma: **se pide una sola vez** y las
   siguientes ejecuciones lo reutilizan.

Si no se carga, el prototipo se construye igual pero en su lugar aparece un recuadro
punteado que dice «logo pendiente», y el informe lo anota como incidencia. Es a propósito:
un hueco vacío se olvida, un recuadro que dice lo que falta se corrige.

El segundo selector, *Fondo de Santa Marta*, es **opcional**. Sin él se dibuja una
ilustración generada —la Sierra Nevada sobre el Caribe— al 8 % de opacidad. Con una
fotografía cargada se usa esa, al 6 %. La ilustración no exige resolver la licencia de
ninguna imagen, que es la razón de que sea la opción por defecto.

Máximo 900 KB por imagen: por encima de eso el almacenamiento local de Figma la rechaza.

---

## Cómo ejecutarlo

1. Abre **Figma escritorio** (no el navegador: la versión web no permite importar un
   manifiesto local).
2. Crea un archivo nuevo y llámalo `Hub Cultural Santa Marta — Prototipo`.
3. Menú **Plugins → Development → Import plugin from manifest…**
4. Selecciona [`manifest.json`](manifest.json) de esta carpeta.
5. Menú **Plugins → Development → Hub Cultural — Generador de prototipo**.
6. Pulsa **Construir**. Tarda entre unos segundos y un minuto.

Al terminar aparece un informe. **Cópialo con el botón *Copiar informe*** y pégalo en el
issue [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6): es la
evidencia de lo que se construyó y de las comprobaciones que pasó.

Es **re-ejecutable**: al volver a pulsar Construir borra lo que generó antes y lo rehace.
Lo que hayas añadido a mano se conserva, porque solo borra lo que lleva su marca interna.

---

## Qué construye

| | Cantidad | Detalle |
| --- | --- | --- |
| Estilos de color | 17 | 11 de marca y estado + 6 tintes de categoría, con los nombres de `docs/07-guia-figma.md` §1 |
| Estilos de texto | 12 | Archivo, Source Sans 3 e IBM Plex Mono, según §2 |
| Estilos de rejilla | 3 | 360/4/16, 768/8/24, 1366/12/32 |
| Conjuntos de componentes | 4 | `Boton` (3 variantes), `Insignia` (3), `Chip` (2), `Campo` (2) |
| Pantallas | 27 | 9 vistas × 360, 768 y 1366 px |
| Capa de menú | 1 | `Menú de navegación · 360`, que abre el botón compacto del encabezado |
| Enlaces de prototipo | 151 | Navegación completa entre pantallas del mismo ancho |
| Logotipo institucional | 28 | Cabecera de las 27 pantallas y del menú desplegable, sobre placa blanca |
| Fondo de la ciudad | 27 | Sierra Nevada sobre el Caribe, al 8 %, por debajo de todo el contenido |

Se descartan además 11 enlaces que apuntarían a su propia pantalla —la opción activa del
menú y el «volver al inicio» del pie dentro de Inicio—, que Figma rechaza porque el destino
de una navegación tiene que ser **otro** marco de primer nivel. El informe los cuenta
aparte: no son enlaces que falten, son enlaces que no deben existir.

El panel de administración se alcanza desde **V-8 · Ingreso**, con el bloque de *acceso
de demostración*: el prototipo no valida credenciales —eso es HU-12 y HU-15—, así que sin
esos dos accesos la única vista con rol restringido se quedaba fuera del recorrido.

En los anchos de móvil el botón compacto del encabezado abre `Menú de navegación · 360`
como capa superpuesta, con sus cinco opciones enlazadas y un botón de cierre. Si la versión
de la API no admitiera capas superpuestas, el plugin cae automáticamente a una navegación
normal —el menú se ve a pantalla completa— y lo anota en el informe.

Cada pantalla lleva su rejilla aplicada, contenido cultural real de Santa Marta —el mismo
de [`../docs/prototipo/index.html`](../docs/prototipo/index.html)— y la adaptación que
corresponde a su ancho: menú compacto por debajo de 768, tarjetas en 1/2/3 columnas, y la
tabla del panel de administración convertida en tarjetas apiladas en móvil.

### Lo que NO construye como componente

`Tarjeta`, `Cabecera` y `Pie` se generan como frames con auto layout, no como componentes.
Su composición cambia con el ancho, y un componente con tres variantes de tamaño se vuelve
más incómodo de editar que útil. Si los prefieres como componentes, selecciona uno y usa
**Create component** (`Ctrl+Alt+K`); el resto de pantallas no se ve afectado.

---

## El informe

Al terminar, el plugin audita lo que acaba de construir:

- **Pantallas construidas** y si cada una mide exactamente el ancho que le toca.
- **Desbordamiento horizontal**: ningún elemento debe salirse de su pantalla (RNF-03, HU-33).
  Se mide en coordenadas absolutas, no relativas al padre.
- **Área de toque**: en las pantallas de 360 px, ningún control por debajo de 44 × 44 (HU-10).
- **Contenedores con ajuste de línea**: que ninguno haya quedado abrazando su contenido.
  Uno así nunca envuelve —crece en una sola fila y desborda— y es el fallo que produjo la
  primera ejecución real.
- **Enlaces de prototipo**: cuántos se conectaron, y para los que fallen, en qué pantalla
  está el origen, qué nodo es y cuál fue el error exacto.
- **Separación entre filas**: todo contenedor con ajuste de línea tiene que separar sus
  filas, no solo sus columnas. Sin ello las tarjetas se tocan, y a 360 px —una tarjeta por
  fila— la lista entera queda sin aire.
- **Tarjetas desparejas**: en una rejilla de columnas iguales, que no haya dos tarjetas
  de distinta altura en la misma fila.
- **Fondo y logotipo**: que las 27 pantallas lleven fondo y que el logotipo institucional
  sea la imagen real y no el marcador.
- **Pantallas sin camino desde Inicio**: recorre el grafo de enlaces desde V-1 y avisa
  de toda vista a la que no se pueda llegar navegando (HU-09). Una vista puede estar
  impecablemente construida y no tener un solo enlace de entrada: ninguna de las
  comprobaciones anteriores la vería.
- **Fuentes**: si alguna no estuviera disponible, lo dice y sustituye por Inter.

Un informe sin incidencias no significa que el diseño esté aprobado: significa que se
construyó lo que se pidió y que cumple las comprobaciones automatizables. La valoración del
asesor en la Sprint Review sigue siendo el cuarto criterio de aceptación de HU-06.

---

## Si algo falla

| Síntoma | Causa probable |
| --- | --- |
| No aparece *Import plugin from manifest* | Estás en el navegador. Hace falta la aplicación de escritorio. |
| El informe avisa de fuentes sustituidas por Inter | Archivo, Source Sans 3 o IBM Plex Mono no están disponibles en tu cuenta. Búscalas en el selector de fuentes de Figma para que se descarguen y vuelve a ejecutar. |
| «Cannot write to node» o similar | El archivo está abierto en modo solo lectura, o es un archivo de un equipo donde no tienes permiso de edición. |
| Los plugins de desarrollo están deshabilitados | Algunas organizaciones restringen los plugins a una lista aprobada. Prueba en un archivo de tu espacio personal (*Drafts*). |
| El informe dice «logo institucional : NO cargado» | No has usado el selector *Elegir…*, o la imagen no es PNG ni JPG. `createImage` de Figma solo admite mapas de bits: un SVG no sirve. |
| «La imagen pesa N KB» al elegir el archivo | Supera los 900 KB que admite el almacenamiento local. Expórtala más pequeña: para el logotipo bastan unos 600 px de ancho. |

---

## Desarrollo

`code.js` no tiene dependencias ni paso de compilación: es el archivo que Figma ejecuta.

Comprobación de sintaxis:

```bash
node --check figma-plugin/code.js
```

Banco de pruebas: ejecuta el plugin completo contra una API de Figma simulada.

```bash
node figma-plugin/simular.cjs
```

Atrapa métodos inexistentes, propiedades asignadas en el orden equivocado, nodos usados
después de borrarlos y excepciones sin capturar, que es lo que de verdad rompe un plugin.
Imprime el mismo informe que verías en Figma, así que sirve para comprobar un cambio sin
abrir la aplicación. Sale con código distinto de cero si la construcción falla.

La extensión es `.cjs` a propósito: `package.json` declara `"type": "module"` por la
aplicación de React, y el banco de pruebas está escrito en CommonJS porque necesita `vm`
para ejecutar `code.js` tal cual, sin compilarlo. Con `.js` Node lo leería como módulo ES
y fallaría en el primer `require`.

Su motor de disposición no es Figma, pero ya modela lo suficiente para reproducir los
defectos que han ido apareciendo: qué eje es el principal en cada dirección, el relleno y
la separación —las dos, la de dentro de la fila y la de entre filas—, el ajuste de línea,
el reparto del espacio sobrante, el borde interior, el colapso a 1 px de un hijo que
rellena dentro de un contenedor que abraza, los hijos en posición absoluta, el salto de
línea de los textos y la igualación de alturas dentro de una fila. Cada uno se añadió
después de que un defecto real se escapara por no estar modelado.

Lo que **no** comprueba es el aspecto: tipografía real, color, jerarquía. Eso solo lo ve
una persona mirando la pantalla, y es de donde han salido cuatro de los defectos de esta
historia.
