# El perfil del actor cultural

> **Historia de usuario:** HU-18 · Sprint 5
> **Épica:** E2 — Perfiles de actores culturales y hubs
> **Objetivo específico:** 2
> **Requisitos asociados:** RF-03, RF-06, RF-12.
> **Depende de:** HU-15 (roles y permisos), HU-17 (catálogo de categorías).

El primer contenido que la plataforma publica no lo escribe el administrador: lo escribe
quien sostiene la manifestación cultural. Esta historia abre esa puerta y decide cuatro
cosas que el resto de la épica hereda: dónde vive el perfil, quién puede tocarlo, cuándo se
hace público y cómo se contacta a su dueño.

---

## 1. Las cinco cosas que había que resolver

| Criterio de aceptación | Dónde se resuelve |
| --- | --- |
| El perfil se guarda y queda asociado a mi cuenta | §2 — el identificador del documento es el `uid` |
| Al editarlo, los cambios se ven sin nueva aprobación | §5 — el dueño no escribe `estado` |
| La descripción avisa antes del envío si pasa del límite | §4 — el contador, y el mismo tope en las reglas |
| El perfil de otro actor no se puede editar | §6 — la propiedad se comprueba en las reglas |
| Un visitante sin cuenta lo ve en `/actores` y en `/actores/:id` | §7 — el directorio filtra en el servidor |

---

## 2. El identificador del perfil es el `uid` de su dueño

Un actor tiene un perfil, y solo uno. El modelo lo declara así desde HU-05 —la relación
`usuarios ||--o| actoresCulturales` de [`04-modelo-datos.md` §2](04-modelo-datos.md) es de
uno a cero-o-uno—, pero declararlo no lo impide: con un identificador generado al azar,
nada evitaba que la misma cuenta creara veinte perfiles.

Impedirlo desde la interfaz no sirve. La regla del proyecto es que **el control vive en dos
capas simultáneas** ([`11-reglas-de-seguridad.md`](11-reglas-de-seguridad.md)), y lo que la
interfaz esconde tiene que rechazarlo también el servidor. El problema es que una regla de
Firestore no puede preguntar «¿existe ya otro documento con este `uid`?»: no hay consultas
dentro de las reglas, solo `exists()` sobre **una ruta concreta**.

De ahí la decisión: **la ruta concreta es el `uid`.**

```
/actoresCulturales/{uid}
```

Con eso, la regla que garantiza «un actor, un perfil» cabe en una línea, porque crear un
segundo perfil obligaría a escribir en una ruta que no es la propia:

```javascript
allow create: if tengoRol('actor')
  && idActor == miUid()
  && request.resource.data.uid == miUid()
  && ...
```

Es la misma decisión que ya se había tomado en `usuarios` ([`04` §3](04-modelo-datos.md)) y
por la misma razón. Trae además dos ventajas que no se buscaban:

- **Leer el perfil propio es una lectura directa**, `getDoc(doc(db, ..., uid))`, y no una
  consulta con filtro. Ni índice, ni recorrido, ni caso de «devolvió dos».
- **La dirección pública no cambia si el actor se renombra**, porque no deriva del nombre.

### ¿Y no es un problema publicar el `uid`?

Es la objeción evidente: `/actores/aB3x...` expone el identificador de Firebase
Authentication de una persona. Se comprobó qué abre ese dato por sí solo, y la respuesta es
**nada**:

- Las reglas nunca confían en un `uid` que llegue del cliente. Toda comprobación de
  identidad usa `request.auth.uid`, que lo pone el servidor a partir del token.
- `usuarios/{uid}` solo lo lee su dueño o el administrador (`allow get: if autenticado() &&
  (miUid() == uid || soyAdmin())`), así que conocer el identificador no descubre el correo
  ni el rol de nadie.
- Lo único que revela es que esa cuenta tiene un perfil de actor cultural publicado, que es
  precisamente lo que el directorio publica.

