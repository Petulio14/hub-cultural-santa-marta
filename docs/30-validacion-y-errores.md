# Validación de formularios y manejo de errores

> **Historia de usuario:** HU-31 · Sprint 7
> **Épica:** E6 — Calidad, accesibilidad y medición
> **Objetivo específico:** 3
> **Requisitos asociados:** RNF-01.
> **Depende de:** HU-21.

Abre el **Sprint 7** y la **épica E6**, la primera que no añade nada que la plataforma no
hiciera ya. Las seis épicas anteriores construyeron lo que el sistema **hace**; esta revisa
cómo se comporta cuando algo sale mal, que es lo que separa un prototipo que funciona de
uno que se puede entregar a alguien.

| Criterio de aceptación | Dónde se cumple de verdad |
| --- | --- |
| Se señala el campo concreto, no un error genérico | `validaciones.js` + `useFocoEnElPrimerError.js` |
| Lo ya escrito se conserva tras el error | cada formulario, y `FilaDeCategoria.jsx` |
| Un fallo de conexión se lee, no se descifra | `utils/errores.js` y `exigirRespuesta` |
| El botón se deshabilita mientras se envía | los seis formularios |

---

## 1. Por qué esta historia no empieza de cero

La validación no se escribió aquí. Se venía escribiendo desde HU-12, y para cuando llegó el
Sprint 7 el proyecto ya tenía `utils/validaciones.js` con sus validadores, tres componentes
de campo que pintan el error debajo y lo enlazan con `aria-describedby`, y
`services/errores.js` traduciendo los códigos de Firestore al español.

Eso deja a HU-31 en un sitio incómodo: **sus cuatro criterios parecían cumplidos antes de
empezar**. Y casi lo estaban. Lo que esta historia hizo no fue escribir validación nueva,
sino **comprobar los cuatro criterios en los seis formularios, uno por uno**, y encontrar en
qué se diferenciaban entre sí.

Los seis son:

| Formulario | Archivo | Campos |
| --- | --- | --- |
| Ingreso, registro y recuperación | `Ingreso.jsx` | 1 a 5 |
| Perfil de actor cultural | `MiPerfil.jsx` | 8 |
| Hub de innovación | `MiHub.jsx` | 8 y el punto en el mapa |
| Publicación de un evento | `FormularioDePublicacion.jsx` | 8, imagen y punto |
| Alta de categoría | `PanelAdministracion.jsx` | 2 |
| Renombrado de categoría | `FilaDeCategoria.jsx` | 2 |

Lo que se encontró es que **la calidad venía por orden de escritura**. `Ingreso.jsx` es de
HU-12, la primera vista con formulario, y es la mejor de las seis. Los demás fueron copiando
la forma pero no todo el contenido, y `FilaDeCategoria.jsx` —dos campos dentro de una fila
de tabla, escrito casi de paso en HU-17— es el que más lejos quedó.

---

## 2. Primer criterio · el campo estaba señalado y no se veía

> Dado cualquier formulario, cuando un campo obligatorio esté vacío, entonces debe señalarse
> el campo específico y no mostrarse un error genérico.

Al pie de la letra ya se cumplía en los seis: cada campo con problema recibe borde propio,
`aria-invalid="true"` y su mensaje escrito debajo, y el mensaje dice qué falta —«Escribe el
nombre del actor cultural o del colectivo»— y no «campo inválido».

**El problema es que en tres de los seis el mensaje aparecía fuera de la pantalla.**

`MiPerfil`, `MiHub` y el formulario de publicación son largos: entre el primer campo y el
botón de guardar hay una descripción de mil o dos mil caracteres, un selector de imagen y,
en dos de ellos, un mapa. Quien rellena el formulario llega al botón habiendo dejado el
primer campo a dos pantallas de distancia. Al pulsar «Guardar» con ese campo vacío:

- el campo se marcaba, arriba, donde nadie estaba mirando;
- el foco se quedaba en el botón;
- **en la pantalla no cambiaba nada**.

