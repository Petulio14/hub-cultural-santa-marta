# Documentación del proyecto

Evidencia verificable de las historias de usuario de los sprints 1 a 6. Cada documento
corresponde a una historia del backlog y es la prueba que respalda su cierre en el tablero.

| Documento | Historia | Sprint | Contenido |
| --- | --- | --- | --- |
| [01-requisitos.md](01-requisitos.md) | [HU-01](https://github.com/Petulio14/hub-cultural-santa-marta/issues/1) | 1 | Limitaciones del contexto, actores y necesidades, catálogo de 15 RF y 10 RNF con criterio de verificación. |
| [02-alcance-mvp.md](02-alcance-mvp.md) | [HU-03](https://github.com/Petulio14/hub-cultural-santa-marta/issues/3) | 1 | Inclusiones, exclusiones justificadas, restricciones y registro de trabajo futuro. |
| [03-arquitectura.md](03-arquitectura.md) | [HU-04](https://github.com/Petulio14/hub-cultural-santa-marta/issues/4) | 2 | Diagrama de las cuatro capas, tecnología de cada una y regla de acceso a datos. |
| [04-modelo-datos.md](04-modelo-datos.md) | [HU-05](https://github.com/Petulio14/hub-cultural-santa-marta/issues/5) | 2 | Las 7 colecciones de Firestore con tipos, obligatoriedad, relaciones e índices compuestos. |
| [05-prototipo-interfaz.md](05-prototipo-interfaz.md) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Mapa de navegación, inventario de 9 vistas, paleta con contrastes WCAG verificados y rejilla responsive. |
| [prototipo/index.html](prototipo/index.html) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Maqueta navegable de las 9 vistas, conmutable entre 360, 768 y 1366 px. Se abre haciendo doble clic. |
| [06-puesta-en-marcha.md](06-puesta-en-marcha.md) | [HU-08](https://github.com/Petulio14/hub-cultural-santa-marta/issues/8), [HU-11](https://github.com/Petulio14/hub-cultural-santa-marta/issues/11) | 3 | Creación de los proyectos de Firebase y Vercel paso a paso, con la verificación de las reglas de seguridad. |
| [07-guia-figma.md](07-guia-figma.md) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Traducción de la especificación a Figma: estilos, componentes, orden de construcción y enlaces de navegación. |
| [../figma-plugin/](../figma-plugin/) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Plugin que construye el prototipo dentro de Figma: estilos, componentes, 27 pantallas y 151 enlaces, de una sola pasada. Incluye el banco de pruebas que reprodujo cada defecto corregido. |
| [08-estructura-del-proyecto.md](08-estructura-del-proyecto.md) | [HU-07](https://github.com/Petulio14/hub-cultural-santa-marta/issues/7) | 3 | Estructura de carpetas del proyecto de React, tabla de rutas, página de error controlada y verificación automática de la regla de acceso a datos. |
| [11-reglas-de-seguridad.md](11-reglas-de-seguridad.md) | [HU-11](https://github.com/Petulio14/hub-cultural-santa-marta/issues/11) | 3 | Qué protege cada colección, publicación de reglas e índices, y las 21 pruebas automáticas que las demuestran contra el emulador. |
| [12-despliegue-continuo.md](12-despliegue-continuo.md) | [HU-08](https://github.com/Petulio14/hub-cultural-santa-marta/issues/8) | 3 | Dirección pública, reescritura de rutas, cabeceras de seguridad y la verificación de que cada integración en `master` se publica sola. |
| [13-cuentas-y-sesion.md](13-cuentas-y-sesion.md) | [HU-12](https://github.com/Petulio14/hub-cultural-santa-marta/issues/12), [HU-13](https://github.com/Petulio14/hub-cultural-santa-marta/issues/13), [HU-14](https://github.com/Petulio14/hub-cultural-santa-marta/issues/14) | 4 | Registro de actor cultural, inicio y cierre de sesión, recuperación de contraseña, mensajes que no revelan quién tiene cuenta, y el agujero de escalada de rol que encontró la suite de reglas. |
| [14-tratamiento-de-datos.md](14-tratamiento-de-datos.md) | [HU-16](https://github.com/Petulio14/hub-cultural-santa-marta/issues/16) | 4 | Política publicada, consentimiento expreso guardado con fecha y versión, minimización de datos y canal de supresión. |
| [15-roles-y-permisos.md](15-roles-y-permisos.md) | [HU-15](https://github.com/Petulio14/hub-cultural-santa-marta/issues/15) | 4 | Qué puede hacer cada rol, las cuatro maneras de no pasar, el estado de la cuenta como condición del permiso, y los doce casos que lo fijan contra el emulador. |
| [16-categorias.md](16-categorias.md) | [HU-17](https://github.com/Petulio14/hub-cultural-santa-marta/issues/17) | 4 | El catálogo de categorías, por qué una categoría se desactiva en lugar de borrarse, y el recuento de publicaciones contado en el servidor. |
| [17-perfil-de-actor.md](17-perfil-de-actor.md) | [HU-18](https://github.com/Petulio14/hub-cultural-santa-marta/issues/18) | 5 | El perfil del actor cultural: por qué su identificador es el `uid`, el límite de la descripción escrito en las dos capas, la edición que no vuelve a la cola y el directorio público. |
| [18-imagen-del-perfil.md](18-imagen-del-perfil.md) | [HU-19](https://github.com/Petulio14/hub-cultural-santa-marta/issues/19) | 5 | La imagen dentro del documento en lugar de Firebase Storage, los dos límites que no son el mismo, la reducción en el navegador y la imagen predeterminada dibujada en el código. |
| [19-hubs-de-innovacion.md](19-hubs-de-innovacion.md) | [HU-20](https://github.com/Petulio14/hub-cultural-santa-marta/issues/20) | 5 | Los hubs de innovación, las tres piezas que salieron de duplicar, y por qué las coordenadas no se pueden obtener en silencio. |
| [20-publicacion-de-eventos.md](20-publicacion-de-eventos.md) | [HU-21](https://github.com/Petulio14/hub-cultural-santa-marta/issues/21) | 5 | La publicación de un evento: hora local contra UTC, la fecha de creación que solo el servidor puede escribir, y el campo normalizado que ninguna persona mira. |
| [21-georreferenciacion.md](21-georreferenciacion.md) | [HU-22](https://github.com/Petulio14/hub-cultural-santa-marta/issues/22) | 5 | El punto en el mapa: Leaflet sin envoltorio, el marcador que se dibuja con CSS, y la advertencia que solo se lee si detiene el envío. |
| [22-edicion-y-eliminacion.md](22-edicion-y-eliminacion.md) | [HU-23](https://github.com/Petulio14/hub-cultural-santa-marta/issues/23) | 5 | Corregir y retirar lo propio: un formulario que sirve para las dos cosas, por qué no `window.confirm`, y tres historias seguidas encontrando reglas sin estrenar. |
| [23-moderacion.md](23-moderacion.md) | [HU-24](https://github.com/Petulio14/hub-cultural-santa-marta/issues/24) | 5 | Moderar antes de publicar: la decisión y su constancia en una sola escritura, y qué significa «notificar» cuando no se puede enviar correo. |
| [24-catalogo-publico.md](24-catalogo-publico.md) | [HU-25](https://github.com/Petulio14/hub-cultural-santa-marta/issues/25) | 6 | El catálogo público: por qué «limit» no es un filtro, trece documentos para enseñar doce, y el índice que se publica antes de fusionar. |
| [25-filtros-del-catalogo.md](25-filtros-del-catalogo.md) | [HU-26](https://github.com/Petulio14/hub-cultural-santa-marta/issues/26) | 6 | Filtrar por categoría y por fechas: «vigente en el rango» es un solapamiento, dos desigualdades sobre campos distintos, y la trampa de las fechas por tercera vez. |
| [26-busqueda.md](26-busqueda.md) | [HU-27](https://github.com/Petulio14/hub-cultural-santa-marta/issues/27) | 6 | Buscar por palabra clave: la primera historia que se resuelve fuera de la base de datos, el tope que se dice en pantalla, y por palabras y no por cadena. |
| [27-detalle-de-la-publicacion.md](27-detalle-de-la-publicacion.md) | [HU-28](https://github.com/Petulio14/hub-cultural-santa-marta/issues/28) | 6 | La ficha de una actividad: el punto de HU-22 dibujado por primera vez, el mapa que no se toca, y una publicación visible cuyo autor no lo es. |
| [28-contacto-directo.md](28-contacto-directo.md) | [HU-29](https://github.com/Petulio14/hub-cultural-santa-marta/issues/29) | 6 | Contactar sin intermediarios: por qué una llamada no lleva mensaje, el espacio que no siempre es «%20», y lo que del visitante no se guarda. |

**HU-02 — Construcción y priorización del Product Backlog** no tiene documento propio: su
evidencia son los [40 issues](https://github.com/Petulio14/hub-cultural-santa-marta/issues)
del repositorio, los 8 hitos y el tablero de GitHub Projects. Los datos de origen están en
[`../backlog/`](../backlog/).

---

## Estado de los sprints

| Sprint | Vence | Historias | Estado |
| --- | --- | --- | --- |
| Sprint 1 | 17/08/2026 | HU-01, HU-02, HU-03 | Documentación completa. Pendiente registrar la aprobación del asesor. |
| Sprint 2 | 01/09/2026 | HU-04, HU-05, HU-06 | **Cerrado el 21/08/2026, once días antes del vencimiento.** Las tres historias completas, con el [prototipo publicado en Figma](https://www.figma.com/proto/wAfJjgLhVl2owhFtxZ2PjN/Hub-Cultural-Santa-Marta-%E2%80%94-Prototipo?node-id=17-10047&starting-point-node-id=17%3A9189&scaling=min-zoom&content-scaling=fixed&t=pbQnxU0nW6OzSUZt-1) aprobado por el asesor. |
| Sprint 3 | 15/09/2026 | HU-07 a HU-11 | **Cerrado el 22/08/2026, veinticuatro días antes del vencimiento.** Las cinco historias completas: proyecto de React con su estructura y enrutador ([08](08-estructura-del-proyecto.md)), navegación y página de inicio ([09](09-navegacion-e-inicio.md)), adaptación a los tres anchos ([10](10-responsive.md)), reglas de seguridad publicadas y probadas ([11](11-reglas-de-seguridad.md)) y despliegue continuo en [hub-cultural-santa-marta.vercel.app](https://hub-cultural-santa-marta.vercel.app) ([12](12-despliegue-continuo.md)). |
| Sprint 4 | 29/09/2026 | HU-12 a HU-17 | **Cerrado el 22/08/2026, treinta y siete días antes del vencimiento.** La épica E1 completa: registro, sesión y recuperación de contraseña ([13](13-cuentas-y-sesion.md)), consentimiento de tratamiento de datos con su política publicada ([14](14-tratamiento-de-datos.md)), control por rol en las dos capas ([15](15-roles-y-permisos.md)) y el catálogo de categorías ([16](16-categorias.md)). Comprobado en producción con cuentas reales de administrador y de actor cultural. |
| Sprint 5 | 13/10/2026 | HU-18 a HU-24 | **Cerrado el 27/08/2026, cuarenta y siete días antes del vencimiento.** Dos épicas completas. La **E2**: perfil del actor cultural ([17](17-perfil-de-actor.md)), su imagen ([18](18-imagen-del-perfil.md)) y los hubs de innovación ([19](19-hubs-de-innovacion.md)). La **E3**, el ciclo de vida entero de una publicación: crearla ([20](20-publicacion-de-eventos.md)), situarla en el mapa ([21](21-georreferenciacion.md)), corregirla y retirarla ([22](22-edicion-y-eliminacion.md)) y moderarla antes de que se vea ([23](23-moderacion.md)). Las siete comprobadas en el sitio publicado con cuentas reales de administrador y de actor cultural. |
| Sprint 6 | 27/10/2026 | HU-25 a HU-30 | **En curso.** Abre la épica E4 con el catálogo público ([24](24-catalogo-publico.md)), que es la primera vista del proyecto pensada para quien **no tiene cuenta**, y lo hace preguntable por categoría y por fechas ([25](25-filtros-del-catalogo.md)) y por palabra clave ([26](26-busqueda.md)), y cada actividad tiene ya su ficha propia ([27](27-detalle-de-la-publicacion.md)) desde la que se contacta con quien la organiza ([28](28-contacto-directo.md)), lo que **cierra la épica E4**. |


> **Lo que queda por delante.** [HU-25](24-catalogo-publico.md) salda la mitad de la deuda
> que el Sprint 5 dejó abierta a propósito: lo aprobado ya tiene dónde verse. Queda la otra
> mitad: el punto que HU-22 guarda ya se dibuja en la ficha de cada actividad
> ([27](27-detalle-de-la-publicacion.md)), pero **el mapa de toda la oferta sigue siendo
> HU-30**, la última historia del sprint y la única de la épica E5. Con
> [HU-29](28-contacto-directo.md) la E4 queda cerrada: descubrir, filtrar, buscar,
> abrir y contactar.

## Configuración en la raíz del repositorio

| Archivo | Para qué | Historia |
| --- | --- | --- |
| `firestore.rules` | Reglas de seguridad de las 7 colecciones. | HU-11 |
| `firestore.indexes.json` | Los 6 índices compuestos. Generado desde [04 §10](04-modelo-datos.md). | HU-05, HU-26 |
| `storage.rules` | Lectura pública, escritura del propietario, JPG/PNG ≤ 2 MB. **Escrito y sin publicar**: activar Storage exige plan de facturación ([18 §1](18-imagen-del-perfil.md)). | HU-19 |
| `firebase.json` | Enlaza reglas e índices; configura los emuladores locales. | HU-11 |
| `vercel.json` | Build de Vite, reescritura de rutas y cabeceras de seguridad. | HU-08 |
| `.env.example` | Las seis variables del SDK de Firebase. | HU-08 |

## Cómo se lee esta documentación

Los documentos están encadenados y se leen en orden:

1. **Requisitos** — qué debe hacer el sistema (`RF-nn`) y bajo qué condiciones (`RNF-nn`).
2. **Alcance** — qué de eso entra en el prototipo y qué queda explícitamente fuera.
3. **Arquitectura** — cómo se organiza el sistema para cumplirlo.
4. **Modelo de datos** — cómo se estructura la información dentro de esa arquitectura.
5. **Prototipo de interfaz** — cómo se presenta al usuario.

Los códigos `RF-nn`, `RNF-nn` y `HU-nn` son los mismos en los cinco documentos, en los
issues del repositorio y en el trabajo de grado. Esa correspondencia es la base de la
matriz de trazabilidad requisitos–historias–pruebas que exige HU-40.
