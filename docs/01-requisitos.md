# Especificación de requisitos del sistema

> **Historia de usuario:** HU-01 · Sprint 1
> **Objetivo específico:** 1 — Levantar y documentar los requisitos del sistema.
> **Fuente:** Trabajo de grado, *Desarrollo del Primer Objetivo*, tablas 22, 23 y 24.

Este documento es la fuente única de verdad de los requisitos del prototipo. Los códigos
`RF-nn` y `RNF-nn` se conservan sin cambios a lo largo de las historias de usuario, los
casos de prueba y la matriz de trazabilidad, de modo que sea posible verificar su
cumplimiento al cierre del proyecto.

---

## 1. Limitaciones del modelo turístico y su traducción en requisitos

La revisión documental del contexto identificó tres limitaciones estructurales del modelo
turístico de Santa Marta. Cada una está asociada al menos a un requisito, condición
exigida por el primer criterio de aceptación de HU-01.

| # | Limitación identificada | Evidencia | Decisión de alcance | Requisitos asociados |
| --- | --- | --- | --- | --- |
| L-1 | Concentración de la demanda en pocas semanas del año. | Ocupación hotelera promedio del 56 % en 2024, frente a niveles cercanos al 100 % en diciembre. | Incorporar filtros por fecha y por categoría que permitan visibilizar oferta distribuida durante todo el año. | RF-05, RF-07, RF-10 |
| L-2 | Especialización de la oferta formal en el modelo de sol y playa. | 7.771 prestadores registrados en el Magdalena, orientados mayoritariamente a alojamiento, alimentación y transporte. | Hacer del **actor cultural** —y no del prestador formal— el sujeto principal del sistema. | RF-01, RF-03, RF-04, RF-06 |
| L-3 | Ausencia de un canal digital que conecte la oferta cultural con la demanda. | El 71 % de los visitantes planifica su viaje en línea. | Definir el producto como plataforma pública de descubrimiento y contacto, no como sistema transaccional. | RF-09, RF-11, RF-12 |

## 2. Actores, necesidades y requisitos derivados

| Actor | Necesidad identificada | Requisitos derivados |
| --- | --- | --- |
| Actor cultural | Disponer de un espacio propio donde describir su manifestación y publicar sus experiencias sin depender de un intermediario comercial. | RF-03, RF-05, RF-06, RF-07 |
| Hub de innovación | Hacer visibles sus iniciativas y ser localizable por actores culturales y entidades del ecosistema. | RF-04, RF-09, RF-11 |
| Administrador | Garantizar la calidad y la pertinencia de la información publicada, y conocer el uso de la plataforma. | RF-13, RF-14, RF-15 |
| Turista o visitante | Descubrir qué oferta cultural existe, dónde está y cómo acceder a ella durante su estancia. | RF-09, RF-10, RF-11, RF-12 |

## 3. Catálogo de requisitos funcionales

Cada requisito tiene código único, redacción verificable y prioridad asignada.

| Código | Requisito funcional | Prioridad | Historias que lo implementan |
| --- | --- | --- | --- |
| RF-01 | El sistema debe permitir el registro de usuarios con asignación de un rol diferenciado: actor cultural, hub de innovación, administrador o turista. | Alta | HU-12, HU-15 |
| RF-02 | El sistema debe permitir el inicio de sesión, el cierre de sesión y la recuperación de la contraseña. | Alta | HU-13, HU-14 |
| RF-03 | El sistema debe permitir al actor cultural crear y editar su perfil, incluyendo la manifestación o práctica que representa. | Alta | HU-18, HU-19 |
| RF-04 | El sistema debe permitir al hub de innovación crear y editar su perfil y sus líneas de trabajo. | Alta | HU-20 |
| RF-05 | El sistema debe permitir publicar eventos y experiencias culturales con título, descripción, categoría, fecha, lugar e imagen. | Alta | HU-21 |
| RF-06 | El sistema debe permitir al autor de una publicación editarla o eliminarla, e impedir que un usuario modifique publicaciones de terceros. | Alta | HU-18, HU-23 |
| RF-07 | El sistema debe permitir asociar cada publicación a una categoría cultural definida por el administrador. | Alta | HU-17, HU-21 |
| RF-08 | El sistema debe permitir georreferenciar cada publicación mediante coordenadas geográficas. | Alta | HU-22 |
| RF-09 | El sistema debe presentar públicamente el catálogo de eventos, actores culturales y hubs aprobados. | Alta | HU-09, HU-20, HU-25, HU-28 |
| RF-10 | El sistema debe permitir filtrar el catálogo por categoría cultural y por rango de fechas, y buscar por palabra clave. | Alta | HU-26, HU-27, HU-30 |
| RF-11 | El sistema debe representar la oferta cultural sobre un mapa interactivo mediante marcadores seleccionables. | Alta | HU-28, HU-30 |
| RF-12 | El sistema debe permitir al visitante contactar directamente al actor cultural responsable de una publicación. | Alta | HU-29 |
| RF-13 | El sistema debe permitir al administrador aprobar o devolver con observaciones cada publicación antes de su visibilidad pública. | Alta | HU-24 |
| RF-14 | El sistema debe permitir al administrador gestionar las categorías culturales y el estado de las cuentas de usuario. | Media | HU-17 |
| RF-15 | El sistema debe registrar y presentar indicadores básicos de uso: publicaciones por categoría, publicaciones aprobadas y consultas por evento. | Media | HU-29, HU-34 |

