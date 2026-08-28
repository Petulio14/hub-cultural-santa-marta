# Situar la publicación en el mapa

> **Dónde acaba viéndose.** El punto que esta historia guarda no se dibujó en ninguna
> parte hasta [HU-28](27-detalle-de-la-publicacion.md), seis historias después: la ficha
> de cada actividad lo enseña en un mapa reducido que **no se toca**, y que comparte con
> este el marcador y las teselas pero nada de su comportamiento
> ([27 §4](27-detalle-de-la-publicacion.md)). Y desde
> [HU-30](29-mapa-interactivo.md) se ve además junto a todos los demás, que es lo
> único que sirve para decidir según dónde se está: **ocho historias** tardó este
> punto en dibujarse en alguna parte.

> **Historia de usuario:** HU-22 · Sprint 5
> **Épica:** E3 — Publicación y moderación de contenido
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-08.
> **Depende de:** HU-21.

Es la primera historia que dibuja un mapa. Hasta aquí, «el mapa» había sido una decisión de
arquitectura (docs/03 §6), un buscador de direcciones que devolvía coordenadas sin
enseñarlas (HU-20) y una clave escrita en nulo esperando a alguien (HU-21). HU-22 junta las
tres.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Al seleccionar un punto en el mapa se capturan y guardan latitud y longitud | `MapaDePunto.jsx` + `eventosService.js` |
| Sin coordenadas se advierte que no aparecerá en el mapa | `FormularioDePublicacion.jsx` |
| El punto guardado se puede modificar | `firestore.rules` + `EditorDePunto.jsx` |

El reparto se parece poco al de HU-21, donde tres de cuatro criterios vivían en las reglas.
Aquí el trabajo está en el navegador, y la razón es simple: **elegir un punto es un gesto**,
y un gesto no se valida en el servidor, se diseña.

---

## 1. Por qué Leaflet a secas

`react-leaflet` es la respuesta habitual y se descartó. Dos razones:

- **Va por detrás de React.** El proyecto está en React 19, y una capa de terceros entre
  React y Leaflet es una dependencia más que puede quedarse sin actualizar en mitad del
  trabajo de grado.
- **Lo que aporta cabe en cincuenta líneas** que hay que entender igual. El envoltorio de
  `src/components/MapaDePunto.jsx` es el mapa entero: crearlo, destruirlo, sincronizar el
  marcador. Si algo falla, el sitio donde mirar es un archivo del repositorio.

Leaflet 1.9.4 no arrastra ninguna dependencia transitiva: `npm install leaflet` añadió
**un** paquete.

### El trato con React

Leaflet manipula el DOM por su cuenta, que es justo lo que React no espera. La frontera es
un solo `div` que React pinta y no vuelve a tocar, con Leaflet mandando dentro.

El mapa y el marcador viven en `useRef`, no en el estado. No son datos que se pinten: son
objetos vivos, y meterlos en `useState` provocaría un repintado por cada arrastre del
ratón.

> **El defecto que StrictMode encuentra y producción no.** En desarrollo, React monta,
> desmonta y vuelve a montar cada componente. Sin el `instancia.remove()` del retorno del
> efecto, el segundo montaje encuentra el contenedor ya inicializado y Leaflet aborta con
> «Map container is already initialized». Se comprobó que **no ocurre** (§8): es el mismo
> tipo de error que solo aparece al volver a entrar en una vista, y en producción se
> manifestaría como un mapa que funciona la primera vez y no la segunda.

---

## 2. El marcador dibujado con CSS

Leaflet trae sus iconos como archivos PNG cuya ruta calcula a partir de la del script. Con
un empaquetador esa ruta deja de existir y **el marcador desaparece sin error en consola**:
el defecto clásico de Leaflet con Vite, que se manifiesta como un mapa correcto en el que
no se ve dónde se hizo clic.

Se usa un `divIcon` —un marcador que es un elemento HTML— y el problema no llega a existir.
De paso resuelve otras dos cosas:

| | Con el PNG de Leaflet | Con el `divIcon` |
| --- | --- | --- |
| Ruta del icono al empaquetar | se rompe en silencio | no hay icono que romper |
| Color | el azul de Leaflet | `--terracota`, de la paleta |
| `npm run verificar` | pasaría, pero el color quedaría fuera de la paleta | el color se escribe en `variables.css` |

