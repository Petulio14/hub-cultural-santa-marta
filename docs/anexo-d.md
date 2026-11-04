# Anexo D · Casos de prueba, hallazgos, instrumento de usabilidad y consentimientos

> **Trabajo de grado — Hub Cultural Santa Marta**
> Ingeniería en Software, Tecnológico de Antioquia.
> Versión del prototipo descrita: **1.0.0**.

> ⚙ **Este documento se genera.** Lo escribe `herramientas/generar-anexo-d.js`, y
> `npm run verificar` comprueba que el archivo del repositorio sea el que saldría hoy.
> Para actualizarlo, `npm run anexo`; para el .docx que se adjunta, `npm run anexo:word`.

Este anexo reúne la evidencia de verificación del prototipo, **compuesta a partir del**
**repositorio**: los criterios de aceptación salen de la instantánea de los issues, los casos
de prueba del catálogo que mantiene la matriz de trazabilidad, las capturas de
`docs/caso de pruebas/`, los hallazgos de su registro y el instrumento de usabilidad de
`pruebas/usabilidad/`. Ninguna cifra de este documento está escrita a mano.

| | |
| --- | --- |
| Historias de usuario | 40 |
| Criterios de aceptación | 140 |
| Criterios con caso de prueba | 133 |
| Capturas de pantalla | **94**, en 26 historias |
| Hallazgos registrados | 9 |
| Sesiones de usabilidad ejecutadas | **0** de 8 |

---

## D.1 Cómo leer este anexo

Cada historia trae **sus criterios de aceptación tal como están escritos en el issue**, el
caso de prueba que verifica cada uno y el resultado. Debajo, las capturas que documentan la
comprobación.

**No todas las historias tienen capturas, y no es un olvido.** El tipo de cada caso dice qué
clase de evidencia le corresponde:

| Tipo de caso | Qué evidencia produce |
| --- | --- |
| `navegador` | Un recorrido por la pantalla: **esto sí se fotografía** |
| `produccion` | Lo mismo, pero sobre el sitio publicado |
| `documental` | Un documento que tiene que existir y decir algo: la evidencia es el documento |
| `unidad` | `npm run probar`, que corre en cada integración |
| `reglas` | `npm run probar:reglas` contra el emulador de Firestore |
| `estructura` | `npm run verificar`, reglas estructurales del repositorio |
| `herramienta` | Un guion que mide y falla si no llega al umbral |
| `asesor` | Una aprobación externa al repositorio |

Por eso las historias de documentación —requisitos, arquitectura, modelo de datos— no
aparecen con fotografías: su evidencia es el documento que produjeron, y está en `docs/`.

---

## D.2 Casos de prueba

### HU-01 · Especificación de requisitos del sistema

**Prioridad:** debe · **Requisitos:** RF-01, RF-15, RNF-01, RNF-10 · **Objetivo específico:** 1

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado que se ha realizado la revisión documental del contexto, cuando se consolide el análisis, entonces cada limitación identificada debe estar asociada al menos a un requisito. | CP-01.1 | `documental` | pasa |
| 2 | Dado el catálogo de requisitos, cuando se revise, entonces cada requisito funcional debe tener un código único, una redacción verificable y una prioridad asignada. | CP-01.2 | `documental` | pasa |
| 3 | Dado el catálogo de requisitos no funcionales, cuando se revise, entonces cada uno debe contar con un criterio de verificación medible. | CP-01.3 | `documental` | pasa |
| 4 | Dado el documento finalizado, cuando se presente al asesor, entonces debe recibir su aprobación antes de iniciar el diseño. | CP-01.4 | `asesor` | pendiente |

**Evidencia registrada:**

- **CP-01.1** — docs/01 §1 y §2: cada limitación asociada a su necesidad y a su requisito
- **CP-01.2** — docs/01 §3: 15 RF con código, redacción verificable y prioridad MoSCoW
- **CP-01.3** — docs/01 §4: 10 RNF, cada uno con su criterio de verificación medible
- **CP-01.4** — docs/01: la validación registrada es del otro integrante y dice que se cumplen «los primeros tres criterios»

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, asesor.*

### HU-02 · Construcción y priorización del Product Backlog

**Prioridad:** debe · **Requisitos:** RF-01, RF-15 · **Objetivo específico:** 1

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el catálogo de requisitos, cuando se redacten las historias, entonces cada una debe seguir el formato «como / necesito / para» y contar con criterios de aceptación. | CP-02.1 | `documental` | pasa |
| 2 | Dado el conjunto de historias, cuando se estime en planning poker, entonces cada historia debe tener un valor en puntos de la escala de Fibonacci adoptada. | CP-02.2 | `documental` | pasa |
| 3 | Dado el backlog, cuando se priorice con el método MoSCoW, entonces las historias clasificadas como «Debe» deben cubrir el ciclo completo de publicar, moderar, descubrir y contactar. | CP-02.3 | `documental` | pasa |
| 4 | Dado el backlog priorizado, cuando se cierre el Sprint 1, entonces debe estar publicado en el tablero de GitHub Projects. | CP-02.4 | `documental` | pasa |

**Evidencia registrada:**

- **CP-02.1** — los 40 issues del repositorio: formato «como / necesito / para» con criterios de aceptación
- **CP-02.2** — los 40 issues llevan etiqueta «puntos:n» de la escala Fibonacci adoptada
- **CP-02.3** — backlog/ y las etiquetas «prioridad:debe»: cubren publicar, moderar, descubrir y contactar
- **CP-02.4** — tablero de GitHub Projects con las 40 historias y los 8 hitos

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental.*

### HU-03 · Delimitación del alcance del producto mínimo viable

**Prioridad:** debe · **Requisitos:** — · **Objetivo específico:** 1

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el backlog priorizado, cuando se defina el alcance, entonces debe existir una lista escrita de funcionalidades excluidas con su justificación. | CP-03.1 | `documental` | pasa |
| 2 | Dado el alcance definido, cuando se identifique una funcionalidad fuera de él, entonces debe registrarse como trabajo futuro y no incorporarse a ningún sprint. | CP-03.2 | `documental` | pasa |
| 3 | Dado el alcance, cuando se revise con el asesor, entonces debe quedar constancia de su aceptación. | CP-03.3 | `asesor` | pendiente |

**Evidencia registrada:**

- **CP-03.1** — docs/02 §3: exclusiones, cada una con su justificación
- **CP-03.2** — docs/02 §5: registro de trabajo futuro
- **CP-03.3** — docs/02 §6: la fila «Revisado con el asesor» dice «pendiente de registrar fecha y observaciones»

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, asesor.*

### HU-04 · Diseño de la arquitectura de la solución

**Prioridad:** debe · **Requisitos:** RNF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el alcance aprobado, cuando se diseñe la arquitectura, entonces debe quedar documentada en un diagrama con sus capas y las relaciones entre ellas. | CP-04.1 | `documental` | pasa |
| 2 | Dada la arquitectura, cuando se revise, entonces la capa de presentación no debe acceder a datos sin pasar por la capa de servicios. | CP-04.2 | `estructura` | pasa |
| 3 | Dada la arquitectura, cuando se documente, entonces debe indicar explícitamente qué tecnología resuelve cada capa. | CP-04.3 | `documental` | pasa |

**Evidencia registrada:**

- **CP-04.1** — docs/03 §1: diagrama de las cuatro capas y sus relaciones
- **CP-04.2** — npm run verificar, regla 1: ningún archivo fuera de src/services/ importa el SDK de Firebase
- **CP-04.3** — docs/03 §2: qué tecnología resuelve cada capa

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, estructura.*

### HU-05 · Diseño del modelo de datos en Cloud Firestore

**Prioridad:** debe · **Requisitos:** RF-03, RF-11 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el catálogo de requisitos, cuando se diseñe el modelo, entonces cada entidad debe tener su colección con los campos necesarios y sus tipos definidos. | CP-05.1 | `documental` | pasa |
| 2 | Dado el modelo, cuando se revise, entonces las relaciones entre colecciones deben resolverse mediante identificadores de referencia. | CP-05.2 | `documental` | pasa |
| 3 | Dado el modelo, cuando se documente, entonces debe indicar qué campos son obligatorios y cuáles admiten valor nulo. | CP-05.3 | `documental` | pasa |
| 4 | Dado el modelo, cuando se implemente, entonces debe permitir consultar los eventos filtrando por categoría y por rango de fechas. | CP-05.4 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-05.1** — docs/04 §3 a §9: las 7 colecciones con sus campos y tipos
- **CP-05.2** — docs/04 §2: las relaciones se resuelven por identificador de referencia
- **CP-05.3** — docs/04 §3 a §9: columna «Obligatorio» en cada colección
- **CP-05.4** — pruebas/reglas: «los filtros del catálogo (HU-26)»

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, reglas.*

### HU-06 · Prototipo de interfaz en Figma

**Prioridad:** debe · **Requisitos:** RNF-01, RNF-03, RNF-07 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el alcance funcional, cuando se diseñe el prototipo, entonces deben existir las vistas de inicio, catálogo, detalle de evento, perfil de actor, directorio de hubs, mapa y panel de administración. | CP-06.1 | `documental` | pasa |
| 2 | Dado el prototipo, cuando se revise, entonces debe ser navegable entre pantallas mediante enlaces. | CP-06.2 | `documental` | pasa |
| 3 | Dado el prototipo, cuando se defina la paleta, entonces los contrastes de color deben cumplir la relación mínima exigida por las pautas WCAG 2.1. | CP-06.3 | `herramienta` | pasa |
| 4 | Dado el prototipo, cuando se presente en la Sprint Review, entonces debe recibir la retroalimentación del asesor antes de iniciar la construcción. | CP-06.4 | `asesor` | pasa |

**Evidencia registrada:**

- **CP-06.1** — docs/05 §2: inventario de las 9 vistas
- **CP-06.2** — prototipo publicado en Figma: 27 pantallas y 151 enlaces (docs/07)
- **CP-06.3** — python herramientas/medir-contraste.py: 21 pares, ninguno por debajo de su mínimo
- **CP-06.4** — docs/README §Sprint 2: prototipo publicado en Figma y aprobado por el asesor

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, herramienta, asesor.*

### HU-07 · Configuración del proyecto y estructura de rutas

**Prioridad:** debe · **Requisitos:** RNF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el proyecto creado, cuando se ejecute en local, entonces debe iniciar sin errores en consola. | CP-07.1 | `navegador` | pasa |
| 2 | Dada la estructura de carpetas, cuando se revise, entonces debe separar componentes, vistas, servicios y utilidades. | CP-07.2 | `estructura` | pasa |
| 3 | Dado el enrutador, cuando se navegue a una ruta inexistente, entonces debe mostrarse una página de error controlada. | CP-07.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-07.1** — docs/08 §1 y la revisión de docs/32 §4: las 7 vistas sin errores en consola
- **CP-07.2** — docs/08 §2 y npm run verificar: components, views, services y utils separados
- **CP-07.3** — docs/08 §4: una ruta inexistente lleva a la página de error controlada

![Captura del criterio 1 de HU-07](caso%20de%20pruebas/H7/h7.1%20Dado%20el%20proyecto%20creado,%20cuando%20se%20ejecute%20en%20local,%20entonces%20debe%20iniciar%20sin%20errores%20en%20consola.png)

*Figura D.1 — HU-07.1: Dado el proyecto creado, cuando se ejecute en local, entonces debe iniciar sin errores en consola.*

![Captura del criterio 2 de HU-07](caso%20de%20pruebas/H7/h7.2%20Dada%20la%20estructura%20de%20carpetas,%20cuando%20se%20revise,%20entonces%20debe%20separar%20componentes,%20vistas,%20servicios%20y%20utilidades..png)

*Figura D.2 — HU-07.2: Dada la estructura de carpetas, cuando se revise, entonces debe separar componentes, vistas, servicios y utilidades.*

![Captura del criterio 3 de HU-07](caso%20de%20pruebas/H7/h7.3%20-%20Dado%20el%20enrutador,%20cuando%20se%20navegue%20a%20una%20ruta%20inexistente,%20entonces%20debe%20mostrarse%20una%20p%C3%A1gina%20de%20error%20controlada.png)

*Figura D.3 — HU-07.3: Dado el enrutador, cuando se navegue a una ruta inexistente, entonces debe mostrarse una página de error controlada.*

### HU-08 · Repositorio versionado y despliegue continuo

**Prioridad:** debe · **Requisitos:** RNF-08, RNF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el repositorio, cuando se integre un cambio en la rama principal, entonces Vercel debe generar un despliegue sin intervención manual. | CP-08.1 | `produccion` | pasa |
| 2 | Dado un despliegue, cuando finalice, entonces debe existir una dirección pública accesible desde cualquier navegador. | CP-08.2 | `produccion` | pasa |
| 3 | Dada la rama principal, cuando se intente integrar sin revisión del otro integrante, entonces la integración debe quedar bloqueada. | CP-08.3 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-08.1** — docs/12 §4: cada integración en master se publica sola en Vercel
- **CP-08.2** — docs/12 §1: hub-cultural-santa-marta.vercel.app, accesible
- **CP-08.3** — rama master protegida: exige pull request con una aprobación

*Sin capturas de pantalla: la evidencia de esta historia es de tipo produccion.*

### HU-09 · Estructura base de navegación y página de inicio

**Prioridad:** debe · **Requisitos:** RF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la página de inicio, cuando se cargue, entonces debe presentar el propósito de la plataforma y los cuatro accesos principales. | CP-09.1 | `navegador` | pasa |
| 2 | Dado el menú de navegación, cuando se seleccione una opción, entonces debe conducir a la vista correspondiente en menos de dos segundos. | CP-09.2 | `navegador` | pasa |
| 3 | Dada cualquier vista interna, cuando se consulte, entonces debe existir siempre una forma visible de regresar al inicio. | CP-09.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-09.1** — docs/09 §2: la página de inicio presenta el propósito y los cuatro accesos
- **CP-09.2** — docs/09 §4: cambio de vista sin recarga, medido
- **CP-09.3** — docs/09 §3: el nombre del sitio en la cabecera y el enlace del pie

![Captura del criterio 1 de HU-09](caso%20de%20pruebas/H9/h9.1%20Dada%20la%20p%C3%A1gina%20de%20inicio,%20cuando%20se%20cargue,%20entonces%20debe%20presentar%20el%20prop%C3%B3sito%20de%20la%20plataforma%20y%20los%20cuatro%20accesos%20principales..png)

