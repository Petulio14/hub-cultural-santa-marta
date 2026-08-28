# El detalle de una publicación

> **Historia de usuario:** HU-28 · Sprint 6
> **Épica:** E4 — Descubrimiento y contacto
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-09, RF-11.
> **Depende de:** HU-25.

Dos puntos de historia y una vista pequeña, pero es la que **hace pulsable el catálogo**.
HU-25 dejó la tarjeta sin enlazar a propósito, porque el destino era una pantalla «en
construcción» ([24 §7](24-catalogo-publico.md)); el enlace llega con la vista que abre.

También es donde el punto que HU-22 guarda en cada publicación **se dibuja por primera
vez**. Lleva seis historias almacenado sin que nadie lo viera.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Al seleccionarla se abre su ficha con los seis datos | `DetalleEvento.jsx` |
| La ficha da acceso al perfil del actor | `leerActor` + `firestore.rules` |
| Con coordenadas, su ubicación en un mapa reducido | `MapaDeUbicacion.jsx` |

---

## 1. Dos lecturas donde el catálogo hacía una

El documento del evento guarda `idActor` y **nada más** de quien lo publicó: ni su nombre ni
su imagen. El primer criterio pide enseñar el «actor responsable», así que hay que ir a
buscarlo a otra colección.

Se piden en cadena y no en paralelo, por una razón concreta: sin publicación no hay a quién
buscar, y pedir el perfil igualmente sería una lectura pagada para no enseñar nada. Se lee
la publicación, y solo si existe se lee su actor.

Lo que **no** hacen es fallar juntas. Si el perfil no llega, la ficha se pinta igual: lo que
se vino a leer es la actividad.

## 2. La función que HU-25 escribió y borró

`leerPublicacionAprobada` se llegó a escribir en HU-25 y se retiró antes de confirmar, con
la anotación de que la escribiría la historia que la necesitara. Es esta.

Devuelve **null tanto si no existe como si la regla deniega leerla**, que es exactamente lo
que hace `leerActor` desde HU-18 y por el mismo motivo ([17 §10](17-perfil-de-actor.md)): un
identificador de evento es aleatorio, y responder «existe pero no puedes» a unos y «no
existe» a otros convertiría `/eventos/:id` en un detector de publicaciones pendientes. La
vista dice lo mismo en los dos casos, y hay dos casos de prueba que comprueban que el
servidor también.

No pide `aprobado` en ninguna condición, y no hace falta: la regla ya deja leer un evento a
su dueño y al administrador. Un actor que abre el enlace de su propia publicación pendiente
la ve —con un aviso de que nadie más puede—, y el catálogo sigue sin listarla porque eso lo
decide la consulta y no esta lectura.

## 3. Una publicación visible cuyo autor no lo es

Es el caso que esta historia descubrió, y no es hipotético.

Las reglas dejan leer públicamente **solo los perfiles aprobados**. Desactivar una cuenta
(HU-15) no retira las publicaciones que ya estaban aprobadas. Entre las dos cosas queda una
publicación que cualquiera puede leer y cuyo autor no.

| | Publicación | Perfil del actor |
| --- | --- | --- |
| Actor aprobado | visible | visible |
| **Actor desactivado** | **visible** | **denegado** |
| Administrador | visible | visible |

Sin comprobarlo, la vista estaría tratando ese caso «por si acaso». Con los tres casos de
prueba que lo fijan, lo trata porque está demostrado que ocurre.

Lo que hace la ficha entonces es **decirlo y no enlazar**:

> El perfil de quien organiza esta actividad no está disponible en este momento.

Un enlace que lleva a «ese perfil no está disponible» es peor que la frase que lo explica:
promete una página que existe y entrega un callejón.

## 4. El mapa que no se toca

El segundo mapa del proyecto, y el primero que solo se mira. Comparte con el de HU-22 el
marcador, las teselas y el rectángulo del distrito, y **nada de su comportamiento**:

