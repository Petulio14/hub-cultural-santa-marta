# Filtrar el catálogo

> **Historia de usuario:** HU-26 · Sprint 6
> **Épica:** E4 — Descubrimiento y contacto
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-10.
> **Depende de:** HU-25.

El catálogo de [HU-25](24-catalogo-publico.md) se recorre entero o no se recorre. Esta
historia lo hace preguntable: por tipo de manifestación y por los días que alguien va a
estar en la ciudad.

Casi todo lo interesante está en la segunda mitad de una sola frase del criterio —«las
publicaciones **vigentes en ese rango**»— y en lo que cuesta que sea verdad.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Filtrar por categoría muestra solo esa categoría | `eventosService.js`, en el servidor |
| Filtrar por fechas muestra solo lo vigente en el rango | `filtros.js` + tres índices compuestos |
| Los dos filtros a la vez satisfacen ambas condiciones | la misma consulta, con dos `where` más |
| Limpiar restituye el catálogo completo | `useCatalogo.js` + `FiltrosDelCatalogo.jsx` |

---

## 1. «Vigente en el rango» no es «empieza en el rango»

Alguien llega el 5 de septiembre y se va el 7. Un festival empezó el 1 y termina el 12.
**¿Lo puede ver?** Sí: está ocurriendo mientras está en la ciudad.

Un filtro que preguntara «¿empieza dentro del rango?» respondería que no. Y es la pregunta
tentadora, porque es **una sola condición sobre un solo campo** y no necesita ningún índice
que el proyecto no tenga ya declarado desde HU-05.

Vigente es un **solapamiento**, y un solapamiento son dos condiciones sobre dos campos:

```
fechaFin    >= el día que llega        (no ha terminado cuando llego)
fechaInicio <= el día que se va        (ya empezó, o empieza, antes de que me vaya)
```

| Actividad | Empieza | Termina | ¿Se solapa con el 5–7? |
| --- | --- | --- | --- |
| Ya pasó | 1 sep | 3 sep | No |
| **Empezó la víspera** | 1 sep | 6 sep | **Sí** |
| Cabe dentro | 6 sep | 6 sep | Sí |
| Empieza el último día | 7 sep | 12 sep | Sí |
| Envuelve la estancia | 1 sep | 30 sep | Sí |
| Todavía no | 10 sep | 11 sep | No |

La segunda fila es la que decide la historia. Elegir la pregunta barata habría sido cumplir
la letra del criterio al precio de su sentido, y no se habría notado nunca: el filtro
devuelve resultados, solo que le falta el festival que estaba ocurriendo.

Hay un caso de prueba escrito **aparte** solo para esa fila, aunque el caso general ya la
cubra, para que si alguien vuelve a la pregunta barata el fallo diga cuál se rompió.

## 2. Dos desigualdades sobre campos distintos

Es lo que Firestore **no admitía** hasta 2024. Hoy lo admite con dos condiciones:

1. Todos los campos con desigualdad tienen que aparecer en el `orderBy`.
2. Tienen que aparecer **antes** que cualquier otro campo del `orderBy`.

De ahí dos consecuencias que se ven en el código:

- `fechaInicio` se suma al orden **solo cuando hay tope superior**. Sin día de salida hay
  una sola desigualdad y el orden sigue siendo el de HU-25.
- El cursor de paginación pasa entonces a tener **tres** valores en lugar de dos.

Los dos salen de la misma lista de campos y no de dos sitios distintos:

```js
const campos = hasta ? ['fechaFin', 'fechaInicio'] : ['fechaFin'];
…
...campos.map((campo) => orderBy(campo)),
orderBy(documentId()),
...(despuesDe ? [startAfter(...campos.map((c) => despuesDe[c]), despuesDe.id)] : []),
```

No es elegancia. Un cursor con menos valores de los que hay órdenes, o en otro orden, **no
devuelve resultados raros: revienta en ejecución**, y desde esta historia la cantidad de
órdenes ya no es fija. Escribir las dos listas por separado es un defecto que se arregla
una vez y vuelve a la siguiente.

### Que Firestore lo admita hoy no es algo que convenga creerse

Es una capacidad reciente, y el sitio se sustenta ante un jurado. Así que se le preguntó al
emulador con seis publicaciones colocadas alrededor de una estancia de tres días —las seis
filas de la tabla de arriba—, y el resultado es la tabla misma, comprobada.

