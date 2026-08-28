/**
 * Los filtros del catálogo — HU-26 · RF-10.
 *
 *   npm run probar
 *
 * Lo que se comprueba aquí es la **traducción**: de tres campos de formulario a
 * los dos límites y la categoría que entiende la consulta. Ninguna de las tres
 * decisiones que hace esa traducción se ve en pantalla, y las tres cambian qué
 * publicaciones salen.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FILTROS_VACIOS,
  hayFiltros,
  limitesDeConsulta,
  rangoInvertido,
} from '../../src/utils/filtros.js';

/** Un instante fijo, para que los casos no dependan de cuándo se ejecuten. */
const AHORA = new Date(2026, 7, 28, 12, 0);

const con = (cambios) => ({ ...FILTROS_VACIOS, ...cambios });

describe('hayFiltros', () => {
  it('sin nada escrito, no hay filtros', () => {
    assert.equal(hayFiltros(FILTROS_VACIOS), false);
  });

  it('basta uno de los tres', () => {
    assert.equal(hayFiltros(con({ categoria: 'musica' })), true);
    assert.equal(hayFiltros(con({ desde: '2026-09-01' })), true);
    assert.equal(hayFiltros(con({ hasta: '2026-09-05' })), true);
  });

  it('un valor ausente no cuenta como filtro', () => {
    assert.equal(hayFiltros(undefined), false);
  });
});

describe('rangoInvertido', () => {
  it('del 5 al 1 está del revés', () => {
    assert.equal(rangoInvertido(con({ desde: '2026-09-05', hasta: '2026-09-01' })), true);
  });

  it('del 1 al 5 no lo está', () => {
    assert.equal(rangoInvertido(con({ desde: '2026-09-01', hasta: '2026-09-05' })), false);
  });

  it('un solo día, de sí mismo a sí mismo, es un rango válido', () => {
    // Es el caso de quien pasa un día en la ciudad, y sale a menudo.
    assert.equal(rangoInvertido(con({ desde: '2026-09-01', hasta: '2026-09-01' })), false);
  });

  it('con un extremo sin escribir no hay nada que invertir', () => {
    assert.equal(rangoInvertido(con({ desde: '2026-09-05' })), false);
    assert.equal(rangoInvertido(con({ hasta: '2026-09-01' })), false);
    assert.equal(rangoInvertido(FILTROS_VACIOS), false);
  });
});

describe('limitesDeConsulta', () => {
  it('sin filtros, el catálogo parte de ahora y no tiene tope', () => {
    const { categoria, desde, hasta } = limitesDeConsulta(FILTROS_VACIOS, AHORA);
    assert.equal(categoria, null);
    assert.equal(desde.getTime(), AHORA.getTime());
    assert.equal(hasta, null);
  });

  it('la categoría vacía viaja como null, no como cadena', () => {
    // El servicio decide con ella si la consulta lleva un «where» más, y una
    // cadena vacía es un valor que Firestore buscaría.
    assert.equal(limitesDeConsulta(con({ categoria: '' }), AHORA).categoria, null);
    assert.equal(limitesDeConsulta(con({ categoria: 'musica' }), AHORA).categoria, 'musica');
  });

  it('un día de partida futuro sí mueve el punto de partida', () => {
    const { desde } = limitesDeConsulta(con({ desde: '2026-09-01' }), AHORA);
    assert.equal(desde.getDate(), 1);
    assert.equal(desde.getMonth(), 8);
    assert.equal(desde.getHours(), 0);
  });

  it('un día de partida pasado NO reabre lo que ya terminó', () => {
    // Primera decisión: se toma el más tardío de los dos. Pedir «desde enero»
    // no puede devolver al catálogo lo que el catálogo excluye por definición.
    const { desde } = limitesDeConsulta(con({ desde: '2020-01-01' }), AHORA);
    assert.equal(desde.getTime(), AHORA.getTime());
  });

  it('el día de llegada se estira hasta su último instante', () => {
    // Segunda decisión. Con las 00:00 del día 5, una actividad de las 18:00 de
    // ese mismo día quedaría fuera del rango que se pidió para incluirla.
    const { hasta } = limitesDeConsulta(con({ hasta: '2026-09-05' }), AHORA);
    assert.equal(hasta.getDate(), 5);
    assert.equal(hasta.getHours(), 23);
    assert.equal(hasta.getMinutes(), 59);
  });

  it('sin día de llegada, no hay tope: es lo que distingue una desigualdad de dos', () => {
    assert.equal(limitesDeConsulta(con({ desde: '2026-09-01' }), AHORA).hasta, null);
  });

  it('una fecha mal escrita se ignora en lugar de tumbar la consulta', () => {
    const { desde, hasta } = limitesDeConsulta(
      con({ desde: 'el mes que viene', hasta: '2026-02-31' }),
      AHORA
    );
    assert.equal(desde.getTime(), AHORA.getTime());
    assert.equal(hasta, null);
  });

  it('los tres a la vez se combinan (tercer criterio)', () => {
    const limites = limitesDeConsulta(
      con({ categoria: 'artesania', desde: '2026-09-01', hasta: '2026-09-05' }),
      AHORA
    );
    assert.equal(limites.categoria, 'artesania');
    assert.equal(limites.desde.getDate(), 1);
    assert.equal(limites.hasta.getDate(), 5);
  });
});
