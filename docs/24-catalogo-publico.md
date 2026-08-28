# El catálogo público

> **Historia de usuario:** HU-25 · Sprint 6
> **Épica:** E4 — Descubrimiento y contacto
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-09.
> **Depende de:** HU-24.

Abre el Sprint 6 y la épica E4, y **salda la deuda que el Sprint 5 dejó abierta a
propósito**: hasta hoy una publicación se podía crear (HU-21), situar en el mapa (HU-22),
corregir (HU-23) y aprobar (HU-24), y no había dónde verla. Los cuatro documentos
anteriores terminan apuntando aquí.

Es también la primera vista del proyecto pensada para quien **no tiene cuenta**. Todo lo
construido hasta ahora se leía desde dentro de una sesión; esto se lee desde la calle.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Solo se listan las publicaciones aprobadas | `firestore.rules`, no la vista |
| Cada elemento muestra imagen, título, categoría, fecha y lugar | `TarjetaDeEvento.jsx` |
| Más de doce elementos: paginación o carga progresiva | `paginacion.js` + el cursor de `eventosService.js` |
| Un catálogo vacío no es una pantalla en blanco | `Catalogo.jsx` |

---

## 1. Lo que el catálogo decide no enseñar

Un catálogo que se abre con el festival del año pasado no sirve para planear una estancia
de cuatro días. Así que la consulta **excluye lo que ya terminó**, y esa decisión tiene un
precio que conviene escribir antes que esconder.

Firestore exige que el primer `orderBy` sea el campo sobre el que va la desigualdad. Filtrar
por `fechaFin >= ahora` obliga entonces a **ordenar por `fechaFin`**, y con ello se pierde
la posibilidad de ordenar por cuándo empieza cada cosa:

| Lo que se quiere | Lo que Firestore permite a la vez |
| --- | --- |
| No mostrar lo terminado | Ordenar por `fechaFin` |
| Ordenar por cuándo empieza | Mostrar también lo terminado |

Se eligió lo primero. Ordenar por lo que está a punto de acabarse no es un mal segundo
premio para quien está de paso —lo urgente arriba—, y la fecha completa se lee entera en
cada tarjeta, así que no se esconde nada. La intro de la vista lo dice con todas las
letras: *«se ordena por lo que está a punto de terminar»*.

### Por qué no se filtra la fecha en memoria

Habría evitado el índice nuevo, y **habría roto la paginación**. La consulta trae trece
documentos; si cinco se descartan al llegar, la página enseña siete y el visitante no sabe
por qué unas páginas traen doce y otras no.

No contradice lo que HU-23 y HU-24 dejaron escrito. Allí se **ordena** en memoria, y se
puede porque todos los documentos están ya leídos: la lista propia de un actor y la cola de
moderación se traen enteras. El catálogo, por definición, no se trae entero.

## 2. «limit» no es un filtro

El primer criterio dice que solo se listen las publicaciones aprobadas. Desde HU-21 hay dos
casos que lo sostienen: un visitante lista lo aprobado, y pedir la colección entera falla.

Pero la consulta del catálogo **no es** aquella consulta. Lleva un orden, un cursor y un
tope de resultados, y las tres cosas son maneras de pedir menos documentos. De ahí la
pregunta que abre el bloque de pruebas de esta historia:

> ¿Pedir pocos equivale a pedir los permitidos?

Si `limit(12)` bastara para leer una colección que contiene documentos denegados, el primer
criterio no lo sostendría el servidor sino la buena voluntad del cliente. Se le preguntó al
emulador, que es lo que HU-24 hizo con el lote en lugar de suponerlo:

| Consulta de un visitante sin sesión | Resultado |
| --- | --- |
| Toda la colección, con `limit(12)` | **Denegada** |
| Toda la colección, ordenada y con `limit(12)` | **Denegada** |
| Ordenada, con cursor y con `limit(12)`, sin filtro de estado | **Denegada** |
| La consulta completa del catálogo | Autorizada |

Un orden no es una condición y un cursor no es un filtro: mueven de dónde se empieza a
leer, no a qué documentos alcanza la consulta. El primer criterio lo sostiene el `where`, y
lo sostiene en el servidor.

