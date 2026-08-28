# Moderar antes de publicar

> **Historia de usuario:** HU-24 · Sprint 5
> **Épica:** E3 — Publicación y moderación de contenido
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-13.
> **Depende de:** HU-15, HU-21.

Cierra la épica E3 y el Sprint 5. Es la tercera cola de aprobación del proyecto —después de
los perfiles de actor (HU-18) y los hubs (HU-20)— y la primera en la que **decidir no basta**:
cada decisión deja un registro de quién la tomó, qué decidió y por qué.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| La cola lista lo pendiente ordenado por fecha de creación | `eventosService.js` |
| Aprobar la hace visible en el catálogo y en el mapa | `firestore.rules` |
| Devolver exige observación escrita y se notifica al actor | `firestore.rules` + `ObservacionesDeModeracion.jsx` |
| De cualquier decisión queda constancia | **el lote**, y `firestore.rules` |

---

## 1. La decisión toca dos colecciones

`docs/03` §3 dice que cada colección tiene un único servicio que la escribe. Moderar rompe
esa regla: cambia `eventos.estadoPublicacion` **y** crea el registro en `moderaciones`.

No hay forma de repartirlo entre dos servicios sin romper lo que lo hace correcto (§2), así
que se declara la excepción en lugar de disimularla: `moderacionService.js` es dueño del
acto de moderar, y la cabecera de `eventosService.js` remite allí en vez de seguir diciendo
que es el único que escribe `eventos`.

---

## 2. Por qué un lote, y las dos preguntas que abrió

El cuarto criterio dice que de **cualquier** decisión debe quedar constancia. Con dos
escrituras sueltas hay un instante entre la primera y la segunda:

```
1. eventos/abc  →  estadoPublicacion: 'aprobado'     ✓
2. moderaciones/xyz  →  quién, qué, cuándo           ✗  se cae la red
```

El resultado es una publicación aprobada sin constancia de quién la aprobó. Y lo peor:
**el resultado visible es el correcto**, así que nadie se entera. `writeBatch` hace las dos
o ninguna.

Eso dejaba abiertas dos cosas que no se pueden dar por sabidas leyendo documentación, así
que se le preguntaron al emulador (§8):

| Pregunta | Respuesta |
| --- | --- |
| ¿Sigue valiendo `fecha == request.time` dentro de un lote? Son dos escrituras enviadas juntas, y el momento de recepción no tiene por qué coincidir con el de confirmación. | **Sí.** Un lote con `serverTimestamp()` pasa la regla. |
| Si la parte del registro es inválida, ¿se revierte también el cambio de estado? | **Sí.** El caso devuelve una publicación sin observación, el lote entero falla, y al releer el evento sigue `pendiente`. |

La segunda es la que convierte el cuarto criterio en algo demostrado. Sin ella, «queda
constancia» sería una afirmación sobre el camino feliz.

---

## 3. «Notificar» cuando no se puede enviar correo

El tercer criterio pide notificar al actor cultural. **No hay correo**, y conviene decir por
qué en lugar de dejarlo caer: enviarlo exigiría Cloud Functions, que exigen el plan Blaze,
que exige registrar un medio de pago que el proyecto no tiene (docs/03 §6.1, RNF-10). Es la
misma restricción que dejó las imágenes fuera de Firebase Storage.

Así que la notificación ocurre **dentro de la aplicación**: la publicación devuelta aparece
como «Devuelta» y debajo se lee qué hay que corregir, en el mismo sitio donde se va a
corregir.

Lo que eso implica, dicho sin adornos: **el actor se entera la próxima vez que entra**, no
en el momento. Es una limitación real de esta implementación del criterio, no una
interpretación generosa.

### Una promesa que llevaba tres historias sin cumplirse

La tarjeta de «Mis publicaciones» dice desde HU-21, para una publicación devuelta:

> El administrador la devolvió. Revisa las observaciones antes de reenviarla.

**No había ninguna observación a la vista.** El texto prometía algo que la aplicación no
daba, y pasó por HU-22 y HU-23 sin que nadie lo notara, porque no hay forma de que una
prueba detecte una frase que promete de más. Esta historia es la que lo cumple.

De ahí dos decisiones del componente:

- **Se enseña sola, no tras pulsar.** Una observación que hay que ir a buscar no es una
  notificación.
- **Se lee solo para las devueltas.** Cada una cuesta una consulta; una publicación aprobada
  o pendiente no tiene nada que enseñar. Se lee donde hay algo que leer.

---

## 4. La regla era más laxa que el modelo

`moderaciones` **sí** tenía pruebas desde HU-11 —seis casos sobre quién escribe y quién
lee—, así que aquí se rompe la racha que HU-22 y HU-23 encontraron (docs/22 §1). Lo que le
faltaba era otra cosa: la regla comprobaba quién decide y que traiga observación al
devolver, pero no **la forma del documento**.

