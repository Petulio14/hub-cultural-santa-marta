# El mapa de la oferta cultural

> **Historia de usuario:** HU-30 · Sprint 6
> **Épica:** E5 — Mapa interactivo
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-11, RF-10.
> **Depende de:** HU-22, HU-26.

Cierra el **Sprint 6** y la **épica E5**, la única historia que la compone y la de más peso
del sprint: ocho puntos.

Salda además la otra mitad de la deuda que el Sprint 5 dejó abierta. El punto que HU-22
guarda en cada publicación se enseñaba desde HU-28 **de uno en uno**, en su ficha. Aquí se
ven todos juntos, que es lo único que sirve para decidir según dónde se está.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Un marcador por publicación aprobada con coordenadas | `MapaInteractivo.jsx` |
| Al pulsarlo, una ficha con título, categoría y acceso al detalle | `fichaDelMarcador` |
| El filtro de categoría deja solo esos marcadores | la misma consulta de HU-26 |
| En un teléfono se recorre sin bloquear la página | `MapaDeMarcadores.jsx` |

---

## 1. El cuarto criterio es lo contrario del de HU-28

«Desplazamiento y acercamiento táctil **sin bloquear el desplazamiento de la página**.» Son
dos cosas que se estorban entre sí:

- Si un dedo sobre el mapa lo desplaza, ese mismo dedo ya no desplaza la página, y quien
  solo quería seguir bajando se queda atrapado dentro del mapa.
- Si un dedo sobre el mapa desplaza la página, el mapa no se puede recorrer, que es
  justamente lo que pide la primera mitad del criterio.

[HU-28](27-detalle-de-la-publicacion.md) resolvió su mapa apagando el arrastre en el móvil,
y podía: allí el mapa es un dato más de una ficha que se lee de arriba abajo. Aquí el mapa
**es** la vista, así que apagarlo sería no cumplir el criterio.

La salida es la que usan los mapas incrustados en artículos: **un dedo desplaza la página,
dos mueven el mapa**. Leaflet no lo trae, así que se enciende y se apaga `dragging` según
cuántos dedos haya en la pantalla:

```js
const alCambiarLosDedos = (evento) => {
  if (evento.touches.length > 1) instancia.dragging.enable();
  else instancia.dragging.disable();
};
```

El acercamiento a pellizco no necesita nada: ya son dos dedos por definición, así que
`touchZoom` se queda encendido y el criterio queda cubierto entero.

### Y se dice en pantalla

Un gesto que hay que adivinar es un gesto que nadie hace. Sin el aviso, un mapa que no se
mueve con el dedo **parece roto**, y quien lo pruebe se irá pensando que la plataforma no
funciona en el móvil.

El aviso va **encima** del mapa y no dentro: dentro lo taparía el primer marcador que cayera
ahí, y hay que leerlo antes de tocar.

Solo aparece en el teléfono, porque en el escritorio no hay dedos que contar. Ahí el mapa se
arrastra con el ratón, que es lo que se espera de la vista cuyo contenido principal es el
mapa.

## 2. El tercer mapa, y lo que justifica el archivo compartido

`mapa.js` nació en HU-28, cuando el proyecto pasó de un mapa a dos, con la previsión de que
HU-30 traería el tercero. Aquí está:

| | HU-22 | HU-28 | HU-30 |
| --- | --- | --- | --- |
| Para qué existe | elegir un punto | enseñar uno | recorrerlos todos |
| Marcadores | uno, arrastrable | uno, fijo | muchos, con ficha |
| Clic sobre el mapa | fija el punto | nada | nada |
| Rueda del ratón | acerca | no la captura | acerca |
| Arrastre en móvil | sí | **no** | **sí, con dos dedos** |
| Rol accesible | `application` | `img` | `application` |
| Alto | 320 / 420 px | 240 / 300 px | 60 / 68 dvh |

Los tres comparten el marcador dibujado con CSS, la capa de OpenStreetMap con su atribución
y el rectángulo del distrito. **Ninguna otra cosa.** Un componente configurable que sirviera
para los tres tendría dentro los tres, con banderas para elegir cuál.

### `dvh` y no `vh`

En un móvil la barra del navegador aparece y desaparece al desplazarse, y `vh` mide la
ventana **sin** ella. Con `vh`, el mapa quedaría cortado por abajo justo mientras se
recorre, que es el momento en que se está mirando.

## 3. La ficha del marcador, y por qué no es una cadena de HTML

Leaflet acepta HTML en un globo. Aquí se construye con nodos del DOM, y es una decisión de
**seguridad**, no de estilo.

