# Categorías culturales

> **Historia de usuario:** HU-17 · Sprint 4
> **Objetivo específico:** 2 — Desarrollar los módulos del prototipo funcional.
> **Requisitos asociados:** RF-07 (clasificar la publicación), RF-14 (gestión del administrador).
> **Depende de:** [HU-15 · roles y permisos](15-roles-y-permisos.md).

La categoría es lo que hace que el catálogo se pueda filtrar. Sin ella, la oferta cultural
de Santa Marta es una lista larga, y buscar «qué hay de música este fin de semana» deja de
ser posible: es el requisito RF-10, y depende por completo de que esta clasificación sea
coherente.

---

## 1. El identificador sale del nombre, y no cambia nunca

«Música y danza» produce `musica-y-danza`. Dos decisiones ahí:

**Legible a propósito.** Ese identificador queda escrito dentro de cada evento, en
`eventos.categoria`. Leer `musica-y-danza` en la base de datos dice qué es; un identificador
generado al azar obliga a consultar otra colección para entender el dato que se tiene
delante, y eso convierte cualquier revisión de los datos en una cadena de consultas.

**Renombrar no lo cambia.** Si el administrador corrige «Musica y danza» a «Música y danza»,
el identificador sigue siendo el mismo y las publicaciones ya clasificadas siguen apuntando
a donde apuntaban. Lo prohíben también las reglas:

```
allow update: if soyAdmin() && !toca(['idCategoria']) && …
```

Y de ahí sale una comprobación menos evidente: **dos nombres que solo se diferencian en
tildes o mayúsculas producen el mismo identificador**. Crear «MUSICA Y DANZA» cuando ya
existe «Música y danza» no crearía una segunda categoría, sino que sobrescribiría la
primera. Por eso el duplicado se detecta comparando identificadores y no nombres escritos.

## 2. Una categoría no se elimina: se desactiva

Este es el hallazgo de la historia, y conviene leerlo entero porque el criterio de
aceptación pedía otra cosa.

El criterio dice: *«dada una categoría con publicaciones asociadas, cuando intente
eliminarla, el sistema debe advertirlo e impedir la pérdida de la clasificación»*. La lectura
inmediata es una regla condicional: permitir borrar si no hay publicaciones, negarlo si las
hay.

**Esa regla no se puede escribir.** Las reglas de seguridad de Firestore no pueden consultar
otra colección: `exists()` y `get()` acceden a un documento concreto, no a una consulta. No
hay manera, desde `match /categorias/{id}`, de contar cuántos documentos de `eventos` tienen
`categoria == id`.

Quedaban tres caminos:

| Camino | Por qué no |
| --- | --- |
| Que el cliente cuente y el servidor confíe. | El recuento lo aportaría el navegador, y el navegador puede mentir. Sería una promesa que el servidor no puede cumplir. |
| Guardar el recuento en la propia categoría. | Habría que incrementarlo al publicar, y quien publica es un actor cultural, que no puede escribir en `categorias` (RF-14). Abrir esa escritura para mantener un contador abre la colección entera. |
| No borrar nunca. | Es el que se tomó. |

Una categoría se **desactiva**: `activa: false`. Deja de ofrecerse en los formularios de
publicación y en los filtros del catálogo, y las publicaciones que ya la usan conservan su
clasificación intacta. Las reglas cierran la puerta del todo:

```
allow delete: if false;
```

**Negarlo siempre es más fuerte que negarlo a veces**, y es la única garantía que el servidor
puede cumplir de verdad. El coste es que una categoría creada por error se queda en el
listado del panel, desactivada; borrarla del todo exige entrar a la consola de Firebase, que
no pasa por estas reglas. Es un coste pequeño y visible, frente a la alternativa de que un
evento se quede apuntando a una categoría que ya no existe.

La interfaz acompaña esa decisión en lugar de esconderla. El botón se llama **«Eliminar»**,
porque es lo que la persona va a buscar, y al pulsarlo explica lo que ocurre:

> Esta categoría clasifica **3 publicaciones**. Eliminarla las dejaría sin clasificar, así
> que **no se elimina**. Al desactivarla deja de ofrecerse en los formularios y en los
> filtros, y lo ya clasificado se conserva.

Con cero publicaciones el mensaje cambia, pero la conclusión no: el catálogo no borra
categorías. Decir lo mismo en los dos casos, y no solo cuando estorba, es lo que hace que la
regla se entienda a la primera.

## 3. El recuento se cuenta en el servidor

El tercer criterio pide que el listado muestre cuántas publicaciones usa cada categoría. Se
resuelve con una **consulta de recuento**: el servidor devuelve el número sin enviar los
documentos.

```js
const consulta = query(collection(db, 'eventos'), where('categoria', '==', idCategoria));
return (await getCountFromServer(consulta)).data().count;
```

Traer los eventos para contarlos con `length` funcionaría hoy, con el catálogo vacío, y
dejaría de funcionar el día que haya publicaciones de verdad: abrir el panel descargaría el
catálogo entero para mostrar diez números. Es el tipo de decisión que no se nota hasta que ya
es cara de cambiar.

## 4. Cambios en el modelo de datos

`categorias` gana un campo respecto a [04 §7](04-modelo-datos.md):

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `activa` | `boolean` | Sí | Si se ofrece o no en formularios y filtros. Sustituye a la eliminación. |

Las categorías sembradas antes de esta historia no lo tienen; el servicio las considera
activas, que es como se venían comportando.

## 5. Verificación

### Las funciones puras · `npm run probar`