---

## 3. Por qué la edición tiene dirección propia: `/mi-perfil`

El prototipo de HU-06 describe V-4 como «público (lectura) / privado (edición)» y le da una
sola dirección, `/actores/:id`. Al construirla apareció un caso que la especificación no
podía prever: **quien todavía no tiene perfil no tiene tampoco un `:id` al que ir.** La
dirección de edición no puede depender de un documento que aún no existe.

Se añade por eso una ruta privada, `/mi-perfil`, con rol de actor cultural. Es la misma
excepción que ya hizo HU-16 con `/politica-de-datos`, y se resuelve igual: la ruta se
declara en [`rutas.jsx`](../src/routes/rutas.jsx) con el comentario que dice por qué no
estaba en el prototipo.

Crear y editar son **la misma pantalla**. Separarlas obligaría a decidir a cuál llevar a
alguien antes de saber si ya tiene perfil, es decir, a leer el documento para elegir la
ruta y volver a leerlo dentro de ella.

Un detalle que se decidió con esto: el actor cultural **aterriza en `/mi-perfil` al iniciar
sesión**, y no en `/mis-publicaciones` como hasta ahora. Sin perfil no puede publicar nada
—las reglas de `eventos` exigen un `idActor` que sea suyo—, así que llevarle primero a un
catálogo vacío sería enseñarle una puerta cerrada. El cambio está en
[`roles.js`](../src/routes/roles.js).

---

## 4. El límite de la descripción está escrito dos veces, a propósito

El tercer criterio pide que el exceso **se advierta antes del envío**. Eso obliga a
comprobarlo en el navegador; y la regla de las dos capas obliga a comprobarlo también en el
servidor. Son dos comprobaciones del mismo número, con dos propósitos distintos:

| Dónde | Qué aporta |
| --- | --- |
| [`validaciones.js`](../src/utils/validaciones.js) | El aviso llega **mientras se escribe**, no al pulsar «Guardar». |
| [`firestore.rules`](../firestore.rules) | El aviso no depende de que quien escribe use esta interfaz. |

Duplicar una constante es una deuda, y se paga con una prueba que falla si los dos números
dejan de coincidir:

```javascript
it('el tope es el mismo que imponen las reglas de seguridad', () => {
  const reglas = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
  const tope = `descripcion.size() <= ${LONGITUD_MAXIMA_DESCRIPCION_ACTOR}`;
  assert.ok(reglas.includes(tope), `firestore.rules ya no exige «${tope}»`);
});
```

**El `textarea` no lleva `maxlength`.** Cortar el texto en silencio es peor que advertir:
quien pega tres párrafos vería desaparecer el final sin saber por qué, que es justo lo que
el criterio pide evitar. El contador dice cuántos caracteres sobran, el borde se marca y el
mensaje se escribe debajo del campo enlazado con `aria-describedby` — nunca solo con color
(WCAG 2.1, criterio 1.4.1).

---

## 5. Editar no devuelve el perfil a la cola

El segundo criterio dice que los cambios se ven «sin requerir una nueva aprobación de la
cuenta». Se cumple por omisión, y esa omisión es deliberada: `guardarMiPerfil` escribe
`estado` **solo al crear**, nunca al actualizar.

```javascript
if (existente.exists()) {
  await updateDoc(referencia, editables);   // «estado» no está aquí dentro
  ...
}
```

No es una precaución cosmética. Las reglas prohíben al dueño tocar ese campo, así que
escribirlo —aunque fuera con el mismo valor que ya tenía— haría que el servidor rechazara la
operación entera:

```javascript
allow update: if (autenticado()
                  && resource.data.uid == miUid()
                  && !toca(['uid', 'idActor', 'estado'])
                  && perfilDeActorBienFormado())
              || soyAdmin();
```

La prueba que fija el criterio no comprueba que la escritura pase, sino que el perfil **siga
aprobado después**:

