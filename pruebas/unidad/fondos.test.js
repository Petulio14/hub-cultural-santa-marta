/**
 * El fondo de cada vista.
 *
 *   npm run probar
 *
 * La función es un vistazo a un objeto con un valor por omisión, así que lo que
 * se comprueba aquí no es la búsqueda. Es otra cosa: que las dos excepciones
 * sean rutas que existen, que los archivos que se nombran estén de verdad en
 * «public/» y —lo que de verdad importa desde que hay un fondo por omisión— que
 * **ninguna ruta se quede sin fondo**. Una excepción mal escrita no rompe nada:
 * devuelve el fondo general y la vista se ve bien, solo con la imagen que no le
 * tocaba. Eso pasaría desapercibido hasta que alguien mirase la pantalla.
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';
import { FONDOS_PROPIOS, FONDO_GENERAL, fondoDeRuta } from '../../src/routes/fondos.js';

/** Las rutas públicas del enrutador (docs/08 §2). */
const RUTAS_PUBLICAS = [
  '/',
  '/eventos',
  '/eventos/abc',
  '/actores',
  '/actores/abc',
  '/hubs',
  '/mapa',
  '/ingreso',
  '/politica-de-datos',
];

/** Las privadas. Tienen fondo igual: lo pinta la disposición, no la vista. */
const RUTAS_PRIVADAS = ['/admin', '/mi-perfil', '/mi-hub', '/mis-publicaciones'];

describe('la tabla de fondos', () => {
  it('tiene dos excepciones, y son las dos vistas que retrata una imagen', () => {
    assert.deepEqual(Object.keys(FONDOS_PROPIOS), ['/actores', '/mapa']);
  });

  it('cada ruta que nombra es una ruta que existe', () => {
    for (const ruta of Object.keys(FONDOS_PROPIOS)) {
      assert.ok(RUTAS_PUBLICAS.includes(ruta), `${ruta} no es una ruta del enrutador`);
    }
  });

  it('cada archivo que nombra está en public/', () => {
    for (const [ruta, imagen] of [...Object.entries(FONDOS_PROPIOS), ['por omisión', FONDO_GENERAL]]) {
      assert.ok(imagen.startsWith('/'), `${ruta} apunta a ${imagen}, que no es absoluta`);
      assert.ok(existsSync(`public${imagen}`), `falta public${imagen}`);
    }
  });

  it('ninguna excepción repite el fondo general: sería una excepción que no cambia nada', () => {
    const imagenes = [FONDO_GENERAL, ...Object.values(FONDOS_PROPIOS)];
    assert.equal(new Set(imagenes).size, imagenes.length);
  });
});

describe('fondoDeRuta', () => {
  it('devuelve la imagen propia de las dos vistas que la tienen', () => {
    assert.equal(fondoDeRuta('/actores'), '/fondo-actores.jpg');
    assert.equal(fondoDeRuta('/mapa'), '/fondo-mapa.jpg');
  });

  it('ninguna ruta se queda sin fondo', () => {
    // Es el criterio de este cambio, y por eso se comprueba sobre la lista de
    // rutas y no sobre la tabla: la tabla ya no las nombra todas.
    for (const ruta of [...RUTAS_PUBLICAS, ...RUTAS_PRIVADAS]) {
      assert.ok(fondoDeRuta(ruta), `${ruta} se quedó sin fondo`);
    }
  });

  it('las demás vistas llevan el fondo general', () => {
    for (const ruta of [...RUTAS_PUBLICAS, ...RUTAS_PRIVADAS].filter((r) => !(r in FONDOS_PROPIOS))) {
      assert.equal(fondoDeRuta(ruta), FONDO_GENERAL, `${ruta} no lleva el fondo general`);
    }
  });

  it('una ruta inventada lleva el fondo general, como la página de no encontrada', () => {
    assert.equal(fondoDeRuta('/esto-no-existe'), FONDO_GENERAL);
  });

  it('la ficha de un actor no hereda el fondo del directorio', () => {
    // La coincidencia de las excepciones es exacta y no por prefijo. Con
    // prefijo, «/actores/abc» se llevaría la imagen de varios actores puesta
    // detrás de la portada de uno.
    assert.equal(fondoDeRuta('/actores/abc'), FONDO_GENERAL);
  });

  it('una barra final no cambia el fondo', () => {
    assert.equal(fondoDeRuta('/actores/'), '/fondo-actores.jpg');
    assert.equal(fondoDeRuta('/mapa/'), '/fondo-mapa.jpg');
  });

  it('la raíz sigue siendo la raíz', () => {
    // «/» es el único caso donde la barra final ES la ruta: recortarla dejaría
    // una cadena vacía, que tampoco es una excepción y también daría el general.
    assert.equal(fondoDeRuta('/'), FONDO_GENERAL);
  });

  it('lo que no es una ruta no revienta', () => {
    for (const valor of [null, undefined, 0, {}, []]) {
      assert.equal(fondoDeRuta(valor), null);
    }
  });
});