*Figura D.4 — HU-09.1: Dada la página de inicio, cuando se cargue, entonces debe presentar el propósito de la plataforma y los cuatro accesos principales.*

![Captura del criterio 2 de HU-09](caso%20de%20pruebas/H9/h9.2%20Dado%20el%20men%C3%BA%20de%20navegaci%C3%B3n,%20cuando%20se%20seleccione%20una%20opci%C3%B3n,%20entonces%20debe%20conducir%20a%20la%20vista%20correspondiente%20en%20menos%20de%20dos%20segundos..png)

*Figura D.5 — HU-09.2: Dado el menú de navegación, cuando se seleccione una opción, entonces debe conducir a la vista correspondiente en menos de dos segundos.*

![Captura del criterio 3 de HU-09](caso%20de%20pruebas/H9/h%209.3%20Dada%20cualquier%20vista%20interna,%20cuando%20se%20consulte,%20entonces%20debe%20existir%20siempre%20una%20forma%20visible%20de%20regresar%20al%20inicio..png)

*Figura D.6 — HU-09.3: Dada cualquier vista interna, cuando se consulte, entonces debe existir siempre una forma visible de regresar al inicio.*

### HU-10 · Diseño responsive de la estructura base

**Prioridad:** debe · **Requisitos:** RNF-03 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la interfaz, cuando se visualice en anchos de 360, 768 y 1366 píxeles, entonces el contenido debe permanecer legible y sin desbordamiento horizontal. | CP-10.1 | `navegador` | pasa |
| 2 | Dado el menú, cuando el ancho sea inferior a 768 píxeles, entonces debe presentarse en su versión compacta. | CP-10.2 | `navegador` | pasa |
| 3 | Dados los elementos interactivos, cuando se visualicen en móvil, entonces su área de toque no debe ser inferior a 44 por 44 píxeles. | CP-10.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-10.1** — docs/32 §1: las 7 vistas a 360 px, scrollWidth igual a clientWidth
- **CP-10.2** — docs/10 §2: el menú compacto entra en el punto exacto de 768 px
- **CP-10.3** — docs/32 §3: 8 elementos bajo 44 px; 6 exentos por WCAG y 2 corregidos

![Captura del criterio 1 de HU-10](caso%20de%20pruebas/H10/h10.1%20Dada%20la%20interfaz,%20cuando%20se%20visualice%20en%20anchos%20de%20360,%20768%20y%201366%20p%C3%ADxeles,%20entonces%20el%20contenido%20debe%20permanecer%20legible%20y%20sin%20desbordamiento%20horizontal..png)

*Figura D.7 — HU-10.1: Dada la interfaz, cuando se visualice en anchos de 360, 768 y 1366 píxeles, entonces el contenido debe permanecer legible y sin desbordamiento horizontal.*

![Captura del criterio 2 de HU-10](caso%20de%20pruebas/H10/h10.%202%20Dado%20el%20men%C3%BA,%20cuando%20el%20ancho%20sea%20inferior%20a%20768%20p%C3%ADxeles,%20entonces%20debe%20presentarse%20en%20su%20versi%C3%B3n%20compacta..png)

*Figura D.8 — HU-10.2: Dado el menú, cuando el ancho sea inferior a 768 píxeles, entonces debe presentarse en su versión compacta.*

![Captura del criterio 3 de HU-10](caso%20de%20pruebas/H10/H%2010.3%20Dados%20los%20elementos%20interactivos,%20cuando%20se%20visualicen%20en%20m%C3%B3vil,%20entonces%20su%20%C3%A1rea%20de%20toque%20no%20debe%20ser%20inferior%20a%2044%20por%2044%20p%C3%ADxeles..png)

*Figura D.9 — HU-10.3: Dados los elementos interactivos, cuando se visualicen en móvil, entonces su área de toque no debe ser inferior a 44 por 44 píxeles.*

### HU-11 · Reglas de seguridad iniciales de la base de datos

**Prioridad:** debe · **Requisitos:** RNF-05, RNF-08 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada una sesión no autenticada, cuando se intente escribir en cualquier colección, entonces la operación debe ser rechazada. | CP-11.1 | `reglas` | pasa |
| 2 | Dado un usuario autenticado, cuando intente modificar un documento que no le pertenece, entonces la operación debe ser rechazada. | CP-11.2 | `reglas` | pasa |
| 3 | Dada la colección de eventos, cuando se consulte sin autenticación, entonces solo deben ser legibles los documentos con estado aprobado. | CP-11.3 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-11.1** — pruebas/reglas: «escritura sin sesión»
- **CP-11.2** — pruebas/reglas: «propiedad del documento»
- **CP-11.3** — pruebas/reglas: «eventos · lectura pública»

*Sin capturas de pantalla: la evidencia de esta historia es de tipo reglas.*

### HU-12 · Registro de actor cultural

**Prioridad:** debe · **Requisitos:** RF-01 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario de registro, cuando ingrese un correo válido y una contraseña de al menos ocho caracteres, entonces la cuenta debe crearse y quedar asociada al rol de actor cultural. | CP-12.1 | `produccion` | pasa |
| 2 | Dado el formulario, cuando ingrese un correo ya registrado, entonces debe mostrarse un mensaje claro y no crearse una cuenta duplicada. | CP-12.2 | `produccion` | pasa |
| 3 | Dado el formulario, cuando algún campo obligatorio esté vacío, entonces el envío debe bloquearse indicando el campo faltante. | CP-12.3 | `unidad` | pasa |
| 4 | Dado un registro exitoso, cuando finalice, entonces debe iniciarse la sesión automáticamente y redirigirse al perfil. | CP-12.4 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-12.1** — docs/13 §5: registro comprobado en el sitio publicado con cuenta real
- **CP-12.2** — docs/13 §3 y §5: correo ya registrado, mensaje propio y sin cuenta duplicada
- **CP-12.3** — pruebas/unidad: «registro · campos obligatorios (HU-12, tercer criterio)»
- **CP-12.4** — docs/13 §5: tras registrarse, sesión iniciada y redirección al perfil

![Captura del criterio 1 de HU-12](caso%20de%20pruebas/H12/H12.1Dado%20el%20form%20de%20registro,%20cuando%20ingrese%20un%20correo%20v%C3%A1lido%20y%20una%20contrase%C3%B1a%20de%20al%20menos%20ocho%20caracteres,%20entonces%20la%20cuenta%20debe%20crearse%20y%20quedar%20asociada.png)

*Figura D.10 — HU-12.1: Dado el formulario de registro, cuando ingrese un correo válido y una contraseña de al menos ocho caracteres, entonces la cuenta debe crearse y quedar asociada al rol de actor cultural.*

![Captura del criterio 2 de HU-12](caso%20de%20pruebas/H12/h%2012.2%20dado%20el%20formulario,cuando%20ingrese%20un%20correo%20ya%20registrado,%20entonces%20debe%20mostrarse%20un%20mensaje%20claro%20y%20no%20crearse%20una%20cuenta%20duplicada..png)

*Figura D.11 — HU-12.2: Dado el formulario, cuando ingrese un correo ya registrado, entonces debe mostrarse un mensaje claro y no crearse una cuenta duplicada.*

![Captura del criterio 3 de HU-12](caso%20de%20pruebas/H12/h12.3%20Dado%20el%20formulario,%20cuando%20alg%C3%BAn%20campo%20obligatorio%20est%C3%A9%20vac%C3%ADo,%20entonces%20el%20env%C3%ADo%20debe%20bloquearse%20indicando%20el%20campo%20faltante.png)

*Figura D.12 — HU-12.3: Dado el formulario, cuando algún campo obligatorio esté vacío, entonces el envío debe bloquearse indicando el campo faltante.*

![Captura del criterio 4 de HU-12](caso%20de%20pruebas/H12/h12.4%20Dado%20un%20registro%20exitoso,%20cuando%20finalice,%20entonces%20debe%20iniciarse%20la%20sesi%C3%B3n%20autom%C3%A1ticamente%20y%20redirigirse%20al%20perfil.png)

*Figura D.13 — HU-12.4: Dado un registro exitoso, cuando finalice, entonces debe iniciarse la sesión automáticamente y redirigirse al perfil.*

### HU-13 · Inicio y cierre de sesión

**Prioridad:** debe · **Requisitos:** RF-02 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dadas credenciales correctas, cuando inicie sesión, entonces debe accederse a la vista correspondiente a mi rol. | CP-13.1 | `produccion` | pasa |
| 2 | Dadas credenciales incorrectas, cuando intente iniciar sesión, entonces debe mostrarse un mensaje de error que no revele si el correo existe. | CP-13.2 | `unidad` | pasa |
| 3 | Dada una sesión activa, cuando cierre sesión, entonces debe perderse el acceso a las vistas privadas. | CP-13.3 | `produccion` | pasa |
| 4 | Dada una sesión activa, cuando recargue la página, entonces la sesión debe mantenerse. | CP-13.4 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-13.1** — docs/13 §5: cada rol entra a su vista, comprobado con cuentas reales
- **CP-13.2** — pruebas/unidad: «ingreso · qué se valida al entrar (HU-13)», y docs/13 §3
- **CP-13.3** — docs/13 §5: al cerrar sesión se pierde el acceso a las vistas privadas
- **CP-13.4** — docs/13 §5: la sesión sobrevive a la recarga

![Captura del criterio 1 de HU-13](caso%20de%20pruebas/H13/H%2013.%201%20Dadas%20credenciales%20correctas,%20cuando%20inicie%20sesi%C3%B3n,%20entonces%20debe%20accederse%20a%20la%20vista%20correspondiente%20a%20mi%20rol.png)

*Figura D.14 — HU-13.1: Dadas credenciales correctas, cuando inicie sesión, entonces debe accederse a la vista correspondiente a mi rol.*

![Captura del criterio 2 de HU-13](caso%20de%20pruebas/H13/H%2013.%202%20concredenciales%20incorrectas%20al%20intente%20iniciar%20sesi%C3%B3n,%20debe%20mostrarse%20un%20mensaje%20de%20error%20que%20no%20revele%20si%20el%20correo%20existe.png)

*Figura D.15 — HU-13.2: Dadas credenciales incorrectas, cuando intente iniciar sesión, entonces debe mostrarse un mensaje de error que no revele si el correo existe.*

![Captura del criterio 3 de HU-13](caso%20de%20pruebas/H13/h%2013.3%20Dada%20una%20sesi%C3%B3n%20activa,%20cuando%20cierre%20sesi%C3%B3n,%20entonces%20debe%20perderse%20el%20acceso%20a%20las%20vistas%20pri.png)

*Figura D.16 — HU-13.3: Dada una sesión activa, cuando cierre sesión, entonces debe perderse el acceso a las vistas privadas.*

![Captura del criterio 4 de HU-13](caso%20de%20pruebas/H13/h%2013.4%20Dada%20una%20sesi%C3%B3n%20activa,%20cuando%20recargue%20la%20p%C3%A1gina,%20entonces%20la%20sesi%C3%B3n%20debe%20mantenerse..png)

*Figura D.17 — HU-13.4: Dada una sesión activa, cuando recargue la página, entonces la sesión debe mantenerse.*

### HU-14 · Recuperación de contraseña

**Prioridad:** deberia · **Requisitos:** RF-02 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado un correo registrado, cuando solicite el restablecimiento, entonces debe recibirse un mensaje con el enlace correspondiente. | CP-14.1 | `produccion` | pasa |
| 2 | Dado un correo no registrado, cuando se solicite, entonces la respuesta visible debe ser la misma para no revelar la existencia de la cuenta. | CP-14.2 | `unidad` | pasa |
| 3 | Dado el enlace recibido, cuando se defina una nueva contraseña válida, entonces debe poderse iniciar sesión con ella. | CP-14.3 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-14.1** — docs/13 §5 bis y §5 ter: correo de restablecimiento recibido, con dos hallazgos anotados
- **CP-14.2** — pruebas/unidad: «recuperación de contraseña (HU-14)»; el mensaje no distingue
- **CP-14.3** — docs/13 §5 bis: contraseña nueva definida y sesión iniciada con ella

![Captura del criterio 1 de HU-14](caso%20de%20pruebas/H14/14.1%20Dado%20un%20correo%20registrado,%20cuando%20solicite%20el%20restablecimiento,%20entonces%20debe%20recibirse%20un%20mensaje%20con%20el%20enlace%20correspondiente.png)

*Figura D.18 — HU-14.1: Dado un correo registrado, cuando solicite el restablecimiento, entonces debe recibirse un mensaje con el enlace correspondiente.*

![Captura del criterio 2 de HU-14](caso%20de%20pruebas/H14/14.2Dado%20un%20correo%20no%20registrado,%20cuando%20se%20solicite,%20entonces%20la%20respuesta%20visible%20debe%20ser%20la%20misma%20para%20no%20revelar%20la%20existencia%20de%20la%20cuenta..png)

*Figura D.19 — HU-14.2: Dado un correo no registrado, cuando se solicite, entonces la respuesta visible debe ser la misma para no revelar la existencia de la cuenta.*

![Captura del criterio 3 de HU-14](caso%20de%20pruebas/H14/14.3%20Dado%20el%20enlace%20recibido,%20cuando%20se%20defina%20una%20nueva%20contrase%C3%B1a%20v%C3%A1lida,%20entonces%20debe%20poderse%20iniciar%20sesi%C3%B3n%20con%20ella..png)

*Figura D.20 — HU-14.3: Dado el enlace recibido, cuando se defina una nueva contraseña válida, entonces debe poderse iniciar sesión con ella.*

### HU-15 · Diferenciación de roles y permisos

**Prioridad:** debe · **Requisitos:** RF-01, RNF-08 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada una cuenta con rol de actor cultural, cuando intente acceder al panel de administración, entonces el acceso debe ser denegado. | CP-15.1 | `reglas` | pasa |
| 2 | Dada una cuenta con rol de administrador, cuando inicie sesión, entonces debe acceder al panel de moderación. | CP-15.2 | `produccion` | pasa |
| 3 | Dado un visitante sin cuenta, cuando navegue por la plataforma, entonces debe poder consultar el contenido aprobado sin registrarse. | CP-15.3 | `navegador` | pasa |
| 4 | Dado cualquier intento de acceso indebido, cuando se produzca, entonces debe ser rechazado también por las reglas de la base de datos y no solo por la interfaz. | CP-15.4 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-15.1** — pruebas/reglas: «roles y permisos (HU-15)»
- **CP-15.2** — docs/15 §6: el administrador entra al panel, comprobado en el sitio publicado
- **CP-15.3** — docs/15 §1 y docs/32 §1: las 7 vistas públicas se recorren sin cuenta
- **CP-15.4** — pruebas/reglas: «roles y permisos (HU-15)» y «propiedad del documento»