El efecto para quien lo usa no es «me falta un campo». Es «el botón no funciona».

`Ingreso.jsx` no lo tenía porque desde HU-12 llevaba escrito un efecto que lleva el foco al
primer `aria-invalid`. Era lo único que ese formulario hacía y los otros cinco no, y estaba
escrito dentro de la vista, donde nadie más podía verlo.

### La solución: `useFocoEnElPrimerError`

El efecto salió de `Ingreso.jsx` a `src/hooks/useFocoEnElPrimerError.js` y ahora lo usan los
seis. Devuelve la referencia que se pone en el `<form>`:

```jsx
const formularioRef = useFocoEnElPrimerError(errores);
…
<form onSubmit={guardar} noValidate ref={formularioRef}>
```

Busca por `aria-invalid` y no por clase ni por nombre de campo. Por clase ataría el foco a
la hoja de estilos; por nombre obligaría a cada formulario a declarar el orden de sus
campos, que es justo el que el navegador ya conoce.

### El desplazamiento suave que no desplazaba

La primera versión hacía `focus({ preventScroll: true })` y después
`scrollIntoView({ behavior: 'smooth', block: 'center' })`, con la animación desactivada para
quien tenga `prefers-reduced-motion`.

Medido en el navegador a 375 px, con el formulario de registro desplazado hasta abajo y el
nombre vacío:

| | Desplazamiento de la página | El campo, respecto al borde superior |
| --- | --- | --- |
| Antes de pulsar | 541 px | −120 px (fuera) |
| Con `behavior: 'smooth'` | **593 px** | **−172 px (más fuera todavía)** |
| Con el comportamiento predeterminado | **40 px** | **+381 px, centrado** |

Con `smooth` no desplazaba **nada**. Los 52 px que se movió la página no son un
desplazamiento: son el hueco que abrió el mensaje de error al aparecer, empujando el
contenido hacia abajo. El foco sí llegaba al campo; la pantalla se quedaba donde estaba, y
el resultado era exactamente el defecto que la historia venía a corregir.

Llamado a mano desde la consola en la misma página, `scrollIntoView` con `smooth` tampoco
hacía nada y con el predeterminado saltaba de 593 px a 40 px. No es cosa de React ni del
momento en que se llama.

Así que **no hay animación**. Una que a veces no ocurre es peor que no tenerla, y de paso
desaparece la pregunta por `prefers-reduced-motion`: sin movimiento animado no hay nada de
lo que librar a quien pidió que no se moviera nada.

Se conservan las dos llamadas, `focus` y `scrollIntoView`, porque hacen cosas distintas:
`focus` deja el campo asomando por el borde y el mensaje va **debajo**, así que se queda
fuera. Centrar es lo que hace que se lea lo que hay que corregir.

### `hayErrores` contaba claves, no mensajes

```js
// antes
return Object.keys(errores).length > 0;
```

Tres formularios borran el error de un campo escribiendo
`{ ...actuales, [campo]: undefined }`, que **deja la clave puesta**. Contando claves, un
formulario donde ya se había corregido todo seguía diciendo que le faltaba algo.

No llegó a romper nada, y conviene decir por qué: las seis vistas preguntan siempre por el
resultado recién validado —`hayErrores(encontrados)`— y no por su estado. Pero el gancho
nuevo sí pregunta por el estado, así que era cuestión de tiempo. Ahora cuenta mensajes:

```js
return Object.values(errores).some((mensaje) => mensaje != null);
```

---

## 3. Segundo criterio · el formulario que se cerraba solo

> Dado un formulario con error, cuando se muestre el mensaje, entonces la información ya
> ingresada debe conservarse.

Cinco de los seis lo cumplían. El estado vive en la vista, el error no lo toca, y el
formulario de publicación ya tenía escrito desde HU-21 por qué no se vacía tras un fallo de
red.

