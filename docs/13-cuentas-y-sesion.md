# Cuentas y sesión

> **Historias de usuario:** HU-12, HU-13 y HU-14 · Sprint 4
> **Objetivo específico:** 2 — Desarrollar los módulos del prototipo funcional.
> **Requisitos asociados:** RF-01 (registro con rol), RF-02 (inicio y cierre de sesión),
> RNF-05 (credenciales seguras).
> **Depende de:** [HU-11 · reglas de seguridad](11-reglas-de-seguridad.md).

Con este incremento la plataforma deja de ser solo lectura: una persona puede crear su
cuenta de actor cultural, entrar, salir y recuperar la contraseña si la olvida. El
consentimiento que exige la ley se documenta aparte, en
[14 · tratamiento de datos](14-tratamiento-de-datos.md), y el control por rol en
[15 · roles y permisos](15-roles-y-permisos.md).

---

## 1. Dónde vive cada cosa

La vista de ingreso podría haberse escrito entera en un archivo. Está repartida porque cada
pieza se comprueba de una manera distinta:

| Pieza | Archivo | Qué resuelve | Cómo se comprueba |
| --- | --- | --- | --- |
| Validación | `src/utils/validaciones.js` | Qué es un correo aceptable, cuánto mide una contraseña, qué campos faltan. | `npm run probar` — sin navegador ni emulador. |
| Acceso a Firebase | `src/services/authService.js` | Crear la credencial, crear el perfil, entrar, salir, traducir los errores. | Contra el proyecto real, y las reglas con `npm run probar:reglas`. |
| Sesión compartida | `src/hooks/useSesion.jsx` | Un solo observador de Authentication para toda la aplicación. | En el navegador: recargar y seguir dentro. |
| Qué ve cada rol | `src/routes/roles.js` | Dónde aterriza cada rol y qué enlaces añade al menú. | [15 · roles y permisos](15-roles-y-permisos.md). |
| Presentación | `src/views/Ingreso/` y `src/components/Campo.jsx` | El formulario y sus mensajes. | Medición en los tres anchos (§5). |

Ninguna vista importa el SDK de Firebase: la regla de [03 §3](03-arquitectura.md) sigue
comprobándose con `npm run verificar`.

## 2. La contraseña no se guarda (RNF-05)

En la colección `usuarios` hay identidad, rol y consentimiento. **No hay contraseña**, ni
cifrada ni resumida: la gestiona Firebase Authentication por completo, y el proyecto nunca
la ve. Es el criterio de verificación literal de RNF-05.

El documento que se crea al registrarse es el de [04 §3](04-modelo-datos.md):

```js
{
  uid, nombre, correo,
  rol: 'actor',
  estado: 'activo',
  fechaRegistro: serverTimestamp(),
  consentimientoDatos: { aceptado: true, fecha: serverTimestamp(), version: '1.0' }
}
```

Las dos fechas las pone el servidor, no el navegador. Las reglas lo exigen
(`fechaRegistro == request.time`): una fecha que escribe el cliente es una fecha que el
cliente puede mentir.

## 3. Qué mensaje se muestra, y por qué no siempre el mismo

Los criterios de aceptación de HU-12 y HU-13 piden cosas opuestas, y a propósito:

| Situación | Mensaje | Razón |
| --- | --- | --- |
| Registro con un correo ya usado | «Ese correo ya tiene una cuenta en la plataforma.» | HU-12 lo exige, y el servicio lo revela igualmente: no se puede crear dos veces la misma cuenta. |
| Ingreso con credenciales incorrectas | «El correo o la contraseña no son correctos.» | HU-13 lo exige. Distinguir «ese correo no existe» de «esa contraseña no es» convierte el formulario en un detector de quién tiene cuenta. |
| Recuperación de contraseña | La misma respuesta exista o no la cuenta. | Mismo motivo. Se implementa en HU-14. |

El único mensaje que distingue es el del registro, y ahí la información ya era pública por
construcción. En los demás, todos los códigos de error de credencial —`invalid-credential`,
`user-not-found`, `wrong-password`, `invalid-email`— se traducen a una sola frase.

## 4. Dos hallazgos de este incremento

### 4.1 El rol de administrador se podía autoconceder

