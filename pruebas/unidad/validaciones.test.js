/**
 * Validación de los formularios — HU-12, HU-13, HU-16, HU-17.
 *
 * No necesitan emulador ni navegador porque lo que comprueban son funciones
 * puras. Es la razón de que la validación viva en «src/utils» y no dentro de la
 * vista: así los criterios de aceptación se ejecutan, en lugar de repasarse a
 * mano en la pantalla cada vez que alguien toca el formulario.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LONGITUD_MAXIMA_CATEGORIA,
  LONGITUD_MINIMA_CONTRASENA,
  hayErrores,
  validarCategoria,
  validarConsentimiento,
  validarIngreso,
  validarRecuperacion,
  validarRegistro,
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