```javascript
const despues = await getDoc(doc(visitante(), 'actoresCulturales', ID_ACTOR));
assert.equal(despues.data().estado, 'aprobado');
```

Esto es lo contrario de lo que hará HU-23 con las publicaciones, que **sí** vuelven a
`pendiente` al editarse. La diferencia es intencionada: un evento anuncia una fecha y un
lugar que pueden cambiar a algo que no debería publicarse; un perfil describe a quien ya fue
admitido en la plataforma.

---

## 6. La propiedad, y un campo que nadie declaró

La propiedad es la parte fácil: `resource.data.uid == miUid()`. Ya estaba desde HU-11 y el
cuarto criterio se comprueba contra ella.

Lo que se añadió en esta historia es `hasOnly`:

```javascript
function perfilDeActorBienFormado() {
  let d = request.resource.data;
  return d.keys().hasOnly(['idActor', 'uid', 'nombre', 'manifestacion',
                           'descripcion', 'categoria', 'contacto', 'redes',
                           'imagenUrl', 'estado'])
    && ...
}
```

Sin él, un actor podía añadir a **su propio** perfil una clave que la interfaz nunca pinta.
Parece inofensivo porque el documento es suyo — y no lo es, porque **el perfil se lee entero
y en público**. Cualquier campo inventado viajaría al navegador de todo visitante que abra
el directorio. Es el mismo razonamiento que ya se había aplicado a `categorias` en HU-17 y a
`interacciones` en HU-11.

---

## 7. El directorio filtra en el servidor, no en memoria

La regla de lectura deniega los perfiles sin aprobar. Eso tiene una consecuencia que no es
evidente: **pedir la colección entera y filtrar después no devuelve menos datos, devuelve un
error.** Firestore evalúa la regla contra cada documento que la consulta alcanza y rechaza la
consulta completa si alguno no pasa; no devuelve «los que sí puede».

Por eso el filtro va dentro de la consulta:

```javascript
const consulta = query(collection(db, COLECCION), where('estado', '==', 'aprobado'));
```

y hay una prueba que fija justamente el error, para que nadie «simplifique» esto más
adelante:

```javascript
it('pero NO lista la colección entera: hay perfiles sin aprobar dentro', async () => {
  await assertFails(getDocs(collection(visitante(), 'actoresCulturales')));
});
```

### Un perfil guardado no es todavía un perfil publicado

El quinto criterio dice «dado un perfil **guardado**». Tomado al pie de la letra chocaría
con el modelo: un perfil nace `pendiente` y el directorio solo lista los aprobados. La
lectura correcta del criterio es **guardado y aprobado**, y así debe quedar redactado en el
Anexo A del trabajo escrito.

Eso dejaba un hueco práctico: sin cola de aprobación —que es HU-24, y modera
publicaciones, no perfiles— el único modo de aprobar un perfil habría sido editar el
documento desde la consola de Firebase, es decir, **fuera de la plataforma**. El criterio no
sería demostrable dentro del producto. Se añade por eso una sección al panel de
administración,
[`PerfilesDeActores.jsx`](../src/views/PanelAdministracion/PerfilesDeActores.jsx), con lo
mínimo: los perfiles pendientes, y dos botones para publicarlos o dejarlos sin publicar. No
escribe en `moderaciones` ni ordena por antigüedad; eso es HU-24 y sigue siendo HU-24.

Mientras tanto, el dueño no se queda a oscuras: `/mi-perfil` dice en qué estado está su
perfil y qué significa, y si abre su propia dirección pública sin aprobar, la vista lo
advierte en lugar de fingir que no existe.

---

## 8. Los canales de contacto (RF-12)