![Captura del criterio 1 de HU-15](caso%20de%20pruebas/H15/H%2015.1%20Dada%20una%20cuenta%20con%20rol%20de%20actor%20cultural,%20cuando%20intente%20acceder%20al%20panel%20de%20administraci%C3%B3n,%20entonces%20el%20acceso%20debe%20ser%20denegado.png)

*Figura D.21 — HU-15.1: Dada una cuenta con rol de actor cultural, cuando intente acceder al panel de administración, entonces el acceso debe ser denegado.*

![Captura del criterio 2 de HU-15](caso%20de%20pruebas/H15/h%2015.2%20Dada%20una%20cuenta%20con%20rol%20de%20administrador,%20cuando%20inicie%20sesi%C3%B3n,%20entonces%20debe%20acceder%20al%20panel%20de%20moderaci%C3%B3n..png)

*Figura D.22 — HU-15.2: Dada una cuenta con rol de administrador, cuando inicie sesión, entonces debe acceder al panel de moderación.*

![Captura del criterio 3 de HU-15](caso%20de%20pruebas/H15/h%2015.3%20Dado%20un%20visitante%20sin%20cuenta,%20cuando%20navegue%20por%20la%20plataforma,%20entonces%20debe%20poder%20consultar%20el%20contenido%20aprobado%20sin%20registrarse..png)

*Figura D.23 — HU-15.3: Dado un visitante sin cuenta, cuando navegue por la plataforma, entonces debe poder consultar el contenido aprobado sin registrarse.*

![Captura del criterio 4 de HU-15](caso%20de%20pruebas/H15/h%2015.4%20Dado%20cualquier%20intento%20de%20acceso%20indebido%20entonces%20debe%20ser%20rechazado%20tambi%C3%A9n%20por%20las%20reglas%20de%20la%20base%20de%20datos%20y%20no%20solo%20por%20la%20interfaz.png)

*Figura D.24 — HU-15.4: Dado cualquier intento de acceso indebido, cuando se produzca, entonces debe ser rechazado también por las reglas de la base de datos y no solo por la interfaz.*

### HU-16 · Consentimiento de tratamiento de datos personales

**Prioridad:** debe · **Requisitos:** RNF-06 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario de registro, cuando se presente, entonces debe incluir un enlace visible a la política de tratamiento de datos. | CP-16.1 | `navegador` | pasa |
| 2 | Dado el formulario, cuando no se marque la casilla de aceptación, entonces el registro no debe completarse. | CP-16.2 | `unidad` | pasa |
| 3 | Dada una cuenta creada, cuando se consulte en la base de datos, entonces debe existir el registro de la aceptación con su fecha. | CP-16.3 | `reglas` | pasa |
| 4 | Dada una solicitud de supresión, cuando el usuario la presente, entonces debe existir un canal documentado para atenderla. | CP-16.4 | `documental` | pasa |

**Evidencia registrada:**

- **CP-16.1** — docs/14 §6: el enlace a la política está en el formulario de registro
- **CP-16.2** — pruebas/unidad: «consentimiento · sin aceptación no hay registro (HU-16, segundo criterio)»
- **CP-16.3** — pruebas/reglas: «usuarios · alta de la cuenta (HU-12, HU-16)»
- **CP-16.4** — docs/14 §5: canal de supresión documentado en la política publicada

![Captura del criterio 1 de HU-16](caso%20de%20pruebas/H16/h%2016.1Dado%20el%20formulario%20de%20registro,%20cuando%20se%20presente,%20entonces%20debe%20incluir%20un%20enlace%20visible%20a%20la%20pol%C3%ADtica%20de%20tratamiento%20de%20datos.png)

*Figura D.25 — HU-16.1: Dado el formulario de registro, cuando se presente, entonces debe incluir un enlace visible a la política de tratamiento de datos.*

![Captura del criterio 2 de HU-16](caso%20de%20pruebas/H16/h%2016.%202%20Dado%20el%20formulario,%20cuando%20no%20se%20marque%20la%20casilla%20de%20aceptaci%C3%B3n,%20entonces%20el%20registro%20no%20debe%20completarse..png)

*Figura D.26 — HU-16.2: Dado el formulario, cuando no se marque la casilla de aceptación, entonces el registro no debe completarse.*

![Captura del criterio 3 de HU-16](caso%20de%20pruebas/H16/h%2016.3%20Dada%20una%20cuenta%20creada,%20cuando%20se%20consulte%20en%20la%20base%20de%20datos,%20entonces%20debe%20existir%20el%20registro%20de%20la%20aceptaci%C3%B3n%20con%20su%20fecha..png)

*Figura D.27 — HU-16.3: Dada una cuenta creada, cuando se consulte en la base de datos, entonces debe existir el registro de la aceptación con su fecha.*

![Captura del criterio 4 de HU-16](caso%20de%20pruebas/H16/h%2016.4%20.Dada%20una%20cuenta%20creada,%20cuando%20se%20consulte%20en%20la%20base%20de%20datos,%20entonces%20debe%20existir%20el%20registro%20de%20la%20aceptaci%C3%B3n%20con%20su%20fecha..png)

*Figura D.28 — HU-16.4: Dada una solicitud de supresión, cuando el usuario la presente, entonces debe existir un canal documentado para atenderla.*

### HU-17 · Gestión de categorías culturales

**Prioridad:** debe · **Requisitos:** RF-07, RF-14 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el panel de administración, cuando cree una categoría, entonces debe quedar disponible de inmediato en los formularios de publicación. | CP-17.1 | `produccion` | pasa |
| 2 | Dada una categoría con publicaciones asociadas, cuando intente eliminarla, entonces el sistema debe advertirlo e impedir la pérdida de la clasificación. | CP-17.2 | `reglas` | pasa |
| 3 | Dado el listado de categorías, cuando se consulte, entonces debe mostrar el número de publicaciones asociadas a cada una. | CP-17.3 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-17.1** — docs/16 §5: una categoría nueva queda disponible sin volver a desplegar
- **CP-17.2** — pruebas/reglas: «categorías · el catálogo no se borra (HU-17)»
- **CP-17.3** — docs/16 §3 y §5: el listado enseña el recuento, contado en el servidor

![Captura del criterio 1 de HU-17](caso%20de%20pruebas/H17/h%2017.1%20Dado%20el%20panel%20de%20administraci%C3%B3n,%20cuando%20cree%20una%20categor%C3%ADa,%20entonces%20debe%20quedar%20disponible%20de%20inmediato%20en%20los%20formularios%20de%20publicaci%C3%B3n..png)

*Figura D.29 — HU-17.1: Dado el panel de administración, cuando cree una categoría, entonces debe quedar disponible de inmediato en los formularios de publicación.*

![Captura del criterio 2 de HU-17](caso%20de%20pruebas/H17/h%2017%20.2%20Dada%20una%20categor%C3%ADa%20con%20publicaciones%20asociadas,%20cuando%20intente%20eliminarla,%20entonces%20el%20sistema%20debe%20advertirlo%20e%20impedir%20la%20p%C3%A9rdida%20de%20la%20clasificaci%C3%B3n..png)

*Figura D.30 — HU-17.2: Dada una categoría con publicaciones asociadas, cuando intente eliminarla, entonces el sistema debe advertirlo e impedir la pérdida de la clasificación.*

![Captura del criterio 3 de HU-17](caso%20de%20pruebas/H17/h17.%203Dado%20el%20listado%20de%20categor%C3%ADas,%20cuando%20se%20consulte,%20entonces%20debe%20mostrar%20el%20n%C3%BAmero%20de%20publicaciones%20asociadas%20a%20cada%20una..png)

*Figura D.31 — HU-17.3: Dado el listado de categorías, cuando se consulte, entonces debe mostrar el número de publicaciones asociadas a cada una.*

### HU-18 · Creación y edición del perfil de actor cultural

**Prioridad:** debe · **Requisitos:** RF-03, RF-06 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario de perfil, cuando complete nombre, manifestación, descripción, categoría y datos de contacto, entonces el perfil debe guardarse y quedar asociado a mi cuenta. | CP-18.1 | `unidad` | pasa |
| 2 | Dado mi perfil guardado, cuando lo edite, entonces los cambios deben reflejarse en la vista pública sin requerir una nueva aprobación de la cuenta. | CP-18.2 | `produccion` | pasa |
| 3 | Dado el campo de descripción, cuando supere el límite establecido, entonces debe advertirse antes del envío. | CP-18.3 | `unidad` | pasa |
| 4 | Dado el perfil de otro actor, cuando intente editarlo, entonces la operación debe ser rechazada. | CP-18.4 | `reglas` | pasa |
| 5 | Dado un perfil guardado, cuando un visitante sin cuenta abra `/actores`, entonces el perfil debe figurar en el directorio público y poder abrirse en su propia dirección `/actores/:id`. | CP-18.5 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-18.1** — pruebas/unidad: «perfil de actor · formulario completo (HU-18, primer criterio)»
- **CP-18.2** — docs/17 §5: editar no devuelve el perfil a la cola, comprobado en el sitio publicado
- **CP-18.3** — pruebas/unidad: «perfil de actor · límite de la descripción (HU-18, tercer criterio)»
- **CP-18.4** — pruebas/reglas: «perfil de actor cultural (HU-18)»
- **CP-18.5** — docs/17 §7: el perfil aprobado figura en /actores y se abre

![Captura del criterio 1 de HU-18](caso%20de%20pruebas/H18/h18.1%20Dado%20el%20formulario%20de%20perfil,%20cuando%20complete%20nombre,%20manifestaci%C3%B3n...png)

*Figura D.32 — HU-18.1: Dado el formulario de perfil, cuando complete nombre, manifestación, descripción, categoría y datos de contacto, entonces el perfil debe guardarse y quedar asociado a mi cuenta.*

![Captura del criterio 2 de HU-18](caso%20de%20pruebas/H18/h%2018.2%20Dado%20mi%20perfil%20guardado,%20cuando%20lo%20edite,%20entonces%20los%20cambios%20deben%20reflejarse%20en%20la%20vista%20p%C3%BAblica%20sin%20requerir%20una%20nueva%20aprobaci%C3%B3n%20de%20la%20cuenta..png)

*Figura D.33 — HU-18.2: Dado mi perfil guardado, cuando lo edite, entonces los cambios deben reflejarse en la vista pública sin requerir una nueva aprobación de la cuenta.*

![Captura del criterio 3 de HU-18](caso%20de%20pruebas/H18/18.3%20Dado%20el%20campo%20de%20descripci%C3%B3n,%20cuando%20supere%20el%20l%C3%ADmite%20establecido,%20entonces%20debe%20advertirse%20antes%20del%20env%C3%ADo.png)

*Figura D.34 — HU-18.3: Dado el campo de descripción, cuando supere el límite establecido, entonces debe advertirse antes del envío.*

![Captura del criterio 5 de HU-18](caso%20de%20pruebas/H18/h18.5%20Dado%20un%20perfil%20guardado,%20cuando%20el%20visitante%20abra%20actores...png)

*Figura D.35 — HU-18.5: Dado un perfil guardado, cuando un visitante sin cuenta abra `/actores`, entonces el perfil debe figurar en el directorio público y poder abrirse en su propia dirección `/actores/:id`.*

> **Criterios de esta historia sin captura:** 4. El caso consta en la
> matriz y el resultado está anotado; lo que falta es la fotografía.

### HU-19 · Carga de imagen en el perfil

**Prioridad:** deberia · **Requisitos:** RF-03 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario, cuando cargue una imagen en formato JPG o PNG de hasta dos megabytes, entonces debe almacenarse y mostrarse en el perfil. | CP-19.1 | `unidad` | pasa |
| 2 | Dado un archivo de formato o tamaño no permitido, cuando se intente cargar, entonces debe rechazarse con un mensaje explicativo. | CP-19.2 | `unidad` | pasa |
| 3 | Dado un perfil sin imagen, cuando se consulte, entonces debe mostrarse una imagen predeterminada. | CP-19.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-19.1** — pruebas/unidad: «archivo elegido · formato y peso (HU-19, primer y segundo criterio)»
- **CP-19.2** — pruebas/unidad: «archivo elegido · formato y peso (HU-19, primer y segundo criterio)»
- **CP-19.3** — docs/18 §6: sin imagen se dibuja la predeterminada, que es código y no un archivo

![Captura del criterio 1 de HU-19](caso%20de%20pruebas/H19/h19.1%20Dado%20el%20formulario,%20cuando%20cargue%20una%20imagen%20en%20formato%20JPG%20o%20PNG%20de%20hasta%20dos%20megabytes,%20entonces%20debe%20almacenarse%20y%20mostrarse%20en%20el%20perfil.png)

*Figura D.36 — HU-19.1: Dado el formulario, cuando cargue una imagen en formato JPG o PNG de hasta dos megabytes, entonces debe almacenarse y mostrarse en el perfil.*

![Captura del criterio 2 de HU-19](caso%20de%20pruebas/H19/h19.2%20Dado%20un%20archivo%20de%20formato%20o%20tama%C3%B1o%20no%20permitido%20cuando%20se%20intente%20cargar%20entonces%20debe%20rechazarse%20con%20un%20mensaje%20explicativo..png)

*Figura D.37 — HU-19.2: Dado un archivo de formato o tamaño no permitido, cuando se intente cargar, entonces debe rechazarse con un mensaje explicativo.*

![Captura del criterio 3 de HU-19](caso%20de%20pruebas/H19/h19%20.3%20Dado%20un%20perfil%20sin%20imagen,%20cuando%20se%20consulte,%20entonces%20debe%20mostrarse%20una%20imagen%20predeterminada..png)

*Figura D.38 — HU-19.3: Dado un perfil sin imagen, cuando se consulte, entonces debe mostrarse una imagen predeterminada.*

### HU-20 · Perfil y directorio de hubs de innovación

**Prioridad:** debe · **Requisitos:** RF-04, RF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario del hub, cuando complete nombre, descripción, líneas de trabajo, dirección y contacto, entonces el perfil debe guardarse. | CP-20.1 | `unidad` | pasa |
| 2 | Dado el directorio público, cuando se consulte, entonces deben listarse todos los hubs aprobados con su información básica. | CP-20.2 | `produccion` | pasa |
| 3 | Dado un hub con dirección registrada, cuando se guarde, entonces deben almacenarse sus coordenadas para su representación en el mapa. | CP-20.3 | `unidad` | pasa |

