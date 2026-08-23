# Convenciones del repositorio

Trabajo de grado de Ingeniería en Software, Tecnológico de Antioquia. La plataforma
cultural de Santa Marta. La documentación de cada historia vive en [`docs/`](docs/) y es
la evidencia que respalda su cierre en el tablero.

## Autoría

**Los commits y los pull request no llevan atribución a herramientas de asistencia.** Sin
`Co-Authored-By` de ningún asistente y sin pie de «Generated with…» en las descripciones.
Es un requisito del asesor: la autoría del trabajo académico es del estudiante.

## Commits

- Mensaje en español, en imperativo, explicando **por qué** y no solo qué.
- Prefijo `HU-nn:` cuando el cambio pertenece a una historia; `docs:` cuando solo toca
  documentación.
- Nunca directo sobre `master`: la rama está protegida y exige pull request con una
  aprobación.

## Pull request

El cuerpo lleva **`Closes #n`** por cada issue que la rama cierra, en inglés y **desde que
el pull request se abre**. Es lo que alimenta el campo «Linked pull requests» del tablero y
la sección *Development* del issue, que es por donde se llega al código desde la historia.

Dos límites comprobados y que no tienen vuelta atrás:

- «Cierra #n» en español no enlaza ni cierra nada.
- Editar el cuerpo **después de fusionar** tampoco crea el enlace: GitHub solo interpreta
  esas palabras mientras el pull request está abierto. Lo que se olvidó hay que enlazarlo a
  mano en el panel *Development* del issue.

Si la historia no debe cerrarse al fusionar porque falta comprobarla sobre el sitio
publicado, se pone `Closes #n` igualmente y se reabre el issue hasta terminar la
comprobación. Dejarlo para después cuesta el enlace.

## Trazabilidad

Los códigos `RF-nn`, `RNF-nn` y `HU-nn` son los mismos en los documentos de `docs/`, en
los issues del repositorio y en el trabajo escrito. Esa correspondencia es la base de la
matriz que exige HU-40, así que un cambio que introduzca un requisito nuevo tiene que
reflejarse en los tres sitios.

## La aplicación de React

Vive en la raíz: `src/`, `index.html`, `vite.config.js`. Antes de dar por buena una
modificación:

```bash
npm run verificar
```

Comprueba que ninguna vista importa el SDK de Firebase por su cuenta (la regla de
`docs/03-arquitectura.md` §3), que toda vista de `src/views/` está enrutada y que los
colores solo se escriben en `src/styles/variables.css`. Si una regla nueva hace falta, se
añade ahí y se comprueba que falla antes de darla por buena.

## Las reglas de seguridad

`firestore.rules` y `storage.rules` están en la raíz. Cualquier cambio se comprueba con:

```bash
npm run probar:reglas
```

Levanta el emulador de Firestore y ejecuta `pruebas/reglas/`. Cada prohibición nueva se
acompaña del permiso que sí debe concederse: una regla que lo deniegue todo también pasa las
pruebas de denegación.

Lo que no necesita emulador —validaciones y utilidades puras— vive en `pruebas/unidad/`:

```bash
npm run probar
```

Una función que decide si un dato es aceptable se escribe en `src/utils/` y se prueba ahí,
no dentro del componente que la usa.

## El plugin de Figma

`figma-plugin/code.js` no tiene dependencias ni paso de compilación. Antes de dar por
buena una modificación:

```bash
node figma-plugin/simular.js
```

Ejecuta el plugin completo contra una API de Figma simulada e imprime el mismo informe
que se vería dentro de Figma. Cuando aparezca un defecto que el simulador no reproduzca,
lo que hay que arreglar son dos cosas: el defecto y el simulador.