## 3. Trece para enseñar doce

El tercer criterio pide paginación o carga progresiva a partir de doce elementos. Se eligió
carga progresiva con **un botón**, no desplazamiento infinito: el desplazamiento infinito
deja el pie de página inalcanzable —donde vive el enlace a la política de datos— y le quita
a quien navega con teclado el control de cuándo llega más contenido.

Saber si queda algo detrás cuesta una consulta más si se pregunta, y nada si se pide **uno
de más**: se traen trece, se enseñan doce y el decimotercero es la respuesta. Se descarta y
se vuelve a leer en la página siguiente; guardarlo ahorraría una lectura y costaría que la
primera página tuviera trece tarjetas y las demás doce.

Doce no es un número redondo por casualidad. Es el que nombra el criterio de aceptación, y
además es divisible por uno, dos y tres, que son las columnas que tiene la rejilla a 360,
768 y 1366 px ([10 §2](10-responsive.md)). Ninguna página termina en una fila coja, y hay
un caso de prueba que lo fija por si alguien cambia el número.

### El cursor no es una instantánea de Firestore

`startAfter` admite el documento entero, y usarlo así obligaría al gancho a guardar un
objeto del SDK para devolverlo en la consulta siguiente. Un gancho que sostiene una
instantánea es un gancho que habla el idioma de Firestore, que es justo lo que prohíbe la
regla de acceso a datos ([03 §3](03-arquitectura.md)) y lo que comprueba `npm run
verificar`. El cursor viaja como lo que ya es dominio: **la última publicación de la lista**.

Y viaja con **dos** valores, no con la fecha sola. Dos actividades que terminan a la misma
hora no son raras —las 22:00 de un sábado—, y sobre un empate un cursor de un solo valor se
salta a uno de los dos o lo repite. El desempate es el identificador del documento, que
Firestore añade por su cuenta al final de todo índice compuesto; aquí se escribe para poder
nombrarlo en el cursor. Hay un caso que lo comprueba con tres publicaciones que terminan en
el mismo instante.

### Repetido no es lo mismo que ausente

Aun con el cursor exacto, una tarjeta puede llegar dos veces: si entre una página y la
siguiente el administrador aprueba una publicación que cae antes del cursor, la segunda
consulta la devuelve. React avisaría con *«two children with the same key»*, pero el aviso
sale en la consola y el visitante ve la tarjeta duplicada. `anadirPagina` descarta lo
repetido y **conserva la que ya estaba**: es la que la persona tiene delante.

## 4. La categoría que se desactivó

El segundo criterio pide cinco datos por tarjeta, y uno —la categoría— llega como
identificador y hay que traducirlo a un nombre.

Lo natural era reutilizar `useCategoriasActivas`, que ya existe para el formulario de
publicación. Habría sido un error silencioso. HU-17 decidió que una categoría **no se borra,
se desactiva**: deja de ofrecerse y las publicaciones que ya la usan conservan su
clasificación ([16 §3](16-categorias.md)). Una publicación aprobada bajo «Cine y video», si
el administrador desactiva esa categoría después, sigue en el catálogo —está aprobada— y con
la lista de activas se quedaría **sin categoría a la vista**. Un dato de los cinco
desaparecería sin que nada avisara.

Por eso `useNombresDeCategoria` lee todas, activas o no. La distinción entre activa y
desactivada es la del panel del administrador, donde ese estado es el dato que se
administra; aquí no se enseña, solo se necesita el nombre.

Si esa lectura falla, la tarjeta se pinta igual con los otros cuatro datos. Un aviso de
error sobre el catálogo entero porque no se pudo traducir una etiqueta sería peor que la
etiqueta que falta.

## 5. El índice se publica **antes** de fusionar

Al revés que las reglas, y no es un descuido.

[12 §5.1](12-despliegue-continuo.md) fija el orden para las reglas: primero fusionar,
después publicar. La razón es que una regla más estricta que el código en producción rompe
la aplicación que está viva. Con los índices la asimetría es la contraria:

| | Si se publica antes | Si se publica después |
| --- | --- | --- |
| **Reglas** | La regla nueva rechaza al cliente viejo | Correcto |
| **Índices** | Correcto: un índice de más no molesta a nadie | La consulta nueva falla hasta que el índice termine de construirse |