**Evidencia registrada:**

- **CP-20.1** — pruebas/unidad: «hub de innovación · formulario completo (HU-20, primer criterio)»
- **CP-20.2** — docs/19 §7: el directorio lista los hubs aprobados
- **CP-20.3** — pruebas/unidad: «hub · el punto en el mapa (HU-20, tercer criterio)»

![Captura del criterio 1 de HU-20](caso%20de%20pruebas/H20/h20.1%20Dado%20el%20formulario%20del%20hub,%20cuando%20complete%20nombre,%20descripci%C3%B3n,%20l%C3%ADneas%20de%20trabajo,%20direcci%C3%B3n%20y%20contacto,%20entonces%20el%20perfil%20debe%20guardarse.png)

*Figura D.39 — HU-20.1: Dado el formulario del hub, cuando complete nombre, descripción, líneas de trabajo, dirección y contacto, entonces el perfil debe guardarse.*

![Captura del criterio 2 de HU-20](caso%20de%20pruebas/H20/h20.2%20Dado%20el%20directorio%20p%C3%BAblico,%20cuando%20se%20consulte,%20entonces%20deben%20listarse%20todos%20los%20hubs%20aprobados%20con%20su%20informaci%C3%B3n%20b%C3%A1sica..png)

*Figura D.40 — HU-20.2: Dado el directorio público, cuando se consulte, entonces deben listarse todos los hubs aprobados con su información básica.*

![Captura del criterio 3 de HU-20](caso%20de%20pruebas/H20/h%2020.3%20Dado%20un%20hub%20con%20direcci%C3%B3n%20registrada,%20cuando%20se%20guarde,%20entonces%20deben%20almacenarse%20sus%20coordenadas%20para%20su%20representaci%C3%B3n%20en%20el%20mapa..png)

*Figura D.41 — HU-20.3: Dado un hub con dirección registrada, cuando se guarde, entonces deben almacenarse sus coordenadas para su representación en el mapa.*

### HU-21 · Publicación de un evento o experiencia cultural

**Prioridad:** debe · **Requisitos:** RF-05, RF-07 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario de publicación, cuando complete título, descripción, categoría, fecha, lugar e imagen, entonces la publicación debe guardarse con estado «pendiente de aprobación». | CP-21.1 | `unidad` | pasa |
| 2 | Dado el formulario, cuando la fecha de inicio sea posterior a la de finalización, entonces el envío debe bloquearse con un mensaje explicativo. | CP-21.2 | `unidad` | pasa |
| 3 | Dada una publicación guardada, cuando se consulte el catálogo público, entonces no debe aparecer hasta ser aprobada. | CP-21.3 | `reglas` | pasa |
| 4 | Dada una publicación creada, cuando se revise en la base de datos, entonces debe conservar el identificador del actor que la creó y la fecha de creación. | CP-21.4 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-21.1** — pruebas/unidad: «publicación · el formulario completo (HU-21, primer criterio)»
- **CP-21.2** — pruebas/unidad: «publicación · las dos fechas (HU-21, segundo criterio)»
- **CP-21.3** — pruebas/reglas: «eventos · lectura pública» y «publicación de un evento (HU-21)»
- **CP-21.4** — pruebas/reglas: «publicación de un evento (HU-21)»: idActor y fechaCreacion del servidor

![Captura del criterio 1 de HU-21](caso%20de%20pruebas/H21/h21.1%20Dado%20el%20formulario%20de%20publicaci%C3%B3n,%20cuando%20complete%20los%20campos...png)

*Figura D.42 — HU-21.1: Dado el formulario de publicación, cuando complete título, descripción, categoría, fecha, lugar e imagen, entonces la publicación debe guardarse con estado «pendiente de aprobación».*

![Captura del criterio 2 de HU-21](caso%20de%20pruebas/H21/H21.2%20Dado%20el%20formulario,%20cuando%20la%20fecha%20de%20inicio%20sea%20posterior%20a%20la%20de%20finalizaci%C3%B3n,%20entonces%20el%20env%C3%ADo%20debe%20bloquearse%20con%20un%20mensaje%20explicativo..png)

*Figura D.43 — HU-21.2: Dado el formulario, cuando la fecha de inicio sea posterior a la de finalización, entonces el envío debe bloquearse con un mensaje explicativo.*

![Captura del criterio 3 de HU-21](caso%20de%20pruebas/H21/h%2021.3%20Dada%20una%20publicaci%C3%B3n%20guardada,%20cuando%20se%20consulte%20el%20cat%C3%A1logo%20p%C3%BAblico,%20entonces%20no%20debe%20aparecer%20hasta%20ser%20aprobada..png)

*Figura D.44 — HU-21.3: Dada una publicación guardada, cuando se consulte el catálogo público, entonces no debe aparecer hasta ser aprobada.*

> **Criterios de esta historia sin captura:** 4. El caso consta en la
> matriz y el resultado está anotado; lo que falta es la fotografía.

### HU-22 · Georreferenciación de la publicación

**Prioridad:** debe · **Requisitos:** RF-08 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el formulario de publicación, cuando seleccione un punto en el mapa, entonces deben capturarse y guardarse su latitud y longitud. | CP-22.1 | `reglas` | pasa |
| 2 | Dada una publicación sin coordenadas, cuando se intente guardar, entonces debe advertirse que no aparecerá en el mapa. | CP-22.2 | `navegador` | pasa |
| 3 | Dadas unas coordenadas guardadas, cuando se edite la publicación, entonces debe poder modificarse el punto seleccionado. | CP-22.3 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-22.1** — pruebas/reglas: «el punto de una publicación (HU-22)»
- **CP-22.2** — docs/21 §4: el primer envío no guarda, enseña el aviso y pide una segunda pulsación
- **CP-22.3** — pruebas/reglas: «el punto de una publicación (HU-22)» y docs/21 §6

![Captura del criterio 1 de HU-22](caso%20de%20pruebas/H22/h%2022.1%20Dado%20el%20formulario%20de%20publicaci%C3%B3n,%20cuando%20seleccione%20un%20punto%20en%20el%20mapa,%20entonces%20deben%20capturarse%20y%20guardarse%20su%20latitud%20y%20longitud..png)

*Figura D.45 — HU-22.1: Dado el formulario de publicación, cuando seleccione un punto en el mapa, entonces deben capturarse y guardarse su latitud y longitud.*

![Captura del criterio 2 de HU-22](caso%20de%20pruebas/H22/h22.2%20Dada%20una%20publicaci%C3%B3n%20sin%20coordenadas,%20cuando%20se%20intente%20guardar,%20entonces%20debe%20advertirse%20que%20no%20aparecer%C3%A1%20en%20el%20mapa.png)

*Figura D.46 — HU-22.2: Dada una publicación sin coordenadas, cuando se intente guardar, entonces debe advertirse que no aparecerá en el mapa.*

![Captura del criterio 3 de HU-22](caso%20de%20pruebas/H22/h%2022.3%20Dadas%20unas%20coordenadas%20guardadas,%20cuando%20se%20edite%20la%20publicaci%C3%B3n,%20entonces%20debe%20poder%20modificarse%20el%20punto%20seleccionado..png)

*Figura D.47 — HU-22.3: Dadas unas coordenadas guardadas, cuando se edite la publicación, entonces debe poder modificarse el punto seleccionado.*

### HU-23 · Edición y eliminación de publicaciones propias

**Prioridad:** debe · **Requisitos:** RF-06 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada una publicación propia, cuando la edite, entonces los cambios deben guardarse y la publicación debe volver a estado «pendiente de aprobación». | CP-23.1 | `reglas` | pasa |
| 2 | Dada una publicación propia, cuando la elimine, entonces debe solicitarse confirmación antes de proceder. | CP-23.2 | `navegador` | pasa |
| 3 | Dada una publicación de otro actor, cuando intente editarla o eliminarla, entonces la operación debe ser rechazada tanto por la interfaz como por las reglas de seguridad. | CP-23.3 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-23.1** — pruebas/reglas: «editar y eliminar una publicación (HU-23)»: vuelve a pendiente
- **CP-23.2** — docs/22 §3: la confirmación vive en la tarjeta; revisada en docs/31 §4.1
- **CP-23.3** — pruebas/reglas: «editar y eliminar una publicación (HU-23)»

![Captura del criterio 1 de HU-23](caso%20de%20pruebas/H23/h%2023.1%20Dada%20una%20publicaci%C3%B3n%20propia,%20cuando%20la%20edite,%20entonces%20los%20cambios%20deben%20guardarse%20y%20la%20publicaci%C3%B3n%20debe%20volver%20a%20estado%20%C2%ABpendiente%20de%20aprobaci%C3%B3n.png)

*Figura D.48 — HU-23.1: Dada una publicación propia, cuando la edite, entonces los cambios deben guardarse y la publicación debe volver a estado «pendiente de aprobación».*

![Captura del criterio 2 de HU-23](caso%20de%20pruebas/H23/h%2023.2%20Dada%20una%20publicaci%C3%B3n%20propia,%20cuando%20la%20elimine,%20entonces%20debe%20solicitarse%20confirmaci%C3%B3n%20antes%20de%20proceder..png)

*Figura D.49 — HU-23.2: Dada una publicación propia, cuando la elimine, entonces debe solicitarse confirmación antes de proceder.*

![Captura del criterio 3 de HU-23](caso%20de%20pruebas/H23/h23.3%20Dada%20una%20publicaci%C3%B3n%20de%20otro%20actor,%20cuando%20intente%20editarla...png)

*Figura D.50 — HU-23.3: Dada una publicación de otro actor, cuando intente editarla o eliminarla, entonces la operación debe ser rechazada tanto por la interfaz como por las reglas de seguridad.*

### HU-24 · Moderación de publicaciones

**Prioridad:** debe · **Requisitos:** RF-13 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el panel de moderación, cuando se cargue, entonces deben listarse todas las publicaciones pendientes ordenadas por fecha de creación. | CP-24.1 | `produccion` | pasa |
| 2 | Dada una publicación pendiente, cuando la apruebe, entonces debe pasar a estado «aprobada» y hacerse visible en el catálogo y en el mapa. | CP-24.2 | `reglas` | pasa |
| 3 | Dada una publicación pendiente, cuando la devuelva, entonces debe exigirse una observación escrita y notificarse al actor cultural. | CP-24.3 | `unidad` | pasa |
| 4 | Dada cualquier decisión de moderación, cuando se registre, entonces debe quedar constancia del administrador, la decisión, la observación y la fecha. | CP-24.4 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-24.1** — docs/23 §6: la cola lista las pendientes por antigüedad
- **CP-24.2** — pruebas/reglas: «moderación de publicaciones (HU-24)»
- **CP-24.3** — pruebas/unidad: «moderación · la observación al devolver (HU-24)» y docs/23 §3
- **CP-24.4** — pruebas/reglas: «moderación de publicaciones (HU-24)»: la constancia en el mismo lote

![Captura del criterio 1 de HU-24](caso%20de%20pruebas/H24/h24.1%20Dado%20el%20panel%20de%20moderaci%C3%B3n,%20cuando%20se%20cargue,%20entonces%20deben%20listarse%20todas%20las%20publicaciones%20pendientes%20ordenadas%20por%20fecha%20de%20creaci%C3%B3n..png)

*Figura D.51 — HU-24.1: Dado el panel de moderación, cuando se cargue, entonces deben listarse todas las publicaciones pendientes ordenadas por fecha de creación.*

![Captura del criterio 2 de HU-24](caso%20de%20pruebas/H24/h%2024.2%20Dada%20una%20publicaci%C3%B3n%20pendiente,%20cuando%20la%20apruebe,%20entonces%20debe%20pasar%20a%20estado%20%C2%ABaprobada%C2%BB%20y%20hacerse%20visible%20en%20el%20cat%C3%A1logo%20y%20en%20el%20mapa..png)

*Figura D.52 — HU-24.2: Dada una publicación pendiente, cuando la apruebe, entonces debe pasar a estado «aprobada» y hacerse visible en el catálogo y en el mapa.*

![Captura del criterio 3 de HU-24](caso%20de%20pruebas/H24/h%2024.3%20Dada%20una%20publicaci%C3%B3n%20pendiente,%20cuando%20la%20devuelva,%20entonces%20debe%20exigirse%20una%20observaci%C3%B3n%20escrita%20y%20notificarse%20al%20actor%20cultural..png)

*Figura D.53 — HU-24.3: Dada una publicación pendiente, cuando la devuelva, entonces debe exigirse una observación escrita y notificarse al actor cultural.*

![Captura del criterio 4 de HU-24](caso%20de%20pruebas/H24/h24.4%20Dada%20cualquier%20decisi%C3%B3n%20de%20moderaci%C3%B3n,%20cuando%20se%20registre,%20entonces%20debe%20quedar%20constancia%20del%20administrador,%20la%20decisi%C3%B3n,%20la%20observaci%C3%B3n%20y%20la%20fecha..png)

*Figura D.54 — HU-24.4: Dada cualquier decisión de moderación, cuando se registre, entonces debe quedar constancia del administrador, la decisión, la observación y la fecha.*

### HU-25 · Exploración del catálogo público

**Prioridad:** debe · **Requisitos:** RF-09 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el catálogo, cuando se cargue, entonces deben listarse únicamente las publicaciones aprobadas. | CP-25.1 | `reglas` | pasa |
| 2 | Dado el listado, cuando se presente cada elemento, entonces debe mostrar imagen, título, categoría, fecha y lugar. | CP-25.2 | `navegador` | pasa |
| 3 | Dado un catálogo con más de doce elementos, cuando se recorra, entonces debe existir paginación o carga progresiva. | CP-25.3 | `unidad` | pasa |
| 4 | Dado un catálogo vacío tras aplicar criterios, cuando se muestre, entonces debe presentarse un mensaje orientador y no una pantalla en blanco. | CP-25.4 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-25.1** — pruebas/reglas: «el catálogo público (HU-25)»
- **CP-25.2** — docs/24 §6: cada tarjeta con imagen, título, categoría, fecha y lugar
- **CP-25.3** — pruebas/unidad: «el tamaño de página», «partirPagina» y «anadirPagina»
- **CP-25.4** — docs/24 §6 y docs/32: mensaje orientador, comprobado a 360 y 1280 px

