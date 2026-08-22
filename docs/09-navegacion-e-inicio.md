# Navegación y página de inicio

> **Historia de usuario:** HU-09 · Sprint 3
> **Objetivo específico:** 2 — Desarrollar los módulos del prototipo funcional.
> **Requisito asociado:** RF-09 (navegación clara desde la página de inicio).
> **Depende de:** [HU-06 · prototipo](05-prototipo-interfaz.md) y [HU-07 · estructura](08-estructura-del-proyecto.md).

Traslada a React la vista **V-1 · Inicio** del prototipo y la estructura de navegación
común a todas las vistas. La adaptación a los tres anchos es HU-10.

---

## 1. Los cuatro accesos principales

Eventos, actores culturales, hubs y mapa. Aparecen en dos sitios —el menú de la cabecera y
la sección «Cuatro formas de empezar» del inicio— y se leen de **una sola lista**,
`src/routes/accesos.js`. Si mañana se añade un quinto acceso o cambia un nombre, no puede
quedar distinto en un sitio y en el otro.

| Acceso | Ruta | Qué ofrece |
| --- | --- | --- |
| Eventos | `/eventos` | Qué pasa y cuándo |
| Actores culturales | `/actores` | Quién está detrás |
| Hubs | `/hubs` | Espacios de innovación |
| Mapa | `/mapa` | Qué hay cerca de ti |

La vista activa se señala en el menú con fondo y **subrayado**: el color no puede ser el
único portador de la información (WCAG 2.1, criterio 1.4.1, y HU-32).

## 2. La página de inicio

Reproduce V-1 de la [maqueta navegable](prototipo/index.html):

- **Propósito de la plataforma**, en el bloque de entrada: qué es, quién publica y que no
  hace falta registrarse para consultar. Es la primera mitad del primer criterio de
  aceptación.
- **Dos acciones de arranque**: ver la oferta cultural (visitante) y «soy actor cultural»
  (quien viene a publicar).
- **Los cuatro accesos**, en tarjetas.

Las tarjetas se disponen en una rejilla de **1 columna a 360 px, 2 a 768 y 4 en
escritorio**, con la misma separación entre filas que entre columnas, y **todas las de una
misma fila miden lo mismo de alto**. Los dos son defectos que aparecieron en el prototipo
de HU-06 y que el asesor señaló; en CSS se resuelven con la rejilla, que estira cada
elemento a la altura de su fila. La verificación en los tres anchos es HU-10.

## 3. Regreso al inicio desde cualquier vista

El tercer criterio de aceptación pide que ese camino exista **siempre** y sea visible. Hay
dos permanentes, y no uno, porque en una vista larga la cabecera queda fuera de la pantalla:

1. **La marca de la cabecera**, arriba a la izquierda, con el logotipo institucional.
2. **«Volver al inicio»**, en el pie.

Recorriendo las once direcciones del enrutador se comprueba que ninguna queda sin salida:

```
/                    → /                    | 3 salidas al inicio | 8 ms | Inicio
/eventos             → /eventos             | 3 salidas al inicio | 5 ms | Catálogo de eventos
/eventos/abc         → /eventos/abc         | 3 salidas al inicio | 5 ms | Detalle del evento
/actores             → /actores             | 3 salidas al inicio | 5 ms | Actores culturales
/actores/abc         → /actores/abc         | 3 salidas al inicio | 6 ms | Perfil del actor cultural
/hubs                → /hubs                | 3 salidas al inicio | 6 ms | Directorio de hubs
/mapa                → /mapa                | 3 salidas al inicio | 5 ms | Mapa
/ingreso             → /ingreso             | 3 salidas al inicio | 5 ms | Ingreso y registro
/admin               → /ingreso             | 3 salidas al inicio | 6 ms | Ingreso y registro
/mis-publicaciones   → /ingreso             | 3 salidas al inicio | 5 ms | Ingreso y registro
/no-existe           → /no-existe           | 3 salidas al inicio | 5 ms | Página no encontrada
```

Solo se cuentan los enlaces **visibles**: los que no están ocultos en el momento de la
medición. Las dos rutas privadas redirigen a `/ingreso` porque todavía no existe la
autenticación (HU-12), y esa redirección también termina en una vista con salida.

## 4. Tiempo de cambio de vista

El segundo criterio de aceptación fija **menos de dos segundos**. Medido sobre las once
rutas: entre **5 y 8 milisegundos**, tres órdenes de magnitud por debajo del límite.

No es mérito de la optimización sino de la decisión de arquitectura: al ser una aplicación
de página única, cambiar de vista no pide nada al servidor, solo intercambia el componente
montado. El límite volverá a estar en juego cuando las vistas consulten datos —ahí el
tiempo lo pondrá Firestore, no el enrutador—, y por eso HU-25 y siguientes vuelven a
medirlo.

## 5. Hallazgo: falta la puerta de entrada a los actores culturales

Al trasladar los cuatro accesos al código apareció un hueco del que el prototipo no se
percató. El acceso «actores culturales» necesita una **vista de índice** —el listado desde
el que se llega a un perfil—, pero el inventario de vistas de
[`05-prototipo-interfaz.md` §2](05-prototipo-interfaz.md) solo especifica **V-4 · Perfil de
actor cultural**, que es la ficha de *uno*. En la maqueta el acceso salta directamente al
perfil de un actor de ejemplo, cosa que en la aplicación real no es posible: no hay ningún
actor «por omisión».

Lo mismo ocurre en el backlog: **ninguna de las 40 historias cubre el listado de actores**.
HU-18 es la creación y edición del perfil propio, y HU-20 es el directorio, pero solo de
hubs.

Queda `/actores` enrutada con su marcador, para que el acceso de la página de inicio no
lleve a un callejón. **Es una decisión pendiente del equipo**, y afecta a la trazabilidad:

- añadir un criterio de aceptación a **HU-18** que cubra el listado público de actores, o
- abrir una historia nueva —sería HU-41— y reflejarla en los issues y en el Anexo A.

## 6. Nota de trabajo: la página en blanco de Vite

Durante el desarrollo la aplicación arrancó en blanco con el error
`does not provide an export named 'default'` sobre un componente que sí exportaba por
omisión. La causa no estaba en el código: el servidor de desarrollo había cacheado el
archivo **vacío**, capturado en el instante en que el editor lo truncaba para reescribirlo.
Se comprueba pidiendo el módulo al servidor —`curl http://localhost:5173/src/...`— y viendo
que devuelve una respuesta vacía. **Se resuelve reiniciando `npm run dev`**, y conviene
descartarlo antes de buscar el fallo en el componente.

## 7. Cierre de HU-09

| Criterio de aceptación | Evidencia |
| --- | --- |
| La página de inicio presenta el **propósito** de la plataforma y los **cuatro accesos** principales. | Secciones 1 y 2. Los accesos se leen de una única lista compartida con el menú. |
| Seleccionar una opción del menú conduce a su vista **en menos de dos segundos**. | Sección 4: entre 5 y 8 ms en las once rutas. |
| Desde cualquier vista interna existe **siempre una forma visible de regresar al inicio**. | Sección 3: dos salidas permanentes, comprobadas en las once rutas. |

Queda para HU-10 la adaptación a 360, 768 y 1366 px, incluido el menú compacto, y para
HU-25 el bloque de eventos próximos de la maqueta, que necesita datos reales.

---

*Elaboración propia (2026).*