Un índice compuesto tarda minutos en construirse. Publicado después de fusionar, el catálogo
queda roto durante ese rato para todo el que entre.

Se comprobó en el navegador antes de escribir esta sección, y de la forma más directa
posible: con el índice todavía sin publicar, la vista del catálogo respondió

> El catálogo no está disponible en este momento. Vuelve a intentarlo en unos minutos.

que es el mensaje nuevo de `errores.js` para `failed-precondition`. Ese código no existía en
la tabla de traducciones porque hasta ahora ninguna consulta del proyecto combinaba filtro y
orden. Se distingue del error genérico en algo práctico: **no se arregla reintentando**. El
mensaje de Firestore trae un enlace para crear el índice que solo sirve a quien administra
el proyecto, así que no se le enseña a nadie más.

```bash
firebase deploy --only firestore:indexes
```

## 6. Dos estados de carga, no uno

`useCatalogo` se parece a `useMisPublicaciones` y se distingue en lo único que importa:
aquella trae la lista entera porque son las publicaciones de una persona; esta trae las de
todo el mundo, página a página.

De ahí que haya dos:

- **`cargando`** es la primera página. Mientras dure no hay nada que enseñar.
- **`cargandoMas`** es cualquier página siguiente, y mientras dure **lo que ya está en
  pantalla no se toca**.

Con un solo estado, pedir más borraría lo que se está leyendo para volver a pintarlo un
segundo después. Es exactamente lo que hace inutilizable un catálogo largo.

El error se guarda aparte de la lista por la misma razón. Si la tercera página falla, las
veinticuatro tarjetas anteriores siguen siendo verdad: se enseñan, con el aviso debajo.
Quitarlas de la pantalla sería mentir por prudencia.

## 7. Lo que la tarjeta no lleva

Los cinco datos del criterio y ni uno más.

**La descripción no está.** Puede llegar a cuatro mil caracteres, y doce tarjetas con cuatro
mil caracteres cada una no son un catálogo que se recorra, son un texto largo partido en
cajas. Se lee en el detalle, que es HU-28.

**Todavía no se puede pulsar**, y también es a propósito. Abrir el detalle es el primer
criterio de aceptación de HU-28; enlazarlo hoy llevaría a la pantalla «V-3 · en
construcción», que es peor que no ofrecer el enlace. Es la misma decisión que tomó el
servicio en HU-21 al no escribir un `listarAprobadas` que nadie llamaba: la pieza la pone la
historia que la necesita. Al escribir esta historia se llegó a añadir una
`leerPublicacionAprobada` de más, y se retiró antes de confirmar: era API muerta esperando a
una historia que puede pedirla distinta.

**No se comparte con `TarjetaDePublicacion`**, la del actor que la escribió, y no es
duplicación. Aquella lleva el estado de revisión, las observaciones del administrador, la
fecha de envío y los botones de editar y borrar; nada de eso es asunto de quien viene a
buscar un plan. Lo común —la fotografía y el periodo— ya vive en piezas aparte
(`ImagenDeActor`, `textoDelPeriodo`).

### El catálogo vacío dice las dos razones

El cuarto criterio pide un mensaje orientador. El que hay dice **las dos** razones por las
que el catálogo puede estar vacío, porque desde fuera se ven igual y no son lo mismo: que
todavía no se haya publicado nada, o que lo que hubo ya terminó. Y ofrece a dónde ir: el
directorio de actores, que sí tiene contenido, y el registro para quien represente una
manifestación cultural de la ciudad.

## 8. Cambios en el modelo y en las reglas

**`firestore.rules` no cambia.** Es la primera historia desde HU-22 de la que se puede decir
esto, y no es casualidad: la regla que sostiene el primer criterio se escribió en HU-21 y ya
tenía casos. Lo que esta historia añade son casos, no permisos.

**`firestore.indexes.json` sí cambia**: un índice nuevo.

| Colección | Campos | Consulta que habilita |
| --- | --- | --- |
| `eventos` | `estadoPublicacion` ASC, `fechaFin` ASC | El catálogo público: lo aprobado que no ha terminado, ordenado por lo que queda |