![Captura del criterio 1 de HU-25](caso%20de%20pruebas/H25/h%2025.1%20Dado%20el%20cat%C3%A1logo,%20cuando%20se%20cargue,%20entonces%20deben%20listarse%20%C3%BAnicamente%20las%20publicaciones%20aprobadas..png)

*Figura D.55 — HU-25.1: Dado el catálogo, cuando se cargue, entonces deben listarse únicamente las publicaciones aprobadas.*

![Captura del criterio 2 de HU-25](caso%20de%20pruebas/H25/h%2025.2%20Dado%20el%20listado,%20cuando%20se%20presente%20cada%20elemento,%20entonces%20debe%20mostrar%20imagen,%20t%C3%ADtulo,%20categor%C3%ADa,%20fecha%20y%20lugar.%20.png)

*Figura D.56 — HU-25.2: Dado el listado, cuando se presente cada elemento, entonces debe mostrar imagen, título, categoría, fecha y lugar.*

![Captura del criterio 3 de HU-25](caso%20de%20pruebas/H25/h%2025.3%20Dado%20un%20cat%C3%A1logo%20con%20m%C3%A1s%20de%20doce%20elementos,%20cuando%20se%20recorra,%20entonces%20debe%20existir%20paginaci%C3%B3n%20o%20carga%20progresiva.png)

*Figura D.57 — HU-25.3: Dado un catálogo con más de doce elementos, cuando se recorra, entonces debe existir paginación o carga progresiva.*

![Captura del criterio 4 de HU-25](caso%20de%20pruebas/H25/h25.4%20Dado%20un%20cat%C3%A1logo%20vac%C3%ADo%20tras%20aplicar%20criterios,%20cuando%20se%20muestre,%20entonces%20debe%20presentarse%20un%20mensaje%20orientador%20y%20no%20una%20pantalla%20en%20blanco..png)

*Figura D.58 — HU-25.4: Dado un catálogo vacío tras aplicar criterios, cuando se muestre, entonces debe presentarse un mensaje orientador y no una pantalla en blanco.*

### HU-26 · Filtrado por categoría cultural y por fecha

**Prioridad:** debe · **Requisitos:** RF-10 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el catálogo, cuando aplique un filtro de categoría, entonces deben mostrarse únicamente las publicaciones de esa categoría. | CP-26.1 | `reglas` | pasa |
| 2 | Dado el catálogo, cuando aplique un rango de fechas, entonces deben mostrarse solo las publicaciones vigentes en ese rango. | CP-26.2 | `unidad` | pasa |
| 3 | Dados dos filtros aplicados simultáneamente, cuando se combinen, entonces el resultado debe satisfacer ambas condiciones. | CP-26.3 | `reglas` | pasa |
| 4 | Dados filtros aplicados, cuando los limpie, entonces debe restituirse el catálogo completo. | CP-26.4 | `unidad` | pasa |

**Evidencia registrada:**

- **CP-26.1** — pruebas/reglas: «los filtros del catálogo (HU-26)»
- **CP-26.2** — pruebas/unidad: «el rango de días (HU-26)» y «limitesDeConsulta»
- **CP-26.3** — pruebas/reglas: «los filtros del catálogo (HU-26)»: categoría y fechas a la vez
- **CP-26.4** — pruebas/unidad: «hayFiltros»; y docs/25 §6

![Captura del criterio 1 de HU-26](caso%20de%20pruebas/H26/h%2026.1%20Dado%20el%20cat%C3%A1logo,%20cuando%20aplique%20un%20filtro%20de%20categor%C3%ADa,%20entonces%20deben%20mostrarse%20%C3%BAnicamente%20las%20publicaciones%20de%20esa%20categor%C3%ADa.png)

*Figura D.59 — HU-26.1: Dado el catálogo, cuando aplique un filtro de categoría, entonces deben mostrarse únicamente las publicaciones de esa categoría.*

![Captura del criterio 2 de HU-26](caso%20de%20pruebas/H26/h%2026.2%20Dado%20el%20cat%C3%A1logo,%20cuando%20aplique%20un%20rango%20de%20fechas,%20entonces%20deben%20mostrarse%20solo%20las%20publicaciones%20vigentes%20en%20ese%20rango.png)

*Figura D.60 — HU-26.2: Dado el catálogo, cuando aplique un rango de fechas, entonces deben mostrarse solo las publicaciones vigentes en ese rango.*

![Captura del criterio 3 de HU-26](caso%20de%20pruebas/H26/h26.3%20Dados%20dos%20filtros%20aplicados%20simult%C3%A1neamente,%20cuando%20se%20combinen,%20entonces%20el%20resultado%20debe%20satisfacer%20ambas%20condiciones.png)

*Figura D.61 — HU-26.3: Dados dos filtros aplicados simultáneamente, cuando se combinen, entonces el resultado debe satisfacer ambas condiciones.*

![Captura del criterio 4 de HU-26](caso%20de%20pruebas/H26/h26.4%20Dados%20filtros%20aplicados,%20cuando%20los%20limpie,%20entonces%20debe%20restituirse%20el%20cat%C3%A1logo%20completo.png)

*Figura D.62 — HU-26.4: Dados filtros aplicados, cuando los limpie, entonces debe restituirse el catálogo completo.*

### HU-27 · Búsqueda por palabra clave

**Prioridad:** deberia · **Requisitos:** RF-10 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el campo de búsqueda, cuando escriba un término, entonces deben mostrarse las publicaciones cuyo título o descripción lo contengan. | CP-27.1 | `unidad` | pasa |
| 2 | Dada una búsqueda sin resultados, cuando se ejecute, entonces debe informarse con un mensaje y sugerirse limpiar los filtros. | CP-27.2 | `navegador` | pasa |
| 3 | Dada una búsqueda, cuando se escriba con o sin tildes y en mayúsculas o minúsculas, entonces el resultado debe ser equivalente. | CP-27.3 | `unidad` | pasa |

**Evidencia registrada:**

- **CP-27.1** — pruebas/unidad: «el primer criterio: título o descripción»
- **CP-27.2** — docs/26 §5: mensaje y sugerencia de limpiar los filtros
- **CP-27.3** — pruebas/unidad: «el tercer criterio: tildes y mayúsculas»

![Captura del criterio 1 de HU-27](caso%20de%20pruebas/H27/27.1%20Dado%20el%20campo%20de%20b%C3%BAsqueda,%20cuando%20escriba%20un%20t%C3%A9rmino,%20entonces%20deben%20mostrarse%20las%20publicaciones%20cuyo%20t%C3%ADtulo%20o%20descripci%C3%B3n%20lo%20contengan.png)

*Figura D.63 — HU-27.1: Dado el campo de búsqueda, cuando escriba un término, entonces deben mostrarse las publicaciones cuyo título o descripción lo contengan.*

![Captura del criterio 2 de HU-27](caso%20de%20pruebas/H27/h%2027.2%20Dada%20una%20b%C3%BAsqueda%20sin%20resultados,%20cuando%20se%20ejecute,%20entonces%20debe%20informarse%20con%20un%20mensaje%20y%20sugerirse%20limpiar%20los%20filtros..png)

*Figura D.64 — HU-27.2: Dada una búsqueda sin resultados, cuando se ejecute, entonces debe informarse con un mensaje y sugerirse limpiar los filtros.*

![Captura del criterio 3 de HU-27](caso%20de%20pruebas/H27/h27.3%20Dada%20una%20b%C3%BAsqueda,%20cuando%20se%20escriba%20con%20o%20sin%20tildes%20y%20en%20may%C3%BAsculas%20o%20min%C3%BAsculas,%20entonces%20el%20resultado%20debe%20ser%20equivalente.png)

*Figura D.65 — HU-27.3: Dada una búsqueda, cuando se escriba con o sin tildes y en mayúsculas o minúsculas, entonces el resultado debe ser equivalente.*

### HU-28 · Consulta del detalle de una publicación

**Prioridad:** debe · **Requisitos:** RF-09, RF-11 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado un elemento del catálogo, cuando lo seleccione, entonces debe abrirse su vista de detalle con descripción, fechas, lugar, categoría, imagen y actor responsable. | CP-28.1 | `navegador` | pasa |
| 2 | Dada la vista de detalle, cuando se cargue, entonces debe incluir un acceso al perfil del actor cultural. | CP-28.2 | `navegador` | pasa |
| 3 | Dada una publicación con coordenadas, cuando se consulte su detalle, entonces debe mostrarse su ubicación en un mapa reducido. | CP-28.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-28.1** — docs/27 §9: la ficha con descripción, fechas, lugar, categoría e imagen
- **CP-28.2** — docs/27 §9: acceso al perfil del actor desde la ficha
- **CP-28.3** — docs/27 §9: mapa reducido cuando la publicación tiene coordenadas

![Captura del criterio 1 de HU-28](caso%20de%20pruebas/H28/h28.1%20Dado%20un%20elemento%20del%20cat%C3%A1logo,%20cuando%20lo%20seleccione...png)

*Figura D.66 — HU-28.1: Dado un elemento del catálogo, cuando lo seleccione, entonces debe abrirse su vista de detalle con descripción, fechas, lugar, categoría, imagen y actor responsable.*

![Captura del criterio 2 de HU-28](caso%20de%20pruebas/H28/h28.2%20Dada%20la%20vista%20de%20detalle,%20cuando%20se%20cargue,%20entonces%20debe%20incluir%20un%20acceso%20al%20perfil%20del%20actor%20cultural.png)

*Figura D.67 — HU-28.2: Dada la vista de detalle, cuando se cargue, entonces debe incluir un acceso al perfil del actor cultural.*

![Captura del criterio 3 de HU-28](caso%20de%20pruebas/H28/h28.3%20Dada%20una%20publicaci%C3%B3n%20con%20coordenadas,%20cuando%20se%20consulte%20su%20detalle,%20entonces%20debe%20mostrarse%20su%20ubicaci%C3%B3n%20en%20un%20mapa%20reducido..png)

*Figura D.68 — HU-28.3: Dada una publicación con coordenadas, cuando se consulte su detalle, entonces debe mostrarse su ubicación en un mapa reducido.*

### HU-29 · Contacto directo con el actor cultural

**Prioridad:** debe · **Requisitos:** RF-12, RF-15 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la vista de detalle, cuando seleccione la opción de contacto, entonces deben mostrarse los canales que el actor cultural haya autorizado. | CP-29.1 | `unidad` | pasa |
| 2 | Dado un canal de contacto, cuando lo seleccione, entonces debe abrirse la aplicación correspondiente con el mensaje inicial prellenado. | CP-29.2 | `unidad` | pasa |
| 3 | Dado un contacto realizado, cuando se produzca, entonces debe registrarse la interacción de forma anonimizada para los indicadores de uso. | CP-29.3 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-29.1** — pruebas/unidad: «enlaces de contacto (RF-12)»
- **CP-29.2** — pruebas/unidad: «los enlaces con mensaje (HU-29)» y «el mensaje inicial (HU-29)»
- **CP-29.3** — pruebas/reglas: «el registro de un contacto (HU-29)»

![Captura del criterio 1 de HU-29](caso%20de%20pruebas/H29/h29.1%20Dada%20la%20vista%20de%20detalle,%20cuando%20seleccione%20la%20opci%C3%B3n%20de%20contacto,%20entonces%20deben%20mostrarse%20los%20canales%20que%20el%20actor%20cultural%20haya%20autorizado.png)

*Figura D.69 — HU-29.1: Dada la vista de detalle, cuando seleccione la opción de contacto, entonces deben mostrarse los canales que el actor cultural haya autorizado.*

![Captura del criterio 2 de HU-29](caso%20de%20pruebas/H29/h29.2%20Dado%20un%20canal%20de%20contacto,%20cuando%20lo%20seleccione,%20entonces%20debe%20abrirse%20la%20aplicaci%C3%B3n%20correspondiente%20con%20el%20mensaje%20inicial%20prellenado.png)

*Figura D.70 — HU-29.2: Dado un canal de contacto, cuando lo seleccione, entonces debe abrirse la aplicación correspondiente con el mensaje inicial prellenado.*

![Captura del criterio 3 de HU-29](caso%20de%20pruebas/H29/h%2029.3%20Dado%20un%20contacto%20realizado,%20cuando%20se%20produzca,%20entonces%20debe%20registrarse%20la%20interacci%C3%B3n%20de%20forma%20anonimizada%20para%20los%20indicadores%20de%20uso.png)

*Figura D.71 — HU-29.3: Dado un contacto realizado, cuando se produzca, entonces debe registrarse la interacción de forma anonimizada para los indicadores de uso.*

### HU-30 · Mapa interactivo de la oferta cultural

**Prioridad:** debe · **Requisitos:** RF-11, RF-10 · **Objetivo específico:** 2

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el mapa, cuando se cargue, entonces debe mostrar un marcador por cada publicación aprobada con coordenadas registradas. | CP-30.1 | `navegador` | pasa |
| 2 | Dado un marcador, cuando lo seleccione, entonces debe desplegarse una ficha con el título, la categoría y el acceso al detalle. | CP-30.2 | `navegador` | pasa |
| 3 | Dado el mapa, cuando aplique un filtro de categoría, entonces deben mostrarse únicamente los marcadores correspondientes. | CP-30.3 | `navegador` | pasa |
| 4 | Dado el mapa, cuando se abra en un teléfono, entonces debe permitir desplazamiento y acercamiento táctil sin bloquear el desplazamiento de la página. | CP-30.4 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-30.1** — docs/29 §9: un marcador por publicación aprobada con coordenadas
- **CP-30.2** — docs/29 §9: la ficha del marcador con título, categoría y acceso al detalle
- **CP-30.3** — docs/29 §9: el filtro de categoría deja solo esos marcadores
- **CP-30.4** — docs/29 §9: un dedo desplaza la página y dos mueven el mapa, medido

![Captura del criterio 1 de HU-30](caso%20de%20pruebas/H30/H%2030.1%20Dado%20el%20mapa,%20cuando%20se%20cargue,%20entonces%20debe%20mostrar%20un%20marcador%20por%20cada%20publicaci%C3%B3n%20aprobada%20con%20coordenadas%20registradas.png)

*Figura D.72 — HU-30.1: Dado el mapa, cuando se cargue, entonces debe mostrar un marcador por cada publicación aprobada con coordenadas registradas.*

![Captura del criterio 2 de HU-30](caso%20de%20pruebas/H30/H30.2%20Dado%20un%20marcador,%20cuando%20lo%20seleccione,%20entonces%20debe%20desplegarse%20una%20ficha%20con%20el%20t%C3%ADtulo,%20la%20categor%C3%ADa%20y%20el%20acceso%20al%20detalle..png)

