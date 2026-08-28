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
  asuntoDeContacto,
  enlaceDeCorreo,
  enlaceDeTelefono,
  enlaceDeWhatsapp,
  mensajeDeContacto,
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

/**
 * El mensaje inicial — HU-29 · RF-12, segundo criterio.
 *
 * Lo que se prueba aquí es la **codificación**, que es donde está el defecto que
 * no se ve: un enlace mal codificado parece correcto en el código y solo se
 * descubre al abrir el correo o WhatsApp de verdad, con el texto roto delante.
 */
describe('el mensaje inicial (HU-29)', () => {
  const TITULO = 'Cumbia y tambora';

  it('dice de dónde viene y por qué actividad se pregunta', () => {
    const mensaje = mensajeDeContacto(TITULO);
    assert.equal(mensaje.includes('Hub Cultural de Santa Marta'), true);
    assert.equal(mensaje.includes(TITULO), true);
  });

  it('el asunto del correo también nombra la actividad', () => {
    assert.equal(asuntoDeContacto(TITULO).includes(TITULO), true);
  });

  it('un título ausente no rompe el mensaje', () => {
    assert.equal(typeof mensajeDeContacto(undefined), 'string');
    assert.equal(typeof asuntoDeContacto(null), 'string');
  });
});

describe('los enlaces con mensaje (HU-29)', () => {
  const MENSAJE = 'Hola, ¿queda cupo?';

  it('WhatsApp lleva el mensaje en «text»', () => {
    const enlace = enlaceDeWhatsapp('3001234567', MENSAJE);
    assert.equal(enlace.startsWith('https://wa.me/573001234567?text='), true);
  });

  it('sin mensaje, el enlace de WhatsApp es el de HU-18, sin cola', () => {
    // Lo sigue usando el perfil de actor, que no sabe de qué actividad se
    // pregunta porque desde allí no se pregunta por ninguna.
    assert.equal(enlaceDeWhatsapp('3001234567'), 'https://wa.me/573001234567');
  });

  it('el correo lleva asunto y cuerpo', () => {
    const enlace = enlaceDeCorreo('gaitas@ejemplo.co', {
      asunto: 'Consulta',
      cuerpo: MENSAJE,
    });
    assert.equal(enlace.startsWith('mailto:gaitas@ejemplo.co?'), true);
    assert.equal(enlace.includes('subject=Consulta'), true);
    assert.equal(enlace.includes('&body='), true);
  });

  it('sin asunto ni cuerpo, el correo es el de HU-18, sin interrogante', () => {
    assert.equal(enlaceDeCorreo('gaitas@ejemplo.co'), 'mailto:gaitas@ejemplo.co');
  });

  it('solo el asunto no deja un «&» colgando', () => {
    const enlace = enlaceDeCorreo('gaitas@ejemplo.co', { asunto: 'Consulta' });
    assert.equal(enlace, 'mailto:gaitas@ejemplo.co?subject=Consulta');
  });

  it('**el espacio se codifica «%20» y no «+»**', () => {
    // La trampa de esta historia. «URLSearchParams» codifica con las reglas de
    // un formulario web, donde el espacio es «+»; un cliente de correo no aplica
    // esas reglas y dejaría el «+» literal en el asunto.
    const enlace = enlaceDeCorreo('a@b.co', { asunto: 'Consulta sobre algo' });
    assert.equal(enlace.includes('%20'), true);
    assert.equal(enlace.includes('+'), false);
  });

  it('y las tildes y las comillas angulares viajan codificadas', () => {
    const enlace = enlaceDeWhatsapp('3001234567', 'más «información»');
    assert.equal(enlace.includes('%C3%A1'), true);
    assert.equal(enlace.includes('%C2%AB'), true);
    // Que ni el interrogante ni el ampersand del mensaje partan la dirección.
    const conSignos = enlaceDeCorreo('a@b.co', { asunto: '¿Y & cuándo?', cuerpo: 'x' });
    assert.equal(conSignos.split('?').length, 2);
    assert.equal(conSignos.split('&').length, 2);
  });

  it('sin número o sin correo no hay enlace, aunque haya mensaje', () => {
    assert.equal(enlaceDeWhatsapp('', MENSAJE), null);
    assert.equal(enlaceDeCorreo(null, { cuerpo: MENSAJE }), null);
  });
});