**`FilaDeCategoria.jsx` no lo cumplía**, y fallaba de la peor manera posible:

```jsx
// antes
await alRenombrar(categoria.id, { nombre, descripcion });
setModo('reposo');
```

`alRenombrar` no devolvía nada —el `try` vive en la vista de arriba—, así que la fila volvía
a reposo **pasara lo que pasara**. Si el guardado fallaba por falta de red, la fila se
cerraba, volvía a enseñar el nombre viejo y el nombre recién escrito desaparecía. El aviso
del fallo salía arriba del todo, lejos de la fila.

La corrección son dos piezas. `ejecutar` devuelve si salió bien:

```js
await accion();
await recargar();
setAviso({ tipo: 'exito', texto: mensajeDeExito });
return true;
…
return false;
```

y la fila solo se cierra entonces:

```jsx
if (await alRenombrar(categoria.id, { nombre, descripcion })) setModo('reposo');
```

### Y de paso, validaba con una regla suya

La misma fila comprobaba el nombre a mano:

```js
if (nombre.trim().length < 3) { … }
```

mientras el formulario de alta, tres archivos más arriba, usa `validarCategoria`. El mínimo
coincidía; lo demás no. Por el renombrado pasaban un nombre de doscientos caracteres, uno
hecho solo de signos y —lo importante— **un nombre que ya tenía otra categoría**.

Renombrar no cambia el identificador, que es lo que llevan escrito dentro las publicaciones
ya clasificadas ([16 §3](16-categorias.md)). Así que dos categorías podían acabar llamándose
igual con identificadores distintos, y el filtro del catálogo las habría ofrecido dos veces
sin forma de distinguirlas.

Ahora usa `validarCategoria` con los identificadores de las demás, **excluida ella misma**:
dejarse dentro haría que corregir solo la descripción se rechazara por duplicado.

---

## 4. Tercer criterio · el que no estaba cumplido

> Dado un fallo de conexión con el servicio de datos, cuando ocurra, entonces debe mostrarse
> un mensaje comprensible y no un error técnico.

Este es el criterio que dio trabajo, y por dos motivos distintos.

### 4.1 El respaldo que nunca se usaba

Veinticuatro sitios entre vistas y ganchos escribían el fallo así:

```js
setError(fallo?.message ?? 'No se pudo leer el directorio. Revisa la conexión y recarga.');
```

Se lee como una precaución razonable y **no protegía de nada**. `??` solo sustituye lo nulo,
y un `Error` de Firestore trae siempre su cadena: «Missing or insufficient permissions.». El
respaldo estaba escrito y no se alcanzaba nunca.

Funcionaba igualmente mientras el servicio tradujera, porque entonces `fallo.message` ya
venía en español. Y ahí estaba el agujero: **`categoriasService.js` no traducía**. Es de
HU-17, `errores.js` se extrajo después en HU-20, y nadie volvió a pasar por allí; ninguna de
sus siete funciones envolvía su acceso a Firestore. El catálogo de categorías lo leen los
seis formularios y los filtros del catálogo.

La corrección tiene dos mitades. Una clase raíz, en `src/utils/errores.js` porque es pura y
la usan las dos capas:

```js
export class ErrorDeDominio extends Error {}

export function mensajeDe(fallo, respaldo) {
  return fallo instanceof ErrorDeDominio && fallo.message ? fallo.message : respaldo;
}
```

Heredar de ahí es la marca de que el mensaje está escrito para quien lo va a leer.
`ErrorDeDatos`, `ErrorDeCuenta`, `ErrorDeCategoria`, `ErrorDeGeocodificacion` y los fallos de
`utils/imagen.js` lo hacen; lo que no hereda se sustituye por el respaldo de la vista. Los
veinticuatro sitios pasaron a `mensajeDe(fallo, …)`, y `categoriasService.js` a envolver sus
siete funciones en `intentar`.

