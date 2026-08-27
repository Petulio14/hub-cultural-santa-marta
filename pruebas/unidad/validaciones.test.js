/**
 * Validación de los formularios — HU-12, HU-13, HU-16, HU-17, HU-18, HU-20, HU-21.
 *
 * No necesitan emulador ni navegador porque lo que comprueban son funciones
 * puras. Es la razón de que la validación viva en «src/utils» y no dentro de la
 * vista: así los criterios de aceptación se ejecutan, en lugar de repasarse a
 * mano en la pantalla cada vez que alguien toca el formulario.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  LONGITUD_MAXIMA_CATEGORIA,
  LONGITUD_MAXIMA_DESCRIPCION_ACTOR,
  LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION,
  LONGITUD_MAXIMA_DIRECCION,
  LONGITUD_MAXIMA_LINEA,
  LONGITUD_MAXIMA_MANIFESTACION,
  LONGITUD_MAXIMA_NOMBRE_ACTOR,
  LONGITUD_MAXIMA_TITULO,
  LONGITUD_MINIMA_CONTRASENA,
  LONGITUD_MINIMA_DESCRIPCION_ACTOR,
  LONGITUD_MINIMA_DESCRIPCION_PUBLICACION,
  LONGITUD_MINIMA_TITULO,
  MAXIMO_LINEAS_DE_TRABAJO,
  hayErrores,
  validarCategoria,
  validarConsentimiento,
  validarContacto,
  validarDescripcionDeActor,
  validarIngreso,
  validarPerfilDeActor,
  validarPerfilDeHub,
  validarPeriodo,
  LONGITUD_MAXIMA_OBSERVACION,
  LONGITUD_MINIMA_OBSERVACION,
  validarObservacion,
  validarPublicacion,
  validarPuntoDePublicacion,
  validarRecuperacion,
  validarRegistro,
  validarTelefono,
} from '../../src/utils/validaciones.js';

/** Registro correcto del que parten las variantes: se cambia solo lo que se prueba. */
const REGISTRO_VALIDO = {
  nombre: 'Colectivo de tambora',
  correo: 'tambora@ejemplo.co',
  contrasena: 'cumbia2026',
  confirmacion: 'cumbia2026',
  consentimiento: true,
};

const registro = (cambios) => validarRegistro({ ...REGISTRO_VALIDO, ...cambios });

describe('registro · correo y contraseña (HU-12, primer criterio)', () => {
  it('un correo válido con contraseña de ocho caracteres o más se acepta', () => {
    assert.equal(hayErrores(registro({})), false);
  });

  it('acepta exactamente la longitud mínima, que es el borde del criterio', () => {
    const justa = 'a'.repeat(LONGITUD_MINIMA_CONTRASENA);
    assert.equal(hayErrores(registro({ contrasena: justa, confirmacion: justa })), false);
  });

  it('rechaza un carácter por debajo de la longitud mínima', () => {
    const corta = 'a'.repeat(LONGITUD_MINIMA_CONTRASENA - 1);
    const errores = registro({ contrasena: corta, confirmacion: corta });
    assert.ok(errores.contrasena.includes('ocho') || errores.contrasena.includes('8'));
  });

  it('rechaza un correo sin arroba', () => {
    assert.ok(registro({ correo: 'tambora.ejemplo.co' }).correo);
  });

  it('rechaza un correo sin dominio', () => {
    assert.ok(registro({ correo: 'tambora@' }).correo);
  });

  it('rechaza un correo con espacios', () => {
    assert.ok(registro({ correo: 'tam bora@ejemplo.co' }).correo);
  });

  it('acepta un correo con punto y guion en el nombre', () => {
    assert.equal(registro({ correo: 'casa-de.la-cultura@santamarta.gov.co' }).correo, undefined);
  });

  it('las dos contraseñas deben coincidir', () => {
    assert.ok(registro({ confirmacion: 'otra-distinta' }).confirmacion);
  });
});

