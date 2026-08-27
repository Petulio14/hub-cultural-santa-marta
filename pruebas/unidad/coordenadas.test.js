/**
 * Coordenadas geográficas — HU-20 · RF-09.
 *
 * El rectángulo de Santa Marta es lo que más se prueba aquí, y no por gusto: es
 * la única defensa contra un resultado del buscador de direcciones que sea
 * perfectamente creíble y esté en otra ciudad.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CENTRO_SANTA_MARTA,
  LIMITES_SANTA_MARTA,
  esLatitudValida,
  esLongitudValida,
  esPuntoValido,
  estaEnSantaMarta,
  formatearCoordenada,
  textoDeCoordenadas,
} from '../../src/utils/coordenadas.js';

/** El centro histórico, tomado del buscador el 26/08/2026. */
const PARQUE_DE_LOS_NOVIOS = { lat: 11.24222, lon: -74.21331 };

describe('validez de una coordenada', () => {
  it('acepta las del planeta y rechaza las que se salen', () => {
    assert.equal(esLatitudValida(11.24), true);
    assert.equal(esLatitudValida(-90), true);
    assert.equal(esLatitudValida(90.1), false);
    assert.equal(esLongitudValida(-74.2), true);
    assert.equal(esLongitudValida(180.1), false);
  });

  it('un NaN no es una coordenada, aunque sea de tipo número', () => {
    // Es lo que devuelve «Number('once punto dos')», y sin esta comprobación
    // viajaría hasta Firestore como latitud.
    assert.equal(esLatitudValida(Number.NaN), false);
    assert.equal(esLongitudValida(Number.POSITIVE_INFINITY), false);
  });

  it('una cadena que parece un número tampoco', () => {
    assert.equal(esLatitudValida('11.24'), false);
  });

  it('un punto necesita las dos', () => {
    assert.equal(esPuntoValido(PARQUE_DE_LOS_NOVIOS), true);
    assert.equal(esPuntoValido({ lat: 11.24 }), false);
    assert.equal(esPuntoValido(null), false);
    assert.equal(esPuntoValido(undefined), false);
  });
});

describe('el rectángulo de Santa Marta', () => {
  it('acepta un punto del centro de la ciudad', () => {
    assert.equal(estaEnSantaMarta(PARQUE_DE_LOS_NOVIOS), true);
  });

  it('acepta la Quinta de San Pedro Alejandrino y la Universidad del Magdalena', () => {
    assert.equal(estaEnSantaMarta({ lat: 11.2281, lon: -74.17768 }), true);
    assert.equal(estaEnSantaMarta({ lat: 11.2241, lon: -74.1856 }), true);
  });

  it('rechaza Bogotá, que es lo que devolvería una búsqueda mal acotada', () => {
    assert.equal(estaEnSantaMarta({ lat: 4.711, lon: -74.0721 }), false);
  });

  it('rechaza Barranquilla, que está cerca y no es esto', () => {
    assert.equal(estaEnSantaMarta({ lat: 10.9685, lon: -74.7813 }), false);
  });

  it('rechaza el punto cero, que es el resultado de no haber encontrado nada', () => {
    assert.equal(estaEnSantaMarta({ lat: 0, lon: 0 }), false);
  });

  it('los bordes del rectángulo entran', () => {
    const l = LIMITES_SANTA_MARTA;
    assert.equal(estaEnSantaMarta({ lat: l.latMin, lon: l.lonMin }), true);
    assert.equal(estaEnSantaMarta({ lat: l.latMax, lon: l.lonMax }), true);
  });

  it('un pelo fuera del borde ya no', () => {
    const l = LIMITES_SANTA_MARTA;
    assert.equal(estaEnSantaMarta({ lat: l.latMax + 0.001, lon: l.lonMax }), false);
    assert.equal(estaEnSantaMarta({ lat: l.latMin, lon: l.lonMin - 0.001 }), false);
  });

  it('un punto inválido no está en ninguna parte', () => {
    assert.equal(estaEnSantaMarta(null), false);
    assert.equal(estaEnSantaMarta({ lat: Number.NaN, lon: -74.2 }), false);
  });
});

describe('cómo se escribe una coordenada', () => {
  it('cinco decimales, que es aproximadamente un metro', () => {
    assert.equal(formatearCoordenada(11.2422156), '11,24222');
  });

  it('con la coma decimal del español', () => {
    assert.match(formatearCoordenada(-74.21331), /^-74,21331$/);
  });

  it('completa los decimales que falten, para que dos puntos se comparen a ojo', () => {
    assert.equal(formatearCoordenada(11.2), '11,20000');
  });

  it('un valor que no es número no se escribe', () => {
    assert.equal(formatearCoordenada(undefined), '');
    assert.equal(formatearCoordenada(Number.NaN), '');
  });

  it('el punto entero se escribe con la coma que separa los dos números', () => {
    assert.equal(textoDeCoordenadas(PARQUE_DE_LOS_NOVIOS), '11,24222, -74,21331');
  });

  it('un punto que no existe no produce texto', () => {
    assert.equal(textoDeCoordenadas(null), '');
  });
});

/**
 * El centro del mapa — HU-22 · RF-08.
 *
 * Tres casos que parecen triviales y son los que sostienen que el mapa abra
 * donde debe. «MapaDePunto» abre en este punto y a la vez impide arrastrar fuera
 * del rectángulo: si el centro cayera fuera, Leaflet abriría peleándose consigo
 * mismo, corrigiendo la vista en el primer fotograma.
 */
describe('el centro del mapa (HU-22)', () => {
  it('cae dentro del rectángulo que acota el mapa', () => {
    assert.equal(estaEnSantaMarta(CENTRO_SANTA_MARTA), true);
  });

  it('no es el centro geométrico del rectángulo, que caería en la Sierra', () => {
    // Si alguien "corrige" el centro calculándolo del rectángulo, este caso lo
    // detiene y el comentario de coordenadas.js explica por qué está mal.
    const medioLat = (LIMITES_SANTA_MARTA.latMin + LIMITES_SANTA_MARTA.latMax) / 2;
    const medioLon = (LIMITES_SANTA_MARTA.lonMin + LIMITES_SANTA_MARTA.lonMax) / 2;
    assert.notEqual(CENTRO_SANTA_MARTA.lat, medioLat);
    assert.notEqual(CENTRO_SANTA_MARTA.lon, medioLon);
  });

  it('está en el mar Caribe por el norte y no al revés: longitud negativa', () => {
    // Colombia está al oeste de Greenwich. Una longitud positiva sería el error
    // de signo clásico, y colocaría Santa Marta en Somalia.
    assert.equal(CENTRO_SANTA_MARTA.lon < 0, true);
    assert.equal(CENTRO_SANTA_MARTA.lat > 0, true);
  });
});
