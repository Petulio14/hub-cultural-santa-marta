/**
 * El sello de versión — HU-37 · RNF-08.
 *
 * El tercer criterio de aceptación de HU-37 pide que la versión desplegada
 * **se pueda contrastar con el repositorio**. Eso no se comprueba ejecutando
 * nada: se comprueba abriendo el sitio publicado y comparando lo que dice el
 * pie con lo que señala la etiqueta.
 *
 * Lo que sí se puede comprobar aquí es que **el sello siga existiendo**. Son
 * tres piezas en tres archivos distintos —la versión en «package.json», los dos
 * literales en «vite.config.js» y el pie que los enseña— y basta con que una se
 * caiga en una refactorización para que el sitio deje de decir de dónde salió,
 * sin que nada falle ni se vea raro. Esta prueba es lo que hace ruido entonces.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), 'utf8');

describe('el sello de versión (HU-37)', () => {
  it('el paquete declara una versión publicable', () => {
    const { version } = JSON.parse(leer('../../package.json'));
    const partes = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    assert.ok(partes, `«${version}» no tiene la forma mayor.menor.parche`);
    // Mayor 0 significa «todavía no publicado», que es justo lo contrario de lo
    // que afirma esta historia. La etiqueta del repositorio es esta misma
    // versión con una «v» delante.
    assert.ok(Number(partes[1]) >= 1, `la versión final no puede ser ${version}`);
  });

  it('la compilación escribe la versión y el commit en el paquete', () => {
    const config = leer('../../vite.config.js');
    assert.match(config, /__VERSION__:/, 'la compilación ya no sella la versión');
    assert.match(config, /__COMMIT__:/, 'la compilación ya no sella el commit');
    // Sin esta variable el commit se resolvería preguntando a git, y en Vercel
    // no hay repositorio al que preguntar: diría «sin-git» en el único sitio
    // donde el dato sirve para algo.
    assert.match(config, /VERCEL_GIT_COMMIT_SHA/, 'en Vercel el commit saldría vacío');
  });

  it('y el pie los enseña, que es donde se leen', () => {
    const pie = leer('../../src/components/PieDePagina.jsx');
    assert.match(pie, /__VERSION__/, 'el pie ya no dice la versión');
    assert.match(pie, /__COMMIT__/, 'el pie ya no dice la compilación');
  });
});
