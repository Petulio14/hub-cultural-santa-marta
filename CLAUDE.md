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

## Trazabilidad

Los códigos `RF-nn`, `RNF-nn` y `HU-nn` son los mismos en los documentos de `docs/`, en
los issues del repositorio y en el trabajo escrito. Esa correspondencia es la base de la
matriz que exige HU-40, así que un cambio que introduzca un requisito nuevo tiene que
reflejarse en los tres sitios.

## El plugin de Figma

`figma-plugin/code.js` no tiene dependencias ni paso de compilación. Antes de dar por
buena una modificación:

```bash
node figma-plugin/simular.js
```

Ejecuta el plugin completo contra una API de Figma simulada e imprime el mismo informe
que se vería dentro de Figma. Cuando aparezca un defecto que el simulador no reproduzca,
lo que hay que arreglar son dos cosas: el defecto y el simulador.