`traducir` tuvo que ensancharse a la vez. Comprobaba `instanceof ErrorDeDatos` y ahora
comprueba `ErrorDeDominio`: `crearCategoria` lanza un `ErrorDeCategoria` —«Ya existe una
categoría con ese nombre»— que al envolver el servicio pasaría por ahí, y con la comprobación
estrecha se habría convertido en «No se pudo completar la operación», que es verdad y no
sirve de nada.

### 4.2 Sin conexión, Firestore no falla

Nada de lo anterior cumple el criterio, y eso solo se supo probándolo. Con la red hacia
`firestore.googleapis.com` cortada en el navegador y navegando dentro de la aplicación —sin
recargar, para no restaurar la red— a `/actores`:

> Todavía no hay ningún perfil publicado. Los perfiles aparecen aquí cuando el administrador
> los aprueba.

Había cuatro. Con la red restaurada, «4 perfiles publicados».

**No hubo error.** `getDocs` resuelve contra la caché local del kit, y si la colección nunca
se leyó en esa sesión la caché está vacía, así que la promesa se cumple con cero documentos.
No hay excepción que traducir. Se repitió sobre `/hubs` esperando 3, 15 y 30 segundos por si
llegaba tarde: no llegó nunca.

Un mensaje comprensible y falso es **peor** que el error técnico que venía a sustituir. El
error técnico deja claro que algo se rompió; este manda a quien lo lee a no volver.

Lo que distingue un caso del otro es `metadata.fromCache`, que el kit pone a cierto cuando la
respuesta no vino del servidor:

| De dónde viene | Trae datos | Qué se hace |
| --- | --- | --- |
| Del servidor | sí o no | es la verdad; se devuelve tal cual |
| De la caché | sí | se devuelven: lo último que se supo es mejor que un error |
| De la caché | **no** | **no se sabe nada**: error de conexión |

Eso es `exigirRespuesta`, en `services/errores.js`, aplicado a las once lecturas cuyo vacío
se enseña como una afirmación. No se aplica a las relecturas posteriores a una escritura, que
no afirman nada en pantalla.

Medido después, con la misma red cortada:

| Vista | Antes | Después |
| --- | --- | --- |
| `/actores` | «Todavía no hay ningún perfil publicado» | «No hay conexión con el servidor, así que no se pudo leer el directorio de actores.» |
| `/hubs` | «Todavía no hay ningún hub publicado» | «…no se pudo leer el directorio de hubs.» |
| `/eventos` | «Ninguna actividad coincide» | «…no se pudo leer el catálogo.» |
| `/mapa` | ídem | «…no se pudo leer el catálogo.» |

Y las dos comprobaciones que importan, **con red**, para descartar el falso positivo:

| Caso | Qué dice |
| --- | --- |
| `/actores/perfil-que-no-existe-1234` | «Ese perfil no está disponible» |
| Catálogo filtrado desde 2035 | «Ninguna actividad coincide con lo que buscas» |

Ninguno de los dos habla de conexión, que es lo correcto: vinieron del servidor.

### 4.3 El vacío que mentía en los formularios

El mismo error de razonamiento, un nivel más arriba. `useCategoriasActivas` devuelve `error`,
y `MiPerfil` y el formulario de publicación **no lo miraban**: calculaban

```js
const sinCategorias = !cargandoCategorias && categorias.length === 0;
```

Ante un fallo de lectura, `cargando` pasa a falso y la lista se queda vacía, así que
`MiPerfil` le decía a un actor cultural que **el administrador todavía no había creado
ninguna categoría**. El formulario de publicación era aún más callado: deshabilitaba el
desplegable y el botón sin decir una palabra. Quien acababa de escribir la descripción entera
se encontraba con que «Enviar a revisión» no respondía.

Los dos distinguen ahora los tres estados —leyendo, no hay ninguna, no se pudieron leer— y el
tercero se escribe con `role="alert"`.

---

## 5. Cuarto criterio · el único que ya estaba entero

> Dado un envío en curso, cuando se procese, entonces el botón debe deshabilitarse para
> evitar envíos duplicados.