El título de una publicación lo escribe un actor cultural: es texto de otra persona. Pasarlo
por `innerHTML` convertiría cualquier publicación aprobada en un sitio donde ejecutar
guiones sobre el navegador de quien abre el mapa. Con `textContent` el problema no llega a
existir, porque el texto **nunca se interpreta**.

La moderación de HU-24 no basta como defensa: revisa que la publicación sea apropiada, no
que su título no lleve una etiqueta `<script>`. Y aunque bastara, sería una defensa que
depende de que una persona no se despiste.

### El acceso al detalle es un enlace de verdad

Con su `href`, no un botón. Así se puede abrir en otra pestaña, copiar la dirección o verla
al pasar por encima.

El clic lo intercepta la navegación de React para no recargar la aplicación entera, **pero
solo cuando es un clic normal**: con Ctrl, con Mayús o con el botón central se deja pasar,
que es precisamente como se abre en otra pestaña. Un `preventDefault` incondicional habría
roto ese gesto sin que nada lo delatara.

## 4. El mapa no pagina, y esa es la decisión

Un mapa con la mitad de los marcadores no es medio mapa: **es un mapa que miente** sobre
dónde hay oferta cultural. Alguien lo mira, ve que en su barrio no hay nada y se va.

Así que se piden todas de una vez con un tope de doscientas, igual que hace la búsqueda de
[HU-27](26-busqueda.md) y por la misma razón: una consulta sin límite crece con el catálogo
y cada documento se paga.

`TOPE_DEL_MAPA` y `TOPE_DE_BUSQUEDA` valen lo mismo y son **dos constantes**. No es
duplicación por descuido: responden a criterios distintos y pueden separarse sin que nadie
tenga que averiguar a cuál de las dos vistas le importaba el número.

**No hizo falta tocar el servicio**, por tercera vista consecutiva. Pedir muchas es pedir una
página grande, y `listarPublicacionesAprobadas` ya recibía `tamano` desde HU-25. El
catálogo, la búsqueda y el mapa se construyen los tres sobre la misma función.

## 5. Sin punto no hay marcador, y se dice cuántas faltan

Situar la publicación es opcional desde HU-22, y el primer criterio pide un marcador «por
cada publicación aprobada **con coordenadas registradas**». Las que no lo tienen no salen
aquí.

Callarlo dejaría creer que el mapa enseña toda la oferta, así que el recuento lo dice:

> 2 actividades situadas. Otras 3 están publicadas sin situar y solo aparecen en el
> catálogo.

El descarte ocurre **en memoria**, y no contradice lo que HU-25 dejó escrito. Allí filtrar en
memoria era un defecto porque rompía la paginación —descartar cinco de trece deja una página
de siete—, y aquí no hay paginación que romper. Firestore tampoco sabría hacerlo sin una
desigualdad más y otro índice.

## 6. Un atributo que se acepta y no hace nada

Los marcadores llevan `aria-label` puesto **después** de añadirse al mapa, y no con la
opción `alt` de `L.marker`. La primera versión usaba `alt`, que es lo que sugiere la
documentación de Leaflet.

`alt` solo sirve cuando el icono es una **imagen**. El de este proyecto es un `divIcon`
—elegido en HU-22 porque la ruta de los PNG de Leaflet se rompe al empaquetar
([21 §3](21-georreferenciacion.md))—, y un `div` no tiene `alt`: Leaflet acepta la opción,
no la aplica y no avisa. El marcador se quedaba sin nombre accesible.

Se descubrió mirando el elemento en el navegador, no leyendo el código:

```
atributos: class, title, tabindex=0, role=button, style
```

`aria-label` no estaba. Leaflet sí pone por su cuenta `role="button"` y `tabindex="0"`, así
que los marcadores ya se recorrían con el tabulador y se abrían con Intro; lo único que
faltaba era **qué** anuncia cada uno.

> Es el mismo tipo de defecto que el marcador invisible de HU-22 y que el `+` del `mailto`
> de HU-29: **una opción que se acepta sin efecto**. No hay error en consola, no hay prueba
> que falle, y solo se ve mirando el resultado. Tres historias distintas, el mismo patrón.

## 7. Los marcadores se rehacen enteros

Al cambiar el filtro se vacía el grupo y se vuelve a poblar, en lugar de calcular qué
marcador sobra y cuál falta.

Con doscientos como tope la diferencia no se nota, y la alternativa es un algoritmo de
sincronización que hay que mantener correcto para ahorrar milisegundos que nadie percibe.