| El modelo declaraba (docs/04 §8) | La regla pedía |
| --- | --- |
| `idModeracion` obligatorio | nada |
| `idEvento` obligatorio | nada |
| `observaciones` nulas al aprobar | nada |
| solo esos seis campos | nada: cabía cualquier campo inventado |

Importa más aquí que en otras colecciones porque **el registro es inmutable**: `update` y
`delete` están cerrados, así que lo que entra mal escrito no se corrige después. Y es la
prueba de qué se decidió y quién lo decidió.

`moderacionBienFormada()` cierra las cuatro, y hay dos casos nuevos que comprueban la
inmutabilidad, que tampoco se había ejercitado nunca.

### El agujero que encontró la prueba, no la lectura

La regla exigía `observaciones.size() > 0`. **Tres espacios tienen tamaño tres.** Se podía
devolver una publicación con una observación en blanco.

No se vio leyendo la regla recién escrita: se vio porque el caso de prueba lo intentó y la
integración continua lo dejó en rojo. Por la interfaz no se notaba nada —el servicio recorta
antes de escribir—, así que el agujero existía solo para quien escribiera por fuera, que es
exactamente de quien defiende una regla de seguridad.

Es el argumento a favor de lo que `docs/22` §1 dejó anotado: escribir la regla y escribir el
caso que la ejercita son dos trabajos, y el segundo es el que demuestra algo.

---

## 5. La tercera cola sí cabía en el gancho

`useColaDeAprobacion` dejó la pregunta escrita en HU-20:

> La tercera cola —la de publicaciones, en HU-24— tendrá además su registro en
> «moderaciones», y ahí habrá que ver si sigue cabiendo aquí o merece lo suyo.

La respuesta es que **el registro no es asunto del gancho**. Lo que el gancho hace es «leer,
decidir, recargar, decir qué pasó», y eso es idéntico en las tres colas. Lo que la tercera
necesitaba era un dato más viajando con la decisión —la observación—, y eso es un tercer
argumento opcional:

```javascript
cambiarEstado(elemento.id, estado, extra)
```

Las dos colas anteriores no lo reciben porque nunca lo pasan. Es una fuga pequeña y
consciente; la alternativa era un cuarto archivo casi igual, que es donde de verdad se
pierden las correcciones.

### Dos órdenes contrarios, los dos deliberados

| Listado | Orden | Por qué |
| --- | --- | --- |
| Cola de moderación | de la más **antigua** a la más reciente | una cola se atiende por orden de llegada |
| Mis publicaciones | de la más **reciente** a la más antigua | lo último que uno hizo es lo primero que busca |

No conviene «unificarlos»: son dos preguntas distintas hechas sobre la misma colección.

---

## 6. Tres casos existentes que había que ajustar

Al exigir `idModeracion`, tres casos escritos en HU-11 dejaban de crear documentos válidos.
Dos habrían seguido en verde —esperaban un fallo y lo habrían seguido teniendo— **por el
motivo equivocado**:

| Caso | Antes fallaba porque… | Habría fallado porque… |
| --- | --- | --- |
| «devolver sin observaciones NO se registra» | faltaba la observación | faltaba `idModeracion` |
| «un actor NO registra una moderación» | lo escribía un actor | faltaba `idModeracion` |

Es exactamente el error que HU-21 cometió y dejó documentado (docs/20 §8): una prueba que
pasa por una razón que no es la de su nombre deja de vigilar lo que dice vigilar. Se les
añadió `idModeracion` —y `observaciones: null` donde hacía falta— para que la única
diferencia siga siendo la que el nombre anuncia.

---

## 7. Cambios en el modelo y en las reglas

**Las reglas cambian**, por primera vez desde HU-21. El modelo no: `moderacionBienFormada()`
no añade nada, exige lo que `docs/04` §8 ya declaraba.

> **Al fusionar hay que publicar las reglas.** Es el caso del orden de despliegue de
> `docs/12` §5.1: primero se fusiona el código, después `firebase deploy --only
> firestore:rules`. Al revés, las reglas nuevas rechazarían escrituras que el código
> desplegado todavía hace.

| Archivo | Cambio |
| --- | --- |
| `firestore.rules` | `moderacionBienFormada()`; el `trim()` de la observación |
| `src/services/moderacionService.js` | nuevo · el lote y el historial |
| `src/views/PanelAdministracion/PublicacionesPendientes.jsx` | nueva · la tercera cola |
| `src/views/MisPublicaciones/ObservacionesDeModeracion.jsx` | nueva · lo que el actor recibe |
| `src/services/eventosService.js` | `listarPublicacionesPendientes`; la excepción declarada |
| `src/hooks/useColaDeAprobacion.js` | un tercer argumento opcional |
| `src/utils/validaciones.js` | `validarObservacion` |
| `src/views/PanelAdministracion/PanelAdministracion.jsx` | monta la cola, al final |