Los seis formularios ya lo hacían, y tres van más allá de lo que el criterio pide: `MiPerfil`
y el de publicación deshabilitan también mientras se reduce la imagen, porque guardar en ese
momento escribiría la imagen anterior y el resultado llegaría tarde.

No se cambió nada. Se deja anotado porque comprobar que un criterio se cumple es parte del
trabajo aunque no produzca diferencia.

---

## 6. Verificación

### Las funciones puras · `npm run probar`

**300 casos, todos en verde.** Los 16 nuevos:

| Archivo | Casos | Qué fija |
| --- | --- | --- |
| `pruebas/unidad/errores.test.js` | 8 | que `mensajeDe` **no** enseñe el mensaje de un `Error` llano ni de un `TypeError`, que sí enseñe el de cualquier descendiente de `ErrorDeDominio`, y que un impostor con el mismo `name` no cuele |
| `pruebas/unidad/errores.test.js` | 4 | las tres situaciones de `exigirRespuesta` y el caso del documento suelto, que dice `exists()` en vez de `empty` |
| `pruebas/unidad/validaciones.test.js` | 4 | que `hayErrores` cuente mensajes y no claves |

Los casos de `mensajeDe` están escritos al revés de lo esperable: no comprueban que nuestros
mensajes se enseñen —eso nunca falló— sino que los ajenos **no** se enseñen, que es lo que el
patrón anterior dejaba pasar sin que se notara.

### La estructura · `npm run verificar`

Sin incidencias. `utils/errores.js` es un archivo nuevo en la capa de utilidades y no importa
nada; `services/errores.js` lo importa a él y no al revés.

### En el navegador

A 375 px y a 1280 px, sin errores en consola salvo el aviso que el propio kit de Firebase
escribe cuando se le corta la red a propósito.

**Lo comprobado en vivo:**

| Qué | Cómo |
| --- | --- |
| Foco y desplazamiento al primer campo señalado | registro vacío y registro con el correo mal, a 375 y 1280 px |
| El campo señalado es el primero **inválido**, no el primero | con el nombre bien escrito, el foco fue al correo |
| Lo escrito se conserva | correo, contraseña y casilla intactos tras el rechazo |
| Los cuatro mensajes son específicos | uno por campo, ninguno genérico |
| El fallo de conexión se lee | las cuatro vistas públicas con la red cortada |
| Un vacío de verdad sigue siendo un vacío | documento inexistente y filtro sin resultados, con red |

**Lo que no se pudo comprobar en vivo:** `MiPerfil`, `MiHub`, el formulario de publicación y
el panel de administración exigen sesión iniciada, y el servidor de desarrollo autentica
contra el Firebase real. El gancho es el mismo código en los seis y su referencia está puesta
en los seis `<form>`, pero **el recorrido con cuenta de actor cultural y de administrador
queda pendiente** para cerrar la Definición de Terminado.

---

## 7. Lo que queda fuera

- **La escritura sin conexión.** Firestore encola las escrituras y las resuelve de forma
  optimista: «Guardar» sin red responde que sí y la promesa se cumple. `exigirRespuesta`
  cubre las lecturas, no esto. Quien guarde sin red y cierre la pestaña pierde el cambio sin
  que nada se lo diga. Es un problema real y pide una decisión de producto —avisar, bloquear
  o confiar en la cola— que no cabe en esta historia.
- **La comprobación de duplicado de `crearCategoria`** lee antes de escribir para no pisar una
  categoría existente. Sin red esa lectura viene de la caché y podría decir que no existe. La
  escritura quedaría encolada y se resolvería contra el servidor, así que el riesgo es el del
  punto anterior y se trata con él.
- **El aviso de que se está viendo contenido de la caché.** Cuando hay datos guardados se
  enseñan sin decir que pueden estar desfasados. Es lo correcto frente a un error, y
  etiquetarlo es trabajo de HU-33.
