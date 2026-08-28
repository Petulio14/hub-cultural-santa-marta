# Contacto directo con el actor cultural

> **Historia de usuario:** HU-29 · Sprint 6
> **Épica:** E4 — Descubrimiento y contacto
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-12, RF-15.
> **Depende de:** HU-28.

Cierra la épica E4 y es la razón de ser de la plataforma: **que alguien que llegó buscando
un plan acabe hablando con quien lo ofrece, sin intermediarios**. Todo lo anterior —el
catálogo, los filtros, la búsqueda, la ficha— existe para llegar aquí.

También es la primera historia que **escribe en `interacciones`**, una colección que llevaba
declarada desde HU-05 y con regla desde HU-11 sin que nadie la usara. Y al usarla apareció
lo que suele aparecer.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| Se muestran los canales que el actor autorizó | `ContactoDelActor.jsx` |
| Cada canal abre su aplicación con el mensaje preparado | `contacto.js` |
| Queda constancia anonimizada de la interacción | `interaccionesService.js` + `firestore.rules` |

---

## 1. Detrás de un botón, porque lo pide el criterio

«Cuando seleccione la **opción de contacto**, entonces deben mostrarse los canales»: primero
se elige contactar y después se elige cómo.

Enseñarlos siempre habría sido más fácil de programar, y habría convertido el teléfono de
una persona en algo que se lee sin haberlo pedido. El botón no es decoración: es la
diferencia entre publicar un número y ofrecerlo.

El botón lleva `aria-expanded` y `aria-controls`, así que quien usa un lector de pantalla
sabe que hay algo que se despliega y que se desplegó.

## 2. Solo los que el actor autorizó

Los tres campos de contacto son opcionales desde HU-18. Aquí se pinta lo que haya y nada
más: no se inventa un canal, y **no se enseña un botón apagado** que anuncie que existe un
teléfono que no se va a dar.

Si el actor no autorizó ninguno, se dice y se ofrece su perfil, que es donde cuenta quién
es. Y si el perfil no está disponible —el caso que encontró
[HU-28 §3](27-detalle-de-la-publicacion.md)— no hay a quién escribir, así que tampoco hay
botón.

## 3. Una llamada no lleva mensaje

El segundo criterio pide que el canal se abra «con el mensaje inicial prellenado». Dos de
los tres lo permiten:

| Canal | Cómo se prepara | Mensaje |
| --- | --- | --- |
| WhatsApp | `wa.me/<número>?text=…` | Sí |
| Correo | `mailto:<correo>?subject=…&body=…` | Sí, con asunto |
| Teléfono | `tel:+<número>` | **No existe** |

`tel:` abre el marcador con el número puesto y no admite ningún parámetro para escribir
nada. No es una limitación de la implementación: **una llamada no es un mensaje**. Se hace
lo único que se puede hacer, que es marcar, y cuando el teléfono es el único canal la vista
lo dice en lugar de dejar creer que también irá preparado.

### Qué dice el mensaje

> Hola. Escribo desde el Hub Cultural de Santa Marta por la actividad «Cumbia y tambora».
> Me gustaría saber más.

**De dónde viene** y **por qué actividad se pregunta**: las dos cosas que el actor necesita
para responder sin tener que preguntarlas. Sin ellas, un «hola» suelto desde un número
desconocido es indistinguible de cualquier otro mensaje del día.

Termina sin pregunta concreta a propósito. Lo que quiera saber quien escribe lo sabe esa
persona, y rellenárselo entero convertiría el mensaje en algo que no ha escrito nadie. Se
deja **empezado, no dicho**.

Y se enseña **antes** de abrir nada. Un enlace que prepara un mensaje en nombre de quien lo
pulsa tiene que enseñarlo primero: lo va a mandar esa persona, con su número y su nombre.

## 4. La trampa: el espacio no siempre es `%20`

Los parámetros del `mailto:` se componen a mano y **no con `URLSearchParams`**, y la razón
merece quedar escrita porque el código incorrecto parece el correcto.

`URLSearchParams` codifica con las reglas de un formulario web
(`application/x-www-form-urlencoded`), donde **el espacio se escribe `+`**. Un cliente de
correo no aplica esas reglas: interpreta los porcentajes y deja el `+` tal cual.

| | Asunto que se envía | Asunto que se lee |
| --- | --- | --- |
| `URLSearchParams` | `Consulta+sobre+algo` | `Consulta+sobre+algo` |
| `encodeURIComponent` | `Consulta%20sobre%20algo` | `Consulta sobre algo` |

