# Documentación del proyecto

Evidencia verificable de las historias de usuario de los sprints 1 y 2. Cada documento
corresponde a una historia del backlog y es la prueba que respalda su cierre en el tablero.

| Documento | Historia | Sprint | Contenido |
| --- | --- | --- | --- |
| [01-requisitos.md](01-requisitos.md) | [HU-01](https://github.com/Petulio14/hub-cultural-santa-marta/issues/1) | 1 | Limitaciones del contexto, actores y necesidades, catálogo de 15 RF y 10 RNF con criterio de verificación. |
| [02-alcance-mvp.md](02-alcance-mvp.md) | [HU-03](https://github.com/Petulio14/hub-cultural-santa-marta/issues/3) | 1 | Inclusiones, exclusiones justificadas, restricciones y registro de trabajo futuro. |
| [03-arquitectura.md](03-arquitectura.md) | [HU-04](https://github.com/Petulio14/hub-cultural-santa-marta/issues/4) | 2 | Diagrama de las cuatro capas, tecnología de cada una y regla de acceso a datos. |
| [04-modelo-datos.md](04-modelo-datos.md) | [HU-05](https://github.com/Petulio14/hub-cultural-santa-marta/issues/5) | 2 | Las 7 colecciones de Firestore con tipos, obligatoriedad, relaciones e índices compuestos. |
| [05-prototipo-interfaz.md](05-prototipo-interfaz.md) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Mapa de navegación, inventario de 9 vistas, paleta con contrastes WCAG verificados y rejilla responsive. |
| [prototipo/index.html](prototipo/index.html) | [HU-06](https://github.com/Petulio14/hub-cultural-santa-marta/issues/6) | 2 | Maqueta navegable de las 9 vistas, conmutable entre 360, 768 y 1366 px. Se abre haciendo doble clic. |

**HU-02 — Construcción y priorización del Product Backlog** no tiene documento propio: su
evidencia son los [40 issues](https://github.com/Petulio14/hub-cultural-santa-marta/issues)
del repositorio, los 8 hitos y el tablero de GitHub Projects. Los datos de origen están en
[`../backlog/`](../backlog/).

---

## Estado de los sprints

| Sprint | Vence | Historias | Estado |
| --- | --- | --- | --- |
| Sprint 1 | 17/08/2026 | HU-01, HU-02, HU-03 | Documentación completa. Pendiente registrar la aprobación del asesor. |
| Sprint 2 | 01/09/2026 | HU-04, HU-05, HU-06 | HU-04 y HU-05 completas. HU-06 especificada y con maqueta navegable; **pendiente el archivo de Figma.** |
| Sprint 3 | 15/09/2026 | HU-07 a HU-11 | No iniciado. Primer código: proyecto React, despliegue en Vercel y reglas de seguridad. |

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