De 21 a **40 casos**. Los que añade esta historia comprueban la conversión del nombre en
identificador y la detección del duplicado:

```
▶ aIdentificador
  ✔ convierte el nombre en un identificador legible
  ✔ junta los espacios seguidos en un solo guion
  ✔ los signos de puntuación se vuelven separadores
  ✔ no deja guiones sueltos al principio ni al final
  ✔ dos nombres que solo difieren en tildes o mayúsculas dan el mismo identificador
  ✔ un nombre sin letras ni números da identificador vacío, y hay que detectarlo
▶ normalizarTexto
  ✔ pasa a minúsculas y quita las tildes
  ✔ conserva la eñe: «año» y «ano» no son la misma palabra
  ✔ la diéresis también se va
▶ categorías culturales (HU-17)
  ✔ un nombre nuevo se acepta
  ✔ el nombre vacío se bloquea
  ✔ un nombre demasiado corto se bloquea
  ✔ un nombre que no cabe en un filtro se bloquea
  ✔ acepta exactamente la longitud máxima
  ✔ detecta el duplicado aunque cambien las tildes y las mayúsculas
  ✔ un nombre sin letras ni números se bloquea antes de llegar al servidor
```

Dos merecen comentario. **La eñe** no es una N con tilde: la descomposición Unicode la
separaría igual que a las vocales acentuadas, y «Niñez» daría `ninez`. Se aparta antes de
descomponer y se restituye después. Y **el nombre sin letras**: sin esa comprobación se
intentaría crear un documento con identificador vacío, que Firestore rechaza con un error
que nadie entiende al verlo en pantalla.

### Las reglas · `npm run probar:reglas`

De 46 a **56 casos**:

```
▶ categorías · el catálogo no se borra (HU-17)
  ✔ el administrador crea una categoría
  ✔ NO se crea con un identificador distinto del documento
  ✔ NO se crea con un campo que no está en el modelo
  ✔ NO se crea sin nombre
  ✔ el administrador la renombra
  ✔ NO se cambia el identificador al renombrar
  ✔ el administrador la desactiva
  ✔ un actor NO la desactiva
  ✔ NADIE la elimina, tampoco el administrador
  ✔ una categoría desactivada se sigue leyendo: los eventos antiguos la nombran
```

El último cierra el círculo: si al desactivar se ocultara también la lectura, un evento
antiguo mostraría el identificador crudo en lugar del nombre de su categoría.

### Comprobación en vivo

El panel es la primera vista que exige sesión de administrador. Ejecutado sobre el sitio
publicado el **22/08/2026** con la cuenta del paso [06 §1.7](06-puesta-en-marcha.md):

| Criterio | Resultado |
| --- | --- |
| Crear una categoría y verla en el listado | ✅ «Danza» aparece con su identificador `danza`, y el aviso confirma que ya está disponible en los formularios de publicación. |
| El listado muestra el recuento de cada categoría | ✅ Columna «Publicaciones»: 0, que es lo que corresponde con el catálogo de eventos vacío. |
| «Eliminar» advierte y ofrece desactivar en su lugar | ✅ Texto completo en la captura: «Ninguna publicación la usa ahora mismo, pero el catálogo **no elimina categorías**…», con los botones Desactivar y Cancelar. |
| Desactivar y reactivar | ✅ La etiqueta pasa de «Se ofrece» a «No se ofrece» y las acciones, de «Eliminar» a «Reactivar». |
| Medición a 360, 768 y 1366 px sobre el panel | ⬜ |

### Un defecto que apareció en esa comprobación

El resumen del listado decía **«1 categoría, 1 en uso»** al lado de una columna
«Publicaciones» que marcaba **0**. Las dos cifras eran correctas y se contradecían: «en uso»
se refería a las categorías que se ofrecen, y la columna, a las publicaciones que las usan.

No es un fallo de comportamiento, y por eso importa anotarlo: nadie lo habría encontrado
leyendo el código, porque cada frase por separado dice la verdad. Solo se ve con la pantalla
delante y un dato real dentro. El resumen dice ahora «1 categoría, 1 se ofrece en los
formularios y en los filtros», que es el mismo vocabulario de la etiqueta de cada fila.

## 6. Lo que queda fuera

- **«Disponible de inmediato en los formularios de publicación»** se cumple por construcción
  —`categoriasService.listarCategoriasActivas()` es la única fuente, y no hay copia en
  ninguna parte—, pero el formulario que la consumirá es de **HU-21** y todavía no existe.
  Lo que hoy se puede enseñar es el listado del panel actualizándose al crear.
- **La gestión del estado de las cuentas de usuario**, la otra mitad de RF-14, es del panel
  también y llega con **HU-24**. Las reglas ya la permiten solo al administrador y hay
  pruebas que lo fijan ([15 §6](15-roles-y-permisos.md)).
- **No hay reordenación manual** de las categorías: se listan por nombre. Si el orden llega a
  importar en los filtros, es una historia nueva.

## 7. Cierre de HU-17

| Criterio de aceptación | Evidencia |
| --- | --- |
| Una categoría creada queda disponible de inmediato en los formularios de publicación. | §6: fuente única en `categoriasService`, sin copias; el listado lo refleja al instante. Comprobación en vivo. |
| Una categoría con publicaciones asociadas no puede eliminarse, y el sistema lo advierte. | §2: la advertencia con el recuento, y `allow delete: if false` con su caso en el emulador. |
| El listado muestra el número de publicaciones asociadas a cada categoría. | §3: consulta de recuento en el servidor. Comprobación en vivo. |

---

*Elaboración propia (2026).*