describe('registro · campos obligatorios (HU-12, tercer criterio)', () => {
  it('el formulario vacío señala los cinco campos, no solo el primero', () => {
    const errores = validarRegistro({
      nombre: '',
      correo: '',
      contrasena: '',
      confirmacion: '',
      consentimiento: false,
    });
    assert.deepEqual(Object.keys(errores).sort(), [
      'confirmacion',
      'consentimiento',
      'contrasena',
      'correo',
      'nombre',
    ]);
  });

  it('un nombre de solo espacios cuenta como vacío', () => {
    assert.ok(registro({ nombre: '   ' }).nombre);
  });

  it('cada mensaje dice qué campo falta y qué hacer', () => {
    const errores = validarRegistro({
      nombre: '',
      correo: '',
      contrasena: '',
      confirmacion: '',
      consentimiento: false,
    });
    for (const mensaje of Object.values(errores)) {
      assert.ok(mensaje.length > 15, `mensaje demasiado escueto: «${mensaje}»`);
      assert.ok(/[.:]$/.test(mensaje), `mensaje sin puntuación final: «${mensaje}»`);
    }
  });
});

describe('consentimiento · sin aceptación no hay registro (HU-16, segundo criterio)', () => {
  it('la casilla sin marcar bloquea el registro', () => {
    assert.ok(registro({ consentimiento: false }).consentimiento);
  });

  it('el mensaje nombra la política de tratamiento de datos', () => {
    assert.match(validarConsentimiento(false), /política de tratamiento de datos/);
  });

  it('marcada, deja pasar', () => {
    assert.equal(validarConsentimiento(true), null);
  });

  it('un valor que no sea verdadero no cuenta como aceptación', () => {
    // Una casilla que llegara como cadena «false» o como undefined no debe
    // interpretarse como un sí: la ley exige consentimiento expreso.
    for (const valor of [undefined, null, 'false', 0, 1, 'true']) {
      assert.ok(validarConsentimiento(valor), `aceptó indebidamente el valor ${String(valor)}`);
    }
  });
});

describe('ingreso · qué se valida al entrar (HU-13)', () => {
  it('correo y contraseña presentes bastan', () => {
    assert.equal(
      hayErrores(validarIngreso({ correo: 'tambora@ejemplo.co', contrasena: 'x' })),
      false
    );
  });

  it('no se exige longitud mínima al entrar: delataría la regla sin evitar nada', () => {
    assert.equal(validarIngreso({ correo: 'tambora@ejemplo.co', contrasena: 'abc' }).contrasena, undefined);
  });

  it('la contraseña vacía sí se bloquea antes de llamar al servidor', () => {
    assert.ok(validarIngreso({ correo: 'tambora@ejemplo.co', contrasena: '' }).contrasena);
  });

  it('un correo mal formado se bloquea antes de llamar al servidor', () => {
    assert.ok(validarIngreso({ correo: 'sin-arroba', contrasena: 'cumbia2026' }).correo);
  });
});

describe('recuperación de contraseña (HU-14)', () => {
  it('solo se pide el correo', () => {
    assert.equal(hayErrores(validarRecuperacion({ correo: 'tambora@ejemplo.co' })), false);
  });

  it('el correo vacío se bloquea', () => {
    assert.ok(validarRecuperacion({ correo: '' }).correo);
  });
});

describe('categorías culturales (HU-17)', () => {
  const existentes = ['musica-y-danza', 'gastronomia'];

  it('un nombre nuevo se acepta', () => {
    assert.equal(hayErrores(validarCategoria({ nombre: 'Artesanía y oficios' }, existentes)), false);
  });

  it('el nombre vacío se bloquea', () => {
    assert.ok(validarCategoria({ nombre: '   ' }, existentes).nombre);
  });

  it('un nombre demasiado corto se bloquea', () => {
    assert.ok(validarCategoria({ nombre: 'Ok' }, existentes).nombre);
  });

  it('un nombre que no cabe en un filtro se bloquea', () => {
    const largo = 'a'.repeat(LONGITUD_MAXIMA_CATEGORIA + 1);
    assert.ok(validarCategoria({ nombre: largo }, existentes).nombre);
  });

  it('acepta exactamente la longitud máxima', () => {
    const justo = 'a'.repeat(LONGITUD_MAXIMA_CATEGORIA);
    assert.equal(validarCategoria({ nombre: justo }, existentes).nombre, undefined);
  });

  it('detecta el duplicado aunque cambien las tildes y las mayúsculas', () => {
    // «MUSICA Y DANZA» produce el mismo identificador que la existente, y crear
    // la categoría sobrescribiría la que ya clasifica publicaciones.
    assert.ok(validarCategoria({ nombre: 'MUSICA Y DANZA' }, existentes).nombre);
    assert.ok(validarCategoria({ nombre: 'Gastronomía' }, existentes).nombre);
  });

  it('un nombre sin letras ni números se bloquea antes de llegar al servidor', () => {
    assert.ok(validarCategoria({ nombre: '///' }, existentes).nombre);
  });

  it('sin categorías previas, cualquier nombre válido pasa', () => {
    assert.equal(hayErrores(validarCategoria({ nombre: 'Patrimonio' })), false);
  });
});

