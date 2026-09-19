/**
 * El fondo de cada vista.
 *
 *   npm run probar
 *
 * La tabla es corta y la función es un vistazo a un objeto, así que lo que se
 * comprueba aquí no es la búsqueda: es que las tres rutas con fondo sean rutas
 * que existen, que ninguna otra se lleve uno por accidente y que los archivos
 * que se nombran estén de verdad en «public/». Una ruta mal escrita aquí no
 * rompe nada —devuelve null y la vista se queda con su color— y por eso pasaría
 * desapercibida hasta que alguien mirase la pantalla.
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { describe, it } from 'node:test';
import { FONDOS, fondoDeRuta } from '../../src/routes/fondos.js';

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

describe('la tabla de fondos', () => {
  it('nombra tres vistas, las tres del prototipo', () => {
    assert.deepEqual(Object.keys(FONDOS), ['/', '/actores', '/mapa']);
  });

  it('cada ruta que nombra es una ruta que existe', () => {
    for (const ruta of Object.keys(FONDOS)) {
      assert.ok(RUTAS_PUBLICAS.includes(ruta), `${ruta} no es una ruta del enrutador`);
    }
  });

  it('cada archivo que nombra está en public/', () => {
    for (const [ruta, imagen] of Object.entries(FONDOS)) {
      assert.ok(imagen.startsWith('/'), `${ruta} apunta a ${imagen}, que no es absoluta`);
      assert.ok(existsSync(`public${imagen}`), `falta public${imagen}`);
    }
  });

  it('ninguna imagen se repite en dos vistas', () => {
    const imagenes = Object.values(FONDOS);
    assert.equal(new Set(imagenes).size, imagenes.length);
  });
});

describe('fondoDeRuta', () => {
  it('devuelve la imagen de las tres vistas que la tienen', () => {
    assert.equal(fondoDeRuta('/'), '/fondo-inicio.jpg');
    assert.equal(fondoDeRuta('/actores'), '/fondo-actores.jpg');
    assert.equal(fondoDeRuta('/mapa'), '/fondo-mapa.jpg');
  });

  it('devuelve null en todas las demás rutas públicas', () => {
    for (const ruta of RUTAS_PUBLICAS.filter((r) => !(r in FONDOS))) {
      assert.equal(fondoDeRuta(ruta), null, `${ruta} no debería tener fondo`);
    }
  });

  it('la ficha de un actor no hereda el fondo del directorio', () => {
    // La coincidencia es exacta y no por prefijo. Con prefijo, «/actores/abc»
    // se llevaría el fondo de «/actores» y quedaría detrás de la portada del
    // actor: dos fotos apiladas.
    assert.equal(fondoDeRuta('/actores/abc'), null);
  });

  it('una barra final no cambia el fondo', () => {
    assert.equal(fondoDeRuta('/actores/'), '/fondo-actores.jpg');
    assert.equal(fondoDeRuta('/mapa/'), '/fondo-mapa.jpg');
  });

  it('la raíz sigue siendo la raíz', () => {
    // «/» es el único caso donde la barra final ES la ruta: recortarla dejaría
    // una cadena vacía que no está en la tabla.
    assert.equal(fondoDeRuta('/'), '/fondo-inicio.jpg');
  });

  it('lo que no es una ruta no revienta', () => {
    for (const valor of [null, undefined, 0, {}, []]) {
      assert.equal(fondoDeRuta(valor), null);
    }
  });
});