*Figura D.73 — HU-30.2: Dado un marcador, cuando lo seleccione, entonces debe desplegarse una ficha con el título, la categoría y el acceso al detalle.*

![Captura del criterio 3 de HU-30](caso%20de%20pruebas/H30/H%2030.3%20Dado%20el%20mapa,%20cuando%20aplique%20un%20filtro%20de%20categor%C3%ADa,%20entonces%20deben%20mostrarse%20%C3%BAnicamente%20los%20marcadores%20correspondientes.png)

*Figura D.74 — HU-30.3: Dado el mapa, cuando aplique un filtro de categoría, entonces deben mostrarse únicamente los marcadores correspondientes.*

![Captura del criterio 4 de HU-30](caso%20de%20pruebas/H30/H%2030.%204%20Dado%20el%20mapa,%20cuando%20se%20abra%20en%20un%20tel%C3%A9fono,%20entonces%20debe%20permitir%20desplazamiento%20y%20acercamiento%20t%C3%A1ctil%20sin%20bloquear%20el%20desplazamiento%20de%20la%20p%C3%A1gina..jpeg)

*Figura D.75 — HU-30.4: Dado el mapa, cuando se abra en un teléfono, entonces debe permitir desplazamiento y acercamiento táctil sin bloquear el desplazamiento de la página.*

### HU-31 · Validación de formularios y manejo de errores

**Prioridad:** debe · **Requisitos:** RNF-01 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado cualquier formulario, cuando un campo obligatorio esté vacío, entonces debe señalarse el campo específico y no mostrarse un error genérico. | CP-31.1 | `navegador` | pasa |
| 2 | Dado un formulario con error, cuando se muestre el mensaje, entonces la información ya ingresada debe conservarse. | CP-31.2 | `navegador` | pasa |
| 3 | Dado un fallo de conexión con el servicio de datos, cuando ocurra, entonces debe mostrarse un mensaje comprensible y no un error técnico. | CP-31.3 | `unidad` | pasa |
| 4 | Dado un envío en curso, cuando se procese, entonces el botón debe deshabilitarse para evitar envíos duplicados. | CP-31.4 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-31.1** — docs/30 §6: foco y desplazamiento al primer campo señalado, medido
- **CP-31.2** — docs/30 §6: correo, contraseña y casilla intactos tras el rechazo
- **CP-31.3** — pruebas/unidad: «mensajeDe» y «exigirRespuesta»; y docs/30 §4.2 en el navegador
- **CP-31.4** — docs/30 §5: los seis formularios deshabilitan su botón al enviar

![Captura del criterio 1 de HU-31](caso%20de%20pruebas/H31/h31.1%20Dado%20cualquier%20formulario,%20cuando%20un%20campo%20obligatorio%20est%C3%A9%20vac%C3%ADo,%20entonces%20debe%20se%C3%B1alarse%20el%20campo%20espec%C3%ADfico%20y%20no%20mostrarse%20un%20error%20gen%C3%A9rico..png)

*Figura D.76 — HU-31.1: Dado cualquier formulario, cuando un campo obligatorio esté vacío, entonces debe señalarse el campo específico y no mostrarse un error genérico.*

![Captura del criterio 2 de HU-31](caso%20de%20pruebas/H31/h31%20.2%20%20Dado%20un%20formulario%20con%20error,%20cuando%20se%20muestre%20el%20mensaje,%20entonces%20la%20informaci%C3%B3n%20ya%20ingresada%20debe%20conservarse..png)

*Figura D.77 — HU-31.2: Dado un formulario con error, cuando se muestre el mensaje, entonces la información ya ingresada debe conservarse.*

![Captura del criterio 3 de HU-31](caso%20de%20pruebas/H31/h31.3%20Dado%20un%20fallo%20de%20conexi%C3%B3n%20con%20el%20servicio%20de%20datos,%20cuando%20ocurra,%20entonces%20debe%20mostrarse%20un%20mensaje%20comprensible%20y%20no%20un%20error%20t%C3%A9cnico..png)

*Figura D.78 — HU-31.3: Dado un fallo de conexión con el servicio de datos, cuando ocurra, entonces debe mostrarse un mensaje comprensible y no un error técnico.*

![Captura del criterio 3 de HU-31](caso%20de%20pruebas/H31/h31.3.1%20Dado%20un%20fallo%20de%20conexi%C3%B3n%20con%20el%20servicio%20de%20datos,%20cuando%20ocurra,%20entonces%20debe%20mostrarse%20un%20mensaje%20comprensible%20y%20no%20un%20error%20t%C3%A9cnico..png)

*Figura D.79 — HU-31.3 (2ª captura): Dado un fallo de conexión con el servicio de datos, cuando ocurra, entonces debe mostrarse un mensaje comprensible y no un error técnico.*

![Captura del criterio 4 de HU-31](caso%20de%20pruebas/H31/h31.4%20Dado%20un%20env%C3%ADo%20en%20curso,%20cuando%20se%20procese,%20entonces%20el%20bot%C3%B3n%20debe%20deshabilitarse%20para%20evitar%20env%C3%ADos%20duplicados.png)

*Figura D.80 — HU-31.4: Dado un envío en curso, cuando se procese, entonces el botón debe deshabilitarse para evitar envíos duplicados.*

![Captura del criterio 4 de HU-31](caso%20de%20pruebas/H31/h31.4.1%20%20Dado%20un%20env%C3%ADo%20en%20curso,%20cuando%20se%20procese,%20entonces%20el%20bot%C3%B3n%20debe%20deshabilitarse%20para%20evitar%20env%C3%ADos%20duplicados.png)

*Figura D.81 — HU-31.4 (2ª captura): Dado un envío en curso, cuando se procese, entonces el botón debe deshabilitarse para evitar envíos duplicados.*

### HU-32 · Accesibilidad conforme a las pautas WCAG 2.1

**Prioridad:** deberia · **Requisitos:** RNF-07 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada cualquier imagen de contenido, cuando se inspeccione, entonces debe contar con texto alternativo descriptivo. | CP-32.1 | `estructura` | pasa |
| 2 | Dada la navegación, cuando se recorra únicamente con teclado, entonces debe poderse completar el registro, la publicación y la consulta del catálogo. | CP-32.2 | `navegador` | pasa |
| 3 | Dado cualquier texto sobre su fondo, cuando se mida, entonces la relación de contraste no debe ser inferior a 4,5 a 1. | CP-32.3 | `herramienta` | pasa |
| 4 | Dado un elemento con foco, cuando se navegue con teclado, entonces el foco debe ser visualmente identificable. | CP-32.4 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-32.1** — npm run verificar, regla 4: toda img con alt y todo svg oculto o nombrado
- **CP-32.2** — docs/31 §6: catálogo (26 controles) y mapa (27), ninguno sin nombre accesible
- **CP-32.3** — python herramientas/medir-contraste.py: los 13 pares de texto sobre 4,5 : 1
- **CP-32.4** — docs/31 §2: el anillo blanco sobre la barra azul da 11,55 : 1, medido en la página

![Captura del criterio 1 de HU-32](caso%20de%20pruebas/H32/h32.1%20Dada%20cualquier%20imagen%20de%20contenido,%20cuando%20se%20inspeccione,%20entonces%20debe%20contar%20con%20texto%20alternativo%20descriptivo.png)

*Figura D.82 — HU-32.1: Dada cualquier imagen de contenido, cuando se inspeccione, entonces debe contar con texto alternativo descriptivo.*

![Captura del criterio 2 de HU-32](caso%20de%20pruebas/H32/h32.2%20Dada%20la%20navegaci%C3%B3n,%20cuando%20se%20recorra%20%C3%BAnicamente%20con%20teclado,%20entonces%20debe%20poderse%20completar%20el%20registro,%20la%20publicaci%C3%B3n%20y%20la%20consulta%20del%20cat%C3%A1logo.png)

*Figura D.83 — HU-32.2: Dada la navegación, cuando se recorra únicamente con teclado, entonces debe poderse completar el registro, la publicación y la consulta del catálogo.*

![Captura del criterio 3 de HU-32](caso%20de%20pruebas/H32/h32.3%20Dado%20cualquier%20texto%20sobre%20su%20fondo,%20cuando%20se%20mida,%20entonces%20la%20relaci%C3%B3n%20de%20contraste%20no%20debe%20ser%20inferior%20a%204,5%20a%201.png)

*Figura D.84 — HU-32.3: Dado cualquier texto sobre su fondo, cuando se mida, entonces la relación de contraste no debe ser inferior a 4,5 a 1.*

![Captura del criterio 4 de HU-32](caso%20de%20pruebas/H32/h%2032.4%20Dado%20un%20elemento%20con%20foco,%20cuando%20se%20navegue%20con%20teclado,%20entonces%20el%20foco%20debe%20ser%20visualmente%20identificable..png)

*Figura D.85 — HU-32.4: Dado un elemento con foco, cuando se navegue con teclado, entonces el foco debe ser visualmente identificable.*

### HU-33 · Optimización final del diseño responsive

**Prioridad:** debe · **Requisitos:** RNF-03 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces ninguna debe presentar desbordamiento horizontal. | CP-33.1 | `navegador` | pasa |
| 2 | Dadas las tablas del panel de administración, cuando se visualicen en móvil, entonces deben adaptarse a un formato legible. | CP-33.2 | `navegador` | pasa |
| 3 | Dado el mapa, cuando se abra en móvil, entonces debe ocupar una altura útil que permita su manipulación. | CP-33.3 | `navegador` | pasa |

**Evidencia registrada:**

- **CP-33.1** — docs/32 §1: las 7 vistas públicas a 360 px, sin desbordamiento
- **CP-33.2** — docs/32 §2: la tabla apilada, de 531 px a 326 en una caja de 326
- **CP-33.3** — docs/32 §3: el lienzo ocupa el 60 % de la ventana; visible al abrir, de 107 a 160 px

![Captura del criterio 1 de HU-33](caso%20de%20pruebas/H33/h%2033.1%20Dadas%20todas%20las%20vistas%20del%20sistema,%20cuando%20se%20recorran%20en%20360%20p%C3%ADxeles%20de%20ancho,%20entonces%20ninguna%20debe%20presentar%20desbordamiento%20horizontal..png)

*Figura D.86 — HU-33.1: Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces ninguna debe presentar desbordamiento horizontal.*

![Captura del criterio 1 de HU-33](caso%20de%20pruebas/H33/h%2033.1.1Dadas%20todas%20las%20vistas%20del%20sistema,%20cuando%20se%20recorran%20en%20360%20p%C3%ADxeles%20de%20ancho,%20entonces%20ninguna%20debe%20presentar%20desbordamiento%20horizontal..png)

*Figura D.87 — HU-33.1 (2ª captura): Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces ninguna debe presentar desbordamiento horizontal.*

![Captura del criterio 1 de HU-33](caso%20de%20pruebas/H33/h%2033.1.2Dadas%20todas%20las%20vistas%20del%20sistema,%20cuando%20se%20recorran%20en%20360%20p%C3%ADxeles%20de%20ancho,%20entonces%20ninguna%20debe%20presentar%20desbordamiento%20horizontal..png)

*Figura D.88 — HU-33.1 (3ª captura): Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces ninguna debe presentar desbordamiento horizontal.*

![Captura del criterio 1 de HU-33](caso%20de%20pruebas/H33/h%2033.1.3Dadas%20todas%20las%20vistas%20del%20sistema,%20cuando%20se%20recorran%20en%20360%20p%C3%ADxeles%20de%20ancho,%20entonces%20ninguna%20debe%20presentar%20desbordamiento%20horizontal..png)

*Figura D.89 — HU-33.1 (4ª captura): Dadas todas las vistas del sistema, cuando se recorran en 360 píxeles de ancho, entonces ninguna debe presentar desbordamiento horizontal.*

![Captura del criterio 2 de HU-33](caso%20de%20pruebas/H33/h%2033.2%20Dadas%20las%20tablas%20del%20panel%20de%20administraci%C3%B3n,%20cuando%20se%20visualicen%20en%20m%C3%B3vil,%20entonces%20deben%20adaptarse%20a%20un%20formato%20legible..png)

*Figura D.90 — HU-33.2: Dadas las tablas del panel de administración, cuando se visualicen en móvil, entonces deben adaptarse a un formato legible.*

![Captura del criterio 3 de HU-33](caso%20de%20pruebas/H33/h%2033.3%20Dado%20el%20mapa,%20cuando%20se%20abra%20en%20m%C3%B3vil,%20entonces%20debe%20ocupar%20una%20altura%20%C3%BAtil%20que%20permita%20su%20manipulaci%C3%B3n..png)

*Figura D.91 — HU-33.3: Dado el mapa, cuando se abra en móvil, entonces debe ocupar una altura útil que permita su manipulación.*

### HU-34 · Indicadores básicos de uso de la plataforma

**Prioridad:** podria · **Requisitos:** RF-15, RNF-06 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el panel de indicadores, cuando se cargue, entonces debe mostrar el total de publicaciones por estado y por categoría. | CP-34.1 | `navegador` | pasa |
| 2 | Dado el panel, cuando se consulte, entonces debe listar las publicaciones con mayor número de consultas. | CP-34.2 | `unidad` | pasa |
| 3 | Dados los registros de interacción, cuando se almacenen, entonces no deben contener datos personales identificables del visitante. | CP-34.3 | `reglas` | pasa |

**Evidencia registrada:**

- **CP-34.1** — docs/33 §6: banco de pruebas del panel a 360 y 1280 px
- **CP-34.2** — pruebas/unidad: «masConsultadas» y «conTitulo»
- **CP-34.3** — pruebas/reglas: «los indicadores de uso (HU-34)»: un campo de más se rechaza

![Captura del criterio 1 de HU-34](caso%20de%20pruebas/H34/h34.1%20Dado%20el%20panel%20de%20indicadores,%20cuando%20se%20cargue,%20entonces%20debe%20mostrar%20el%20total%20de%20publicaciones%20por%20estado%20y%20por%20categor%C3%ADa.png)

*Figura D.92 — HU-34.1: Dado el panel de indicadores, cuando se cargue, entonces debe mostrar el total de publicaciones por estado y por categoría.*

![Captura del criterio 2 de HU-34](caso%20de%20pruebas/H34/h34.2%20Dado%20el%20panel,%20cuando%20se%20consulte,%20entonces%20debe%20listar%20las%20publicaciones%20con%20mayor%20n%C3%BAmero%20de%20consultas..png)