/* ---------------------------------------------------------------- HU-18 --- */

/** Perfil correcto del que parten las variantes: se cambia solo lo que se prueba. */
const PERFIL_VALIDO = {
  nombre: 'Colectivo Tambora del Magdalena',
  manifestacion: 'Tambora y cantos de vaquería',
  descripcion:
    'Somos ocho músicos de Santa Marta que sostienen la tambora tradicional del Magdalena Grande. Tocamos en fiestas patronales y damos talleres a niñas y niños del barrio.',
  categoria: 'musica-y-danza',
  contacto: { telefono: '3001234567', correo: '', whatsapp: '' },
};

const OFRECIDAS = ['musica-y-danza', 'gastronomia', 'artesania'];

const perfil = (cambios) => validarPerfilDeActor({ ...PERFIL_VALIDO, ...cambios }, OFRECIDAS);

describe('perfil de actor · formulario completo (HU-18, primer criterio)', () => {
  it('un perfil con nombre, manifestación, descripción, categoría y contacto se acepta', () => {
    assert.equal(hayErrores(perfil({})), false);
  });

  it('sin nombre no se guarda', () => {
    assert.ok(perfil({ nombre: '   ' }).nombre);
  });

  it('sin manifestación no se guarda: es lo que distingue a un actor de otro', () => {
    assert.ok(perfil({ manifestacion: '' }).manifestacion);
  });

  it('sin categoría no se guarda: sin ella el perfil no entra en ningún filtro', () => {
    assert.ok(perfil({ categoria: '' }).categoria);
  });

  it('devuelve todos los campos que fallan de una vez, no solo el primero', () => {
    const errores = perfil({ nombre: '', manifestacion: '', categoria: '' });
    assert.deepEqual(Object.keys(errores).sort(), ['categoria', 'manifestacion', 'nombre']);
  });

  it('una categoría que el administrador ya no ofrece se rechaza', () => {
    // Se desactivó entre que se cargó el formulario y se pulsó «Guardar»: el
    // identificador sigue siendo válido, pero ya no está en la lista (HU-17).
    assert.ok(perfil({ categoria: 'teatro-callejero' }).categoria);
  });

  it('sin lista de categorías ofrecidas no se inventa un rechazo', () => {
    // El formulario puede validarse antes de que llegue el catálogo. Si aquí se
    // rechazara, el primer envío fallaría siempre por una lista vacía.
    assert.equal(validarPerfilDeActor(PERFIL_VALIDO, []).categoria, undefined);
  });

  it('el nombre no puede pasar del tope de la tarjeta del directorio', () => {
    assert.ok(perfil({ nombre: 'a'.repeat(LONGITUD_MAXIMA_NOMBRE_ACTOR + 1) }).nombre);
    assert.equal(perfil({ nombre: 'a'.repeat(LONGITUD_MAXIMA_NOMBRE_ACTOR) }).nombre, undefined);
  });

  it('la manifestación no puede pasar de su tope', () => {
    assert.ok(
      perfil({ manifestacion: 'a'.repeat(LONGITUD_MAXIMA_MANIFESTACION + 1) }).manifestacion
    );
  });
});

describe('perfil de actor · límite de la descripción (HU-18, tercer criterio)', () => {
  it('acepta exactamente el máximo, que es el borde del criterio', () => {
    const justo = 'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_ACTOR);
    assert.equal(validarDescripcionDeActor(justo), null);
  });

  it('un carácter de más se advierte, y el aviso dice cuántos sobran', () => {
    const excedido = 'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_ACTOR + 1);
    assert.match(validarDescripcionDeActor(excedido), /sobra 1 carácter/);
  });

  it('el aviso concuerda en plural cuando sobra más de uno', () => {
    const excedido = 'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_ACTOR + 7);
    assert.match(validarDescripcionDeActor(excedido), /sobran 7 caracteres/);
  });

  it('el tope es el mismo que imponen las reglas de seguridad', () => {
    // firestore.rules exige «descripcion.size() <= 1000» en actoresCulturales.
    // Si este número deja de coincidir, el formulario aceptaría un texto que el
    // servidor rechaza, y el error llegaría sin campo al que señalar.
    const reglas = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
    const tope = `descripcion.size() <= ${LONGITUD_MAXIMA_DESCRIPCION_ACTOR}`;
    assert.ok(reglas.includes(tope), `firestore.rules ya no exige «${tope}»`);
  });

  it('una descripción demasiado corta no dice nada de la propuesta', () => {
    assert.ok(validarDescripcionDeActor('a'.repeat(LONGITUD_MINIMA_DESCRIPCION_ACTOR - 1)));
  });

  it('los espacios de los extremos no cuentan para el límite', () => {
    const justo = `   ${'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_ACTOR)}   `;
    assert.equal(validarDescripcionDeActor(justo), null);
  });
});