Se exige **al menos uno** de los tres —teléfono, WhatsApp, correo— y no los tres. Un perfil
sin ninguna forma de contacto incumple el propósito de la historia («antes de
contactarme»), pero obligar a los tres forzaría a publicar un número personal a quien solo
quiere dar un correo. Publicar un dato de contacto es una decisión del actor, y la política
de tratamiento de datos la respalda como tal ([`14` §3](14-tratamiento-de-datos.md)). El
formulario lo dice donde se decide: *«Lo que escribas aquí es público»*, con enlace a la
política.

Convertir lo escrito en un enlace que marque de verdad resultó tener un caso límite que
merecía su propio módulo, [`contacto.js`](../src/utils/contacto.js). El actor escribe su
número como lo escribe cualquiera:

| Lo que escribe | Lo que hay que marcar |
| --- | --- |
| `300 123 4567` | `+573001234567` |
| `+57 300 123 4567` | `+573001234567` |
| `(605) 421-0000` | `+576054210000` |
| `4210000` | `4210000` — fijo sin indicativo de área: se deja como está |

El segundo caso es el que justifica el módulo. Anteponer el indicativo sin mirar produce
`+5757300…`, que no llama a ninguna parte, y quien lo escribió no tiene forma de enterarse:
el número **se ve bien en pantalla** y solo falla al pulsarlo. La última fila es la decisión
contraria y por el mismo motivo: a un fijo de siete dígitos no se le inventa el indicativo
de área, porque eso sería inventar a quién llama.

---

## 9. Cambios en el modelo de datos y en las reglas

| Qué | Antes | Ahora |
| --- | --- | --- |
| Identificador de `actoresCulturales` | sin especificar | el `uid` del dueño (§2) |
| `create` | `uid` propio, `estado: pendiente`, descripción ≤ 1.000 | además: ruta = `uid`, `idActor` coincidente y forma completa |
| `update` del dueño | no toca `uid` ni `estado` | además: no toca `idActor`, y el resultado sigue bien formado |
| Campos admitidos | cualquiera | los diez del modelo, y ninguno más (`hasOnly`) |
| Rutas | `/actores/:id` | más `/mi-perfil`, privada · rol actor |
| Aterrizaje del rol actor | `/mis-publicaciones` | `/mi-perfil` |

`redes` e `imagenUrl` se admiten en las reglas pero el formulario todavía no los pide:
la imagen llega en **HU-19**.

---

## 10. Verificación

### Las funciones puras · `npm run probar`

**33 casos nuevos**, sin emulador ni navegador: 23 sobre la validación del formulario y 10
sobre los enlaces de contacto. Cubren los bordes exactos del tercer criterio —999, 1.000 y
1.001 caracteres—, la concordancia del aviso en singular y plural, la categoría que el
administrador desactivó entre que se abrió el formulario y se pulsó «Guardar», y el
indicativo duplicado de §8.

### Las reglas · `npm run probar:reglas`

**15 casos nuevos** contra el emulador, uno por cada decisión de §2, §5, §6 y §7. No se
ejecutan en la máquina de desarrollo: el emulador de Firestore muere allí al abrir el pipe
de bucle local que necesita el selector de netty, con o sin aislamiento de red. Una prueba
escrita y nunca ejecutada no es evidencia de nada, así que esta historia trae también el
flujo de integración continua que las corre en cada pull request,
[`.github/workflows/pruebas.yml`](../.github/workflows/pruebas.yml). Con él, la casilla «la
funcionalidad supera la totalidad de sus casos de prueba» deja de depender de qué portátil
tenía a mano quien cerró la historia, y pasa a estar registrada en el repositorio — para
esta historia y para las seis que quedan del sprint.