El encuadre sí se recalcula: se ajusta a lo que hay, con un tope de acercamiento para que un
solo marcador no lleve el mapa hasta el portal. Dejar fijo el centro del distrito
convertiría tres marcadores del mismo barrio en tres puntos diminutos en una esquina.

## 8. Cambios en el modelo y en las reglas

**Ninguno en `firestore.rules`** —la lectura pública del catálogo ya la sostenía desde
HU-21— y **ninguno en `firestore.indexes.json`**: la consulta del mapa es la de HU-26 con un
`limit` mayor, y el tamaño de página no cambia qué índice hace falta.

Es la segunda historia del sprint que no toca nada del servidor, y por eso tampoco añade
casos a `pruebas/reglas`: no hay ningún permiso nuevo que comprobar, y repetir los de HU-26
con otro `limit` sería inflar la cuenta sin medir nada.

## 9. Verificación

### Las funciones puras · `npm run probar`

**274 casos, 58 grupos.** Ninguno nuevo. Esta historia no añade lógica que decidir: su parte
difícil es el comportamiento de un mapa, que no se prueba con `assert` sino mirándolo, y eso
es lo que hay debajo.

### Las reglas · `npm run probar:reglas`

**216 casos, sin casos nuevos**, y es deliberado (§8). Se ejecutan igualmente, y en
verde, en la
[ejecución 33219927168](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33219927168):
una historia que no añade permisos tiene que dejar intactos los que había.

### En el navegador

Contra los datos reales del proyecto, con los índices ya publicados:

| Comprobación | Resultado |
| --- | --- |
| La ruta `/mapa` deja de ser «en construcción» | Correcto |
| Un marcador por publicación aprobada **y situada** | 2 marcadores, 2 publicaciones vigentes con punto |
| Un solo lienzo con StrictMode | Correcto: el doble montaje no deja un mapa huérfano |
| La ficha del marcador lleva los tres datos del segundo criterio | Categoría «Música», título «manejo de acordeón», y «Ver la actividad» |
| El título de la ficha es un encabezado | `h2` |
| El enlace apunta al detalle | `/eventos/gE7FPuhJcNbHpLh7e5tz` |
| Cada marcador tiene nombre accesible, rol y foco | `aria-label` con el título, `role="button"`, `tabindex="0"` |
| **Filtrar por categoría** (tercer criterio) | 2 → 1 con «Música» → 0 con «Artesanía», con su mensaje → 2 al quitarlo |
| El recuento acompaña al filtro | «1 actividad situada en esta categoría.» |
| Errores en consola | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

#### El cuarto criterio, medido

Emulando un teléfono —agente de Android, 5 puntos táctiles—, `L.Browser.mobile` da
verdadero, el aviso del gesto aparece y los marcadores siguen ahí. El arrastre se comprobó
enviando eventos táctiles reales y leyendo la clase `leaflet-grab`, que Leaflet pone en el
contenedor solo mientras el arrastre está activo:

| Estado | ¿El mapa se arrastra? |
| --- | --- |
| Al cargar | **No** |
| Con **un** dedo en la pantalla | **No** — la página se desplaza |
| Con **dos** dedos | **Sí** |
| Al soltar | **No** |

Es el criterio entero: se recorre y se acerca al tacto, y no bloquea el desplazamiento de la
página.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado, y **la fila del gesto de dos dedos hay que
repetirla en un teléfono de verdad**: lo de arriba es una emulación, y un dedo real tiene
área, temblor y tiempos que un evento sintético no reproduce._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 10. Lo que queda fuera

- **La agrupación de marcadores**, que las notas técnicas de la historia dejaban condicionada a que «la densidad lo exija». No la exige: con el catálogo actual los marcadores se cuentan con los dedos. Añadirla hoy sería meter una dependencia (`leaflet.markercluster`) para resolver un problema que no existe, y el tope de doscientos acota cuánto puede crecer antes de que haga falta. Anotado como trabajo futuro en [02 §6](02-alcance-mvp.md).
- **El filtro por fechas en el mapa.** El tercer criterio pide solo la categoría, y es coherente: el catálogo se lee para decidir *cuándo*, y el mapa se mira para decidir *por dónde*. `filtros.js` ya lo soportaría si algún día se pide.
- **Situarse a uno mismo en el mapa.** Requiere permiso de geolocalización y no lo pide ningún criterio.
- **La optimización final del mapa en móvil** es [HU-33](https://github.com/Petulio14/hub-cultural-santa-marta/issues/33), que es la otra historia que la vista V-6 tenía anotada desde HU-07.