describe('perfil de actor · canales de contacto (RF-12)', () => {
  it('basta con uno de los tres', () => {
    assert.equal(hayErrores(validarContacto({ correo: 'tambora@ejemplo.co' })), false);
    assert.equal(hayErrores(validarContacto({ whatsapp: '3001234567' })), false);
  });

  it('ninguno de los tres se bloquea: el perfil quedaría incontactable', () => {
    assert.ok(validarContacto({ telefono: '', correo: '', whatsapp: '' }).contacto);
    assert.ok(validarContacto({}).contacto);
  });

  it('un correo mal escrito se señala aunque haya otro canal correcto', () => {
    const errores = validarContacto({ telefono: '3001234567', correo: 'esto-no-es-un-correo' });
    assert.ok(errores.correo);
    assert.equal(errores.contacto, undefined);
  });

  it('los errores del contacto llegan al formulario con su prefijo', () => {
    const errores = perfil({ contacto: { telefono: '12', correo: '', whatsapp: '' } });
    assert.ok(errores['contacto.telefono']);
  });
});

describe('perfil de actor · teléfono (HU-18)', () => {
  it('acepta un móvil colombiano', () => {
    assert.equal(validarTelefono('3001234567'), null);
  });

  it('acepta el mismo número escrito como lo escribe la gente', () => {
    assert.equal(validarTelefono('+57 300 123 4567'), null);
    assert.equal(validarTelefono('(605) 421-0000'), null);
  });

  it('acepta un fijo de Santa Marta con su indicativo', () => {
    assert.equal(validarTelefono('6054210000'), null);
  });

  it('rechaza lo que no llega a siete dígitos', () => {
    assert.ok(validarTelefono('12345'));
  });

  it('vacío es válido mientras no sea obligatorio: hay otros dos canales', () => {
    assert.equal(validarTelefono(''), null);
    assert.ok(validarTelefono('', { obligatorio: true }));
  });
});

/* ---------------------------------------------------------------- HU-20 --- */

const HUB_VALIDO = {
  nombre: 'Hub Caribe de Innovación',
  descripcion:
    'Un espacio abierto en el centro histórico donde se forman y se encuentran quienes trabajan en cultura, tecnología y economía creativa en Santa Marta.',
  lineasDeTrabajo: ['emprendimiento', 'economía naranja', 'formación'],
  direccion: 'Calle 22 # 1-40, Santa Marta',
  punto: { lat: 11.24222, lon: -74.21331 },
  contacto: { telefono: '', whatsapp: '', correo: 'hub@ejemplo.co' },
};

const hub = (cambios) => validarPerfilDeHub({ ...HUB_VALIDO, ...cambios });

describe('hub de innovación · formulario completo (HU-20, primer criterio)', () => {
  it('un hub con todo lo que pide el criterio se acepta', () => {
    assert.equal(hayErrores(hub({})), false);
  });

  it('sin nombre, sin descripción o sin dirección no se guarda', () => {
    assert.ok(hub({ nombre: '' }).nombre);
    assert.ok(hub({ descripcion: '' }).descripcion);
    assert.ok(hub({ direccion: '' }).direccion);
  });

  it('una dirección demasiado corta para encontrar el sitio se bloquea', () => {
    assert.ok(hub({ direccion: 'Cra' }).direccion);
  });

  it('la dirección no puede pasar de su tope', () => {
    assert.ok(hub({ direccion: 'a'.repeat(LONGITUD_MAXIMA_DIRECCION + 1) }).direccion);
    assert.equal(hub({ direccion: 'a'.repeat(LONGITUD_MAXIMA_DIRECCION) }).direccion, undefined);
  });
});

