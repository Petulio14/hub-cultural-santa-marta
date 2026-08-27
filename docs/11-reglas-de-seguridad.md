# Reglas de seguridad de Cloud Firestore

> **Historia de usuario:** HU-11 · Sprint 3
> **Objetivo específico:** 2 — Garantizar el acceso controlado a la información.
> **Requisitos asociados:** RNF-05 (autenticación delegada), RNF-08 (control de acceso por rol).
> **Depende de:** [HU-05 · modelo de datos](04-modelo-datos.md).

Las reglas viven en [`../firestore.rules`](../firestore.rules), en la raíz del repositorio.
Este documento explica qué protegen, cómo se publicaron y cómo se demuestra que hacen lo
que dicen.

---

## 1. Por qué las reglas y no la interfaz

El control de acceso vive en **dos capas simultáneas**:

1. La interfaz oculta lo que el rol no puede usar —`RutaPrivada` en el enrutador
   ([08 §3](08-estructura-del-proyecto.md)).
2. Las reglas rechazan la operación **aunque se intente desde fuera de la interfaz**: desde
   la consola del navegador, desde un script, desde cualquier cliente del SDK.

La primera es comodidad; la segunda es la seguridad. Una sin la otra no satisface RNF-08.
Que la aplicación no muestre un botón no impide a nadie llamar a Firestore directamente:
las claves del cliente viajan al navegador y no son secretas, y por eso lo que protege los
datos es esto y no ellas.

## 2. Qué protege cada colección

| Colección | Lectura | Escritura |
| --- | --- | --- |
| `usuarios` | La propia, o el administrador. | Cada quien crea la suya, con consentimiento obligatorio (HU-16). Nadie se cambia el rol ni el estado a sí mismo. |
| `actoresCulturales` | Pública si está aprobada; el dueño y el administrador ven también la pendiente. | El identificador del documento **es el `uid`** de su dueño, que es lo que garantiza «un actor, un perfil». El dueño edita su perfil, pero **no lo aprueba**: `estado` solo lo mueve el administrador. Solo se admiten los diez campos del modelo ([17 §2 y §6](17-perfil-de-actor.md)). |
| `hubs` | Igual que actores. | Igual que actores. |
| `eventos` | **Pública solo si está aprobada.** El dueño y el administrador ven las pendientes. Una consulta que alcance una pendiente **falla entera**, no devuelve menos filas. | Nace pendiente y con la fecha del servidor —`fechaCreacion == request.time`, el único valor de tiempo que un cliente no puede inventar—. El identificador del documento tiene que coincidir con `idEvento`, solo se admiten los catorce campos del modelo, y `tituloNormalizado` no puede decir algo distinto del título ([20 §4 y §5](20-publicacion-de-eventos.md)). Al editarla vuelve a pendiente (HU-23). |
| `categorias` | Pública: los filtros la necesitan sin sesión. | Solo el administrador (RF-14). |
| `moderaciones` | El administrador, y el actor dueño del evento moderado. | Solo el administrador. **Devolver exige observación escrita** (HU-24). Registro inmutable: no se edita ni se borra. |
| `interacciones` | Solo el administrador: alimentan los indicadores (HU-34). | Cualquiera puede añadir una, pero **solo con los cuatro campos declarados**: nunca datos identificables del visitante (RNF-06). |

Y un cierre por defecto: `match /{document=**} { allow read, write: if false; }`. Toda
colección que alguien invente y no esté declarada arriba queda denegada.

## 3. Publicación

Ejecutado el 22/08/2026 sobre el proyecto `hub-cultural-santa-marta`:

```
+ cloud.firestore: rules file firestore.rules compiled successfully
+ firestore: deployed indexes in firestore.indexes.json successfully for (default) database
+ firestore: released rules firestore.rules to cloud.firestore
```

Esa primera línea cierra un pendiente de HU-05: las reglas habían pasado una revisión
estructural pero **nunca se habían compilado**, porque hacerlo exige un proyecto creado. La
compilación real ocurre aquí.

Con ellas se publicaron los **seis índices compuestos** de [04 §10](04-modelo-datos.md):

```
eventos       estadoPublicacion, categoria, fechaInicio
eventos       estadoPublicacion, contadorConsultas ↓
eventos       estadoPublicacion, fechaCreacion
eventos       estadoPublicacion, fechaInicio
eventos       idActor, fechaCreacion ↓
moderaciones  idEvento, fecha ↓
```

## 4. Verificación

El criterio de aceptación se comprobaba a mano en el simulador de la consola de Firebase:
seis clics que nadie vuelve a repetir cuando las reglas cambian. Está escrito como
**pruebas automáticas** en [`../pruebas/reglas/reglas-firestore.test.js`](../pruebas/reglas/reglas-firestore.test.js),
que corren contra el emulador y no tocan los datos reales:

```bash
npm run probar:reglas
```

Levanta el emulador de Firestore, ejecuta los casos y lo apaga. Requiere Java instalado.