El índice que [04 §10](04-modelo-datos.md) había planeado para HU-25 era
`estadoPublicacion` + `fechaInicio`. Se conserva declarado —lo necesitará HU-26 para el
rango de fechas— pero **no es el que usa el catálogo**, por lo que explica §1. La diferencia
entre lo planeado y lo construido queda escrita en la tabla, como ya se hizo con el índice
de HU-23 que no llegó a hacer falta.

## 9. Verificación

### Las funciones puras · `npm run probar`

**220 casos, 45 grupos, todos en verde.** Doce son de esta historia, todos sobre la
aritmética de la página: el uno de más y sus tres errores clásicos —enseñar trece, enseñar
once, o decir que hay más cuando lo que hay es exactamente el borde de doce—.

### Las reglas · `npm run probar:reglas`

**186 casos**, nueve de ellos nuevos, en tres grupos. Todo en verde en la
[ejecución 33196516276](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33196516276).

| Qué comprueba | Casos |
| --- | --- |
| Pedir menos no es pedir lo permitido: `limit`, orden y cursor no sustituyen al filtro, y la consulta completa sí se autoriza | 4 |
| Lo que trae la página: lo vigente sí, lo pendiente no, lo terminado tampoco | 3 |
| El empate de fechas: las empatadas salen juntas y en orden, y el cursor cae exactamente entre dos de ellas | 2 |

#### El caso del empate, que primero midió otra cosa

La primera ejecución en integración continua lo dejó
[en rojo](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33196317619):
esperaba dos publicaciones detrás del cursor y llegaron ocho.

**No era el cursor ni la regla.** El caso daba por hecho que la colección contenía solo los
cinco documentos que él mismo había sembrado, y en ese archivo hay publicaciones aprobadas
desde HU-21: ocho de ellas terminan después del instante desde el que consulta el caso.
Contar era la manera equivocada de preguntarlo.

Reescrito, ahora compara la página que devuelve el cursor **contra la lista entera** —tiene
que ser exactamente la lista menos su primer elemento— y no contra un número. Es la misma
lección que HU-21 anotó con `UIDS_SIN_PERFIL[10]`, por otra puerta: un caso que se apoya en
el estado que dejaron los anteriores mide lo que ese estado quiera, no lo que su nombre
anuncia.

> **Lo que este bloque no demuestra.** Que los índices estén publicados. El emulador los
> construye al vuelo, así que una consulta que ahí pasa puede fallar en producción con
> `failed-precondition` hasta que se ejecute el comando de §5. Se dice aquí para que nadie
> lea la suite en verde como una garantía que no da.

### En el navegador

| Comprobación | Resultado |
| --- | --- |
| La ruta `/eventos` deja de ser «en construcción» | Correcto |
| Sin el índice publicado, la vista avisa y no revienta | Correcto: el mensaje de `failed-precondition`, sin traza en consola |
| Errores en consola con StrictMode | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

**Lo que no se pudo medir aquí:** el catálogo con contenido. La consulta necesita el índice
publicado (§5), y el orden de despliegue de esta historia lo pone antes de fusionar, no
antes de escribir. La rejilla, la carga progresiva y el catálogo vacío quedan enteros para
la pasada en vivo.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado y **con el índice ya publicado**: sin él, la
única fila que se puede comprobar es la del aviso de error._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 10. Lo que queda fuera

- **Los filtros por categoría y por rango de fechas** son [HU-26](https://github.com/Petulio14/hub-cultural-santa-marta/issues/26). El catálogo que deja esta historia es el catálogo entero.
- **La búsqueda por palabra clave** es [HU-27](https://github.com/Petulio14/hub-cultural-santa-marta/issues/27). El campo `tituloNormalizado` la espera guardado desde HU-21.
- **El detalle de una publicación** es [HU-28](https://github.com/Petulio14/hub-cultural-santa-marta/issues/28), y con él el enlace desde la tarjeta.
- **El mapa** de la misma oferta es [HU-30](https://github.com/Petulio14/hub-cultural-santa-marta/issues/30). Con esta historia el punto que HU-22 dejó guardado sigue sin verse en ninguna parte; ahí es donde se verá.