describe('hub · líneas de trabajo', () => {
  it('al menos una', () => {
    assert.ok(hub({ lineasDeTrabajo: [] }).lineasDeTrabajo);
    assert.equal(hub({ lineasDeTrabajo: ['TIC'] }).lineasDeTrabajo, undefined);
  });

  it('no más de las que caben en una tarjeta, y el aviso dice cuántas hay', () => {
    const demasiadas = Array.from({ length: MAXIMO_LINEAS_DE_TRABAJO + 1 }, (_, i) => `l${i}`);
    const mensaje = hub({ lineasDeTrabajo: demasiadas }).lineasDeTrabajo;
    assert.match(mensaje, new RegExp(`${demasiadas.length}`));
  });

  it('acepta exactamente el máximo', () => {
    const justas = Array.from({ length: MAXIMO_LINEAS_DE_TRABAJO }, (_, i) => `l${i}`);
    assert.equal(hub({ lineasDeTrabajo: justas }).lineasDeTrabajo, undefined);
  });

  it('cada línea es una etiqueta, no una frase', () => {
    assert.ok(hub({ lineasDeTrabajo: ['a'.repeat(LONGITUD_MAXIMA_LINEA + 1)] }).lineasDeTrabajo);
  });

  it('lo que no sea un arreglo se trata como lista vacía', () => {
    assert.ok(hub({ lineasDeTrabajo: 'emprendimiento' }).lineasDeTrabajo);
    assert.ok(hub({ lineasDeTrabajo: undefined }).lineasDeTrabajo);
  });
});

describe('hub · el punto en el mapa (HU-20, tercer criterio)', () => {
  it('sin punto confirmado no se guarda', () => {
    // El criterio pide que un hub guardado tenga coordenadas. Como el buscador
    // de direcciones falla con la nomenclatura colombiana, la única forma de
    // cumplirlo sin inventar puntos es exigir que alguien confirme uno.
    assert.match(hub({ punto: null }).punto, /no puede aparecer en el mapa/);
  });

  it('un punto fuera de Santa Marta se rechaza y dice qué hacer', () => {
    // Bogotá: es lo que devuelve una búsqueda de «Calle 22» mal acotada.
    const mensaje = hub({ punto: { lat: 4.711, lon: -74.0721 } }).punto;
    assert.match(mensaje, /fuera de Santa Marta/);
    assert.match(mensaje, /referencia cercano/);
  });

  it('un punto con coordenadas imposibles se rechaza', () => {
    assert.ok(hub({ punto: { lat: 999, lon: -74.2 } }).punto);
  });

  it('el punto del Parque de los Novios se acepta', () => {
    assert.equal(hub({ punto: { lat: 11.24222, lon: -74.21331 } }).punto, undefined);
  });
});

describe('hub · contacto (RF-12)', () => {
  it('reutiliza la regla del perfil de actor: basta con uno de los tres', () => {
    assert.equal(hayErrores(hub({ contacto: { telefono: '3001234567' } })), false);
  });

  it('sin ninguno se bloquea', () => {
    assert.ok(hub({ contacto: {} }).contacto);
  });
});
// ── La publicación de un evento · HU-21 · RF-05, RF-07 ──────────────────────

/** Publicación correcta de la que parten las variantes. */
const PUBLICACION_VALIDA = {
  titulo: 'Taller de tambora para principiantes',
  descripcion:
    'Tres sesiones de introducción al toque de tambora, con instrumentos prestados. No hace falta experiencia previa.',
  categoria: 'musica-y-danza',
  fechaInicio: new Date(2026, 8, 1, 18, 0),
  fechaFin: new Date(2026, 8, 1, 21, 0),
  lugar: 'Casa de la Cultura, Santa Marta',
};

const CATEGORIAS = ['musica-y-danza', 'artes-visuales'];

const publicacion = (cambios = {}) =>
  validarPublicacion({ ...PUBLICACION_VALIDA, ...cambios }, CATEGORIAS);

describe('publicación · el formulario completo (HU-21, primer criterio)', () => {
  it('una publicación bien puesta no tiene errores', () => {
    assert.equal(hayErrores(publicacion()), false);
  });

  it('sin categoría del catálogo no se guarda', () => {
    assert.ok(publicacion({ categoria: 'inventada' }).categoria);
  });

  it('sin lugar no se guarda: nadie sabría adónde ir', () => {
    assert.ok(publicacion({ lugar: '   ' }).lugar);
  });
});