```
▶ perfil de actor cultural (HU-18)
  ✔ el identificador del perfil tiene que ser el uid de su dueño
  ✔ un actor con perfil NO crea un segundo
  ✔ el perfil nace pendiente: nadie se publica solo
  ✔ sin manifestación no hay perfil: es lo que distingue a un actor de otro
  ✔ un campo que la interfaz nunca pinta no entra en el perfil
  ▶ límite de la descripción (tercer criterio)
    ✔ exactamente 1.000 caracteres se acepta: es el borde
    ✔ un carácter de más lo rechaza el servidor, no solo el formulario
    ✔ tampoco se cuela al editar un perfil que ya existe
  ▶ edición sin nueva aprobación (segundo criterio)
    ✔ el dueño edita su perfil aprobado y sigue aprobado
    ✔ el dueño NO se aprueba a sí mismo por la puerta de atrás
    ✔ el dueño NO se cambia el uid para apropiarse de otro perfil
  ▶ directorio público (quinto criterio)
    ✔ un visitante sin cuenta lista los perfiles aprobados
    ✔ y abre uno de ellos en su propia dirección
    ✔ pero NO lista la colección entera: hay perfiles sin aprobar dentro
    ✔ un perfil pendiente NO es legible por un visitante
```

Las fixtures de la suite tuvieron que cambiar con el modelo, y el cambio dejó ver algo. Los
perfiles sembrados tenían tres campos sueltos; desde esta historia la regla de actualización
exige que el documento **resultante** siga bien formado, así que un perfil incompleto hacía
fallar la edición del dueño por un motivo que nada tenía que ver con la propiedad que esa
prueba dice medir. Se siembran ahora completos. La misma cautela explica que la prueba de la
cuenta desactivada escriba en `UID_DESACTIVADO` y no en una ruta cualquiera: en cualquier
otra ruta la denegación llegaría por el identificador, y la prueba no diría nada sobre el
estado de la cuenta, que es lo que ahí se mide.

### La estructura · `npm run verificar`

Las tres reglas siguen pasando con 53 archivos y 13 vistas: ninguna vista importa el SDK de
Firebase por su cuenta, `MiPerfil` está enrutada, y los colores nuevos de las hojas de
estilo salen todos de `variables.css`.

### Las reglas publicadas · `firebase deploy --only firestore:rules`

El emulador no arranca en la máquina de desarrollo, así que la **única compilación real** de
`firestore.rules` es la que hace el despliegue. Salida del 26/08/2026:

```
=== Deploying to 'hub-cultural-santa-marta'...

i  deploying firestore
i  firestore: reading indexes from firestore.indexes.json...
i  cloud.firestore: checking firestore.rules for compilation errors...
+  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
+  firestore: released rules firestore.rules to cloud.firestore

+  Deploy complete!
```

Que compilen no es que sean correctas —eso lo dicen los 15 casos del emulador—, pero sí
descarta lo que un error de sintaxis dejaría pasar: hasta este despliegue, el proyecto en
producción seguía ejecutando las reglas anteriores, sin `hasOnly` y sin la garantía de «un
actor, un perfil».

### Comprobación en vivo

| Fecha | Qué se comprobó | Resultado |
| --- | --- | --- |
| | Un visitante sin sesión abre `/actores` | |
| | Un visitante abre `/actores/:id` de un perfil aprobado | |
| | Un visitante que abre `/mi-perfil` acaba en `/ingreso` | |
| | Un actor crea su perfil y queda `pendiente` | |
| | El administrador lo publica desde el panel | |
| | El actor lo edita y el cambio se ve sin volver a aprobación | |
| | La descripción avisa al pasar de 1.000 caracteres | |
| | Los enlaces de teléfono, WhatsApp y correo abren lo que dicen | |
| | A 360, 768 y 1366 px | |

---

## 11. Lo que queda fuera

| Fuera | Dónde llega |
| --- | --- |
| Imagen del perfil | HU-19 |
| Listado de las publicaciones del actor dentro de su perfil | HU-25 |
| Enlaces a redes sociales (`redes`) | Sin historia asignada; el campo está en el modelo |
| Cola de moderación con registro en `moderaciones` | HU-24 |
| Buscar o filtrar dentro del directorio | HU-26, HU-27, sobre el catálogo |
| Perfil del hub de innovación | HU-20 |