*Figura D.93 — HU-34.2: Dado el panel, cuando se consulte, entonces debe listar las publicaciones con mayor número de consultas.*

![Captura del criterio 3 de HU-34](caso%20de%20pruebas/H34/H34.%203%20Dados%20los%20registros%20de%20interacci%C3%B3n,%20cuando%20se%20almacenen,%20entonces%20no%20deben%20contener%20datos%20personales%20identificables%20del%20visitante..png)

*Figura D.94 — HU-34.3: Dados los registros de interacción, cuando se almacenen, entonces no deben contener datos personales identificables del visitante.*

### HU-35 · Ejecución de las pruebas funcionales y de permisos

**Prioridad:** debe · **Requisitos:** RNF-08 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dado el conjunto de historias, cuando se diseñen los casos de prueba, entonces cada criterio de aceptación debe tener al menos un caso asociado. | CP-35.1 | `herramienta` | pasa |
| 2 | Dada la ejecución de las pruebas, cuando concluya, entonces la cobertura de historias de prioridad «Debe» que superan todos sus casos no debe ser inferior al 90 %. | CP-35.2 | `herramienta` | pasa |
| 3 | Dadas las pruebas de permisos, cuando se ejecuten con cada rol, entonces el 100 % de los accesos no autorizados debe ser rechazado. | CP-35.3 | `herramienta` | pasa |
| 4 | Dado cualquier caso fallido, cuando se registre, entonces debe crearse el hallazgo correspondiente con su severidad. | CP-35.4 | `herramienta` | pasa |

**Evidencia registrada:**

- **CP-35.1** — npm run verificar:casos: los criterios de las historias construidas tienen caso; el guion señala el que falte
- **CP-35.2** — npm run verificar:casos: la cobertura de las «Debe» construidas, con el umbral comprobado por los dos lados
- **CP-35.3** — npm run verificar:casos: los criterios verificados por la suite de reglas, al 100 %
- **CP-35.4** — npm run verificar:casos: el guion falla si un caso sin superar no tiene hallazgo en pruebas/casos/hallazgos.json

*Sin capturas de pantalla: la evidencia de esta historia es de tipo herramienta.*

### HU-36 · Pruebas de usabilidad con usuarios representativos

**Prioridad:** debe · **Requisitos:** RNF-01 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la sesión de prueba, cuando se inicie, entonces debe obtenerse el consentimiento informado del participante. | CP-36.1 | `documental` | pendiente |
| 2 | Dado el conjunto de tareas guiadas, cuando se ejecuten sin asistencia, entonces debe registrarse si se completan, el tiempo empleado y las dificultades observadas. | CP-36.2 | `documental` | pendiente |
| 3 | Dado el cuestionario SUS, cuando se aplique a al menos ocho participantes, entonces el puntaje promedio debe ser igual o superior a 68. | CP-36.3 | `herramienta` | pendiente |
| 4 | Dado un puntaje inferior al umbral, cuando se obtenga, entonces los hallazgos deben incorporarse al backlog y repetirse la medición tras su corrección. | CP-36.4 | `herramienta` | pendiente |

**Evidencia registrada:**

- **CP-36.1** — pruebas/usabilidad/consentimiento.md: el instrumento está escrito; no hay ninguna sesión que lo haya usado
- **CP-36.2** — pruebas/usabilidad/guion.md y sesiones.json: las seis tareas están definidas; «sesiones» está vacío
- **CP-36.3** — node herramientas/calcular-sus.js: 0 participantes de los 8 que pide el criterio
- **CP-36.4** — node herramientas/calcular-sus.js: no hay puntaje que juzgar

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, herramienta.*

### HU-37 · Despliegue de la versión final del prototipo

**Prioridad:** debe · **Requisitos:** RNF-08 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la versión final, cuando se despliegue, entonces debe existir una dirección pública estable y documentada. | CP-37.1 | `produccion` | pasa |
| 2 | Dado el prototipo desplegado, cuando se consulte desde un dispositivo externo, entonces debe cargar sin errores y con datos de demostración cargados. | CP-37.2 | `produccion` | pasa |
| 3 | Dada la versión desplegada, cuando se contraste con el repositorio, entonces debe corresponder a una etiqueta de versión identificada. | CP-37.3 | `produccion` | pasa |

**Evidencia registrada:**

- **CP-37.1** — docs/36 §1: la misma dirección pública desde el Sprint 3, documentada en docs/12, con sus cabeceras verificadas sobre la respuesta real
- **CP-37.2** — docs/36 §5: sobre la v1.0.0 publicada, 12 eventos, 5 perfiles de actor, 13 marcadores en el mapa, cero errores de consola y 375 px sin desbordamiento
- **CP-37.3** — docs/36 §3: lo desplegado contiene v1.0.0 —«git merge-base --is-ancestor» sale con 0— y «git diff v1.0.0..compilación» sobre src, index.html, vite.config.js, package.json y vercel.json no imprime nada

*Sin capturas de pantalla: la evidencia de esta historia es de tipo produccion.*

### HU-39 · Documentación técnica del prototipo

**Prioridad:** debe · **Requisitos:** RNF-09 · **Objetivo específico:** 3

| # | Criterio de aceptación | Caso | Tipo | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Dada la documentación, cuando se elabore, entonces debe incluir el diagrama de arquitectura, la estructura de colecciones y las reglas de seguridad aplicadas. | CP-39.1 | `documental` | pasa |
| 2 | Dada la documentación, cuando se revise, entonces debe describir el procedimiento completo para desplegar el proyecto desde cero. | CP-39.2 | `documental` | pasa |
| 3 | Dado el repositorio, cuando se consulte, entonces debe contener el archivo de documentación actualizado a la versión final. | CP-39.3 | `estructura` | pasa |

**Evidencia registrada:**

- **CP-39.1** — docs/38 §2, §3 y §5: diagrama del sistema en ejecución, las 7 colecciones con sus 10 índices, y lo que permite cada regla colección por colección
- **CP-39.2** — docs/38 §4: ocho pasos de «git clone» a la comprobación sobre el sitio publicado, con el orden índices-antes-que-reglas y la cuenta de administrador
- **CP-39.3** — docs/38 describe la versión 1.0.0, y «npm run verificar» falla si las colecciones con reglas o el número de índices dejan de coincidir con lo documentado en docs/04

*Sin capturas de pantalla: la evidencia de esta historia es de tipo documental, estructura.*

---

## D.3 Registro de hallazgos

Un hallazgo es **algo que se encontró y no se resolvió donde se encontró**. Los que vienen de
un caso de prueba que no pasa llevan su criterio; los que vienen de haber mirado, no.

| Severidad | Qué significa |
| --- | --- |
| crítica | impide usar la plataforma o expone datos. Ninguna abierta. |
| alta | el sistema hace algo incorrecto sin avisar, y quien lo usa no puede saberlo |
| media | el sistema hace algo correcto de forma incompleta, o cuesta más de lo debido |
| baja | no afecta al funcionamiento: falta constancia, peso de más, trabajo futuro |

Registrados: **9**. Abiertos: **9**.

| Id | Severidad | Hallazgo | Estado |
| --- | --- | --- | --- |
| **H-01** | alta | Sin conexión, una escritura responde que sí y se pierde | abierto |
| **H-02** | media | Lo servido desde la caché no se distingue de lo recién leído | abierto |
| **H-03** | media | El escudo de la UAEMex pesa 131 KB comprimidos y se dibuja a 24 px | abierto |
| **H-04** | baja | Falta la constancia de la aprobación del asesor del Sprint 1 | abierto |
| **H-05** | baja | El alcance del MVP no tiene registrada su aceptación | abierto |
| **H-06** | media | Las cuatro vistas privadas no se han recorrido con sesión iniciada | abierto |
| **H-07** | alta | Las ocho sesiones de usabilidad no se han ejecutado | abierto |
| **H-08** | media | RNF-02 no lo reclama ninguna historia y no hay constancia de prueba en varios navegadores | abierto |
| **H-09** | baja | RNF-04 está medido pero ninguna historia lo declara | abierto |

### H-01 · Sin conexión, una escritura responde que sí y se pierde

**Severidad:** alta · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/30 §7

**Origen.** HU-31, al probar el tercer criterio con la red cortada

Firestore encola las escrituras y las resuelve de forma optimista. «Guardar» sin red responde que sí, la promesa se cumple y la vista enseña el aviso de éxito. Quien cierre la pestaña antes de que vuelva la red pierde el cambio sin que nada se lo diga. Las lecturas sí lo distinguen desde HU-31, con «exigirRespuesta»; las escrituras no.

**Propuesta.** Decidir entre avisar de que hay escrituras sin confirmar, bloquear el envío sin red, o confiar en la cola y decirlo. Es una decisión de producto, no de código.

### H-02 · Lo servido desde la caché no se distingue de lo recién leído

**Severidad:** media · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/31 §7

**Origen.** HU-31, del mismo hallazgo que H-01

Cuando hay datos guardados en la caché local, se enseñan sin decir que pueden estar desfasados. Frente a un error es lo correcto —enseñar lo último que se supo es mejor que no enseñar nada— pero quien mira no tiene forma de saber que está viendo una copia.

**Propuesta.** Etiquetar la vista cuando la instantánea venga de la caché, usando el mismo «metadata.fromCache» que ya lee «exigirRespuesta».

### H-03 · El escudo de la UAEMex pesa 131 KB comprimidos y se dibuja a 24 px

**Severidad:** media · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/32 §5 y docs/10 §2 ter

**Origen.** HU-33, midiendo lo que descarga un teléfono

357 KB en disco y 131 comprimidos, con 820 trazos vectoriales, para rendirse a 24 píxeles de alto en la cabecera. Es el segundo archivo más pesado del sitio después del paquete de JavaScript y se descarga en todas las páginas. Afecta a RNF-04, no a RNF-03, y por eso no se tocó en HU-33.

**Propuesta.** Servir un PNG del tamaño en que se dibuja y conservar el SVG en «recursos/», como se hizo con las imágenes de fondo. Sustituir o rasterizar una marca institucional es decisión del autor del trabajo.

### H-04 · Falta la constancia de la aprobación del asesor del Sprint 1

**Severidad:** baja · **Estado:** abierto · **Criterio:** HU-01.4 · **Dónde:** docs/01, pie del documento

**Origen.** HU-35, al montar la matriz de trazabilidad

El pie de docs/01 afirma que el documento fue aprobado por el asesor, y la única validación registrada en el repositorio es la del otro integrante, que dice que se cumplen «los primeros tres criterios». El cuarto criterio pide precisamente la aprobación del asesor, y no hay fecha ni observaciones.

**Propuesta.** Registrar fecha y observaciones de la revisión, o retirar la afirmación del pie si no la hubo.

### H-05 · El alcance del MVP no tiene registrada su aceptación

**Severidad:** baja · **Estado:** abierto · **Criterio:** HU-03.3 · **Dónde:** docs/02 §6

**Origen.** HU-35, al montar la matriz de trazabilidad

docs/02 §6 tiene la tabla de constancia preparada y la fila «Revisado con el asesor» dice, literalmente, «pendiente de registrar fecha y observaciones». El tercer criterio de HU-03 pide que quede constancia de la aceptación.

**Propuesta.** Rellenar la fila. Es el único dato que le falta a esa tabla.

### H-06 · Las cuatro vistas privadas no se han recorrido con sesión iniciada

**Severidad:** media · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/30 §6, docs/31 §6, docs/32 §4 y docs/33 §6

**Origen.** HU-31, HU-32, HU-33 y HU-34: las cuatro lo dejaron anotado

«MiPerfil», «MiHub», el formulario de publicación y el panel de administración exigen sesión, y el servidor de desarrollo autentica contra el Firebase real. Lo que cambió en esas vistas durante el Sprint 7 se comprobó leyendo el código y, cuando era CSS, en un banco de pruebas con las hojas de estilo reales. El recorrido con cuenta de actor cultural y de administrador sigue sin hacerse.

**Propuesta.** Recorrerlas con las dos cuentas sobre el sitio publicado, que es donde ya se comprobaron los sprints 4 y 5.

### H-07 · Las ocho sesiones de usabilidad no se han ejecutado

**Severidad:** alta · **Estado:** abierto · **Criterio:** HU-36.1,HU-36.2,HU-36.3,HU-36.4 · **Dónde:** docs/35 §1 y §7

**Origen.** HU-36, que entrega el instrumento y no la medida

El consentimiento, el guion de seis tareas, el cuestionario SUS y el guion que lo procesa están escritos y probados. Lo que no existe es una sola sesión con una persona real: «sesiones.json» está vacío. Los cuatro criterios de HU-36 dependen de eso y ninguno se puede evaluar sin ello. Inventar ocho cuestionarios para que el promedio saliera por encima de 68 falsificaría el único dato del trabajo que mide si la plataforma sirve para alguien que no la construyó.

**Propuesta.** Citar a ocho participantes que no hayan construido la plataforma —cuatro visitantes, tres actores culturales y un administrador—, al menos la mitad en teléfono, y volcar cada sesión a «pruebas/usabilidad/sesiones.json».

### H-08 · RNF-02 no lo reclama ninguna historia y no hay constancia de prueba en varios navegadores

**Severidad:** media · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/39 §5

**Origen.** HU-40, al cruzar los 25 requisitos declarados con las fichas de las 40 historias

RNF-02 pide que el sistema funcione en los navegadores de mayor uso. Ninguna ficha de historia lo declara entre sus requisitos asociados, y ningún documento recoge una comprobación: todos los recorridos manuales del trabajo se hicieron en un único navegador. Las dos menciones a navegadores concretos que hay en docs/ son incidentales —el aviso de Chrome al abrir varios diálogos seguidos y un nombre de campo rechazado— y no comprueban nada. Es el único requisito declarado del que el trabajo no puede enseñar una verificación.

**Propuesta.** Recorrer las siete rutas públicas y las cuatro privadas en los navegadores que fije el criterio de RNF-02, anotar versión y sistema, y asociar el requisito a las historias que lo sostienen. Es una tarde de trabajo y cierra el último requisito sin evidencia.

### H-09 · RNF-04 está medido pero ninguna historia lo declara

**Severidad:** baja · **Estado:** abierto · **Criterio:** ninguno, viene de una observación · **Dónde:** docs/39 §5

**Origen.** HU-40, del mismo cruce que H-08