El caso más útil de los seis es el que **quita** el tope superior y comprueba que entonces
la actividad del 10 de septiembre **sí** entra. Sin él, los otros podrían estar pasando por
casualidad: demuestra que la segunda desigualdad hace trabajo.

## 3. La trampa de las fechas, tercera visita

`docs/20` §3 la contó para `datetime-local` y `docs/22` §7 la vio volver al rellenar un
formulario. Aquí vuelve con `<input type="date">`, y **es peor**:

| Texto | Cómo lo interpreta `new Date(texto)` |
| --- | --- |
| `'2026-09-01T18:00'` | Hora **local** — la especificación así lo dice para cadenas sin zona |
| `'2026-09-01'` | **UTC** — las cadenas de solo fecha son instantes UTC |

En Santa Marta (UTC−5) eso significa que `new Date('2026-09-01')` es **el 31 de agosto a
las 19:00**. Un rango «desde el 1 de septiembre» empezaría la víspera, y el filtro
devolvería actividades del día anterior sin que nada lo delatara.

`desdeEntradaDeDia` compone la fecha con el constructor de tres números, que sí es local, y
no pasa nunca por el analizador de cadenas. Hay dos casos que lo comprueban en un proceso
aparte con `TZ=America/Bogota`, y uno de los dos afirma explícitamente que la versión
ingenua da `31`: en UTC los dos pasarían igual, que es justo el motivo de sacarlos de
proceso.

De paso rechaza lo que no existe. `new Date(2026, 1, 31)` no falla: devuelve el 3 de marzo.
Un filtro que acepta el 31 de febrero y busca en marzo es peor que uno que dice que no.

### Un día tiene final

«Hasta el 5 de septiembre» incluye el día 5 **entero**. Con las 00:00 del día 5 como tope,
una actividad que empieza a las 18:00 de ese mismo día quedaría fuera del rango que la
persona acaba de pedir precisamente para incluirla.

Por eso `finDelDia` devuelve las 23:59:59.999 y no las 00:00 del día siguiente: así una
actividad que empieza exactamente a medianoche no se cuela en el rango anterior.

Es el error que no se ve, porque el resultado parece razonable. Sale una lista; solo le
falta el último día.

## 4. Un rango del revés no devuelve pocos: devuelve cero

Y cero es indistinguible de «no hay nada ese fin de semana». Quien escribió las fechas al
revés se llevaría la conclusión contraria a la verdad sin que nada se lo advirtiera.

Por eso `rangoInvertido` se pregunta **antes** de consultar: el campo enseña el error, el
botón «Aplicar» se deshabilita y no se lanza ninguna consulta. El mensaje va escrito debajo
del campo y enlazado con `aria-describedby`, como todos los del proyecto desde HU-12.

## 5. Un día de partida en el pasado no reabre el catálogo

El catálogo enseña lo que todavía no ha terminado ([24 §1](24-catalogo-publico.md)). Un
rango que empiece el mes pasado no puede deshacer esa decisión: lo que ya pasó no se
alcanza aunque se pida por fecha.

`limitesDeConsulta` toma **el más tardío** entre «ahora» y el día escrito. La alternativa
—dejar que un rango pasado devolviera lo terminado— convertiría el filtro en una puerta
trasera al archivo histórico, que no es lo que RF-10 pide y no es lo que la vista promete.

## 6. Dónde viven los filtros, y por qué no en el formulario

Están en `useCatalogo`, no en `FiltrosDelCatalogo`.

Podrían vivir en el formulario y llegar al gancho como argumento. Entonces `cargarMas`
tendría que recibirlos otra vez en cada llamada, porque **la página siguiente se pide con
los mismos filtros que la primera**. Bastaría que uno de los dos sitios se olvidara de
pasarlos para que «Ver más» trajera el catálogo sin filtrar — y el resultado sería una
lista que empieza filtrada y sigue sin filtrar, que nadie leería como un fallo.

Al vivir en el gancho, la primera consulta y las siguientes leen el mismo dato.

Lo que sí vive en el formulario es el **borrador**: lo que se está escribiendo antes de
pulsar «Aplicar». Es un formulario con botón y no tres campos que consultan al escribir,
porque con dos fechas que se rellenan de una en una, aplicar al vuelo dispararía una
consulta con el rango a medias —«desde el 1» y nada más— y enseñaría un resultado que nadie
pidió antes de terminar de pedirlo.

