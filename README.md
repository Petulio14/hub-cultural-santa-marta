# hub-cultural-santa-marta

Plataforma web que conecta actores culturales, hubs de innovación y visitantes para visibilizar y geolocalizar la oferta cultural de Santa Marta. Trabajo de grado — Ingeniería en Software, Tecnológico de Antioquia.

**Prototipo publicado:** https://hub-cultural-santa-marta.vercel.app

## Contenido del repositorio

| Carpeta | Contenido |
| --- | --- |
| [`src/`](src/) | La aplicación de React: vistas, componentes, servicios, hooks, utilidades, rutas y estilos. |
| [`docs/`](docs/) | Requisitos, alcance del MVP, arquitectura, modelo de datos y especificación de la interfaz. Evidencia de cada sprint. |
| [`backlog/`](backlog/) | Las 40 historias de usuario y los scripts que las cargaron como issues y tablero de GitHub Projects. |
| [`figma-plugin/`](figma-plugin/) | Plugin que construye el prototipo dentro de Figma, con su banco de pruebas. |
| [`herramientas/`](herramientas/) | Verificaciones del repositorio, sin dependencias. |

## Cómo se ejecuta

Requiere Node.js 20 o superior.

```bash
npm install
```

```bash
npm run dev
```

Queda en `http://localhost:5173`. Arranca sin Firebase; para conectarlo, copia
`.env.example` como `.env.local` y sigue [`docs/06-puesta-en-marcha.md`](docs/06-puesta-en-marcha.md).

Antes de abrir un pull request:

```bash
npm run verificar
```

Comprueba que ninguna vista accede a Firebase por su cuenta, que toda vista está enrutada y
que los colores viven solo en la paleta. El detalle está en
[`docs/08-estructura-del-proyecto.md`](docs/08-estructura-del-proyecto.md).

Y si tocas las reglas de seguridad, las 21 pruebas contra el emulador (requiere Java):

```bash
npm run probar:reglas
```

## Stack

React · Firebase (Authentication, Cloud Firestore, Storage) · Leaflet sobre OpenStreetMap · Vercel

La arquitectura de cuatro capas y la justificación de cada decisión técnica están en
[`docs/03-arquitectura.md`](docs/03-arquitectura.md).

## Estado

Prototipo en construcción, 8 sprints entre agosto y noviembre de 2026. Sprints 1, 2 y 3
cerrados. El avance se sigue
en los [issues](https://github.com/Petulio14/hub-cultural-santa-marta/issues) y en el
tablero del proyecto.

## Equipo

Juan Pablo Vásquez y Sebastián Rojas.
