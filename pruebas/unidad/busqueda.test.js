/**
 * La búsqueda por palabra clave — HU-27 · RF-10.
 *
 *   npm run probar
 *
 * El tercer criterio —«con o sin tildes y en mayúsculas o minúsculas, el
 * resultado debe ser equivalente»— es de los pocos que se puede demostrar
 * entero con funciones puras, y aquí está demostrado en las dos direcciones:
 * escribiendo con tilde lo que está guardado sin ella y al revés.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TOPE_DE_BUSQUEDA,
  coincide,
  filtrarPorTermino,
  palabrasDe,
} from '../../src/utils/busqueda.js';
import { TAMANO_DE_PAGINA } from '../../src/utils/paginacion.js';
import { normalizarTexto } from '../../src/utils/texto.js';

/**
 * Como las devuelve «aPublicacion»: el título ya normalizado y la descripción no.
 *
 * Se usa el «normalizarTexto» de verdad y no una copia escrita a mano, porque es
 * literalmente lo que «camposEditables» guarda en el documento. Una copia se
 * separaría del original a la primera corrección y estas pruebas seguirían en
 * verde midiendo otra cosa.
 */
const publicacion = (titulo, descripcion) => ({
  titulo,
  tituloNormalizado: normalizarTexto(titulo),
  descripcion,
});

const CATALOGO = [
  publicacion('Taller de tambora', 'Tres sesiones de percusión afrocaribeña para principiantes.'),
  publicacion('Noche de gaitas', 'Música tradicional del Magdalena en la plaza.'),
  publicacion('Muestra de artesanía wayú', 'Tejido en telar de cintura y mochilas.'),
  publicacion('CUMBIA EN EL MALECÓN', 'Baile abierto al atardecer.'),
];

const titulos = (publicaciones) => publicaciones.map((p) => p.titulo);

describe('palabrasDe', () => {
  it('parte el término en palabras normalizadas', () => {
    assert.deepEqual(palabrasDe('Taller de Tambora'), ['taller', 'de', 'tambora']);
  });

  it('los espacios de sobra no crean palabras vacías', () => {
    assert.deepEqual(palabrasDe('  cumbia   tambora  '), ['cumbia', 'tambora']);
  });

  it('sin término no hay palabras', () => {
    assert.deepEqual(palabrasDe(''), []);
    assert.deepEqual(palabrasDe('   '), []);
    assert.deepEqual(palabrasDe(undefined), []);
  });
});

describe('el tercer criterio: tildes y mayúsculas', () => {
  it('escribir sin tilde encuentra lo que la tiene', () => {
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'percusion')), [
      'Taller de tambora',
    ]);
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'malecon')), [
      'CUMBIA EN EL MALECÓN',
    ]);
  });

  it('y escribirla con tilde encuentra lo mismo', () => {
    // La equivalencia tiene que valer en las dos direcciones: normalizar solo el
    // dato guardado dejaría fuera a quien escribe correctamente.
    assert.deepEqual(
      titulos(filtrarPorTermino(CATALOGO, 'percusión')),
      titulos(filtrarPorTermino(CATALOGO, 'percusion'))
    );
  });

  it('mayúsculas y minúsculas dan lo mismo', () => {
    assert.deepEqual(
      titulos(filtrarPorTermino(CATALOGO, 'cumbia')),
      titulos(filtrarPorTermino(CATALOGO, 'CUMBIA'))
    );
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'cumbia')), [
      'CUMBIA EN EL MALECÓN',
    ]);
  });

  it('la eñe sigue siendo una letra distinta', () => {
    // «wayú» y «wayu» sí son la misma búsqueda; «artesanía» y «artesania»
    // también. Pero la eñe no se descompone: es la promesa de normalizarTexto.
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'artesania')), [
      'Muestra de artesanía wayú',
    ]);
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'año')), []);
  });
});

describe('el primer criterio: título o descripción', () => {
  it('encuentra por el título', () => {
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'gaitas')), ['Noche de gaitas']);
  });

  it('y encuentra por la descripción, que es donde se dice de qué va', () => {
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'mochilas')), [
      'Muestra de artesanía wayú',
    ]);
  });

  it('encuentra en medio de una palabra, no solo al principio', () => {
    // Es lo que descarta la consulta por prefijo que Firestore sí sabría hacer:
    // «tambora» está en medio del título, y «bora» dentro de la palabra.
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'bora')), ['Taller de tambora']);
  });

  it('lo que no está en ninguno de los dos no sale', () => {
    assert.deepEqual(filtrarPorTermino(CATALOGO, 'ajedrez'), []);
  });
});

describe('varias palabras acotan, no amplían', () => {
  it('las dos palabras tienen que estar', () => {
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'taller percusion')), [
      'Taller de tambora',
    ]);
  });

  it('si una de las dos falta, no coincide', () => {
    assert.deepEqual(filtrarPorTermino(CATALOGO, 'taller gaitas'), []);
  });

  it('las palabras pueden estar separadas y en otro orden', () => {
    // Es la razón de buscar por palabras y no por la cadena entera: «taller
    // tambora» no es una subcadena de «Taller de tambora» y sí es lo que quien
    // lo escribe está buscando.
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'tambora taller')), [
      'Taller de tambora',
    ]);
  });

  it('una en el título y la otra en la descripción también vale', () => {
    assert.deepEqual(titulos(filtrarPorTermino(CATALOGO, 'gaitas magdalena')), [
      'Noche de gaitas',
    ]);
  });
});

describe('sin término no se filtra nada', () => {
  it('la lista entera, tal cual', () => {
    assert.equal(filtrarPorTermino(CATALOGO, '').length, CATALOGO.length);
    assert.equal(filtrarPorTermino(CATALOGO, '   ').length, CATALOGO.length);
  });

  it('«coincide» sin palabras dice que sí', () => {
    assert.equal(coincide(CATALOGO[0], []), true);
  });
});

describe('el tope de la búsqueda', () => {
  it('son doscientas, muy por encima de una página del catálogo', () => {
    // Cuando hay término la paginación no se usa —se pide todo de una vez—, así
    // que el tope no tiene que casar con el tamaño de página. Lo que sí tiene
    // que ser es bastante mayor, o la búsqueda se quedaría corta antes que el
    // recorrido a mano, que sería lo contrario de lo que se busca.
    assert.equal(TOPE_DE_BUSQUEDA, 200);
    assert.equal(TOPE_DE_BUSQUEDA > TAMANO_DE_PAGINA * 10, true);
  });
});

describe('un documento al que le falte algo no revienta la búsqueda', () => {
  it('sin «tituloNormalizado» se normaliza el título al vuelo', () => {
    // Los documentos anteriores a HU-21 no lo tienen. Es poco probable y sale
    // gratis contemplarlo; lo contrario es una página en blanco.
    const suelto = { titulo: 'Cumbia y Tambora', tituloNormalizado: '', descripcion: '' };
    assert.equal(coincide(suelto, palabrasDe('cumbia')), true);
  });

  it('sin descripción tampoco', () => {
    const suelto = { titulo: 'Gaitas', tituloNormalizado: 'gaitas', descripcion: null };
    assert.equal(coincide(suelto, palabrasDe('gaitas')), true);
    assert.equal(coincide(suelto, palabrasDe('cumbia')), false);
  });
});
