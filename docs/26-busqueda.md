# Buscar por palabra clave

> **Historia de usuario:** HU-27 · Sprint 6
> **Épica:** E4 — Descubrimiento y contacto
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-10.
> **Depende de:** HU-25.
> **Prioridad (MoSCoW):** Debería.

[HU-26](25-filtros-del-catalogo.md) sirve a quien no sabe qué quiere y va acotando. Esta
sirve a quien **ya lo sabe** y solo quiere escribirlo.

Es la primera historia del proyecto que se resuelve **fuera de la base de datos**, y toda
la documentación va de por qué, de qué cuesta y de qué se promete a cambio.

| Criterio | Dónde se cumple de verdad |
| --- | --- |
| El término encuentra en el título o en la descripción | `busqueda.js`, en memoria |
| Sin resultados: mensaje y sugerencia de limpiar | `Catalogo.jsx` + `FiltrosDelCatalogo.jsx` |
| Con o sin tildes, en mayúsculas o minúsculas, lo mismo | `normalizarTexto`, de HU-17 |

---

## 1. Firestore no sabe buscar dentro de un texto

Sabe comparar por igualdad y por rango, y nada más. No hay `contains`, no hay «parecido a»,
no hay puntuación por relevancia. Las salidas posibles eran tres:

| Salida | Por qué no, o por qué sí |
| --- | --- |
| Un índice de texto externo: Algolia, Typesense, la extensión de Firebase | Exige el plan **Blaze**. Es la misma restricción que dejó las imágenes fuera de Storage ([18 §1](18-imagen-del-perfil.md)) y la devolución sin correo ([23 §3](23-moderacion.md)) |
| Una consulta **por prefijo** sobre `tituloNormalizado` | Es lo único que Firestore puede hacer solo, y **no cumple el criterio**: encuentra «cumbia» al principio del título y no en medio, y no mira la descripción |
| Comparar **en memoria** sobre lo que se ha traído | Lo que [04 §11](04-modelo-datos.md) dejó escrito desde HU-05, y lo que hay aquí |

La segunda merece un párrafo, porque es la que parece que se está descartando por comodidad
y no lo es. El primer criterio dice «cuyo **título o descripción** lo contengan», y una
consulta por prefijo falla en las dos mitades de esa frase: solo mira una de las dos, y solo
por el principio. Hay un caso de prueba que busca `bora` y encuentra «Taller de tam**bora**»
—dentro de una palabra, en medio del título— precisamente para fijar que eso es lo que se
espera.

Y la primera no es un capricho de presupuesto: **RNF-10** deja el proyecto en el plan
gratuito, y esa restricción ya moldeó tres historias antes que esta. Que vuelva a aparecer
aquí es coherencia, no mala suerte.

## 2. Buscar apaga la paginación

HU-25 trae doce actividades por página. Buscar dentro de doce **encuentra dentro de doce**,
y quien busca «gaitas» no está pidiendo «gaitas entre las doce primeras».

Así que con término escrito la consulta cambia de forma: se pide de una vez todo lo que
cumple los filtros del servidor —categoría, fechas, aprobado, sin terminar— y el término se
aplica en memoria sobre eso.

No hizo falta tocar el servicio. `listarPublicacionesAprobadas` ya recibía `tamano`, así que
buscar es pedir una página muy grande:

```js
listarPublicacionesAprobadas({
  ...limitesDeConsulta(filtros),
  ...(conTermino ? { tamano: TOPE_DE_BUSQUEDA } : {}),
})
```

La consecuencia visible es que **«Ver más» desaparece mientras se busca**. Es correcto: ya no
hay una página siguiente, hay un tope.

> **Y hay una razón menos evidente para que desaparezca.** El cursor de HU-25 es «la última
> publicación de la lista», y al buscar la última de la lista **no es** la última que trajo
> la consulta: el término descartó algunas por el camino. Usarla como cursor se saltaría
> todo lo que hay entre una y otra. `cargarMas` lo comprueba explícitamente en lugar de
> confiar en que el botón no esté pintado.

## 3. El tope, y decirlo

Una consulta sin límite crece con el catálogo y cada documento se paga. El tope son
**doscientas** actividades: más de dieciséis páginas del catálogo, bastante más de lo que
nadie recorre a mano.

Lo que importa no es el número sino qué se hace al alcanzarlo. Cuando la consulta devuelve
el tope completo, la vista lo dice:

> La búsqueda revisó las **200** actividades más próximas a terminar, que no son todas las
> que hay. Si no encuentras lo que buscas, acota con la categoría o con las fechas.

Sin ese aviso, «ninguna actividad menciona *cumbia*» sería una afirmación falsa presentada
como cierta. El recuento normal tampoco se calla lo que sabe: al buscar dice **«3 de 47
revisadas»** y no «3 actividades», porque lo segundo sugiere que el catálogo tiene tres.

