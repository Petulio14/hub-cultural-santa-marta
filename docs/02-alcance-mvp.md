# Alcance del producto mínimo viable

> **Historia de usuario:** HU-03 · Sprint 1
> **Objetivo específico:** 1 — Delimitar con precisión qué se va a construir.
> **Fuente:** Trabajo de grado, *Marco Metodológico*, §5.1.1 Inclusiones, §5.1.2 Exclusiones, §5.1.3 Restricciones.

Este documento protege el alcance frente al tiempo académico disponible y al tamaño del
equipo. **Toda funcionalidad que no aparezca en la sección 2 queda fuera del prototipo**
y, si se identifica durante el desarrollo, se registra en la sección 5 como trabajo
futuro sin incorporarse a ningún sprint.

---

## 1. Declaración de alcance

El alcance del proyecto se define como el diseño, desarrollo e implementación de un
**prototipo funcional de plataforma web** orientada a la articulación del ecosistema
turístico, cultural y de innovación en Santa Marta.

El proyecto abarca el ciclo completo de conexión: registro y perfilamiento de los actores
culturales, visibilización de sus iniciativas e interacción directa con turistas o
entidades de innovación. El componente distintivo es su función como **hub virtual**,
donde el software actúa como facilitador para la co-creación de experiencias turísticas
diferenciadas, bajo parámetros explícitos de seguridad que garantizan la integridad de
los datos de las comunidades locales.

## 2. Inclusiones

Está **dentro** del alcance:

| # | Funcionalidad incluida | Requisitos | Sprint |
| --- | --- | --- | --- |
| I-01 | Autenticación básica de usuarios con roles diferenciados. | RF-01, RF-02 | 4 |
| I-02 | Gestión de publicaciones culturales: crear, consultar, editar y eliminar. | RF-05, RF-06, RF-07 | 5 |
| I-03 | Consulta pública del catálogo de eventos, actores culturales y hubs. | RF-09 | 6 |
| I-04 | Perfiles de actor cultural y de hub de innovación. | RF-03, RF-04 | 5 |
| I-05 | Integración de mapa interactivo y geolocalización de espacios culturales. | RF-08, RF-11 | 5, 6 |
| I-06 | Filtros básicos de búsqueda por categoría, fecha y palabra clave. | RF-10 | 6 |
| I-07 | Contacto directo del visitante con el actor cultural. | RF-12 | 6 |
| I-08 | Panel básico de administración: moderación de publicaciones y gestión de categorías. | RF-13, RF-14 | 4, 5 |
| I-09 | Indicadores básicos de uso de la plataforma. | RF-15 | 7 |
| I-10 | Diseño responsive para dispositivos móviles y de escritorio. | RNF-03 | 3, 7 |
| I-11 | Pruebas funcionales, de permisos y de usabilidad. | RNF-01, RNF-08 | 7 |
| I-12 | Despliegue del prototipo en un entorno web público. | RNF-08, RNF-09 | 3, 8 |

## 3. Exclusiones

Está **fuera** del alcance, con su justificación:

| # | Funcionalidad excluida | Justificación |
| --- | --- | --- |
| E-01 | Aplicación móvil nativa para Android o iOS. | El diseño responsive cubre el uso móvil dentro de la capacidad del equipo; una app nativa duplicaría el esfuerzo de construcción y de pruebas. |
| E-02 | Sistemas de pago en línea. | El producto se define como plataforma de descubrimiento y contacto, no como sistema transaccional (decisión derivada de L-3). |
| E-03 | Reservas turísticas. | Depende de acuerdos comerciales y de disponibilidad en tiempo real, ajenos a un MVP académico. |
| E-04 | Chat interno entre usuarios. | El contacto se resuelve mediante los canales que el propio actor cultural autorice (RF-12), sin costo de moderación de mensajería. |
| E-05 | Analítica avanzada y dashboards empresariales. | El alcance se limita a los indicadores básicos de RF-15. |
| E-06 | Inteligencia artificial, realidad aumentada y realidad virtual. | Exceden el tiempo académico disponible y los recursos gratuitos declarados en RNF-10. |
| E-07 | Integración con plataformas externas de turismo. | Requiere convenios y credenciales de terceros que no están garantizados en el periodo del proyecto. |
| E-08 | Funcionalidades de escalabilidad comercial. | El prototipo se valida con un conjunto controlado de usuarios, no en operación productiva. |
| E-09 | Sistema completo de gestión turística para entidades públicas o privadas. | El alcance se limita explícitamente a un MVP académico funcional. |

## 4. Restricciones

| # | Restricción | Implicación sobre el desarrollo |
| --- | --- | --- |
| R-01 | Tiempo académico disponible: agosto a noviembre de 2026, 8 sprints de dos semanas. | La velocidad objetivo es de 20 puntos por sprint; el backlog total de 173 puntos se ajusta a esa capacidad. |
| R-02 | Recursos técnicos gratuitos únicamente. | Toda decisión técnica debe caber en el nivel gratuito de Firebase y Vercel (RNF-10). Se descartan servicios cartográficos comerciales en favor de OpenStreetMap. |
| R-03 | Equipo de dos integrantes con dedicación de 12 horas semanales cada uno. | Capacidad aproximada de 48 horas por sprint. Exige backend como servicio en lugar de backend propio. |
| R-04 | Dependencia de servicios externos: Firebase, Vercel, Leaflet y OpenStreetMap. | El funcionamiento del prototipo queda sujeto a las condiciones técnicas y límites de dichas herramientas. |
| R-05 | La información registrada se usa con fines académicos y de validación. | La política de tratamiento de datos debe declararlo de forma expresa (RNF-06, HU-16). |
| R-06 | Las pruebas se realizan con usuarios de prueba y datos reales recogidos mediante instrumento aplicado en Santa Marta. | La muestra de usabilidad es intencional, de al menos ocho participantes distribuidos entre los cuatro roles. |

## 5. Registro de trabajo futuro

Toda funcionalidad identificada durante el desarrollo que quede fuera del alcance se
registra aquí y **no se incorpora a ningún sprint**.

| # | Funcionalidad propuesta | Fecha de identificación | Origen | Estado |
| --- | --- | --- | --- | --- |
| TF-01 | Deshacer la eliminación de una publicación: papelera o borrado lógico en lugar de definitivo. | 27/08/2026 | HU-23 | Registrada, fuera de sprint |
| TF-02 | Llevar los filtros del catálogo a la dirección, para poder compartir un catálogo ya filtrado y volver atrás con el botón del navegador. | 28/08/2026 | HU-26 | Registrada, fuera de sprint |

## 6. Constancia de aceptación

| Concepto | Valor |
| --- | --- |
| Versión del alcance | 1.0 |
| Fecha de cierre del Sprint 1 | 17/08/2026 |
| Revisado con el asesor | *(pendiente de registrar fecha y observaciones)* |

---

*Elaboración propia (2026).*
