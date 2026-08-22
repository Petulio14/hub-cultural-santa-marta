# Documentación del proyecto

Evidencia verificable de las historias de usuario de los sprints 1 a 3. Cada documento
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
| [09-navegacion-e-inicio.md](09-navegacion-e-inicio.md) | [HU-09](https://github.com/Petulio14/hub-cultural-santa-marta/issues/9) | 3 | Los cuatro accesos principales, la página de inicio en React, el regreso al inicio desde cualquier vista y el tiempo de cambio de vista medido. |
| [10-responsive.md](10-responsive.md) | [HU-10](https://github.com/Petulio14/hub-cultural-santa-marta/issues/10) | 3 | Adaptación a 360, 768 y 1366 px: menú compacto, áreas de toque y verificación del desbordamiento en las nueve rutas públicas. |

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
| Sprint 3 | 15/09/2026 | HU-07 a HU-11 | **En curso.** HU-07, HU-09 y HU-10 completas: proyecto de React con su estructura, enrutador y página de error ([08](08-estructura-del-proyecto.md)); navegación y página de inicio ([09](09-navegacion-e-inicio.md)); adaptación a los tres anchos ([10](10-responsive.md)). Reglas de seguridad, índices y archivos de despliegue ya estaban en el repositorio. Falta crear los proyectos de Firebase y Vercel ([guía](06-puesta-en-marcha.md)). |

## Configuración en la raíz del repositorio

| Archivo | Para qué | Historia |
| --- | --- | --- |
| `firestore.rules` | Reglas de seguridad de las 7 colecciones. | HU-11 |
| `firestore.indexes.json` | Los 6 índices compuestos. Generado desde [04 §10](04-modelo-datos.md). | HU-05, HU-26 |
| `storage.rules` | Lectura pública, escritura del propietario, JPG/PNG ≤ 2 MB. | HU-19 |
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