---

## 8. Verificación

### Las funciones puras · `npm run probar`

**208 casos, todos en verde.** Siete son de esta historia, sobre `validarObservacion`. El más
útil es el que comprueba que «No sirve» **no** pasa: la regla del servidor solo puede exigir
que haya algo escrito, y el criterio pide una observación que explique.

### Las reglas · `npm run probar:reglas`

**177 casos**, veinte de ellos nuevos, en la ejecución
[33111061900](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33111061900).

| Qué comprueba | Casos |
| --- | --- |
| La forma del registro, que la regla no pedía | 9 |
| El registro es inmutable | 2 |
| El lote: sus dos preguntas, y quién no puede moderar | 5 |
| La cola y lo que el actor recibe | 4 |

### Comprobación en vivo

Sobre el sitio publicado, con dos sesiones: una de administrador y otra de actor cultural.
La mitad de lo que hay que ver ocurre en el lado de quien recibe la devolución, y por eso no
se puede hacer con una sola.

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 27/08/2026 | El panel muestra «Publicaciones por revisar», al final de las tres colas | Correcto |
| 27/08/2026 | La cola va de la más antigua a la más reciente | Correcto: es el primer criterio |
| 27/08/2026 | Cada tarjeta enseña imagen, fechas, lugar, punto y descripción completos | Correcto: se decide sobre lo que se ve, no sobre un resumen |
| 27/08/2026 | Aprobar retira la publicación de la cola y lo confirma | Correcto |
| 27/08/2026 | Esa publicación queda «Publicada» en la sesión del actor | Correcto: es el segundo criterio hasta donde hoy se puede ver (§9) |
| 27/08/2026 | Devolver sin escribir nada no devuelve: pide la observación | Correcto: es el tercer criterio |
| 27/08/2026 | Devolver escribiendo «No» tampoco: pide que explique qué corregir | Correcto: la regla del servidor no puede distinguir esto, el formulario sí |
| 27/08/2026 | Con una observación real, la devolución se guarda y sale de la cola | Correcto |
| 27/08/2026 | En la sesión del actor queda «Devuelta» **y se lee la observación debajo** | Correcto: es la notificación de §3, y cierra la promesa que la tarjeta llevaba haciendo desde HU-21 |
| 27/08/2026 | Editarla desde la sesión del actor la devuelve a revisión y reaparece en la cola | Correcto: el ciclo se cierra sobre sí mismo |
| 27/08/2026 | Todo lo anterior a 360 px, sin desbordamiento horizontal | Correcto |

Las **once** pasaron.

La séptima es la que separa cumplir la letra del criterio de cumplirlo. «No» es una
observación escrita para la regla del servidor —hay algo, y no son espacios— y no le sirve de
nada a quien tiene que corregir su publicación. Ese mínimo solo puede vivir en el formulario,
y por eso está ahí y no en `firestore.rules`.

La décima cierra el ciclo completo del Sprint 5 en una sola comprobación: se publica (HU-21),
se sitúa (HU-22), se modera (HU-24), se devuelve, se corrige (HU-23) y vuelve a la cola.

---

## 9. Lo que queda fuera

| Qué | Dónde va |
| --- | --- |
| El catálogo público donde aparece lo aprobado | HU-25, **hecho** ([24](24-catalogo-publico.md)) |
| El mapa donde aparece lo aprobado y situado | HU-30 |
| Ver el historial completo de moderaciones de una publicación | no está pedido; el modelo lo permite y `listarModeracionesDeEvento` ya lo devuelve entero |
| Avisar al actor por correo en el momento | requiere Cloud Functions y plan Blaze (§3); fuera del alcance por RNF-10 |

Una nota sobre el segundo criterio. Dice que al aprobar la publicación «debe hacerse visible
en el catálogo y en el mapa», y **ninguno de los dos existe todavía** —son HU-25 y HU-30—. Lo
que esta historia deja hecho es lo que lo hará cierto cuando existan: el estado pasa a
`aprobado`, y desde HU-21 la regla de lectura pública se apoya exactamente en ese valor, con
casos que lo demuestran. Queda anotado para no darlo por comprobado dos veces, igual que se
hizo en `docs/20` §8.

> **Media nota, saldada.** HU-25 construyó el catálogo, y la mitad del segundo criterio que
> quedaba en promesa se puede comprobar ya: una publicación aprobada aparece ahí, y una
> pendiente no llega siquiera a descargarse ([24 §2](24-catalogo-publico.md)). La otra mitad
> —el mapa— sigue esperando a HU-30.

---

*Elaboración propia (2026).*