describe('publicación · el título', () => {
  it('vacío se rechaza', () => {
    assert.ok(publicacion({ titulo: '' }).titulo);
  });

  it('un título de una palabra corta no dice de qué se trata', () => {
    assert.ok(publicacion({ titulo: 'Hoy' }).titulo);
  });

  it('acepta exactamente el mínimo', () => {
    assert.equal(publicacion({ titulo: 'a'.repeat(LONGITUD_MINIMA_TITULO) }).titulo, undefined);
  });

  it('acepta exactamente el máximo y rechaza uno más', () => {
    assert.equal(publicacion({ titulo: 'a'.repeat(LONGITUD_MAXIMA_TITULO) }).titulo, undefined);
    assert.ok(publicacion({ titulo: 'a'.repeat(LONGITUD_MAXIMA_TITULO + 1) }).titulo);
  });

  it('los espacios de los extremos no cuentan como título', () => {
    assert.ok(publicacion({ titulo: '          ' }).titulo);
  });
});

describe('publicación · la descripción', () => {
  it('demasiado corta no explica la propuesta', () => {
    assert.ok(publicacion({ descripcion: 'Un taller.' }).descripcion);
  });

  it('acepta exactamente el mínimo', () => {
    assert.equal(
      publicacion({ descripcion: 'a'.repeat(LONGITUD_MINIMA_DESCRIPCION_PUBLICACION) })
        .descripcion,
      undefined
    );
  });

  it('el aviso de exceso dice cuánto sobra', () => {
    const mensaje = publicacion({
      descripcion: 'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION + 16),
    }).descripcion;
    assert.match(mensaje, /sobran 16 caracteres/);
  });

  it('cuando sobra uno solo, el mensaje va en singular', () => {
    const mensaje = publicacion({
      descripcion: 'a'.repeat(LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION + 1),
    }).descripcion;
    assert.match(mensaje, /sobra 1 carácter/);
  });

  it('es más larga que la de un actor: no son el mismo texto', () => {
    assert.ok(LONGITUD_MAXIMA_DESCRIPCION_PUBLICACION > LONGITUD_MAXIMA_DESCRIPCION_ACTOR);
  });
});

describe('publicación · las dos fechas (HU-21, segundo criterio)', () => {
  it('terminar antes de empezar bloquea el envío', () => {
    const errores = publicacion({ fechaFin: new Date(2026, 8, 1, 17, 0) });
    assert.ok(errores.fechaFin);
    assert.equal(hayErrores(errores), true);
  });

  it('el mensaje explica qué pasa, no dice «fecha inválida»', () => {
    const mensaje = publicacion({ fechaFin: new Date(2026, 8, 1, 17, 0) }).fechaFin;
    assert.match(mensaje, /anterior a la de inicio/);
    assert.match(mensaje, /terminar antes de empezar/);
  });

  it('el error se pinta junto a la fecha de fin, que es la última que se rellena', () => {
    const errores = publicacion({ fechaFin: new Date(2026, 8, 1, 17, 0) });
    assert.equal(errores.fechaInicio, undefined);
  });

  it('empezar y terminar a la vez es válido: un acto instantáneo', () => {
    const cuando = new Date(2026, 8, 1, 18, 0);
    assert.equal(hayErrores(publicacion({ fechaInicio: cuando, fechaFin: cuando })), false);
  });

  it('sin fechas se piden las dos por separado', () => {
    const errores = validarPeriodo(null, null);
    assert.ok(errores.fechaInicio);
    assert.ok(errores.fechaFin);
  });

  it('una fecha imposible no es una fecha', () => {
    assert.ok(validarPeriodo(new Date('vaya'), new Date(2026, 8, 1)).fechaInicio);
  });

  it('cuando falta una sola, no se inventa el error del orden', () => {
    const errores = validarPeriodo(new Date(2026, 8, 1, 18, 0), null);
    assert.equal(errores.fechaInicio, undefined);
    assert.match(errores.fechaFin, /cuándo termina/);
  });
});

/**
 * El punto de una publicación — HU-22 · RF-08.
 *
 * Lo que estos casos fijan no es una fórmula, es una diferencia: aquí **faltar no
 * es un error**, al revés que en el hub. Si alguien uniformara las dos
 * validaciones «por coherencia», el primer caso lo detiene.
 */