El presupuesto de RNF-04 —la vista principal por debajo de tres segundos en 4G— está medido y discutido en docs/10, docs/18 §11 y docs/32, y hasta se usó para decidir cuánto podía crecer una imagen. Pero ninguna ficha de historia lo declara entre sus requisitos, así que en la matriz de trazabilidad aparece sin historias y sin casos: la trazabilidad hacia él se sostiene en la prosa.

**Propuesta.** Añadir RNF-04 a los requisitos asociados de HU-09 y HU-25, que son las historias que lo sostienen según docs/32, y volver a generar la instantánea de criterios. No se hace desde HU-40 porque cambiar la ficha de un issue cerrado para que la matriz cuadre es reescribir el expediente.

---

## D.4 Instrumento de usabilidad

Los tres documentos que se llevan a cada sesión, tal como están en `pruebas/usabilidad/`.
Se reproducen completos porque son el instrumento: lo que firma el participante, lo que lee
quien acompaña y lo que se responde al terminar.

### D.4.1 Hoja de consentimiento informado

> **Hub Cultural Santa Marta** — trabajo de grado de Ingeniería en Software,
> Tecnológico de Antioquia.
> Instrumento de HU-36. Se lee en voz alta antes de empezar y se firma.
> Una copia para quien participa y otra para el expediente del trabajo.

---

### Qué es esto

Le estamos pidiendo que pruebe un prototipo de plataforma web para la oferta cultural de
Santa Marta. Es un trabajo de grado, no un producto comercial.

**Lo que se evalúa es la plataforma, no usted.** Si algo le resulta confuso o no encuentra
dónde pulsar, eso es un resultado útil: significa que está mal hecho y hay que arreglarlo.
No hay respuestas correctas ni incorrectas, y no se espera que sepa nada de informática.

### Qué va a pasar

La sesión dura entre **veinte y treinta minutos** y tiene dos partes:

1. **Unas tareas.** Se le pedirá que haga cosas concretas en la plataforma —buscar una
   actividad, publicar un evento, revisar algo— y que las intente **sin ayuda**. Quien
   acompaña la sesión no va a responder preguntas sobre cómo hacerlo mientras lo intenta: no
   es descortesía, es que la ayuda falsearía la medida. Puede abandonar una tarea cuando
   quiera diciendo «lo dejo», y eso también es un resultado.
2. **Un cuestionario de diez preguntas** sobre su impresión general, que se responde en dos
   minutos.

Si algo no le queda claro **de este documento**, pregunte ahora y todas las veces que haga
falta.

### Qué se anota

| Se anota | No se anota |
| --- | --- |
| Si completó cada tarea | Su nombre |
| Cuánto tardó en cada una | Su documento de identidad |
| Qué dificultades se observaron | Su dirección ni su teléfono |
| Sus diez respuestas del cuestionario | Su cara, su voz ni su pantalla |
| Su rol (visitante, actor cultural o administrador) | Nada que permita identificarle después |

**No se graba audio, vídeo ni pantalla.** Lo que queda escrito es un número de participante
—P1, P2, P3…—, y ese número no está asociado a ninguna lista de nombres: **esta hoja firmada
se archiva aparte de los datos de la sesión y no lleva el número de participante**.

### Qué se hace con eso

Los resultados se publican **agregados** —promedios, porcentajes, dificultades observadas—
dentro del trabajo de grado y en el repositorio del proyecto. Nadie va a poder reconocer qué
dijo o hizo usted, porque no se guarda con qué número de participante quedó asociado.

Tratamiento de datos conforme a la **Ley 1581 de 2012**. La plataforma tiene su propia
política publicada, que puede leer en `/politica-de-datos` del sitio.

### Sus derechos

- **Participar es voluntario.** Puede negarse sin dar ninguna explicación.
- **Puede parar cuando quiera**, incluso a mitad de una tarea, y no tiene que decir por qué.
- **Puede pedir que se descarten sus datos** hasta el final de la sesión. Después no se puede,
  y el motivo es el mismo que protege su anonimato: como no queda registro de qué número de
  participante es usted, tampoco se puede encontrar su fila para borrarla.
- **No hay pago ni compensación** por participar.
- **No hay riesgo previsible.** Lo peor que puede pasar es que la plataforma le resulte
  incómoda, que es exactamente lo que se quiere averiguar.

### Si usa una cuenta

Para algunas tareas hace falta entrar con una cuenta. **Se le dará una cuenta de prueba
creada para esto**; no use nunca una cuenta suya ni una contraseña que use en otro sitio. Lo
que publique durante la sesión se borra después.

---

### Declaración

Declaro que:

- He leído este documento, o me lo han leído, y he podido preguntar.
- Entiendo que participo voluntariamente y que puedo parar cuando quiera.
- Entiendo qué se anota de la sesión y qué no.
- Autorizo el uso de los resultados, de forma agregada y anónima, dentro de este trabajo de
  grado.

<br>

| | |
| --- | --- |
| **Firma de quien participa** | ______________________________________ |
| **Fecha** | _______ / _______ / 2026 |
| **Lugar** | ______________________________________ |

<br>

| | |
| --- | --- |
| **Nombre de quien acompaña la sesión** | ______________________________________ |
| **Firma** | ______________________________________ |

---

*Elaboración propia (2026). Hub Cultural Santa Marta · HU-36.*

### D.4.2 Guion de la sesión

> Instrumento de HU-36. Lo usa quien acompaña la sesión; **no se le entrega a quien
> participa**, que solo oye la tarea en voz alta.

---

### Antes de empezar

1. Leer el [consentimiento](consentimiento.md) en voz alta y firmarlo. **Archivarlo aparte**,
   sin el número de participante.
2. Abrir <https://hub-cultural-santa-marta.vercel.app> en una ventana limpia, sin sesión
   iniciada y sin historial.
3. Anotar el **rol** que va a probar esta persona y, si hace falta, entrar con la cuenta de
   prueba correspondiente.
4. Decir la frase de arranque. Está escrita abajo y conviene leerla tal cual: es lo que hace
   que la persona se sienta con permiso de fallar.

> «Vamos a probar una plataforma, no a probarle a usted. Si algo no lo encuentra o le parece
> raro, es culpa nuestra y es justo lo que necesitamos saber. Le voy a pedir cosas y le voy a
> pedir que las intente solo; yo no voy a poder ayudarle mientras lo intenta, aunque se me
> note en la cara que quiero. Cuando quiera dejar una tarea, dígame "lo dejo" y pasamos a la
> siguiente. ¿Alguna pregunta antes de empezar?»

#### Las tres reglas de quien acompaña

1. **No ayudar.** Ni con la mirada. Si preguntan «¿es aquí?», responder «¿usted qué haría?».
2. **No justificar el diseño.** Si dicen «esto debería estar arriba», anotarlo y decir
   «gracias, lo apunto». Explicar por qué está donde está convierte la sesión en una defensa.
3. **Anotar lo que pasa, no lo que se interpreta.** «Pulsó tres veces en el logotipo» es un
   dato; «no entendió la navegación» es una conclusión, y esa se saca después.

---

### Tarea 1 · Visitante · encontrar algo que hacer

**Se dice:** «Está de visita en Santa Marta este fin de semana y quiere saber qué hay de
música. Búsquelo.»

| | |
| --- | --- |
| **Empieza en** | la página de inicio, sin sesión |
| **Se considera completada cuando** | llega a una lista filtrada por la categoría de música |
| **Camino previsto** | Inicio → Eventos → filtro de categoría |
| **Qué mirar** | si encuentra el filtro o se pone a leer la lista entera; si confunde el filtro con el buscador |

### Tarea 2 · Visitante · abrir una actividad y contactar

**Se dice:** «De lo que encontró, elija una que le llame la atención y averigüe cómo
preguntarle algo a quien la organiza.»

| | |
| --- | --- |
| **Empieza en** | el listado de la tarea 1 |
| **Se considera completada cuando** | abre la ficha y llega a un canal de contacto |
| **Camino previsto** | tarjeta → ficha → contacto |
| **Qué mirar** | si ve el acceso al contacto sin desplazarse; si entiende que el mensaje va prellenado |

### Tarea 3 · Visitante · situarse en el mapa

**Se dice:** «Quiere ver qué hay cerca de donde se aloja. Use el mapa.»

| | |
| --- | --- |
| **Empieza en** | cualquier vista pública |
| **Se considera completada cuando** | abre el mapa y pulsa un marcador |
| **Camino previsto** | menú → Mapa → marcador → ficha |
| **Qué mirar** | **en teléfono**, si descubre el gesto de dos dedos o se frustra antes; si el mapa se ve al abrir o hay que buscarlo |

### Tarea 4 · Actor cultural · publicar

**Se dice:** «Usted organiza un taller de tambora el sábado que viene, de tres a seis de la
tarde, en el Parque de los Novios. Publíquelo.»

| | |
| --- | --- |
| **Empieza en** | sesión iniciada como actor cultural con perfil ya aprobado |
| **Se considera completada cuando** | la publicación queda enviada a revisión |
| **Camino previsto** | Mis publicaciones → formulario → enviar |
| **Qué mirar** | si entiende que queda pendiente y no publicada; **si sitúa el punto o lo salta**; cómo reacciona al aviso de publicar sin mapa |

### Tarea 5 · Actor cultural · corregir un error

**Se dice:** «Se equivocó: el taller es de cuatro a siete, no de tres a seis. Arréglelo.»

| | |
| --- | --- |
| **Empieza en** | el listado de sus publicaciones |
| **Se considera completada cuando** | guarda el cambio de hora |
| **Camino previsto** | tarjeta → Editar → cambiar la hora → guardar |
| **Qué mirar** | **si lee el aviso de que volverá a revisión**; si encuentra «Editar» a la primera |

### Tarea 6 · Administrador · moderar

**Se dice:** «Llegó una publicación nueva. Revísela y, si está bien, apruébela.»

| | |
| --- | --- |
| **Empieza en** | sesión iniciada como administrador |
| **Se considera completada cuando** | la publicación cambia de estado |
| **Camino previsto** | Panel → cola de publicaciones → Aprobar |
| **Qué mirar** | si encuentra la cola entre las tres del panel; si entiende que devolver exige escribir una observación |

---

### Después de las tareas

1. Pasar el [cuestionario SUS](cuestionario-sus.md). **Sin comentarlo**: si se le explica un
   ítem, la respuesta deja de ser comparable con las de los demás.
2. Preguntar lo único que se pregunta abierto: **«¿Qué fue lo más incómodo?»** Anotar la
   respuesta tal cual, entre comillas.
3. Volcar la sesión a `sesiones.json` con el siguiente número de participante.
4. Borrar lo que se haya publicado durante la sesión.

---

### Cuántas sesiones y con quién

El criterio pide **al menos ocho participantes**. Conviene repartirlos por rol y que **ninguno
haya participado en la construcción**: quien conoce el proyecto no puede perderse en él, y esa
es la medida que se busca.

| Rol | Sesiones | Quién sirve |
| --- | --- | --- |
| Visitante | 4 | alguien que no sea de Santa Marta; turismo real si se puede |
| Actor cultural | 3 | gestores, músicos, artesanos: el perfil de RF-03 |
| Administrador | 1 | alguien con criterio de gestión cultural |

Las tareas 1 a 3 las hace **todo el mundo**, sea cual sea su rol: son las de visitante y
cualquiera llega a la plataforma como visitante antes que como otra cosa.

---

*Elaboración propia (2026). Hub Cultural Santa Marta · HU-36.*

### D.4.3 Cuestionario SUS

> Instrumento de HU-36. Se entrega **después** de las tareas y se responde sin comentarios de
> quien acompaña: explicar un ítem hace que esa respuesta deje de ser comparable con las
> demás.
>
> Brooke, J. (1996). *SUS: A quick and dirty usability scale.*

**Participante:** P____   ·   **Rol probado:** ☐ Visitante ☐ Actor cultural ☐ Administrador
**Fecha:** _______ / _______ / 2026

---

Marque, para cada frase, cuánto está de acuerdo. **Responda con su primera impresión**: no hay
respuestas correctas y no hace falta pensarlas mucho. Si alguna frase no sabe cómo
contestarla, marque el centro.

Las diez son sobre la plataforma que acaba de usar.

---

#### 1. Creo que usaría esta plataforma con frecuencia.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 2. Encontré la plataforma innecesariamente compleja.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 3. Me pareció fácil de usar.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 4. Creo que necesitaría el apoyo de alguien con conocimientos técnicos para poder usarla.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 5. Las funciones de la plataforma están bien integradas entre sí.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 6. Me pareció que había demasiada inconsistencia en la plataforma.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 7. Imagino que la mayoría de la gente aprendería a usarla muy rápido.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 8. Me resultó muy incómoda de usar.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 9. Me sentí seguro usándola.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

#### 10. Necesité aprender muchas cosas antes de poder manejarme con la plataforma.

| 1 · Muy en desacuerdo | 2 | 3 | 4 | 5 · Muy de acuerdo |
| :-: | :-: | :-: | :-: | :-: |
| ☐ | ☐ | ☐ | ☐ | ☐ |

---

### Y una sola pregunta abierta

**¿Qué fue lo más incómodo?**

<br><br>

_______________________________________________________________________________

_______________________________________________________________________________

---

<sub>Para quien procesa: los ítems impares aportan «respuesta − 1» y los pares «5 − respuesta»;
la suma se multiplica por 2,5. No se calcula a mano: se vuelca a `sesiones.json` y lo hace
`node herramientas/calcular-sus.js`.</sub>

*Elaboración propia (2026), sobre el instrumento de Brooke (1996). Hub Cultural Santa Marta · HU-36.*

---

## D.5 Consentimientos informados de los participantes

**No hay ninguno, porque no hay participantes.** Las ocho sesiones de usabilidad que pide
HU-36 **no se han ejecutado**: `pruebas/usabilidad/sesiones.json` está vacío y
`npm run usabilidad` responde que hacen falta ocho personas que no hayan construido la
plataforma.

Se dice aquí en lugar de dejar el apartado en blanco o rellenarlo con formularios sin
firmar: un consentimiento sin firmar no es un consentimiento, y este anexo documenta lo
que ocurrió y no lo que estaba previsto.

Queda registrado como el hallazgo **H-07**, de severidad alta, y es lo que impide cerrar el
tercer criterio de HU-40. Cuando las sesiones se ejecuten, cada consentimiento firmado se
escanea y se añade a este apartado, y el volcado de `sesiones.json` hace que el puntaje SUS
aparezca solo en el informe de validación.

---

*Elaboración propia (2026).*
