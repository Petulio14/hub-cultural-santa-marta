/**
 * De una publicación guardada a los valores de su formulario — HU-23 · RF-06.
 *
 * Este archivo existe por un defecto que **no se vería en pantalla**. Al abrir
 * una publicación para editarla hay que convertir sus `Date` al texto que pide el
 * control «datetime-local», y la conversión ingenua —`toISOString()`— devuelve la
 * hora en UTC. En Santa Marta eso adelanta cinco horas.
 *
 * Lo que lo hace peligroso es que el formulario seguiría siendo coherente: las
 * dos fechas se moverían igual, así que ninguna validación protestaría. Quien
 * editara el título de su evento y guardara sin mirar el reloj movería su propio
 * evento cinco horas, una vez por edición.
 *
 * Los últimos casos corren **en otro proceso**, con la zona horaria de Santa
 * Marta, por lo mismo que en «fechas.test.js»: la integración continua corre en
 * UTC, donde una implementación correcta y una escrita con `toISOString()` dan
 * exactamente el mismo resultado.
 *
 *   npm run probar
 */
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PUBLICACION_VACIA,
  valoresDeFormulario,
} from '../../src/utils/publicaciones.js';

/** Una publicación tal y como la devuelve «eventosService». */
const GUARDADA = {
  id: 'pub-1',
  titulo: 'Taller de tambora',
  descripcion: 'Tres sesiones de introducción al toque de tambora.',
  categoria: 'musica-y-danza',
  fechaInicio: new Date(2026, 8, 1, 19, 0),
  fechaFin: new Date(2026, 8, 1, 22, 30),
  lugar: 'Casa de la Cultura, Santa Marta',
  punto: { lat: 11.2452, lon: -74.2145 },
  imagen: 'data:image/jpeg;base64,abc',
  estadoPublicacion: 'aprobado',
  contadorConsultas: 12,
};

describe('rellenar el formulario con lo guardado (HU-23)', () => {
  it('trae todos los campos que la persona escribió', () => {
    const valores = valoresDeFormulario(GUARDADA);
    assert.equal(valores.titulo, 'Taller de tambora');
    assert.equal(valores.categoria, 'musica-y-danza');
    assert.equal(valores.lugar, 'Casa de la Cultura, Santa Marta');
    assert.equal(valores.imagen, 'data:image/jpeg;base64,abc');
    assert.deepEqual(valores.punto, { lat: 11.2452, lon: -74.2145 });
  });

  it('y NO trae lo que el formulario no debe poder tocar', () => {
    // Si «estadoPublicacion» o «contadorConsultas» entraran en el formulario,
    // saldrían de vuelta en el guardado y la regla rechazaría la edición entera.
    const valores = valoresDeFormulario(GUARDADA);
    assert.deepEqual(Object.keys(valores).sort(), Object.keys(PUBLICACION_VACIA).sort());
  });

  it('sin publicación devuelve el formulario vacío, no un error', () => {
    assert.deepEqual(valoresDeFormulario(null), PUBLICACION_VACIA);
  });

  it('devuelve una copia: editar el formulario no toca el molde', () => {
    // Sin la copia, el primer formulario que se abriera dejaría lo escrito dentro
    // de PUBLICACION_VACIA y el siguiente nacería con ello.
    const valores = valoresDeFormulario(null);
    valores.titulo = 'algo';
    assert.equal(PUBLICACION_VACIA.titulo, '');
  });

  it('una publicación a medias no rompe nada', () => {
    const valores = valoresDeFormulario({ titulo: 'Suelta' });
    assert.equal(valores.titulo, 'Suelta');
    assert.equal(valores.descripcion, '');
    assert.equal(valores.fechaInicio, '');
    assert.equal(valores.punto, null);
  });

  it('las fechas salen con la forma exacta que pide el control', () => {
    const valores = valoresDeFormulario(GUARDADA);
    assert.match(valores.fechaInicio, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    assert.match(valores.fechaFin, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

/**
 * La comprobación que de verdad importa, en la zona horaria de Santa Marta.
 *
 * Con `toISOString().slice(0, 16)` estos dos casos darían «2026-09-02T00:00» y
 * «2026-09-02T03:30»: el evento de las siete de la tarde se abriría a editar como
 * si empezara a medianoche del día siguiente. En UTC los dos pasarían igual, que
 * es el motivo de ejecutarlos fuera.
 */
describe('editar en la zona horaria de Santa Marta (UTC−5)', () => {
  const modulo = new URL('../../src/utils/publicaciones.js', import.meta.url).href;

  const enBogota = (expresion) =>
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const p = await import(${JSON.stringify(modulo)});\n` +
          `process.stdout.write(String(${expresion}));`,
      ],
      { env: { ...process.env, TZ: 'America/Bogota' }, encoding: 'utf8' }
    );

  const publicacion =
    '{ fechaInicio: new Date(2026, 8, 1, 19, 0), fechaFin: new Date(2026, 8, 1, 22, 30) }';

  it('las siete de la tarde se abren a editar como las siete de la tarde', () => {
    assert.equal(
      enBogota(`p.valoresDeFormulario(${publicacion}).fechaInicio`),
      '2026-09-01T19:00'
    );
  });

  it('y la de fin tampoco salta de día', () => {
    assert.equal(
      enBogota(`p.valoresDeFormulario(${publicacion}).fechaFin`),
      '2026-09-01T22:30'
    );
  });
});