## 4. El campo que se guardó para esto y que esto casi no usa

HU-21 guarda `tituloNormalizado` dentro de cada documento, y su comentario dice por qué:
*«Firestore no sabe comparar sin distinguir tildes, así que la única forma de que “Cumbia”
encuentre “cumbia” en HU-27 es que el documento ya lleve la versión normalizada»*.

Ese razonamiento **da por supuesta una comparación en el servidor**. Al hacerse en memoria,
normalizar al vuelo es posible y cuesta microsegundos.

El campo se usa igualmente —lo dice [04 §11](04-modelo-datos.md) y ahorra normalizar el
título en cada comparación—, pero conviene dejar escrito que la mitad de la comparación se
normaliza al vuelo de todas formas, porque **la descripción nunca se guardó normalizada**:

```js
const texto = `${publicacion.tituloNormalizado || normalizarTexto(publicacion.titulo)} ${normalizarTexto(publicacion.descripcion)}`;
```

La asimetría es exacta: se anticipó la mitad del problema. No se corrige añadiendo
`descripcionNormalizada` —eso cambiaría la forma del documento, la regla que la valida y
todos los documentos ya escritos, para ahorrar un trabajo que no cuesta nada—, y sí se
anota, porque lo que de verdad justificaría el campo guardado es la búsqueda por prefijo que
ningún criterio pide.

`aPublicacion` no lo exponía. Esta historia lo añade al objeto de dominio, que es el único
cambio que el servicio necesitó.

## 5. Palabras, no cadena

«Contener el término» en sentido estricto haría que **«taller tambora» no encontrara «Taller
de tambora»**, que es exactamente lo que quien lo escribe está buscando.

Así que el término se parte en palabras y se exigen **todas**:

- Buscar por palabras encuentra todo lo que encontraría la cadena entera, y además eso. Es
  un superconjunto, así que no deja fuera nada de lo que el criterio exige.
- **Todas** y no «cualquiera de ellas»: quien escribe dos palabras está acotando, no
  ampliando. «Taller cumbia» busca lo que es las dos cosas.
- Las palabras pueden estar en el título y en la descripción repartidas. Hay un caso que
  busca «gaitas magdalena» y encuentra una actividad titulada «Noche de gaitas» cuya
  descripción dice «del Magdalena».

## 6. El tercer criterio se demuestra entero con funciones puras

«Con o sin tildes y en mayúsculas o minúsculas, el resultado debe ser equivalente» no
necesita ni servidor ni navegador: es una propiedad de `normalizarTexto`, que existe desde
HU-17 y cuya cabecera ya nombraba esta historia.

Se comprueba **en las dos direcciones**, que es el detalle que se escapa: normalizar solo el
dato guardado deja fuera a quien escribe correctamente. Hay un caso que compara el resultado
de buscar `percusión` con el de buscar `percusion` y exige que sean el mismo, en lugar de
comprobar solo que la versión sin tilde encuentra algo.

Y la eñe sigue siendo otra letra, que es la promesa que `normalizarTexto` lleva haciendo
desde HU-17: «año» y «ano» no son la misma palabra.

## 7. Sin resultados, el mensaje dice la palabra

El segundo criterio pide informar y sugerir limpiar los filtros. El mensaje **nombra el
término**:

> **Ninguna actividad menciona «cumbia».** Prueba con otra palabra, o quita los filtros de
> categoría y de fecha.

«Sin resultados» a secas deja la duda de si el término llegó a enviarse. Y la sugerencia de
limpiar no es solo texto: el botón «Limpiar los filtros» de HU-26 está ahí mismo, y el
catálogo vacío ofrece además «Ver el catálogo completo».

Son ya **tres** versiones del mensaje de vacío, y decir lo mismo en las tres sería peor que
no decir nada:

| Situación | Qué se ofrece |
| --- | --- |
| No hay nada publicado, o todo terminó | El directorio de actores, y el registro |
| Los filtros no encontraron nada | Ampliar el rango, o ver el catálogo completo |
| **La palabra no aparece en ninguna** | Probar otra palabra, o quitar los otros filtros |

## 8. Un botón, y no buscar al escribir

Buscar mientras se teclea es lo habitual y aquí **cada tecla cuesta una consulta al
servidor**, porque con término se pide de una vez todo lo que cumple los filtros. Escribir
«tambora» serían siete consultas de hasta doscientos documentos cada una.

Un botón lo deja en una. Y encaja con lo que HU-26 ya había decidido por otro motivo —un
rango de fechas a medias no es una pregunta—, así que el formulario sigue teniendo una sola
regla en lugar de dos.

El campo va en su propia línea y **antes** que los tres de afinar: es la pregunta que se hace
cuando ya se sabe qué se busca, y las otras son para cuando no. `type="search"` le da al
móvil el teclado con la lupa, y el `role="search"` del formulario lo anuncia como tal.