La gota se dibuja con un cuadrado al que se le redondean tres esquinas de cuatro y se gira
45°, de modo que la que queda en pico apunte hacia abajo. El anclaje es **la punta, no el
centro**: anclarlo al centro dejaría el punto real 17 px por debajo del sitio señalado, que
a zoom 18 son unos veinte metros de error introducidos por la decoración.

---

## 3. Dos caminos hasta el mismo punto

Hacer clic sobre un mapa es un gesto de ratón, y no hay forma razonable de hacerlo con el
teclado. Por eso el mapa **nunca es la única manera de fijar el punto**:

| Camino | Para qué sirve | Quién lo puede usar |
| --- | --- | --- |
| Buscar el lugar por su nombre | aproximar de un golpe | teclado y ratón (los candidatos son botones) |
| Clic o arrastre sobre el mapa | afinar, y sitios sin nombre | ratón y dedo |

El segundo camino no es un lujo: media agenda cultural de la ciudad ocurre en sitios que no
están cartografiados —una playa, una esquina, un patio— y el buscador ya se sabe que falla
con la nomenclatura de «carrera con calle» (docs/19 §3). Que exista el mapa convierte ese
fallo conocido en algo que se resuelve con el dedo.

El primero tampoco: sin él, quien no pueda usar un ratón no podría situar nada
(WCAG 2.1.1).

### `useBusquedaDeDireccion`

El «pedir, esperar, guardar tres candidatos y traducir el fallo» lo hacían el formulario del
hub y ahora también el de la publicación. Una vez no es duplicación; dos sí, y son dos
sitios donde arreglar el mismo mensaje.

Sube al gancho el comportamiento. **No sube el marcado**, y es deliberado: el hub enseña
candidatos y ya está; la publicación enseña además un mapa, y elegir un candidato allí mueve
la vista del mapa. Compartir la lista habría obligado a parametrizar lo que se pinta hasta
que el parámetro fuera más difícil de leer que las dos versiones.

### Una diferencia con HU-20 que parece un descuido

En el formulario del hub, cambiar la dirección **borra** el punto ya elegido. En el de la
publicación, no. No es un olvido:

| | Hub (HU-20) | Publicación (HU-22) |
| --- | --- | --- |
| De dónde sale el punto | solo del buscador | del buscador **o** del mapa |
| El texto y el punto | el punto se deriva del texto | son dos datos distintos |
| Al cambiar el texto | se borra el punto | se conserva |

Allí, conservar el punto guardaría una dirección con las coordenadas de otra. Aquí, el punto
puede haberse puesto con el dedo sin buscar nada, y borrarlo en cada pulsación de un campo
libre destruiría el trabajo de quien solo estaba corrigiendo una tilde. Lo que sostiene la
coherencia es que **el punto está a la vista**: se ve el marcador y se leen sus coordenadas
debajo. No es estado escondido, así que no hace falta protegerlo borrándolo.

---

## 4. La advertencia que sí se lee

El segundo criterio pide advertir, no prohibir. Una publicación sin coordenadas es
legítima: el modelo la admite desde HU-21 (docs/04 §6), y las hay —un taller en línea, algo
cuyo sitio aún no está cerrado—.

El problema de una advertencia que no detiene nada es que **no se lee**. Aparecería junto al
botón que se acaba de pulsar, en el mismo instante en que la página cambia porque el envío
ya salió.

Así que el primer envío no guarda: enseña el aviso y cambia el texto del botón de «Enviar a
revisión» a «Publicar sin situarla en el mapa». El segundo guarda.

```
[Enviar a revisión]  →  aviso + [Publicar sin situarla en el mapa]  →  guardado
```

Son dos pulsaciones en lugar de una para quien de verdad no quiere poner punto, y ese es el
precio de que la advertencia exista fuera del código. Situar el punto retira el aviso y
devuelve el botón a su texto normal: dejarlo puesto convertiría el botón en «publicar de
todos modos» cuando ya no hay ningún «modo» que salvar.