## 4. Catálogo de requisitos no funcionales

Cada requisito no funcional cuenta con un criterio de verificación medible.

| Código | Requisito no funcional | Criterio de verificación | Historias que lo implementan |
| --- | --- | --- | --- |
| RNF-01 | La interfaz debe resultar comprensible y operable para usuarios sin formación técnica. | Puntaje promedio igual o superior a **68** en la escala System Usability Scale. | HU-31, HU-36, HU-38, HU-40 |
| RNF-02 | El sistema debe funcionar en los navegadores de mayor uso. | Ejecución correcta en las versiones vigentes de Chrome, Edge, Firefox y Safari. | HU-35 |
| RNF-03 | El sistema debe adaptarse a distintos tamaños de pantalla. | Visualización correcta en anchos de **360, 768 y 1366 píxeles**. | HU-10, HU-33 |
| RNF-04 | El tiempo de carga inicial debe ser razonable en conexiones móviles. | Carga de la vista principal en **menos de tres segundos** en conexión 4G. | HU-09, HU-25 |
| RNF-05 | Las credenciales de acceso deben gestionarse de forma segura. | Autenticación delegada en Firebase Authentication; **ninguna contraseña almacenada** en la base de datos del proyecto. | HU-11, HU-12 |
| RNF-06 | El tratamiento de datos personales debe cumplir la normativa colombiana. | Política de tratamiento publicada, consentimiento explícito en el registro y recolección limitada a los datos necesarios, conforme a la Ley 1581 de 2012. | HU-16, HU-34 |
| RNF-07 | El sistema debe atender criterios básicos de accesibilidad. | Cumplimiento de las pautas WCAG 2.1 en contraste de color, navegación por teclado y textos alternativos de las imágenes. | HU-06, HU-32 |
| RNF-08 | El acceso a los datos debe restringirse según el rol del usuario. | Reglas de seguridad de Cloud Firestore que impiden la lectura o escritura no autorizada, verificadas mediante pruebas. | HU-08, HU-11, HU-15, HU-35 |
| RNF-09 | El sistema debe ser mantenible y evolucionable. | Arquitectura modular por capas y código versionado en un repositorio con historial de cambios. | HU-04, HU-07, HU-08, HU-39 |
| RNF-10 | El sistema debe operar dentro de los recursos gratuitos disponibles. | Consumo dentro de los límites del nivel gratuito de Firebase y Vercel durante el periodo de validación. | HU-40 |

## 5. Cobertura

- **15** requisitos funcionales y **10** no funcionales.
- Todo RF y todo RNF tiene al menos una historia de usuario que lo implementa.
- Toda limitación identificada (L-1 a L-3) está asociada al menos a un requisito.

---

*Elaboración propia (2026). Documento aprobado por el asesor como condición de cierre del Sprint 1.*

Validación HU-01: Juan Pablo
Se revisa el documento de requisitos y se evidencia la relación de las limitaciones con los requisitos. También se encuentran definidos los 15 requisitos funcionales y los 10 requisitos no funcionales con sus respectivos criterios de verificación.  
Los primeros tres criterios se encuentran cumplidos.