# Roles y permisos

> **Historia de usuario:** HU-15 · Sprint 4
> **Objetivo específico:** 2 — Garantizar el acceso controlado a la información.
> **Requisitos asociados:** RF-01 (rol diferenciado), RNF-08 (acceso restringido por rol).
> **Depende de:** [HU-12 · registro](13-cuentas-y-sesion.md) y
> [HU-11 · reglas de seguridad](11-reglas-de-seguridad.md).

---

## 1. Qué puede hacer cada rol

| | Visitante | Actor cultural | Hub | Administrador |
| --- | :---: | :---: | :---: | :---: |
| Consultar lo aprobado, **sin cuenta** | ✅ | ✅ | ✅ | ✅ |
| Publicar y editar lo propio | — | ✅ | ✅ | ✅ |
| Ver lo propio aún pendiente | — | ✅ | ✅ | ✅ |
| Ver lo pendiente **de otros** | — | — | — | ✅ |
| Aprobar o devolver publicaciones | — | — | — | ✅ |
| Gestionar categorías | — | — | — | ✅ |
| Ver los indicadores de uso | — | — | — | ✅ |
| Activar o desactivar cuentas | — | — | — | ✅ |

El **visitante no es un rol**: es la ausencia de cuenta. No tiene documento en `usuarios`, y
por eso el rol `turista` del catálogo de requisitos no crea ninguno ([04 §3](04-modelo-datos.md)).
Que la consulta pública no exija registrarse es el tercer criterio de aceptación de esta
historia, y también la razón de ser de la plataforma: un turista que llega a Santa Marta no
va a crearse una cuenta para ver qué hay esta noche.

## 2. Las dos capas, otra vez

El control vive en la interfaz **y** en las reglas, y las dos hacen falta:

| | Qué hace | Qué pasa sin ella |
| --- | --- | --- |
| **Interfaz** (`RutaPrivada`, `roles.js`, la cabecera) | Oculta lo que el rol no puede usar y explica por qué. | La plataforma ofrece vistas que fallan al abrirse: el usuario ve errores de permisos sueltos. |
| **Reglas** (`firestore.rules`) | Rechaza la operación aunque no se pase por la interfaz. | El control se puede saltar desde la consola del navegador en dos líneas. |

La primera es comodidad; la segunda es la seguridad. El cuarto criterio de aceptación pide
literalmente las dos, y por eso cada caso de esta historia tiene una comprobación en la
interfaz y otra contra el emulador.

## 3. Cuatro maneras de no pasar

`RutaPrivada` distingue cuatro situaciones, porque cada una necesita una respuesta distinta:

| Situación | Respuesta |
| --- | --- |
| Todavía no se sabe si hay sesión | Esperar. Ni dejar pasar ni echar. |
| No hay sesión | Ir a `/ingreso`, recordando a dónde iba para volver después. |
| Hay sesión, falta el perfil | Explicar que la cuenta está incompleta. |
| Hay sesión, el rol no encaja | Decir para qué rol es la vista, y ofrecer la salida. |

La primera es la que se olvida. Mientras Authentication responde no se sabe si hay sesión, y
tratar ese instante como «no hay nadie» **expulsa a la vista de ingreso a quien sí está
dentro, cada vez que recarga la página**. Es un fallo que solo se ve con la red lenta, que es
justo donde más molesta.

La tercera no es teórica: si el documento de `usuarios` no llegó a escribirse, la credencial
existe y el rol no ([13 §4.2](13-cuentas-y-sesion.md)). Sin este caso, la persona vería una
vista vacía y errores de permisos en la consola.

## 4. El rol no basta: la cuenta tiene estado

Desactivar una cuenta **no borra la credencial**: quien la tenga puede seguir entrando. Lo
que pierde son los permisos, y eso se comprueba en los dos lados con la misma condición:

```
// firestore.rules
function tengoRol(rol) {
  return autenticado()
    && exists(...)
    && miPerfil().rol == rol
    && miPerfil().estado == 'activo';   // ← el rol solo cuenta si la cuenta está activa
}
```

```jsx
// RutaPrivada.jsx
if (perfil.estado !== 'activo') return <AccesoDenegado motivo="Tu cuenta está desactivada…" />;
```

La cabecera tampoco muestra los enlaces del rol a una cuenta desactivada: ofrecerlos sería
llevar a la persona a una puerta cerrada. Y puede seguir consultando la parte pública, que es
lo que corresponde: desactivar no es expulsar.

