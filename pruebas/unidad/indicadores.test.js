/**
 * Los cálculos de los indicadores de uso — HU-34.
 *
 *   npm run probar
 *
 * Lo que se fija aquí no es que sumar funcione: es lo que el panel promete y que
 * es fácil romper sin darse cuenta —que los contactos no se cuenten como
 * consultas, que dos publicaciones empatadas salgan siempre en el mismo orden, y
 * que una publicación borrada siga apareciendo con su cuenta—.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  conTitulo,
  contarPor,
  masConsultadas,
  ordenarCuenta,
  total,
} from '../../src/utils/indicadores.js';

const consulta = (idEvento) => ({ tipo: 'consulta', idEvento });
const contacto = (idEvento) => ({ tipo: 'contacto', idEvento });

describe('contarPor', () => {
  it('cuenta cuántas veces aparece cada valor', () => {
    const cuenta = contarPor(
      [{ estado: 'aprobado' }, { estado: 'pendiente' }, { estado: 'aprobado' }],
      'estado'
    );
    assert.deepEqual(cuenta, { aprobado: 2, pendiente: 1 });
  });

  it('sobre nada devuelve nada, no revienta', () => {
    assert.deepEqual(contarPor([], 'estado'), {});
    assert.deepEqual(contarPor(null, 'estado'), {});
    assert.deepEqual(contarPor(undefined, 'estado'), {});
  });

  /* Un registro sin la clave no es un grupo llamado «undefined»: es un registro
     que no se puede clasificar y no entra en la cuenta. */
  it('salta los registros a los que les falta la clave', () => {
    const cuenta = contarPor([{ estado: 'aprobado' }, {}, { estado: null }, { estado: '' }], 'estado');
    assert.deepEqual(cuenta, { aprobado: 1 });
  });
});

describe('masConsultadas', () => {
  it('ordena de más a menos consultada', () => {
    const filas = masConsultadas([
      consulta('ev-b'),
      consulta('ev-a'),
      consulta('ev-a'),
      consulta('ev-c'),
      consulta('ev-a'),
      consulta('ev-b'),
    ]);
    assert.deepEqual(filas, [
      { idEvento: 'ev-a', consultas: 3 },
      { idEvento: 'ev-b', consultas: 2 },
      { idEvento: 'ev-c', consultas: 1 },
    ]);
  });

  /* Las dos cosas viven en la misma colección y no son lo mismo. Una publicación
     con muchas consultas y ningún contacto dice algo distinto de una con pocas
     consultas y varios contactos; sumarlas borra justo esa diferencia. */
  it('NO cuenta los contactos como consultas', () => {
    const filas = masConsultadas([
      consulta('ev-a'),
      contacto('ev-a'),
      contacto('ev-a'),
      contacto('ev-b'),
    ]);
    assert.deepEqual(filas, [{ idEvento: 'ev-a', consultas: 1 }]);
  });

  it('una publicación con solo contactos no aparece', () => {
    assert.deepEqual(masConsultadas([contacto('ev-a'), contacto('ev-b')]), []);
  });

  /* Sin un desempate estable, dos publicaciones con la misma cuenta se
     intercambian entre dos recargas que no cambiaron nada, y una tabla que se
     reordena sola se lee como que el indicador no es de fiar. */
  it('desempata por identificador, no por el orden de llegada', () => {
    const unOrden = masConsultadas([consulta('ev-z'), consulta('ev-a')]);
    const elOtro = masConsultadas([consulta('ev-a'), consulta('ev-z')]);
    assert.deepEqual(unOrden, elOtro);
    assert.equal(unOrden[0].idEvento, 'ev-a');
  });

  it('respeta el tope que se le pida', () => {
    const muchas = ['a', 'b', 'c', 'd', 'e'].map(consulta);
    assert.equal(masConsultadas(muchas, 3).length, 3);
    assert.equal(masConsultadas(muchas, 0).length, 0);
    assert.equal(masConsultadas(muchas, -1).length, 0);
  });

  it('sobre nada devuelve una lista vacía', () => {
    assert.deepEqual(masConsultadas([]), []);
    assert.deepEqual(masConsultadas(null), []);
  });
});

describe('conTitulo', () => {
  const indice = {
    'ev-a': { titulo: 'Taller de tambora', categoria: 'musica' },
  };

  it('pega el título y la categoría de cada publicación', () => {
    const [fila] = conTitulo([{ idEvento: 'ev-a', consultas: 3 }], indice);
    assert.equal(fila.titulo, 'Taller de tambora');
    assert.equal(fila.categoria, 'musica');
    assert.equal(fila.consultas, 3);
  });

  /* HU-23 deja retirar una publicación y los registros de interacción no se
     borran con ella. Esconder la fila haría que el total del panel no cuadrara
     con la suma de lo que enseña. */
  it('conserva la fila de una publicación que ya no existe, sin título', () => {
    const [fila] = conTitulo([{ idEvento: 'ev-borrada', consultas: 7 }], indice);
    assert.equal(fila.titulo, null);
    assert.equal(fila.consultas, 7);
  });

  it('sin índice, ninguna fila se pierde', () => {
    assert.equal(conTitulo([{ idEvento: 'ev-a', consultas: 1 }], null).length, 1);
  });
});

describe('total', () => {
  it('suma una cuenta', () => {
    assert.equal(total({ aprobado: 2, pendiente: 1, devuelto: 0 }), 3);
  });

  it('sobre nada da cero', () => {
    assert.equal(total({}), 0);
    assert.equal(total(null), 0);
  });
});

describe('ordenarCuenta', () => {
  it('ordena de más a menos y traduce la clave', () => {
    const filas = ordenarCuenta({ musica: 5, danza: 9 }, { musica: 'Música', danza: 'Danza' });
    assert.deepEqual(filas.map((f) => f.etiqueta), ['Danza', 'Música']);
    assert.equal(filas[0].cantidad, 9);
  });

  /* Una categoría desactivada después de haber clasificado publicaciones sigue
     teniendo publicaciones que contar (docs/16 §3), y su nombre ya no está en la
     lista de las activas. Sale con su identificador: es feo y es cierto. */
  it('lo que no tiene nombre sale con su clave', () => {
    const [fila] = ordenarCuenta({ 'categoria-retirada': 2 }, {});
    assert.equal(fila.etiqueta, 'categoria-retirada');
  });

  it('empata por nombre, en español', () => {
    const filas = ordenarCuenta({ b: 1, a: 1, c: 1 }, { b: 'Ñandú', a: 'Náutica', c: 'Nube' });
    assert.deepEqual(filas.map((f) => f.etiqueta), ['Náutica', 'Nube', 'Ñandú']);
  });

  it('sobre nada devuelve una lista vacía', () => {
    assert.deepEqual(ordenarCuenta({}), []);
    assert.deepEqual(ordenarCuenta(null), []);
  });
});