Solo se ve al abrir el correo de verdad, con el texto roto delante. Hay un caso de prueba
que exige explícitamente que el enlace contenga `%20` y **no contenga ningún `+`**, y otro
que comprueba que un `?` o un `&` dentro del mensaje no parten la dirección en dos.

## 5. La regla era más laxa que el modelo, otra vez

`interacciones` tenía regla desde HU-11 y tres casos de prueba. Esta es la primera historia
que escribe en ella de verdad, y al hacerlo apareció el mismo hueco que
[HU-24 §4](23-moderacion.md) encontró en `moderaciones`, por la misma puerta:

**`hasOnly` acota por arriba y no por abajo.** Admite *menos* claves de las que enumera. Así
que pasaba esto:

```js
{ tipo: 'contacto', fecha: serverTimestamp() }   // sin idEvento, y se aceptaba
```

Un registro sin evento al que referirse no ensucia la colección: **no significa nada**.
Ningún indicador de HU-34 lo puede contar, y sin embargo cuenta como fila.

La regla ahora exige lo que el modelo declaraba desde HU-05:

| Campo | Lo que se exige |
| --- | --- |
| `idInteraccion` | igual al identificador del documento |
| `idEvento` | texto y no vacío |
| `tipo` | `consulta` o `contacto` |
| `fecha` | `request.time` — la del servidor |

### Los tres casos de HU-11 siguen valiendo por el motivo que dicen

Es la comprobación que HU-24 tuvo que hacer y que ahí falló: al apretar una regla, un caso
antiguo puede seguir en verde **por una razón distinta de la que anuncia**.

Aquí no ocurre. El primero envía los cuatro campos con el identificador correcto y sigue
pasando; el segundo lo rechaza `hasOnly`, que es exactamente lo que lo rechazaba antes; el
tercero es una lectura y no le afecta. No hizo falta tocar ninguno.

### Y el registro es inmutable, cosa que nadie había comprobado

`allow update, delete: if false` estaba escrito desde HU-11 y **sin un solo caso**. Es la
racha que HU-22, HU-23 y HU-25 fueron encontrando en otras reglas
([22 §1](22-edicion-y-eliminacion.md)), y aquí vuelve.

Importa más que en otras colecciones: de estos documentos salen los indicadores que se van a
presentar. Un registro que se puede reescribir no es constancia de nada.

## 6. Dispara y olvida, y lo que eso cuesta

Al pulsar un canal se deja constancia y **no se espera a que termine**.

Quien pulsa «WhatsApp» quiere abrir WhatsApp. Esperar a que Firestore confirme antes de
dejarle ir sería cobrarle la latencia de un indicador que no le sirve de nada, y en un móvil
con mala señal son segundos mirando un botón que no responde. La escritura sale y no se
espera; si falla, se pierde ese registro y no ocurre nada más.

La contrapartida se dice y no se esconde: **el recuento de HU-34 es una cota inferior**.
Cuenta los contactos que se pudieron registrar, no todos los que hubo. Un indicador que se
anuncia como aproximado y lo es vale más que uno exacto que cuesta segundos a cada
visitante.

Por eso el `catch` del componente está vacío. No hay nada que la persona pueda hacer con ese
error, y enseñárselo sería contarle un problema que no es suyo justo cuando está saliendo de
la página.

## 7. Lo que no se guarda, y por qué

Cuatro campos, y del visitante **nada**: ni quién es, ni desde dónde entró, ni por qué canal
contactó.

Lo último merece explicación, porque sería el dato más interesante para el actor cultural y
es justo el que no se recoge. «Contactó por WhatsApp» no identifica a nadie por sí solo,
pero el documento ya lleva **el evento y la hora**: con un catálogo pequeño, la combinación
de las tres cosas puede señalar a una persona concreta, sobre todo si el actor recibió ese
mensaje en el mismo minuto. RNF-06 pide minimizar, y minimizar es no recoger lo que no hace
falta para el indicador que HU-34 va a calcular, que es **cuántos** contactos hubo.

Es la misma razón por la que **el actor no puede leer las interacciones de su propia
publicación**, aunque parecería razonable dárselas. Cruzar «hubo un contacto a las 18:42»
con el mensaje que le entró a las 18:42 reconstruiría por la puerta de atrás el dato que se
decidió no recoger. Solo las lee el administrador, y hay un caso que lo fija.

## 8. Cambios en el modelo y en las reglas

**`firestore.rules` cambia**, por primera vez desde HU-24 y solo en `interacciones` (§5). No
concede ningún permiso nuevo: **quita** los documentos mal formados que antes pasaban.

| | Antes | Ahora |
| --- | --- | --- |
| Documento sin `idEvento` | se aceptaba | denegado |
| `idEvento` vacío o no textual | se aceptaba | denegado |
| `idInteraccion` distinto de la ruta | se aceptaba | denegado |