describe('publicación · el punto en el mapa (HU-22)', () => {
  const PLAZA_DE_BOLIVAR = { lat: 11.2452, lon: -74.2145 };

  it('sin punto no hay error: la publicación se guarda igual', () => {
    assert.equal(validarPuntoDePublicacion(null), null);
    assert.equal(validarPuntoDePublicacion(undefined), null);
  });

  it('un punto dentro de Santa Marta se acepta', () => {
    assert.equal(validarPuntoDePublicacion(PLAZA_DE_BOLIVAR), null);
  });

  it('un punto de otra ciudad se rechaza aunque sea un punto perfecto', () => {
    // El centro de Bogotá. Es una coordenada impecable y no es de aquí: es lo
    // que devuelve el buscador cuando se le pide «Calle 22» sin acotar.
    assert.ok(validarPuntoDePublicacion({ lat: 4.598, lon: -74.076 }));
  });

  it('el signo de la longitud importa: el mismo número en positivo no vale', () => {
    assert.ok(validarPuntoDePublicacion({ lat: 11.2452, lon: 74.2145 }));
  });

  it('lo que no es un punto tampoco pasa por serlo', () => {
    assert.ok(validarPuntoDePublicacion({ lat: 'once', lon: -74.2 }));
    assert.ok(validarPuntoDePublicacion({ lat: Number.NaN, lon: -74.2 }));
    assert.ok(validarPuntoDePublicacion({ lat: 11.24 }));
  });

  it('el formulario completo sigue siendo válido sin punto', () => {
    assert.equal(hayErrores(publicacion({ punto: null })), false);
  });

  it('y falla con un punto de fuera, sin estropear los demás campos', () => {
    const errores = publicacion({ punto: { lat: 4.598, lon: -74.076 } });
    assert.ok(errores.punto);
    assert.equal(errores.titulo, undefined);
    assert.equal(errores.lugar, undefined);
  });
});


/**
 * La observación de una devolución — HU-24 · RF-13.
 *
 * El tercer criterio pide una observación **escrita**, y la regla del servidor
 * solo puede comprobar que haya algo. «No» pasa la regla y no le sirve de nada a
 * quien tiene que corregir su publicación, así que el mínimo vive aquí. Es el
 * mismo reparto de siempre: el servidor pone el techo del abuso, el formulario
 * promete que el texto se va a poder leer.
 */
describe('moderación · la observación al devolver (HU-24)', () => {
  it('una observación útil se acepta', () => {
    assert.equal(
      validarObservacion('Falta la dirección exacta del lugar y la hora de finalización.'),
      null
    );
  });

  it('en blanco no: es lo único que el autor va a recibir de vuelta', () => {
    assert.ok(validarObservacion(''));
    assert.ok(validarObservacion('    '));
    assert.ok(validarObservacion(null));
  });

  it('«No sirve» pasa la regla del servidor y no pasa aquí', () => {
    // La regla solo exige que haya algo escrito. Este caso es la diferencia
    // entre cumplir la letra del criterio y cumplirlo.
    assert.ok(validarObservacion('No sirve'));
  });

  it('el mínimo se cuenta sobre el texto limpio, no sobre los espacios', () => {
    const justo = 'a'.repeat(LONGITUD_MINIMA_OBSERVACION);
    assert.equal(validarObservacion(`   ${justo}   `), null);
    assert.ok(validarObservacion(`   ${'a'.repeat(LONGITUD_MINIMA_OBSERVACION - 1)}   `));
  });

  it('pasarse del tope dice cuánto sobra', () => {
    const mensaje = validarObservacion('a'.repeat(LONGITUD_MAXIMA_OBSERVACION + 3));
    assert.match(mensaje, /sobran 3 caracteres/);
  });

  it('y con uno solo de más lo dice en singular', () => {
    const mensaje = validarObservacion('a'.repeat(LONGITUD_MAXIMA_OBSERVACION + 1));
    assert.match(mensaje, /sobra 1 carácter/);
  });

  it('el tope del formulario es más bajo que el de la regla, a propósito', () => {
    // La regla admite 2000. Si alguien iguala los dos números, este caso lo
    // detiene y el comentario de validaciones.js explica por qué son distintos.
    assert.equal(LONGITUD_MAXIMA_OBSERVACION < 2000, true);
  });
});
