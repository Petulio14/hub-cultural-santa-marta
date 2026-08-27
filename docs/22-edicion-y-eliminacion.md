# Corregir y retirar lo publicado

> **Historia de usuario:** HU-23 · Sprint 5
> **Épica:** E3 — Publicación y moderación de contenido
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-06.
> **Depende de:** HU-21.

Cierra el ciclo de vida de una publicación por el lado del autor: crear (HU-21), situar
(HU-22), corregir y retirar. Lo que queda después ya no es suyo, es del administrador
(HU-24).

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Al editarla, los cambios se guardan y vuelve a «pendiente» | `firestore.rules` |
| Al eliminarla, se pide confirmación antes de proceder | `ConfirmacionDeBorrado.jsx` |
| Sobre la publicación de otro actor, la operación se rechaza | `firestore.rules` **y** la interfaz |

Y aquí está lo primero que hay que decir de esta historia: **las tres reglas que sostienen
los tres criterios ya estaban escritas desde HU-21**. No se ha tocado `firestore.rules`.

---

## 1. Tres historias seguidas encontrando reglas sin estrenar

| Historia | Regla que encontró escrita y sin una sola prueba |
| --- | --- |
| HU-22 | `allow update` sobre `eventos` |
| HU-23 | `allow delete` sobre `eventos` |

HU-21 escribió las dos y probó a fondo lo que sí ejercitaba —crear y leer, 27 casos—. Las
otras dos quedaron descritas en un comentario, que es una forma educada de no comprobarlas.

Es el mismo patrón que ya mordió dos veces por otros sitios: HU-10 midió la cabecera de un
visitante y nunca la de un actor, y el menú se solapaba desde el primer día; HU-18 probó
perfiles que existen y nunca una cuenta recién creada. Tres veces es una regularidad, no una
casualidad, y conviene nombrarla:

> **Escribir una regla y probarla son dos trabajos distintos, y el segundo se aplaza solo.**
> Una regla escrita «de más», pensando en la historia siguiente, llega a esa historia sin
> que nadie sepa si funciona. Lo barato es escribirla; lo que cuesta es el caso que la
> ejercita, y es el que demuestra algo.

Lo que se hace a partir de aquí: cuando una historia escriba una regla para una historia
posterior, deja también el caso que la ejercita, aunque la interfaz que la use todavía no
exista. Un `assertSucceeds` sobre un documento sembrado no necesita ninguna pantalla.

HU-23 añade **13 casos** sobre `allow delete` y sobre la edición completa.

---

## 2. Un solo formulario para crear y para editar

`FormularioDePublicacion` se separó de la vista en HU-21 justamente para este momento. Desde
HU-23 sirve para las dos cosas: sin `valoresIniciales` crea, con ellos edita.

| Lo que cambia | Crear | Editar |
| --- | --- | --- |
| Valores de partida | vacíos | los de la publicación |
| Texto del botón | «Enviar a revisión» | «Guardar los cambios» |
| Al guardar bien | se vacía | se cierra, con lo escrito intacto |
| Botón «Cancelar» | no hay | sí |

Nada más. La validación, la reducción de la imagen, el mapa y la advertencia de guardar sin
punto son los mismos objetos, no dos copias parecidas.

Un segundo formulario de edición habría sido más rápido de escribir y **el sitio donde una
validación nueva se aplicaría solo a la mitad de los casos**. Es la misma razón por la que
HU-20 sacó tres piezas de la duplicación (docs/19 §2): lo que se escribe dos veces se
corrige una.

### La tarjeta tiene dos modos

En lectura enseña la publicación; en edición **se convierte en el formulario**. El editor de
punto de HU-22 se retira mientras se edita: el formulario ya trae su propio mapa, y dos
mapas en la misma tarjeta serían dos sitios donde arrastrar el mismo marcador con
resultados distintos.

---

## 3. Por qué no `window.confirm`

Es una línea, hace literalmente lo que pide el criterio, y no sirve.

| Problema | Consecuencia |
| --- | --- |
| Su texto es una cadena suelta | No puede decir **cuál** de las tres publicaciones en pantalla se va a borrar |
| El navegador puede suprimirlo | Tras varios diálogos seguidos, Chrome ofrece «impedir que esta página cree más cuadros de diálogo»; a partir de ahí devuelve `false` sin preguntar |
| Bloquea el hilo | No se puede estilar ni ajustar al idioma del resto |

