# Tratamiento de datos personales

> **Historia de usuario:** HU-16 · Sprint 4
> **Objetivo específico:** 2 — Desarrollar los módulos del prototipo funcional.
> **Requisito asociado:** RNF-06 (cumplimiento de la normativa colombiana).
> **Marco normativo:** Ley 1581 de 2012 y Decreto 1377 de 2013.
> **Depende de:** [HU-12 · registro](13-cuentas-y-sesion.md).

La política publicada está en **[/politica-de-datos](https://hub-cultural-santa-marta.vercel.app/politica-de-datos)**,
versión 1.0. Este documento explica cómo se cumple cada exigencia y dónde queda la prueba.

---

## 1. Qué exige la ley y dónde se cumple

| Exigencia | Dónde se cumple |
| --- | --- |
| Política de tratamiento **publicada y accesible**. | Vista `/politica-de-datos`, enlazada desde el formulario de registro y desde el pie de todas las vistas. |
| **Autorización previa, expresa e informada** del titular (art. 9). | Casilla sin marcar por omisión en el registro, con el enlace a la política al lado. Sin marcarla no hay cuenta. |
| **Prueba** de la autorización (art. 12). | `usuarios.consentimientoDatos`, con fecha de servidor y versión aceptada. |
| **Finalidad** informada y **limitación** de los datos a esa finalidad (art. 4). | Secciones 2 y 3 de la política; §4 de este documento. |
| **Derechos del titular** y canal para ejercerlos (arts. 8 y 14). | Secciones 5 y 6 de la política, con los plazos legales. |
| **Seguridad** de la información (art. 4, literal g). | Reglas de seguridad de Firestore ([11](11-reglas-de-seguridad.md)) y comunicación cifrada. |

## 2. Por qué la política es una vista y no un archivo de `docs/`

El consentimiento tiene que poder leerse **antes** de aceptarlo, desde el propio formulario,
y seguir accesible después. Un archivo del repositorio no cumple ninguna de las dos cosas:
quien se registra no entra a GitHub.

La política es, por tanto, la vista `src/views/PoliticaDatos/`. No estaba en el inventario
de nueve vistas del prototipo de [HU-06](05-prototipo-interfaz.md) —es la décima—, y se
añade aquí porque el primer criterio de aceptación de HU-16 la exige. Queda enrutada como
`/politica-de-datos` y comprobada por `npm run verificar`, igual que las demás.

## 3. El consentimiento es un dato, no una casilla

Marcar la casilla no basta: hay que poder **probar** que se marcó. Al crear la cuenta se
escribe, dentro del documento de `usuarios`:

```js
consentimientoDatos: {
  aceptado: true,
  fecha: serverTimestamp(),   // la pone el servidor, no el navegador
  version: '1.0'              // qué texto se aceptó, no solo que se aceptó
}
```

**La versión importa.** Sin ella, cambiar el texto de la política convertiría
retroactivamente en consentida una redacción que nadie leyó. Con ella se sabe qué aceptó
cada persona, y una modificación sustancial puede exigir una aceptación nueva.

La fecha la pone el servidor porque una fecha escrita por el cliente es una fecha que el
cliente puede mentir, y esta es precisamente la que sirve de prueba.

## 4. Minimización: lo que no se recoge

RNF-06 pide «recolección limitada a los datos necesarios». En la práctica, lo que **no** hay:

- **De los visitantes sin cuenta, nada identificable.** La colección `interacciones` registra
  la consulta a una publicación con cuatro campos —`idInteraccion`, `idEvento`, `tipo`,
  `fecha`— y las reglas usan `hasOnly` para que no quepa un quinto. Un correo o una
  dirección de red colados en ese documento son rechazados por el servidor, no ocultados
  por la interfaz.
- **Ninguna contraseña.** La gestiona Authentication; el proyecto no la ve
  ([13 §2](13-cuentas-y-sesion.md)).
- **Ningún dato de perfilado.** No hay analítica de terceros, ni cookies de seguimiento, ni
  identificadores publicitarios.

Los datos del perfil de un actor cultural sí son personales y sí se publican: es la
finalidad por la que se entregan, y la política lo dice con esas palabras.

## 5. El canal de supresión

El cuarto criterio de aceptación pide que **exista un canal documentado**. Es el correo
institucional del equipo, publicado en la sección 6 de la política, con los plazos de la
ley: diez días hábiles para consultas y quince para reclamos.

Atendida una supresión se elimina la cuenta, su perfil y sus publicaciones. Los registros de
`interacciones` no se eliminan **porque no están asociados a ninguna persona**: no hay nada
que suprimir en ellos, y esa es la ventaja de haberlos anonimizado desde el modelo de datos.

## 6. Verificación

### La casilla bloquea el registro

```
▶ consentimiento · sin aceptación no hay registro (HU-16, segundo criterio)
  ✔ la casilla sin marcar bloquea el registro
  ✔ el mensaje nombra la política de tratamiento de datos
  ✔ marcada, deja pasar
  ✔ un valor que no sea verdadero no cuenta como aceptación
```

El último caso comprueba que ni `undefined`, ni `null`, ni la cadena `'false'`, ni un `1`
cuentan como aceptación: la ley exige consentimiento **expreso**, y solo el booleano
verdadero lo es.

### Las reglas también lo exigen

La casilla es la interfaz, y la interfaz se puede saltar. Contra el emulador:

```
  ✔ NO se crea la cuenta sin aceptar el tratamiento de datos
  ✔ NO se crea la cuenta sin el campo de consentimiento
  ✔ NO se crea la cuenta sin la versión de la política aceptada
  ✔ NO se retira el consentimiento editando el propio documento
```

El último es menos evidente que los otros tres: `consentimientoDatos` está en la lista de
campos que el propio usuario no puede tocar al editarse. Si pudiera, la prueba de la
autorización sería un dato que el interesado modifica a voluntad, y dejaría de ser prueba.

### La prueba de la autorización, leída en la base de datos

Sobre una cuenta creada desde el formulario publicado, el 22/08/2026:

```
consentimientoDatos
  aceptado  true
  fecha     22 de agosto de 2026, 8:56:38 p.m. UTC-5
  version   "1.0"
fechaRegistro
            22 de agosto de 2026, 8:56:38 p.m. UTC-5
```

Es el tercer criterio de aceptación, y es también lo que el artículo 12 llama prueba de la
autorización: consta **qué** se aceptó (la versión), **cuándo**, y que fue un sí expreso. La
fecha coincide al segundo con la del registro porque las dos las escribió el servidor en la
misma operación.

### La política es alcanzable

```
/politica-de-datos → 200 · enlazada desde el registro y desde el pie de todas las vistas
360 px · desborde 0 px · elementos bajo 44x44: 0
```

## 7. Lo que queda fuera y hay que decidir antes de operar de verdad

Esto es un **prototipo académico** sin explotación comercial y sin usuarios reales. Dos
asuntos quedan expresamente fuera de su alcance y deben resolverse antes de cualquier puesta
en producción con datos de personas reales:

- **Registro Nacional de Bases de Datos ante la Superintendencia de Industria y Comercio.**
  La obligación de inscribirse depende de la naturaleza y el tamaño del responsable
  (art. 25 de la Ley 1581 y la reglamentación posterior). Quién sería el responsable
  —el equipo, la institución o el ente territorial que adopte la plataforma— es una decisión
  que no toma el prototipo, y de ella depende la respuesta.
- **Transferencia internacional de datos.** La información se aloja en servidores de Google
  fuera de Colombia. La política lo declara, que es lo que corresponde en esta etapa; el
  régimen de transferencia del artículo 26 se evalúa cuando exista un responsable definido.

Anotarlos no es un descargo: es lo que exige la [matriz de trazabilidad de HU-40](README.md),
donde RNF-06 tiene que poder señalar qué está cubierto y qué no.

## 8. Cierre de HU-16

| Criterio de aceptación | Evidencia |
| --- | --- |
| El formulario de registro incluye un enlace visible a la política. | §2 y §6; el enlace va en línea propia con área de toque completa, y se repite en el pie. |
| Sin marcar la casilla, el registro no se completa. | §6: cuatro casos de validación y cuatro de reglas. |
| La cuenta creada guarda el registro de la aceptación con su fecha. | §3: `consentimientoDatos` con fecha de servidor y versión. |
| Existe un canal documentado para las solicitudes de supresión. | §5 y sección 6 de la política publicada, con los plazos legales. |

---

*Elaboración propia (2026).*
