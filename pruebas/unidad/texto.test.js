/**
 * Normalización de texto — HU-17, y HU-27 cuando llegue la búsqueda.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { aIdentificador, aLineasDeTrabajo, normalizarTexto } from '../../src/utils/texto.js';

describe('normalizarTexto', () => {
  it('pasa a minúsculas y quita las tildes', () => {
    assert.equal(normalizarTexto('Música y Danza'), 'musica y danza');
  });

  it('conserva la eñe: «año» y «ano» no son la misma palabra', () => {
    assert.equal(normalizarTexto('Niñez'), 'niñez');
    assert.equal(normalizarTexto('AÑO'), 'año');
  });

  it('quita los espacios de los extremos', () => {
    assert.equal(normalizarTexto('  Patrimonio  '), 'patrimonio');
  });

  it('la diéresis también se va', () => {
    assert.equal(normalizarTexto('Bilingüe'), 'bilingue');
  });

  it('un valor ausente da cadena vacía y no revienta', () => {
    assert.equal(normalizarTexto(undefined), '');
    assert.equal(normalizarTexto(null), '');
  });
});

describe('aIdentificador', () => {
  it('convierte el nombre en un identificador legible', () => {
    assert.equal(aIdentificador('Música y danza'), 'musica-y-danza');
  });

  it('junta los espacios seguidos en un solo guion', () => {
    assert.equal(aIdentificador('Patrimonio    histórico'), 'patrimonio-historico');
  });

  it('los signos de puntuación se vuelven separadores', () => {
    assert.equal(aIdentificador('Teatro / circo'), 'teatro-circo');
    assert.equal(aIdentificador('Cine, video y fotografía'), 'cine-video-y-fotografia');
  });

  it('no deja guiones sueltos al principio ni al final', () => {
    assert.equal(aIdentificador('  ¡Fiestas!  '), 'fiestas');
  });

  it('dos nombres que solo difieren en tildes o mayúsculas dan el mismo identificador', () => {
    // Es lo que permite detectar el duplicado antes de sobrescribir la categoría
    // que ya existe: el identificador es la clave del documento.
    assert.equal(aIdentificador('Gastronomía'), aIdentificador('gastronomia'));
    assert.equal(aIdentificador('MÚSICA Y DANZA'), aIdentificador('Música y Danza'));
  });

  it('un nombre sin letras ni números da identificador vacío, y hay que detectarlo', () => {
    // Sin esta comprobación se intentaría crear un documento con identificador
    // vacío, que Firestore rechaza con un error incomprensible para quien lo ve.
    assert.equal(aIdentificador('///'), '');
    assert.equal(aIdentificador('   '), '');
  });
});

describe('líneas de trabajo de un hub (HU-20)', () => {
  it('separa por comas', () => {
    assert.deepEqual(aLineasDeTrabajo('emprendimiento, formación, TIC'), [
      'emprendimiento',
      'formación',
      'TIC',
    ]);
  });

  it('separa también por saltos de línea, porque las dos cosas se hacen sin pensar', () => {
    assert.deepEqual(aLineasDeTrabajo('emprendimiento\nformación'), [
      'emprendimiento',
      'formación',
    ]);
  });

  it('descarta las vacías: «a,,b» y «a, b» son la misma lista', () => {
    assert.deepEqual(aLineasDeTrabajo('a,,b'), ['a', 'b']);
    assert.deepEqual(aLineasDeTrabajo('  ,  '), []);
  });

  it('quita las repetidas sin distinguir mayúsculas ni tildes', () => {
    // «Formación» y «formacion» saldrían dos veces en el directorio, una al lado
    // de la otra, y parecería un fallo de quien las escribió.
    assert.deepEqual(aLineasDeTrabajo('Formación, formacion, FORMACIÓN'), ['Formación']);
  });

  it('de las repetidas conserva la primera TAL COMO se escribió', () => {
    // Normalizar para comparar es correcto; normalizar para mostrar convertiría
    // «TIC» en «tic».
    assert.deepEqual(aLineasDeTrabajo('TIC, tic'), ['TIC']);
  });

  it('colapsa los espacios de sobra dentro de una línea', () => {
    assert.deepEqual(aLineasDeTrabajo('economía   naranja'), ['economía naranja']);
  });

  it('sin texto no hay líneas', () => {
    assert.deepEqual(aLineasDeTrabajo(''), []);
    assert.deepEqual(aLineasDeTrabajo(null), []);
  });
});