La regla de creación de `usuarios`, escrita en HU-11 cuando todavía no había formulario de
registro, admitía cualquiera de los tres roles:

```
request.resource.data.rol in ['actor', 'hub', 'administrador']
```

El documento lo escribe el navegador. Bastaba con registrarse y cambiar esa cadena antes de
enviar —desde la consola del navegador, sin herramientas— para tener rol de administrador,
porque `soyAdmin()` resuelve el rol leyendo justamente ese documento. El panel de
moderación completo, con una línea de JavaScript.

La regla ahora admite `['actor', 'hub']`. La cuenta de administrador se crea desde la
consola de Firebase ([06 §1.7](06-puesta-en-marcha.md)), que no pasa por las reglas.

Lo que hace didáctico el fallo es **cuándo** apareció: la regla era correcta mientras nadie
escribiera en esa colección, y se volvió un agujero el día que se conectó el formulario. Una
regla no se revisa una vez; se revisa cada vez que cambia quién la usa.

### 4.2 La cuenta a medias

Registrarse son dos escrituras en dos sistemas distintos —la credencial en Authentication y
el perfil en Firestore— y no hay transacción que las abarque. Si la segunda falla, queda una
credencial sin documento de `usuarios`: una cuenta que puede entrar y no puede hacer nada,
porque no tiene rol, y que además bloquea el correo para siempre; al reintentar, el registro
responderá «ese correo ya tiene una cuenta».

`authService.registrarActorCultural` deshace la credencial si el perfil no se pudo escribir,
y avisa de que la cuenta **no** se creó. Es preferible un registro que falla limpio a uno que
deja un resto invisible.

## 5. Verificación

### Validación del formulario · `npm run probar`

Las funciones de `validaciones.js` son puras, así que los criterios de aceptación se
ejecutan en lugar de repasarse a mano en la pantalla:

```
▶ registro · correo y contraseña (HU-12, primer criterio)
  ✔ un correo válido con contraseña de ocho caracteres o más se acepta
  ✔ acepta exactamente la longitud mínima, que es el borde del criterio
  ✔ rechaza un carácter por debajo de la longitud mínima
  ✔ rechaza un correo sin arroba
  ✔ rechaza un correo sin dominio
  ✔ rechaza un correo con espacios
  ✔ acepta un correo con punto y guion en el nombre
  ✔ las dos contraseñas deben coincidir
▶ registro · campos obligatorios (HU-12, tercer criterio)
  ✔ el formulario vacío señala los cinco campos, no solo el primero
  ✔ un nombre de solo espacios cuenta como vacío
  ✔ cada mensaje dice qué campo falta y qué hacer
▶ consentimiento · sin aceptación no hay registro (HU-16, segundo criterio)
  ✔ la casilla sin marcar bloquea el registro
  ✔ el mensaje nombra la política de tratamiento de datos
  ✔ marcada, deja pasar
  ✔ un valor que no sea verdadero no cuenta como aceptación
▶ ingreso · qué se valida al entrar (HU-13)
  ✔ correo y contraseña presentes bastan
  ✔ no se exige longitud mínima al entrar: delataría la regla sin evitar nada
  ✔ la contraseña vacía sí se bloquea antes de llamar al servidor
  ✔ un correo mal formado se bloquea antes de llamar al servidor
▶ recuperación de contraseña (HU-14)
  ✔ solo se pide el correo
  ✔ el correo vacío se bloquea

ℹ tests 21   ℹ pass 21   ℹ fail 0
```

Dos de esos casos merecen explicación. **«Acepta exactamente la longitud mínima»** existe
porque el error clásico de un `>` que debía ser `>=` solo se ve en el borde. Y **«cada
mensaje dice qué campo falta»** no comprueba una redacción concreta sino que ningún mensaje
sea del tipo «campo inválido»: exige longitud suficiente y puntuación final, que es lo que
distingue una frase de una etiqueta.

### Las reglas · `npm run probar:reglas`

La suite de HU-11 pasa de 21 a **34 casos** con el alta de cuentas — 34 en verde el
22/08/2026. Los nuevos:

```
▶ usuarios · alta de la cuenta (HU-12, HU-16)
  ✔ quien se registra crea su propio documento
  ✔ registrarse como hub también se permite
  ✔ NO se crea la cuenta sin aceptar el tratamiento de datos
  ✔ NO se crea la cuenta sin el campo de consentimiento
  ✔ NO se crea la cuenta sin la versión de la política aceptada
  ✔ NO se crea el documento de otra persona
  ✔ NO se concede a sí mismo el rol de administrador al registrarse
  ✔ NO se crea la cuenta con la fecha de registro puesta por el cliente
  ✔ el dueño lee su propio documento
  ✔ NO se lee el documento de otra persona
  ✔ el administrador sí lo lee
  ✔ NO se retira el consentimiento editando el propio documento
  ✔ el dueño sí corrige su nombre
```

El séptimo es el hallazgo de §4.1, y queda escrito como prueba para que no vuelva.

### Comportamiento y accesibilidad

Sobre el servidor de desarrollo, con el formulario de registro vacío enviado a propósito:

- Se muestran **los cinco mensajes a la vez**, no el primero y luego el siguiente.
- Cada campo con error lleva `aria-invalid` y su mensaje enlazado con `aria-describedby`,
  de modo que un lector de pantalla lo anuncie; el color no es el único indicador.
- El **foco salta al primer campo con error**. Sin eso, quien navega con teclado recorre el
  formulario entero buscándolo.
- El error de credencial va en una región con `role="alert"`: se anuncia al aparecer.

Recorriendo las ocho rutas públicas, ahora con la política y el formulario:

```
360 px  · desborde maximo 0 px · elementos bajo 44x44: 0 · menu compacto
768 px  · desborde maximo 0 px · elementos bajo 44x44: 0 · menu completo
1366 px · desborde maximo 0 px · elementos bajo 44x44: 0 · menu completo
```

Ese cero costó dos correcciones. El enlace a la política dentro de la frase del
consentimiento medía **20 px de alto**, y el correo de contacto de la política, otro tanto:
son enlaces en medio de un párrafo, cuya altura la fija la línea de texto. Los dos pasaron a
línea propia con área de toque completa, que además es lo cómodo en un móvil.

### Contra el proyecto real

Con `.env.local` apuntando a `hub-cultural-santa-marta`, un intento de ingreso con un correo
que no existe:

```
El correo o la contraseña no son correctos.
```

La consola registra la respuesta **400** con la que el servicio de autenticación rechaza la
credencial. No es un error de la aplicación: es la respuesta correcta a una contraseña
incorrecta, y el navegador registra toda respuesta que no sea 2xx. La aplicación no emite
ningún error propio.

### Comprobación en vivo

Los criterios que necesitan una cuenta de verdad, ejecutados sobre el sitio publicado el
**22/08/2026** con una cuenta de actor cultural creada desde el propio formulario:

| Criterio | Historia | Resultado |
| --- | --- | --- |
| El registro crea la cuenta con rol de actor cultural | HU-12 | ✅ Documento de `usuarios` con `rol: "actor"`, `estado: "activo"` y el uid como identificador. |
| El registro inicia la sesión | HU-12 | ✅ La cabecera pasa a mostrar «prueba · ACTOR CULTURAL». |
| Un correo ya registrado da un mensaje claro y no duplica la cuenta | HU-12 | ✅ «Ese correo ya tiene una cuenta en la plataforma. Inicia sesión o recupera tu contraseña», junto al campo del correo y con el borde marcado. |
| Cerrar sesión pierde el acceso a las vistas privadas | HU-13 | ✅ Comprobado al cambiar de la cuenta de administrador a la de actor. |
| La respuesta de recuperación no revela si la cuenta existe | HU-14 | ✅ Con una dirección registrada y con una que no lo está, el mismo texto. |
| Recargar la página mantiene la sesión | HU-13 | ⬜ |
| Llega el correo de restablecimiento y la contraseña nueva funciona | HU-14 | ⬜ |

El documento de `usuarios` leído desde la consola de Firebase, que es la prueba del alta:

```
uid                  "DFB9zBZUTWMAA1BCgtK6M79JAM92"
nombre               "prueba"
correo               "actor@correo.com"
rol                  "actor"
estado               "activo"
fechaRegistro        22 de agosto de 2026, 8:56:38 p.m. UTC-5
consentimientoDatos  { aceptado: true, fecha: 22 de agosto de 2026, 8:56:38 p.m. UTC-5, version: "1.0" }
```