| | `MapaDePunto` (HU-22) | `MapaDeUbicacion` (HU-28) |
| --- | --- | --- |
| Para qué existe | elegir un punto | enseñar uno |
| Abre centrado en | el centro histórico | el punto |
| Acercamiento | 13 | 16 |
| Clic sobre el mapa | fija el punto | nada |
| Marcador | se arrastra | fijo |
| Rueda del ratón | acerca | **no la captura** |
| Arrastre en móvil | sí | **no** |
| Alto | 320 / 420 px | 240 / 300 px |

Son dos componentes y no uno con una bandera porque, quitando lo que comparten, no queda
nada en común. Un componente que sirviera para los dos tendría los dos dentro.

### La rueda y el dedo

Un mapa en mitad de una página que se desplaza y que **se traga la rueda** deja a quien
pasaba de largo dando vueltas sobre Santa Marta. `scrollWheelZoom: false` lo evita, y los
botones de acercar y alejar siguen ahí para quien sí quiera moverlo.

Con el dedo el problema es peor: un arrastre sobre el mapa desplazaría el mapa en lugar de
la página, y la ficha se convierte en una trampa. `dragging: !L.Browser.mobile` es la
comprobación que la propia documentación de Leaflet recomienda para esto.

Anticipa además el cuarto criterio de [HU-30](https://github.com/Petulio14/hub-cultural-santa-marta/issues/30),
que pide exactamente lo contrario para el mapa grande: allí desplazar el mapa **es** lo que
se va a hacer, así que la decisión no se hereda, se toma otra vez.

### Sin coordenadas no hay mapa

Situar la publicación es opcional desde HU-22. Un mapa centrado en el centro histórico para
una actividad que nadie situó **afirmaría algo falso**, así que cuando no hay punto no hay
mapa y se dice por qué. La dirección escrita sigue estando.

### Y el mapa no es la única forma de saber dónde es

El lugar está escrito encima, con su dirección, y las coordenadas van debajo y dentro del
texto alternativo. Un mapa es una imagen: quien no pueda verlo no se queda sin la
información. Es la misma regla que siguió HU-22 con el buscador de direcciones (WCAG 1.1.1),
y por eso este mapa se declara `role="img"` con su etiqueta, en lugar del
`role="application"` del otro, que sí es un control.

## 5. Las piezas del mapa salieron a un archivo aparte

El marcador dibujado con CSS, la capa de OpenStreetMap con su atribución y el rectángulo del
distrito vivían dentro de `MapaDePunto`, que era el único mapa que había. Ahora hay dos y en
HU-30 habrá tres, así que se mudan a `mapa.js`.

Es exactamente lo que hizo HU-20 con los hubs —«las tres piezas que salieron de duplicar»
([19 §2](19-hubs-de-innovacion.md))—, con la diferencia de que aquí se extrae al aparecer el
segundo uso y no al tercero.

La atribución merece una frase: **no es cortesía, es la condición de uso de OpenStreetMap**.
Vive en la pieza compartida para que un mapa nuevo la herede en lugar de tener que
acordarse.

## 6. El enlace es el título, no la tarjeta

En el catálogo, la tarjeta se abre pulsando **el título**, igual que en el directorio de
actores.

Una tarjeta-enlace entera obliga a envolver imagen, categoría, fechas y lugar dentro del
enlace, y entonces un lector de pantalla lee los cinco datos de corrido como el nombre de un
único vínculo. El título dice a dónde lleva.

## 7. Lo que la ficha dice y la tarjeta calla

La tarjeta del catálogo lleva cinco datos y ni uno más ([24 §7](24-catalogo-publico.md)). La
ficha añade lo que allí no cabía:

- **La descripción completa**, con `pre-wrap`, que respeta los saltos de línea que escribió
  quien la publicó sin interpretar nada más de lo que tecleó.
- **El mapa y las coordenadas.**
- **Quién la organiza**, con su imagen, su manifestación y el enlace a su perfil.
- **Que ya terminó**, si terminó. Al catálogo no llega lo que ya pasó, pero un enlace
  guardado o compartido sí llega aquí, y una ficha que calla la fecha pasada hace perder el
  viaje.

## 8. Cambios en el modelo y en las reglas

**Ninguno en `firestore.rules`**, por cuarta historia consecutiva, y **ninguno en
`firestore.indexes.json`**: leer un documento por su identificador no necesita índice.

Lo que se añade son cuatro casos de prueba sobre la combinación de dos reglas que ya
existían por separado (§3).

> **Una cosa que esta vista no hace, y conviene anotar.** El modelo tiene
> `contadorConsultas` y [04 §10](04-modelo-datos.md) declara un índice para ordenar por él,
> los dos pensados para HU-34. La ficha sería el sitio natural para incrementarlo, y **no
> puede**: `allow update` sobre `eventos` exige ser el dueño o el administrador, y un
> visitante no es ninguno de los dos. Quien lo resuelva en HU-34 tendrá que decidir entre
> abrir esa escritura con mucho cuidado o contar las consultas por otra vía. Queda dicho
> aquí para que no se descubra entonces.

## 9. Verificación

### Las funciones puras · `npm run probar`

**263 casos, 56 grupos.** Ninguno nuevo: esta historia no añade lógica que decidir, solo
lecturas y presentación. Inventar casos para inflar la cuenta sería medir la suite y no el
código.

### Las reglas · `npm run probar:reglas`

**204 casos**, siete de ellos nuevos. Todo en verde a la primera en la
[ejecución 33217549509](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33217549509).

| Qué comprueba | Casos |
| --- | --- |
| Las dos lecturas de la ficha: la publicación y el perfil de su actor | 2 |
| Una publicación visible cuyo autor no lo es, y que el administrador sí ve las dos cosas | 3 |
| Una dirección que no lleva a nada responde igual que una pendiente | 2 |

### En el navegador

Sobre una publicación aprobada real del proyecto:

| Comprobación | Resultado |
| --- | --- |
| La ficha se abre por su dirección directa | Correcto |
| Los seis datos del primer criterio | Correcto: imagen, categoría, título, periodo, descripción y lugar |
| El mapa se pinta con el punto guardado | Correcto: `11,24006, -74,20415` |
| Un solo mapa y un solo marcador con StrictMode | Correcto: el doble montaje no deja un mapa huérfano |
| Las teselas de OpenStreetMap cargan, con su atribución | Correcto |
| El mapa se anuncia como imagen, no como control | `role="img"`, con las coordenadas en la etiqueta |
| El enlace al perfil apunta a `/actores/:id` | Correcto |
| «Ya terminó» aparece en una actividad pasada | Correcto |
| Una dirección inventada da «Esa actividad no está disponible» | Correcto, con vuelta al catálogo |
| Errores en consola | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

**Lo que no se pudo medir aquí:** el ancho. El panel del navegador no estaba mostrándose y
la ventana informa 0 px, así que cualquier medida de desbordamiento horizontal sería falsa.
Queda para la pasada en vivo, igual que ocurrió en [22 §9](22-edicion-y-eliminacion.md).

Tampoco se pudieron ver las dos ramas sin datos —una publicación **sin punto** y una **de un
actor desactivado**—, porque no hay ninguna así en el proyecto. Lo que sostiene la segunda
son los casos de reglas de §3; la primera es una condición de tres líneas.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado. **Los cuatro índices de HU-25 y HU-26 siguen
sin publicarse**, comprobado con `firebase firestore:indexes`, así que el catálogo no lista
nada y la ficha solo se alcanza por su dirección directa. La fila que comprueba el enlace
desde la tarjeta necesita ese despliegue._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 10. Lo que queda fuera

- **Los canales de contacto del actor** eran el primer criterio de [HU-29](https://github.com/Petulio14/hub-cultural-santa-marta/issues/29) y ya están ([28](28-contacto-directo.md)): detrás de un botón, solo los que el actor autorizó, y con el mensaje empezado. Cuando el perfil no está disponible tampoco hay botón, que es la consecuencia directa de §3.
- **Contar la consulta** para los indicadores es [HU-34](https://github.com/Petulio14/hub-cultural-santa-marta/issues/34), con el obstáculo que anota §8.
- **Las demás publicaciones del mismo actor**, que serían un buen enlace desde aquí y desde el perfil. No lo pide ningún criterio.
- **El mapa con todas las publicaciones** es [HU-30](https://github.com/Petulio14/hub-cultural-santa-marta/issues/30), y reutilizará las piezas de `mapa.js`.