**`firestore.indexes.json` no cambia**: HU-34 necesitará agrupar estos documentos, y ese
índice lo declarará la historia que haga la consulta.

> **Al fusionar hay que publicar las reglas.** Aplica el orden de
> [12 §5.1](12-despliegue-continuo.md): **primero fusionar, después**
> `firebase deploy --only firestore:rules`. La regla nueva es más estricta, así que el código
> anterior —que no escribía nada aquí— no se ve afectado, pero el orden se respeta igual.

## 9. Verificación

### Las funciones puras · `npm run probar`

**274 casos, 58 grupos.** Once son de esta historia, y casi todos de codificación:

| Qué comprueba | Casos |
| --- | --- |
| El mensaje dice de dónde viene y por qué actividad, y aguanta un título ausente | 3 |
| Los enlaces con mensaje, y los mismos enlaces **sin** mensaje, que usa el perfil desde HU-18 | 4 |
| El espacio es `%20` y no `+`; tildes, comillas, `?` y `&` viajan codificados | 2 |
| Solo el asunto no deja un `&` colgando; sin número no hay enlace aunque haya mensaje | 2 |

### Las reglas · `npm run probar:reglas`

**Once casos nuevos.**

| Qué comprueba | Casos |
| --- | --- |
| El tercer criterio: se registra, con tipo válido y fecha del servidor | 3 |
| El hueco de `hasOnly`: sin `idEvento`, vacío, no textual, o con el identificador cambiado | 4 |
| El registro es inmutable: ni el administrador lo edita ni lo borra | 2 |
| Quién lee: el administrador sí; el actor dueño del evento, no; un visitante, tampoco | 2 |

### En el navegador

Sobre una publicación aprobada real, con un actor que tiene los tres canales:

| Comprobación | Resultado |
| --- | --- |
| Los canales están ocultos hasta pulsar «Contactar con…» | Correcto, `aria-expanded="false"` |
| Al pulsar se despliegan y el botón cambia a «Ocultar los canales» | Correcto, `aria-expanded="true"` |
| Aparecen los tres canales autorizados y ninguno más | WhatsApp, correo y teléfono |
| WhatsApp lleva el mensaje en `text=` | Correcto |
| El correo lleva asunto y cuerpo | `subject=Consulta%20sobre%20%C2%ABrumba%20cultural%C2%BB&body=…` |
| **Ningún `+` donde debería haber `%20`** | Correcto |
| El teléfono abre el marcador, sin mensaje | `tel:+57…` |
| WhatsApp abre en otra pestaña con `noopener noreferrer` | Correcto |
| El mensaje preparado se enseña antes de abrir nada | Correcto |
| El servicio rechaza un tipo inválido o un evento vacío antes de ir a la red | Correcto, los tres casos |
| Errores en consola | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

**Lo que no se comprobó aquí a propósito:** la escritura real del registro. Se pudo hacer y
no se hizo: el documento habría ido a la colección de producción, y la regla —la de
siempre— **no permite borrarlo**. Habría dejado un contacto inventado dentro de los
indicadores que HU-34 va a presentar. Lo que sostiene el tercer criterio son los once casos
contra el emulador; el camino completo se recorre en la pasada en vivo, donde ese registro
sí es legítimo.

**Y lo que no se pudo comprobar:** la rama de un actor **sin ningún canal**, porque no hay
ninguno así en el proyecto.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado y **después de publicar las reglas** (§8)._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 10. Lo que queda fuera

- **Contar las consultas de una ficha** (`tipo: 'consulta'`) es de [HU-34](https://github.com/Petulio14/hub-cultural-santa-marta/issues/34), con el obstáculo que anota [27 §8](27-detalle-de-la-publicacion.md): un visitante no puede tocar `contadorConsultas`, aunque **sí** puede crear una interacción. Puede que la respuesta esté ahí.
- **Un formulario de contacto dentro de la plataforma**, con el mensaje guardado y respondido desde aquí. Exigiría almacenar el mensaje y la identidad de quien escribe, que es exactamente lo que RNF-06 evita, y notificar al actor, que exige Cloud Functions ([23 §3](23-moderacion.md)).
- **Saber si el contacto llegó a producirse.** El enlace abre WhatsApp; lo que pase después ocurre fuera y la plataforma no lo ve. Se registra la intención, no el resultado, y así se llama en la tabla de indicadores.
- **El mapa de toda la oferta** es [HU-30](https://github.com/Petulio14/hub-cultural-santa-marta/issues/30), lo último del sprint.