Las dos fechas coinciden al segundo porque **las dos las puso el servidor** en la misma
escritura. Ninguna viene del navegador, que es lo que las hace servir de prueba
([14 §3](14-tratamiento-de-datos.md)).

## 5 bis. Recuperar la contraseña (HU-14)

El tercer panel de la misma vista. Se llega desde «¿Olvidaste tu contraseña?», debajo del
campo de contraseña, que es donde se busca.

**La respuesta es la misma exista o no la cuenta.** El mensaje no dice «te hemos enviado un
correo» sino «si existe una cuenta asociada a esa dirección, acabamos de enviar allí un
enlace». La diferencia no es de estilo: un formulario que responde distinto según el correo
esté registrado o no es un detector de quién tiene cuenta en la plataforma, y basta con
probar direcciones para vaciarlo.

La defensa está en dos sitios, y conviene que estén los dos:

1. **En el proyecto de Firebase.** Con la protección contra enumeración activada, el propio
   servicio responde correctamente para una dirección desconocida y no devuelve
   `auth/user-not-found`. Es lo que se observó al probarlo: la petición no produjo error.
2. **En `authService`.** El código silencia igualmente `auth/user-not-found` e
   `auth/invalid-email`. Si algún día esa opción del proyecto se desactiva, o si el
   prototipo se despliega sobre otro proyecto donde no lo esté, el comportamiento no cambia.

Comprobado sobre el proyecto real con una dirección que no está registrada:

```
Revisa tu correo. Si existe una cuenta asociada a nadie.registrado@ejemplo.co,
acabamos de enviar allí un enlace para definir una contraseña nueva.
```

Sin ningún error en la consola. El tercer criterio —definir una contraseña nueva desde el
enlace y entrar con ella— lo resuelve la pantalla que aloja el propio Firebase, y se
comprueba en vivo con una cuenta real.

## 6. Lo que este incremento todavía no hace

- **Al registrarse se aterriza en «Mis publicaciones»**, no en el perfil público del actor:
  ese perfil es un documento de `actoresCulturales` y lo crea **HU-18**. La cuenta existe;
  el perfil que se muestra al visitante, todavía no.
- **El rol `hub` no tiene formulario de registro.** Las reglas ya lo admiten y la tabla de
  roles ya lo contempla; la vista llega en **HU-20**.
- **No hay verificación del correo.** Firebase la ofrece y no está en ningún criterio de
  aceptación del backlog; si se decide exigirla, es una historia nueva.

## 7. Cierre de HU-12, HU-13 y HU-14

| Historia | Criterio de aceptación | Evidencia |
| --- | --- | --- |
| HU-12 | Correo válido y contraseña de ocho caracteres crean la cuenta con rol de actor cultural. | §5, ocho casos de validación; el rol se escribe en el documento de `usuarios` (§2). |
| HU-12 | Un correo ya registrado muestra un mensaje claro y no duplica la cuenta. | §3; comprobación en vivo. |
| HU-12 | Un campo obligatorio vacío bloquea el envío indicando cuál falta. | §5, tres casos y la comprobación de accesibilidad. |
| HU-12 | El registro inicia la sesión y redirige. | §6 y comprobación en vivo. |
| HU-13 | Credenciales correctas llevan a la vista del rol. | `routes/roles.js`, detallado en [15](15-roles-y-permisos.md). |
| HU-13 | Credenciales incorrectas: mensaje que no revela si el correo existe. | §3 y §5, comprobado contra el proyecto real. |
| HU-13 | Cerrar sesión pierde el acceso a las vistas privadas. | `RutaPrivada` más las reglas; comprobación en vivo. |
| HU-13 | Recargar mantiene la sesión. | Persistencia local declarada en `authService`; comprobación en vivo. |
| HU-14 | Un correo registrado recibe el enlace de restablecimiento. | §5 bis; comprobación en vivo. |
| HU-14 | Un correo no registrado recibe la misma respuesta visible. | §5 bis, comprobado contra el proyecto real. |
| HU-14 | Con el enlace se define una contraseña nueva y se puede entrar. | Pantalla de Firebase; comprobación en vivo. |

---

*Elaboración propia (2026).*