## 9. Cambios en el modelo y en las reglas

**Ninguno en `firestore.rules`**, por tercera historia consecutiva. **Ninguno en
`firestore.indexes.json`**: la búsqueda usa las mismas consultas de HU-26, solo que con un
`limit` mayor, y el tamaño de una página no cambia qué índice hace falta.

Es la primera historia del sprint que no toca nada del servidor. También es la primera que
no añade casos a `pruebas/reglas`, y por la misma razón: no hay ningún permiso nuevo que
comprobar, y escribir casos que repitan los de HU-26 con otro `limit` sería inflar la cuenta
sin medir nada.

El único cambio en `eventosService.js` es exponer `tituloNormalizado` en el objeto de
dominio (§4).

## 10. Verificación

### Las funciones puras · `npm run probar`

**263 casos, 56 grupos.** Veinte son de esta historia, y entre los tres bloques cubren los
tres criterios enteros:

| Qué comprueba | Casos |
| --- | --- |
| `palabrasDe`: partir el término, espacios de sobra, término vacío | 3 |
| **Tercer criterio**: tildes en las dos direcciones, mayúsculas, y la eñe que no se descompone | 4 |
| **Primer criterio**: por título, por descripción, en medio de una palabra, y lo que no está | 4 |
| Varias palabras acotan y no amplían, en cualquier orden y repartidas entre los dos campos | 4 |
| Sin término no se filtra nada | 2 |
| El tope, y documentos a los que les falta un campo | 3 |

> Una nota sobre el ayudante de las pruebas. Simula lo que guarda el servicio, y para eso
> llama al **`normalizarTexto` de verdad** en lugar de reimplementarlo. La primera versión
> lo copiaba a mano: habría seguido en verde para siempre midiendo su propia copia, que es
> la forma más silenciosa de que una suite deje de decir la verdad.

### Las reglas · `npm run probar:reglas`

**197 casos, los mismos que dejó HU-26: sin casos nuevos**, y es deliberado (§9).
Se ejecutan igualmente, y en verde, en la
[ejecución 33210325425](https://github.com/Petulio14/hub-cultural-santa-marta/actions/runs/33210325425):
una historia que no añade permisos tiene que dejar intactos los que había.

### En el navegador

| Comprobación | Resultado |
| --- | --- |
| El campo de palabra clave aparece primero y en su propia línea | Correcto |
| El formulario se anuncia con `role="search"` | Correcto |
| El botón de envío pasa a llamarse «Buscar» | Correcto |
| Errores en consola con StrictMode | ninguno |
| `npm run verificar` | sin incidencias |
| `npm run build` | limpio |

**Lo que no se pudo medir al escribir esta historia, otra vez:** ninguna búsqueda contra
datos reales. `firebase firestore:indexes` decía que **los cuatro índices seguían sin
publicar** —el de HU-25 y los tres de HU-26—, así que la consulta respondía
`failed-precondition` antes de que hubiera nada donde buscar. No era un defecto de esta
historia: era el despliegue de [12 §5.2](12-despliegue-continuo.md) pendiente.

> **Medido después, el 28/08/2026.** Los cuatro índices se publicaron ese día con
> `firebase deploy --only firestore:indexes`, y `firebase firestore:indexes` confirma los
> diez declarados. Con ellos en su sitio se repitió la comprobación contra los datos
> reales del proyecto, y esto es lo que dio:
>
> | Comprobación | Resultado |
> | --- | --- |
> | Buscar «ACORDEON», en mayúsculas y sin tilde | Encuentra «manejo de acordeón» |
> | Buscar «acordeón», con tilde | El mismo resultado |
> | Buscar una palabra que no está | Cero resultados, sin error |
>
> Las dos primeras filas son el tercer criterio comprobado sobre un título guardado de
> verdad, y no solo sobre el catálogo inventado de las pruebas unitarias.

### Comprobación en vivo

_Pendiente. Se hace sobre el sitio publicado y **con los cuatro índices ya publicados**._

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | | |

## 11. Lo que queda fuera

- **La búsqueda exhaustiva sobre todo el catálogo.** Es el tope de §3, y lo que lo levantaría es un índice de texto externo con el plan Blaze. Anotado como trabajo futuro en [02 §6](02-alcance-mvp.md).
- **Ordenar por relevancia.** El resultado conserva el orden del catálogo —lo más próximo a terminar primero—, que para quien está de paso dice más que una puntuación de coincidencia.
- **Buscar en el nombre del actor o en el lugar.** El criterio nombra título y descripción; ampliarlo sería decidir por cuenta propia qué más es «la actividad».
- **Resaltar el término en las tarjetas.** No lo pide ningún criterio y obliga a inyectar marcado dentro de texto que escribió otra persona.
