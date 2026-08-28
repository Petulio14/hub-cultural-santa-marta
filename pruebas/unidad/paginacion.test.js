/**
 * Carga progresiva del catálogo — HU-25, tercer criterio.
 *
 *   npm run probar
 *
 * Lo que se comprueba aquí es el uno de más. La consulta pide trece para enseñar
 * doce, y de esa resta salen los tres errores clásicos: enseñar trece, enseñar
 * once, o decir que hay más cuando lo que hay es exactamente el borde.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TAMANO_DE_PAGINA, anadirPagina, partirPagina } from '../../src/utils/paginacion.js';

/** «n» elementos con identificador propio, que es lo único que se mira. */
const elementos = (n, prefijo = 'e') =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefijo}-${i}` }));

describe('el tamaño de página', () => {
  it('es el doce del tercer criterio de aceptación', () => {
    assert.equal(TAMANO_DE_PAGINA, 12);
  });

  it('es divisible por las tres cuentas de columnas de la rejilla', () => {
    // 360 px una columna, 768 px dos, 1366 px tres (docs/10 §2). Ninguna página
    // termina en una fila coja.
    for (const columnas of [1, 2, 3]) {
      assert.equal(TAMANO_DE_PAGINA % columnas, 0);
    }
  });
});

describe('partirPagina', () => {
  it('con trece leídos enseña doce y avisa de que hay más', () => {
    const { pagina, hayMas } = partirPagina(elementos(13));
    assert.equal(pagina.length, 12);
    assert.equal(hayMas, true);
  });

  it('con doce exactos enseña doce y NO dice que haya más', () => {
    // El borde: doce es «un catálogo de doce», no «más de doce». Decir que hay
    // más aquí pintaría un botón que al pulsarlo no trae nada.
    const { pagina, hayMas } = partirPagina(elementos(12));
    assert.equal(pagina.length, 12);
    assert.equal(hayMas, false);
  });

  it('con menos de doce los enseña todos', () => {
    const { pagina, hayMas } = partirPagina(elementos(5));
    assert.equal(pagina.length, 5);
    assert.equal(hayMas, false);
  });

  it('sin nada leído devuelve la lista vacía, no un hueco', () => {
    const { pagina, hayMas } = partirPagina([]);
    assert.deepEqual(pagina, []);
    assert.equal(hayMas, false);
  });

  it('el de más se descarta: no viaja escondido en la página', () => {
    const trece = elementos(13);
    const { pagina } = partirPagina(trece);
    assert.equal(pagina.at(-1).id, 'e-11');
    assert.equal(
      pagina.some((elemento) => elemento.id === 'e-12'),
      false
    );
  });

  it('el tamaño se puede cambiar, y la cuenta lo sigue', () => {
    const { pagina, hayMas } = partirPagina(elementos(4), 3);
    assert.equal(pagina.length, 3);
    assert.equal(hayMas, true);
  });
});

describe('anadirPagina', () => {
  it('encadena la página siguiente detrás de la anterior', () => {
    const juntos = anadirPagina(elementos(2, 'a'), elementos(2, 'b'));
    assert.deepEqual(
      juntos.map((elemento) => elemento.id),
      ['a-0', 'a-1', 'b-0', 'b-1']
    );
  });

  it('descarta lo que ya estaba, aunque llegue otra vez', () => {
    // Pasa de verdad: si entre una página y la siguiente se aprueba una
    // publicación que cae antes del cursor, la segunda consulta la repite.
    const juntos = anadirPagina(elementos(3), [{ id: 'e-1' }, { id: 'nuevo' }]);
    assert.deepEqual(
      juntos.map((elemento) => elemento.id),
      ['e-0', 'e-1', 'e-2', 'nuevo']
    );
  });

  it('de una repetida gana la que ya estaba delante de la persona', () => {
    const antes = [{ id: 'e-0', titulo: 'lo que se está leyendo' }];
    const [conservada] = anadirPagina(antes, [{ id: 'e-0', titulo: 'lo mismo, releído' }]);
    assert.equal(conservada.titulo, 'lo que se está leyendo');
  });

  it('una página vacía deja la lista como estaba', () => {
    const antes = elementos(3);
    assert.deepEqual(anadirPagina(antes, []), antes);
  });
});