### Cambiar un filtro es una consulta nueva

No una página más. La lista se sustituye, el cursor se olvida y se vuelve a empezar. El
efecto depende de `filtros`, así que no hay nada que reiniciar a mano.

Y ahí `vigente` —la bandera que ya había en HU-25 para no escribir sobre un componente
desmontado— pasa a hacer algo más importante: cambiar de filtro deja una consulta en el
aire, y si la anterior tarda más que la nueva escribiría sus resultados encima. El catálogo
enseñaría lo que se pidió antes con el formulario diciendo otra cosa.

## 7. La opción vacía cambia de bando

`Seleccion.jsx` lleva desde HU-18 la primera opción **deshabilitada**, y con una razón
escrita: en un formulario que guarda, «ninguna» no es una respuesta, y sin esa opción
deshabilitada el desplegable arrancaría con la primera categoría ya elegida y cualquiera
guardaría una clasificación que no eligió.

En un filtro es al revés. «Todas las categorías» **es** la respuesta por defecto y hay que
poder volver a ella. Se añadió `vaciaElegible`, que solo usa este formulario.

También cambia de qué lista salen las categorías. Aquí son **las activas**, y en la tarjeta
del catálogo son **todas** ([24 §4](24-catalogo-publico.md)). No es incoherencia: ofrecer
una categoría retirada sería invitar a filtrar por algo que la plataforma ya no clasifica,
mientras que leer el nombre de la que una publicación lleva escrita hace falta aunque se
haya retirado.

> **Consecuencia asumida.** Una publicación clasificada bajo una categoría desactivada
> aparece en el catálogo con su nombre y **no se puede alcanzar filtrando**. Es coherente
> con HU-17 —la categoría dejó de ofrecerse— y se prefiere a la alternativa, que sería
> ofrecer en el filtro categorías que la plataforma ya retiró.

## 8. El catálogo vacío, ahora en dos versiones

El cuarto criterio de HU-25 decía «un catálogo vacío **tras aplicar criterios**». Hasta
ahora no había criterios que aplicar, así que solo existía una versión del mensaje. Ahora
son dos, y decir lo mismo en las dos sería peor que no decir nada:

| Situación | Qué se ofrece |
| --- | --- |
| No hay nada publicado, o todo terminó | El directorio de actores, y el registro para quien publique |
| Los filtros no encontraron nada | Ampliar el rango, o **ver el catálogo completo** |

Con la primera no hay nada que hacer; con la segunda, sí. El botón de la segunda es el mismo
«limpiar» del cuarto criterio de esta historia, puesto donde hace falta.

## 9. Cambios en el modelo y en las reglas

**`firestore.rules` no cambia**, por segunda historia consecutiva. Lo que se añade son
casos: un `where` sobre la categoría se parece muchísimo al que sostiene el primer criterio
de HU-25 y **no hace su trabajo**, así que hay dos casos que comprueban que filtrar sin
filtrar por estado se deniega igual.

**`firestore.indexes.json` crece en tres.** Cada combinación de filtros es una consulta con
una forma distinta, y Firestore no reutiliza un índice cuyos campos no estén en el orden
exacto:

| Filtros aplicados | Índice |
| --- | --- |
| Ninguno | `estadoPublicacion`, `fechaFin` — de HU-25 |
| Categoría | `estadoPublicacion`, `categoria`, `fechaFin` |
| Rango de fechas | `estadoPublicacion`, `fechaFin`, `fechaInicio` |
| Los dos | `estadoPublicacion`, `categoria`, `fechaFin`, `fechaInicio` |

Un rango **sin día de salida** no estrena índice: sin tope superior hay una sola
desigualdad y la consulta tiene la forma de las dos primeras filas.

### Dos índices planeados que el proyecto no usa

`estadoPublicacion` + `fechaInicio` y `estadoPublicacion` + `categoria` + `fechaInicio` se
declararon en [04 §10](04-modelo-datos.md) desde HU-05, para HU-25 y para HU-26. Ninguna de
las dos historias los usa: las dos ordenan por `fechaFin`, por lo que explica
[24 §1](24-catalogo-publico.md).

Se conservan declarados y marcados como tales, igual que el índice de HU-23 que tampoco
llegó a hacer falta. La diferencia entre lo planeado en el sprint 2 y lo construido en el
sprint 6 es en sí misma un dato del trabajo, y borrarla dejaría la documentación más
limpia y menos cierta.

