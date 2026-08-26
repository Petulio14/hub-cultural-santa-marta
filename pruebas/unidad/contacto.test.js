/**
 * Canales de contacto del perfil de actor — HU-18 · RF-12.
 *
 * Lo que se prueba aquí es la conversión de un número escrito a mano en un
 * enlace que marque de verdad. El caso que motivó estas funciones es el del
 * indicativo duplicado: quien escribe «+57 300…» y recibe un enlace a
 * «+5757300…» descubre que no funciona cuando ya nadie puede llamarle.
 *
 *   npm run probar
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  aNumeroMarcable,
  enlaceDeCorreo,
  enlaceDeTelefono,
  enlaceDeWhatsapp,
} from '../../src/utils/contacto.js';

describe('número marcable (HU-18)', () => {
  it('un móvil de diez dígitos recibe el indicativo de Colombia', () => {
    assert.equal(aNumeroMarcable('3001234567'), '573001234567');
  });

  it('los espacios, guiones y paréntesis no llegan al enlace', () => {
    assert.equal(aNumeroMarcable('300 123 4567'), '573001234567');
    assert.equal(aNumeroMarcable('(605) 421-0000'), '576054210000');
  });

  it('el indicativo NO se duplica cuando ya venía escrito', () => {
    // El defecto que estas funciones existen para evitar: «+5757300…» no marca
    // a ninguna parte, y quien lo escribió no tiene forma de enterarse.
    assert.equal(aNumeroMarcable('+57 300 123 4567'), '573001234567');
    assert.equal(aNumeroMarcable('573001234567'), '573001234567');
  });

  it('un fijo de siete dígitos se deja tal cual: falta el indicativo de área', () => {
    // Añadirle el 57 sería inventar a quién llama. Se deja como está y quien
    // marque decidirá; el número que se ve en pantalla sigue siendo el escrito.
    assert.equal(aNumeroMarcable('4210000'), '4210000');
  });

  it('sin número no hay nada que marcar', () => {
    assert.equal(aNumeroMarcable(''), null);
    assert.equal(aNumeroMarcable('   '), null);
    assert.equal(aNumeroMarcable(null), null);
    assert.equal(aNumeroMarcable(undefined), null);
  });

  it('un texto sin dígitos tampoco produce enlace', () => {
    assert.equal(aNumeroMarcable('llámame'), null);
  });
});

describe('enlaces de contacto (RF-12)', () => {
  it('el teléfono se convierte en un enlace «tel:» con indicativo', () => {
    assert.equal(enlaceDeTelefono('300 123 4567'), 'tel:+573001234567');
  });

  it('el WhatsApp usa el enlace universal wa.me', () => {
    assert.equal(enlaceDeWhatsapp('+57 300 123 4567'), 'https://wa.me/573001234567');
  });

  it('el correo se convierte en un enlace «mailto:»', () => {
    assert.equal(enlaceDeCorreo(' tambora@ejemplo.co '), 'mailto:tambora@ejemplo.co');
  });

  it('un canal vacío no produce enlace, para que la vista no lo pinte', () => {
    assert.equal(enlaceDeTelefono(''), null);
    assert.equal(enlaceDeWhatsapp(null), null);
    assert.equal(enlaceDeCorreo('   '), null);
  });
});