Son **21 casos**: los tres del criterio de aceptación, ampliados a los seis del paso 1.6 de
la [guía de puesta en marcha](06-puesta-en-marcha.md), más las contrapartidas positivas.
Esto último importa: una regla que lo denegara **todo** pasaría las seis denegaciones sin
problema. Cada prohibición va acompañada del permiso que sí debe concederse.

Resultado del 22/08/2026:

```
▶ eventos · lectura pública
  ✔ un visitante sin sesión lee un evento aprobado
  ✔ un visitante sin sesión NO lee un evento pendiente
  ✔ el actor dueño sí lee su propio evento pendiente
  ✔ el administrador lee un evento pendiente
▶ escritura sin sesión
  ✔ un visitante sin sesión NO crea un evento
  ✔ un visitante sin sesión NO crea un actor cultural
  ✔ un visitante sin sesión NO escribe en una colección no declarada
▶ propiedad del documento
  ✔ un usuario NO modifica el perfil de actor de otra persona
  ✔ el dueño sí modifica su propio perfil de actor
  ✔ el dueño NO se aprueba a sí mismo: «estado» solo lo mueve el administrador
  ✔ el administrador sí aprueba el perfil
  ✔ un usuario NO se cambia el rol a sí mismo
▶ categorías · potestad del administrador
  ✔ un actor NO escribe en categorías
  ✔ el administrador sí escribe en categorías
  ✔ cualquiera puede leerlas: los filtros públicos las necesitan
▶ moderaciones · devolver exige observación escrita
  ✔ devolver sin observaciones NO se registra
  ✔ devolver con observaciones sí se registra
  ✔ un actor NO registra una moderación
▶ interacciones · registro anonimizado
  ✔ un visitante registra una consulta
  ✔ NO se admite un campo con datos del visitante
  ✔ un visitante NO las lee: son solo para el panel de indicadores

ℹ tests 21   ℹ pass 21   ℹ fail 0
```

### Los tres criterios, caso por caso

| Criterio de aceptación | Casos que lo demuestran |
| --- | --- |
| Sin sesión, **toda escritura** debe rechazarse. | «NO crea un evento», «NO crea un actor cultural», «NO escribe en una colección no declarada». |
| Autenticado, **modificar lo ajeno** debe rechazarse. | «NO modifica el perfil de actor de otra persona», «NO se cambia el rol a sí mismo», «NO se aprueba a sí mismo», frente a «sí modifica su propio perfil». |
| Sin sesión, en `eventos` **solo lo aprobado** debe ser legible. | «lee un evento aprobado» frente a «NO lee un evento pendiente», con el dueño y el administrador sí viendo el pendiente. |

## 5. Hallazgo: `affectedKeys` mide el cambio, no la petición

La primera versión de la prueba «el dueño no se aprueba a sí mismo» **falló**: la escritura
que debía rechazarse pasó. No era un agujero en las reglas sino un defecto de la prueba, y
la razón merece quedar escrita porque volverá a aparecer.

La regla se apoya en:

```
request.resource.data.diff(resource.data).affectedKeys().hasAny(['uid', 'estado'])
```

`affectedKeys()` no responde «qué campos venían en la petición» sino **qué campos quedan
distintos**. El perfil de la prueba estaba sembrado ya como `aprobado`, así que escribirle
`estado: 'aprobado'` no cambiaba nada: la diferencia era vacía, ningún campo resultaba
tocado y la regla dejaba pasar la escritura. Correctamente, además: una escritura que no
modifica nada no es una elevación de privilegios.

**Una prueba que parte del estado final nunca prueba la transición.** Corregido sembrando
un segundo perfil en `pendiente`, sobre el que el dueño intenta la aprobación —y se le
niega— y el administrador la ejecuta —y se le permite—.

## 6. Lo que queda fuera

- **Storage no está configurado** en el proyecto, así que `storage.rules` no se publicó.
  Firebase pide configurarlo desde la consola y suele exigir plan de pago para el bucket.
  No hace falta hasta **HU-19**, que es cuando se cargan imágenes; el archivo de reglas ya
  está escrito y esperando.
- **Las reglas se amplían en cada sprint** conforme entren colecciones y casos: HU-15
  (roles y permisos), HU-17 (categorías), HU-24 (moderación). Cada ampliación añade sus
  casos a la misma suite, y el valor de tenerla es justamente ese. En el Sprint 4 la suite
  pasó de 21 a 34 casos con el alta de cuentas, y encontró un agujero en la regla de
  creación de `usuarios` que este documento no había visto
  ([13 §4.1](13-cuentas-y-sesion.md)).
- La suite comprueba **las reglas**, no la interfaz. Que un botón no aparezca es HU-15.

## 7. Cierre de HU-11

| Criterio de aceptación | Evidencia |
| --- | --- |
| Sin autenticación, toda escritura es rechazada. | Sección 4, tres casos en verde. |
| Un usuario autenticado no modifica lo que no le pertenece. | Sección 4, cuatro casos en verde, con su contrapartida positiva. |
| Sin autenticación, en `eventos` solo son legibles los aprobados. | Sección 4, cuatro casos en verde. |

Publicadas y en vigor sobre `hub-cultural-santa-marta` desde el 22/08/2026.

---

*Elaboración propia (2026).*
