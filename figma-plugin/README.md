# Generador del prototipo en Figma

Plugin de desarrollo local que construye el prototipo de HU-06 dentro de un archivo de
Figma: los estilos, los componentes, las 27 pantallas y los enlaces de navegación.

No accede a ninguna red. No necesita cuenta de pago ni permisos especiales.

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
| Enlaces de prototipo | 130 | Navegación completa entre pantallas del mismo ancho |

Los enlaces son 141 menos 11 que apuntarían a su propia pantalla —la opción activa del
menú y el «volver al inicio» del pie dentro de Inicio— y que Figma rechaza porque el
destino de una navegación tiene que ser **otro** marco de primer nivel. El informe los
cuenta aparte: no son enlaces que falten, son enlaces que no deben existir.

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

---

## Desarrollo

`code.js` no tiene dependencias ni paso de compilación: es el archivo que Figma ejecuta.

Comprobación de sintaxis:

```bash
node --check figma-plugin/code.js
```

Banco de pruebas: ejecuta el plugin completo contra una API de Figma simulada.

```bash
node figma-plugin/simular.js
```

No valida el aspecto visual —el simulador no implementa auto layout de verdad— pero atrapa
métodos inexistentes, propiedades asignadas en el orden equivocado, nodos usados después de
borrarlos y excepciones sin capturar, que es lo que de verdad rompe un plugin. Imprime el
mismo informe que verías en Figma, así que sirve para comprobar un cambio sin abrir la
aplicación. Sale con código distinto de cero si la construcción falla.