El segundo es el que lo descarta del todo. **Un criterio de aceptación que un ajuste del
navegador puede apagar no está cumplido**, aunque el día de la demostración funcione.

### En la tarjeta, no en una ventana

La pregunta aparece dentro de la tarjeta que se va a borrar, con su título delante. Una
ventana modal habría tapado precisamente lo que hay que mirar para decidir, y habría
obligado a repetir el título dentro para compensarlo.

### El orden de los botones no es un detalle

```
antes:    [ Eliminar ]
después:  Se va a eliminar «Taller de tambora». No se puede deshacer.
          [ Cancelar ]  [ Sí, eliminar ]
```

«Cancelar» va **primero**, y ocupa el sitio donde estaba «Eliminar» cuando se pulsó. Quien
haga doble clic por costumbre —o con un ratón que rebota— cancela. Poner el botón
destructivo bajo el dedo que acaba de pulsar es regalarle la segunda pulsación al accidente.

Y la pregunta ocupa su propia línea (`flex-basis: 100%`), lo que empuja los dos botones por
debajo del punto donde estaba el original. Se comprobó: la pregunta termina en el píxel 57 y
los botones empiezan en el 67.

---

## 4. «Vuelve a pendiente» no lo decide el cliente

El primer criterio parece cosa del servicio —basta con enviar `estadoPublicacion:
'pendiente'`—, y si fuera así no estaría cumplido: dependería de que nadie escriba nunca por
fuera de esta interfaz.

Lo que lo sostiene es la regla de HU-21:

```javascript
request.resource.data.estadoPublicacion == 'pendiente'
```

Cualquier actualización del autor **tiene que** escribir `'pendiente'`. Una edición que
intentara conservar el visto bueno es rechazada por el servidor, y hay dos casos que lo
comprueban: uno sobre una publicación aprobada que intenta seguir aprobada, y otro sobre una
pendiente que intenta aprobarse a sí misma de camino.

El servicio escribe `'pendiente'` porque es lo único que la regla acepta, no porque sea quien
lo garantiza. La diferencia es la que separa un criterio cumplido de una costumbre del
formulario.

### Lo contrario que los perfiles de actor

Un perfil de actor editado **no** vuelve a pendiente (docs/17 §5). La diferencia es
intencionada y merece estar escrita en los dos sitios:

| | Perfil de actor | Publicación |
| --- | --- | --- |
| Qué describe | a quien ya fue admitido en la plataforma | una fecha y un lugar concretos |
| Al editarse | conserva el visto bueno | vuelve a revisión |
| Por qué | admitir a alguien no se revoca porque cambie su teléfono | un evento puede cambiar a algo que no debería publicarse |

---

## 5. Editar y borrar no tienen las mismas condiciones

Es la asimetría de esta historia, y es deliberada:

| Sobre una publicación **aprobada** | ¿Puede el autor? |
| --- | --- |
| Editarla | Sí, pero **pierde el visto bueno** y vuelve a la cola |
| Eliminarla | Sí, y sin más condiciones |

Retirar lo propio del catálogo no necesita el permiso de nadie: es contenido de quien lo
publicó y puede dejar de quererlo publicado. Cambiar lo que ya se aprobó sí vuelve a pedir
permiso, porque lo aprobado fue *ese* texto en *esa* fecha, no la publicación como objeto.

La regla ya lo decía —`allow delete` no mira el estado, `allow update` sí—; lo que faltaba
era decir por qué, y los casos que lo demuestran.

---

## 6. El límite de HU-22, levantado

HU-22 dejó anotado que el punto de una publicación aprobada no se podía corregir: el
servicio escribía solo `coordenadas` y la regla exige que lo escrito siga siendo
`'pendiente'`, así que chocaba (docs/21 §6).

No hacía falta cambiar la regla. Mover el punto **es** editar, y editar devuelve a revisión:
`actualizarPunto` escribe ahora dos claves en vez de una. El límite era del servicio, no del
servidor.

Lo que sí hacía falta es avisar. Tanto el editor de punto como el formulario de edición
enseñan, **antes de tocar nada**, que guardar retirará la publicación del catálogo mientras
la revisan otra vez. Después de guardar ya no sirve de nada.

---

## 7. La trampa de las fechas, que vuelve por otra puerta

Al abrir una publicación para editarla hay que convertir sus `Date` al texto que pide el
control `datetime-local`. La conversión ingenua —`toISOString().slice(0, 16)`— devuelve la
hora en UTC, y en Santa Marta eso adelanta cinco horas:

| | Guardado | Se abriría a editar como |
| --- | --- | --- |
| Correcto | 1 de septiembre, 19:00 | `2026-09-01T19:00` |
| Con `toISOString` | 1 de septiembre, 19:00 | `2026-09-02T00:00` |

Lo peligroso no es el error: es que **nadie lo vería**. Las dos fechas se moverían igual, así
que seguirían siendo coherentes entre sí y ninguna validación protestaría. Quien editara el
título de su evento y guardara sin mirar el reloj movería su propio evento cinco horas, una
vez por edición.

Por eso la conversión vive en `src/utils/publicaciones.js` y no dentro de la vista
(CLAUDE.md), y por eso sus dos casos decisivos corren **en otro proceso** con
`TZ=America/Bogota`, igual que en HU-21: la integración continua corre en UTC, donde una
implementación correcta y una escrita con `toISOString()` dan exactamente el mismo resultado.

El molde vacío del formulario vive en el mismo archivo, al lado de la función que lo rellena.
Si el formulario declarase sus campos por su cuenta, los dos se irían separando en cuanto la
publicación ganara un campo: uno se rellenaría y el otro no.

---

## 8. Cambios en el modelo y en las reglas

**Ninguno, en ninguno de los dos.** Es la tercera historia seguida sin tocar
`firestore.rules` y la primera que tampoco toca el modelo.

| Archivo | Cambio |
| --- | --- |
| `src/utils/publicaciones.js` | nuevo · el molde del formulario y cómo se rellena |
| `src/views/MisPublicaciones/ConfirmacionDeBorrado.jsx` | nuevo · la pregunta antes de borrar |
| `src/services/eventosService.js` | `actualizarPublicacion`, `eliminarPublicacion`; `actualizarPunto` escribe también el estado |
| `src/views/MisPublicaciones/FormularioDePublicacion.jsx` | sirve para crear y para editar |
| `src/views/MisPublicaciones/TarjetaDePublicacion.jsx` | dos modos, y las acciones |
| `src/views/MisPublicaciones/EditorDePunto.jsx` | se levanta el límite de HU-22 y se avisa |
| `src/hooks/useMisPublicaciones.js` | `quitar` |
| `src/styles/global.css` | `.boton--peligro` |

### Un índice que ya no hace falta

`docs/04` §10 declara `eventos · idActor ASC, fechaCreacion DESC` como índice requerido por
HU-23. **No lo es.** `listarMisPublicaciones` filtra en el servidor y ordena en memoria, y esa
decisión —tomada en HU-21 y explicada en la cabecera de `eventosService.js`— evita el índice
compuesto: ordenar en memoria no alcanza ningún documento de más, porque ya están todos
leídos y son los propios.

Queda anotado en `docs/04` en lugar de borrarlo: es la planificación que la implementación
superó, y esa diferencia es en sí misma un dato.

---

## 9. Verificación

### Las funciones puras · `npm run probar`

**201 casos, 41 grupos, todos en verde.** Ocho son de esta historia: seis sobre el rellenado
del formulario y dos, en otro proceso, sobre la zona horaria.

### Las reglas · `npm run probar:reglas`

**157 casos**, trece de ellos nuevos.

| Qué comprueba | Casos |
| --- | --- |
| La edición devuelve a revisión, y no se puede evitar | 6 |
| Sobre lo ajeno no se puede editar ni borrar | 3 |
| Eliminar la propia, incluso aprobada; el administrador también | 4 |

> Un apunte sobre el último caso. «Eliminar una que no existe» se deniega, y el caso **no
> puede distinguir** si la regla dijo que no o si la expresión falló al leer `resource.data`
> sobre un documento nulo: el cliente ve el mismo `PERMISSION_DENIED`. Lo que demuestra es lo
> que importa —que no acaba en un borrado—, y se dice así en lugar de apuntarse un mérito que
> no es. A diferencia de `allow read`, aquí no se añade la guarda `resource != null`: en la
> lectura hacía falta porque había un caso legítimo mal atendido (docs/17 §10); borrar algo
> que ya no está solo le ocurre a quien lo borró en otra pestaña, y la lista ya lo ha quitado.

### En el navegador

El formulario de edición y la confirmación se montaron aislados, fuera de la ruta privada:

| Comprobación | Resultado |
| --- | --- |
| El formulario se rellena con lo guardado | Correcto: título, categoría, descripción, lugar, imagen y punto |
| Las dos fechas se abren en hora local | `2026-09-01T19:00` y `2026-09-01T22:30`, sin desplazamiento |
| El marcador aparece en el mapa con el punto guardado | Correcto: `11,24520, -74,21450` |
| Al guardar, la fecha vuelve como se guardó | `Tue Sep 01 2026 19:00:00 GMT-0500` |
| En edición, el formulario **no** se vacía al guardar | Correcto |
| Un clic en «Eliminar» pregunta y **no** borra | Correcto, con el título dentro de la pregunta |
| «Cancelar» vuelve atrás sin borrar | Correcto |
| «Sí, eliminar» borra | Correcto |
| Orden de los botones | «Cancelar» primero; la pregunta termina en el píxel 57 y los botones empiezan en el 67 |
| Área de toque de los botones | 47 px de alto, por encima del mínimo de 44 de HU-10 |
| Errores en consola con StrictMode | ninguno |
| Desbordamiento horizontal | ninguno a 981 px |

**Lo que no se pudo medir aquí:** el ancho de 375 px. La emulación de tamaño no surtió efecto
en esta sesión, así que la comprobación en móvil quedó entera para la pasada en vivo, que es
donde la Definición de Terminado la pide de todas formas. **Se hizo**, y está en la última
fila de la tabla de abajo.

### Comprobación en vivo

Sobre el sitio publicado, con sesión de actor cultural. Sin despliegue de reglas previo:
esta historia no las toca (§8).

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| 27/08/2026 | «Editar» convierte la tarjeta en el formulario, relleno | Correcto |
| 27/08/2026 | Las dos fechas se abren con la hora con la que se guardaron | Correcto: ni se mueve la hora ni salta el día |
| 27/08/2026 | «Cancelar» devuelve la tarjeta sin cambios | Correcto |
| 27/08/2026 | Cambiar el título y guardar deja el título nuevo | Correcto |
| 27/08/2026 | Editar una publicación **aprobada** avisa de que volverá a revisión | Correcto: el aviso sale antes de escribir, no al guardar |
| 27/08/2026 | Al guardar esos cambios queda «En revisión» | Correcto: es el primer criterio, y lo impone la regla |
| 27/08/2026 | Mover el punto de una aprobada avisa igual y la devuelve a revisión | Correcto: el límite que HU-22 documentó queda levantado (§6) |
| 27/08/2026 | Un clic en «Eliminar» pregunta con el título delante y **no** borra | Correcto: es el segundo criterio |
| 27/08/2026 | «Cancelar» en esa pregunta deja la publicación donde estaba | Correcto |
| 27/08/2026 | «Eliminar» y después «Sí, eliminar» sí borra, y el aviso dice cuál | Correcto |
| 27/08/2026 | Todo lo anterior a 360 px, sin desbordamiento horizontal | Correcto |

Las **once** pasaron. La última cierra lo que quedó abierto en el banco de pruebas: la
emulación de tamaño no había surtido efecto y el ancho de móvil se quedó sin medir. Ahora
está medido donde de verdad cuenta, que es sobre un teléfono y no sobre una ventana
encogida.

La segunda es la que vale por `src/utils/publicaciones.js` entero. Se hizo sobre una
publicación de tarde —a partir de las 19:00, que en UTC ya es el día siguiente— porque con
una de la mañana el defecto de la conversión no se habría manifestado y la fila habría dicho
«correcto» sin comprobar nada.

Y la sexta y la séptima son el mismo criterio por dos caminos distintos: el formulario
completo y el editor de punto. Que las dos devuelvan la publicación a revisión es lo que
demuestra que el «vuelve a pendiente» no es una costumbre de un formulario, sino la regla
actuando sobre cualquiera que escriba.

---

## 10. Lo que queda fuera

| Qué | Dónde va |
| --- | --- |
| Aprobar, devolver y registrar la moderación | HU-24 |
| Ver las observaciones por las que una publicación fue devuelta | HU-24 |
| Que el catálogo público refleje la retirada | HU-25, cuando exista el catálogo |
| Deshacer un borrado | registrado como TF-01 en [02 §5](02-alcance-mvp.md), fuera de sprint |

Sobre lo último, y para que conste: **el borrado es definitivo**. No hay papelera ni
`estadoPublicacion: 'eliminado'`. Es lo que hace que la pregunta de la sección 3 tenga que
estar bien hecha, y la razón de que diga «no se puede deshacer» con esas palabras.

---

*Elaboración propia (2026).*