## 5. Una sola tabla de roles

`src/routes/roles.js` es el único sitio donde está escrito dónde aterriza cada rol y qué
enlaces ve. Lo leen el menú, la redirección posterior al ingreso y las rutas privadas.

Si cada uno lo decidiera por su cuenta, tarde o temprano el menú ofrecería una vista que la
ruta rechaza —y el usuario vería una pantalla de acceso denegado por hacer clic en un enlace
que la propia plataforma le puso delante—. Es el mismo motivo por el que los cuatro accesos
principales viven en `accesos.js` desde HU-09.

## 6. Verificación

### Las reglas · `npm run probar:reglas`

La suite pasa de 34 a **46 casos**. Los que añade esta historia:

```
▶ roles y permisos (HU-15)
  ✔ una cuenta activa con rol de actor crea su perfil
  ✔ una cuenta desactivada NO crea perfil, aunque su rol sea el correcto
  ✔ un visitante sin sesión lee el catálogo aprobado sin registrarse
  ✔ un actor NO lista la colección de usuarios
  ✔ el administrador sí la lista
  ✔ el actor dueño lee la moderación de su propio evento
  ✔ otro actor NO lee esa moderación
  ✔ un visitante sin sesión NO lee moderaciones
  ✔ un actor NO lee las interacciones: alimentan el panel de indicadores
  ✔ el administrador sí las lee
  ✔ un actor NO desactiva la cuenta de otra persona
  ✔ el administrador sí desactiva una cuenta
```

Cada prohibición va con su permiso: «un actor NO lista usuarios» junto a «el administrador
sí la lista». Una regla que lo denegara todo pasaría la mitad de esta lista, y por eso la
otra mitad existe.

### En la interfaz

Sobre el servidor de desarrollo, sin sesión:

```
/admin              → redirige a /ingreso, recordando el destino
/mis-publicaciones  → redirige a /ingreso, recordando el destino
/, /eventos, /actores, /hubs, /mapa, /politica-de-datos → se ven sin cuenta
```

Ese segundo bloque es el tercer criterio: **seis rutas públicas que no piden nada**.

### Pendiente de comprobación en vivo

Con la cuenta de administrador creada según [06 §1.7](06-puesta-en-marcha.md):

| Criterio | Estado |
| --- | --- |
| El administrador inicia sesión y aterriza en `/admin` | ⬜ |
| Una cuenta de actor que abre `/admin` recibe el acceso denegado | ⬜ |

## 7. Lo que queda fuera

- **No hay interfaz para cambiar el rol de una cuenta ni para desactivarla.** Las reglas ya
  dicen que solo el administrador puede, y las pruebas lo fijan; la pantalla que lo permita
  es parte del panel de administración y llega con **HU-17** y **HU-24**.
- **El rol `hub` no tiene todavía dónde registrarse ni qué ver.** Está en la tabla de roles y
  en las reglas, con su inicio provisional en el directorio; su historia es **HU-20**.
- **El rol vive en Firestore y no en el token de Authentication.** Con *custom claims* el rol
  viajaría dentro del token y las reglas no tendrían que leer un documento por comprobación.
  A cambio exige código de servidor —Cloud Functions—, que este proyecto no tiene, y un
  cierre de sesión para refrescar el token cuando el rol cambia. Con siete colecciones y dos
  integrantes, la lectura del documento sale más barata; queda anotado por si el volumen
  cambia el cálculo.

## 8. Cierre de HU-15

| Criterio de aceptación | Evidencia |
| --- | --- |
| Una cuenta de actor cultural que intenta entrar al panel de administración es rechazada. | §3 y §6: `RutaPrivada` con la pantalla que explica el motivo, y las reglas que rechazan la operación. |
| Una cuenta de administrador accede al panel de moderación al iniciar sesión. | §5: `destinoTrasIngresar('administrador')` lleva a `/admin`; comprobación en vivo. |
| Un visitante sin cuenta consulta el contenido aprobado sin registrarse. | §6: seis rutas públicas y tres lecturas comprobadas contra el emulador. |
| Todo intento de acceso indebido es rechazado **también** por las reglas. | §2 y §6: doce casos nuevos, cada prohibición con su permiso. |

---

*Elaboración propia (2026).*