### Y se publican antes de fusionar

Lo fijó [12 §5.2](12-despliegue-continuo.md) en HU-25:

```bash
firebase deploy --only firestore:indexes
```

## 10. Verificación

### Las funciones puras · `npm run probar`

**243 casos, 49 grupos.** Veintitrés son de esta historia:

| Qué comprueba | Casos |
| --- | --- |
| El rango de días: forma, días que no existen, y el final del día | 6 |
| En `TZ=America/Bogota`: un día empieza el día que dice y termina a las 23:59 | 2 |
| `hayFiltros` y `rangoInvertido` | 7 |
| `limitesDeConsulta`: las tres decisiones de la traducción | 8 |

### Las reglas · `npm run probar:reglas`

**197 casos**, once de ellos nuevos. Todo en verde a la primera en la
[ejecución 33202220530](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33202220530),
que es la que responde la pregunta de §2: Firestore resuelve hoy las dos desigualdades
sobre campos distintos, y el solapamiento de la tabla de §1 sale exactamente como se
esperaba.

| Qué comprueba | Casos |
| --- | --- |
| Filtrar no abre ninguna puerta: las tres consultas se autorizan, y filtrar sin el estado se deniega | 5 |
| El solapamiento: las cuatro que se solapan salen y las dos que no, no | 4 |
| Los dos filtros a la vez restringen, no suman | 2 |

### En el navegador

| Comprobación | Resultado |
| --- | --- |
| El desplegable ofrece «Todas las categorías» y es elegible | Correcto: siete categorías activas más la vacía |
| Un rango del revés enseña el error y deshabilita «Aplicar» | Correcto: «La fecha de salida es anterior a la de llegada.» |
| El error va enlazado con `aria-describedby` | Correcto |
| «Limpiar los filtros» vacía los tres campos | Correcto |
| «Limpiar» desaparece cuando no queda nada que limpiar | Correcto |
| Errores en consola con StrictMode | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

**Lo que no se pudo medir al escribir esta historia:** ningún filtro contra datos reales.
Los tres índices no estaban publicados, y **el de HU-25 tampoco**: la consulta sin filtros
respondía `failed-precondition` pidiendo exactamente `estadoPublicacion` + `fechaFin` +
`__name__`.

> **Medido después, el 28/08/2026.** Los cuatro índices se publicaron ese día con
> `firebase deploy --only firestore:indexes`, y `firebase firestore:indexes` confirma los
> diez declarados. Con ellos en su sitio se repitió la comprobación contra los datos
> reales del proyecto, y esto es lo que dio:
>
> | Comprobación | Resultado |
> | --- | --- |
> | Filtrar por la categoría que sí tiene la actividad | La devuelve |
> | Filtrar por otra categoría | Lista vacía, no error |
> | Un rango de fechas que **se solapa** con la actividad | La devuelve |
> | Un rango de diciembre, que no se solapa | Lista vacía |
>
> Las dos últimas filas son lo que el emulador no podía demostrar: **la consulta de dos
> desigualdades sobre campos distintos se resuelve en producción**, con los índices
> declarados en §9 y sin `failed-precondition`. Es la pregunta de §2, respondida esta vez
> por Firestore y no por su emulador.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado y **con los índices ya publicados**._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 11. Lo que queda fuera

- **La búsqueda por palabra clave** era [HU-27](https://github.com/Petulio14/hub-cultural-santa-marta/issues/27) y ya está ([26](26-busqueda.md)). Se apoya en estos mismos filtros y se escribe en este mismo formulario, pero **no ocurre en el mismo sitio**: los filtros los aplica el servidor y el término se compara en memoria.
- **Los filtros en la dirección**, para poder compartir un catálogo ya filtrado o volver atrás con el botón del navegador. Se dejó fuera a propósito: no lo pide ningún criterio y añade estado que mantener sincronizado. Anotado como trabajo futuro en [02 §6](02-alcance-mvp.md).
- **Filtrar por lugar o por cercanía.** El punto está guardado desde HU-22 y Firestore no consulta por proximidad sin geohash; el mapa de [HU-30](https://github.com/Petulio14/hub-cultural-santa-marta/issues/30) resuelve la misma necesidad por otra vía.
- **El filtro de categoría en el mapa** es el tercer criterio de HU-30, y reutilizará `filtros.js`.