El aviso va **después** de la validación. Quien tiene además el título vacío arregla eso
primero; recibir las dos cosas a la vez convertiría la advertencia en una más de la lista.

---

## 5. Faltar no es un error (y en el hub sí lo es)

`validarPuntoDePublicacion` devuelve nulo cuando no hay punto. `validarPunto` —la del hub—
devuelve un mensaje. Es la misma comprobación con la respuesta contraria, y conviene
escribir por qué antes de que alguien las unifique «por coherencia»:

- Un **hub** sin punto no tiene sentido: es un espacio físico y su razón de estar en la
  plataforma es que se pueda llegar.
- Una **publicación** sin punto sí lo tiene: se guarda, se modera y se lee en el catálogo.
  Solo que no sale en el mapa.

Lo que sí es un error en los dos casos es un punto **equivocado**. Uno fuera de Santa Marta
no es un descuido de quien publica: es un candidato mal devuelto por el buscador —pedir
«Calle 22» sin acotar encuentra una calle 22 de cualquier ciudad del país— y guardarlo
pondría un marcador creíble y falso en el mapa de HU-30.

Hay una prueba unitaria que lo fija en cada dirección, incluida la del signo: el mismo
número con la longitud en positivo coloca Santa Marta en Somalia.

### El centro del mapa

`CENTRO_SANTA_MARTA` es el centro histórico, no el centro geométrico del rectángulo del
distrito: ese caería en la Sierra, con media pantalla de monte y sin una sola calle
reconocible. Un mapa que abre donde nadie publica obliga a arrastrar antes de poder hacer
nada.

Hay un caso de prueba que comprueba que **no** coincide con el centro geométrico,
precisamente para que quien lo «arregle» calculándolo del rectángulo se encuentre con el
comentario que explica por qué está mal. Y otro que comprueba que cae dentro del rectángulo:
el mapa abre ahí y a la vez impide arrastrar fuera de él, así que un centro exterior haría
que Leaflet abriera peleándose consigo mismo.

---

## 6. Cambiar el punto de algo ya guardado

El tercer criterio es la primera escritura sobre una publicación existente, y ahí apareció
lo que de verdad hacía falta hacer en esta historia.

### El hueco que dejó HU-21

`allow update` sobre `eventos` estaba escrito desde HU-21 y **no tenía un solo caso de
prueba**. HU-21 probó a fondo el nacimiento de una publicación y su lectura —27 casos— y la
edición se quedó descrita en un comentario. Es el mismo patrón que ya mordió dos veces en
este proyecto: HU-10 midió la cabecera de un visitante y nunca la de un actor; HU-18 probó
perfiles que existen y nunca una cuenta recién creada. Lo que no se ejercita, no está
comprobado.

HU-22 añade **12 casos** sobre esa regla.

### El límite que se hereda

La regla de HU-21 exige que lo que se escribe siga siendo `'pendiente'`. Consecuencia: **el
autor no puede mover el punto de una publicación ya aprobada.** No es una decisión de esta
historia, es la anterior actuando, y es correcta —mover el punto de algo que un
administrador aprobó sería cambiar lo aprobado después del visto bueno—.

La interfaz no ofrece el botón en ese caso y lo explica con palabras, en lugar de ofrecerlo
y llevar a un `permission-denied` que no explica nada. Y hay un caso de prueba sobre la
regla, para que si algún día cambia, la interfaz se entere por una prueba en rojo y no por
un usuario.

Quien necesite corregirlo pasa por **HU-23**, que devuelve la publicación a revisión al
editarla. **Ya está hecho**: `actualizarPunto` escribe también el estado, así que mover el
punto de una aprobada se puede y avisa antes de guardar. El límite era del servicio, no
del servidor ([22 §6](22-edicion-y-eliminacion.md)).

### La pregunta que se le hizo al emulador

`toca()` pregunta por `diff().affectedKeys()`. De ahí dependía una afirmación que estuve a
punto de escribir en `eventosService.js`: que reenviar el documento entero sería rechazado
porque tocaría campos prohibidos aunque fuese con el mismo valor.

No estaba comprobado. Podía ser de dos maneras:

| Si `affectedKeys` cuenta… | Entonces reenviar el documento igual… | Y escribir solo el punto es… |
| --- | --- | --- |
| las claves **enviadas** | falla | obligatorio |
| las claves cuyo **valor cambió** | pasa | una economía |

Suponerlo habría sido repetir el error de HU-21 —un caso que pasa por el motivo
equivocado—, así que hay un caso que se lo pregunta al emulador: actualiza `coordenadas` y
reescribe `idActor` con el valor que ya tenía. **Pasa**, así que `affectedKeys` mira los
valores.

El servicio escribe una sola clave de todos modos, pero por la razón verdadera: el documento
lleva dentro la imagen reducida, hasta 120 KB (docs/03 §6.1), y reenviarla en cada ajuste
del marcador serían 120 KB de subida para mover un punto tres metros.

### Por qué el editor no comparte el punto con la lista

`EditorDePunto` guarda el punto en edición en su propio estado y no toca la lista hasta que
se pulsa «Guardar». Quien arrastra el marcador, lo mira y se arrepiente pulsa «Cancelar» y
la publicación sigue como estaba. Con un solo punto compartido, cada arrastre habría sido ya
un cambio y «Cancelar» no tendría a qué volver.

Y se abre **cerrado**. Un mapa por cada publicación de la lista serían tantas instancias de
Leaflet como tarjetas, cada una pidiendo sus teselas al servidor gratuito de OpenStreetMap
nada más entrar en la página, y eso es justo lo que su política de uso pide no hacer.

---

## 7. Cambios en el modelo y en las reglas

**Ninguno en `firestore.rules`.** Es la primera historia del proyecto que no toca las
reglas, y merece decirse: `coordenadas` nació en HU-21 con su comprobación puesta —nula o
`is latlng`— precisamente para que esta historia solo tuviera que rellenarla. La regla ya
estaba, y ahora además está probada.

En el modelo, `eventos.coordenadas` deja de ser siempre nula. La clave sigue estando
**presente siempre**, con punto o sin él, para que el documento no cambie de forma a mitad
de vida.

| Archivo | Cambio |
| --- | --- |
| `src/components/MapaDePunto.jsx` | nuevo · el envoltorio de Leaflet |
| `src/components/MapaDePunto.css` | nuevo · el alto del lienzo y la gota del marcador |
| `src/hooks/useBusquedaDeDireccion.js` | nuevo · la búsqueda que comparten los dos formularios |
| `src/views/MisPublicaciones/UbicacionDeLaPublicacion.jsx` | nuevo · lugar, buscador y mapa |
| `src/views/MisPublicaciones/EditorDePunto.jsx` | nuevo · cambiar el punto de algo ya guardado |
| `src/services/eventosService.js` | `actualizarPunto`, y `coordenadas` se escribe al crear |
| `src/utils/coordenadas.js` | `CENTRO_SANTA_MARTA` |
| `src/utils/validaciones.js` | `validarPuntoDePublicacion` |
| `src/hooks/useMisPublicaciones.js` | `reemplazar` |
| `src/views/MiHub/BuscadorDeDireccion.jsx` | usa el gancho; el marcado no cambia |

---

## 8. Verificación

### Las funciones puras · `npm run probar`

**193 casos, 39 grupos, todos en verde.** Diez son de esta historia: siete sobre
`validarPuntoDePublicacion` y tres sobre el centro del mapa.

### Las reglas · `npm run probar:reglas`

**144 casos**, doce de ellos nuevos, todos sobre `allow update` de `eventos`. Se ejecutan en
la integración continua: el emulador de Firestore no arranca en el equipo de desarrollo
(docs/17 §10). En verde en la ejecución [33101995202](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33101995202), del 27/08/2026, que es también donde se leyó la respuesta sobre `affectedKeys`.

| Qué comprueba | Casos |
| --- | --- |
| Quién puede mover el punto | 4 |
| El límite heredado de HU-21 (aprobada = intocable) | 3 |
| Lo que no se puede colar junto al punto | 4 |
| Si reescribir con el mismo valor cuenta como tocar | 1 |

### En el navegador

El mapa se montó aislado, fuera de la ruta privada, para poder medirlo:

| Comprobación | Resultado |
| --- | --- |
| Teselas de OpenStreetMap | 15 pedidas, 15 cargadas |
| Atribución de la licencia | presente |
| Errores en consola con StrictMode | ninguno (el `remove()` del efecto funciona) |
| Alto del lienzo en escritorio | 422 px |
| Alto del lienzo a 375 px | 322 px, sin desbordamiento horizontal |
| Color del marcador | `rgb(176, 74, 47)` = `--terracota` |
| Punto puesto desde fuera (camino del buscador) | marcador creado y coordenadas leídas |
| Clic sobre el mapa (camino del ratón) | punto capturado dentro del distrito |
| Marcador arrastrable | sí |

### Comprobación en vivo

Sobre el sitio publicado, con sesión de actor cultural. Sin despliegue de reglas previo:
esta historia no las toca (§7).

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 27/08/2026 | «Mis publicaciones» abre con el mapa de Santa Marta ya dibujado | Correcto: teselas cargadas, centrado en el casco histórico |
| 27/08/2026 | Buscar un lugar conocido sitúa el punto y centra el mapa en él | Correcto |
| 27/08/2026 | Buscar un lugar inventado avisa e invita a situarlo a mano | Correcto: el aviso no tiene tono de error, porque no lo es |
| 27/08/2026 | Un clic sobre el mapa coloca el marcador y muestra sus coordenadas | Correcto |
| 27/08/2026 | Arrastrar el marcador cambia las coordenadas al soltarlo | Correcto |
| 27/08/2026 | Enviar el formulario **sin** punto no guarda: advierte y cambia el botón | Correcto: es el segundo criterio, y la primera pulsación no escribe nada |
| 27/08/2026 | La segunda pulsación sí guarda, y la tarjeta dice «Sin situar en el mapa» | Correcto |
| 27/08/2026 | Enviar una publicación **con** punto la guarda con sus coordenadas | Correcto: es el primer criterio, de punta a punta |
| 27/08/2026 | Mover el marcador y pulsar «Cancelar» deja la tarjeta como estaba | Correcto: el editor no comparte el punto con la lista |
| 27/08/2026 | Repetir y pulsar «Guardar el punto» actualiza las coordenadas | Correcto: es el tercer criterio |

Las **diez** pasaron, y los tres criterios de aceptación quedan comprobados en pantalla. Es
la primera historia del proyecto en la que ocurre eso: HU-19, HU-20 y HU-21 dejaron alguna
fila apoyada en los casos de prueba porque miraban algo que todavía no tiene página donde
verse. Aquí no hay ninguna, y la razón es la misma que explica el reparto de la cabecera de
este documento: **elegir un punto es un gesto**, y un gesto ocurre entero delante de quien lo
hace.

Las filas 6 y 7 son un solo envío en dos pulsaciones, y las 9 y 10 la misma acción con final
distinto. Se enumeran por separado a propósito: lo que hay que ver en la 6 y en la 9 es que
**no** pasó nada, y una fila que solo dijera «se guarda el punto» no distinguiría un
«Cancelar» que funciona de uno que no hace nada porque nunca se llegó a cambiar nada.

---

## 9. Lo que queda fuera

| Qué | Dónde va |
| --- | --- |
| Ver todas las publicaciones sobre un mapa | HU-30 |
| Filtrar el mapa por categoría y por cercanía | HU-33 |
| Editar el resto de la publicación, y borrarla | HU-23 |
| Corregir el punto de una publicación ya aprobada | HU-23, que la devuelve a revisión al editarla |
| Que el formulario del hub use este mismo mapa | posible desde ya: `MapaDePunto` no sabe nada de publicaciones (docs/19 §8 lo anticipaba) |

Una nota sobre lo último. `MapaDePunto` se escribió sin ninguna referencia a `eventos`:
recibe un punto y avisa cuando cambia. Adoptarlo en el formulario del hub es cambiar un
componente de sitio, no reescribir nada. No se hizo aquí porque HU-20 está cerrada y
comprobada en vivo, y tocarla obligaría a repetir esa comprobación por una mejora que nadie
ha pedido.

---

*Elaboración propia (2026).*
