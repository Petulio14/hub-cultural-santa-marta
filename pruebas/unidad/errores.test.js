/**
 * Qué error se puede enseñar y cuál no — HU-31.
 *
 *   npm run probar
 *
 * El tercer criterio de aceptación pide que un fallo de conexión se vea como
 * «un mensaje comprensible y no un error técnico». Lo que se comprueba aquí es
 * justo el caso que el proyecto tenía mal: no que nuestros mensajes se enseñen
 * —eso nunca falló— sino que los **ajenos no se enseñen**, que es lo que el
 * patrón anterior, «fallo?.message ?? respaldo», dejaba pasar sin que se
 * notara.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { exigirRespuesta } from '../../src/services/errores.js';
import { ErrorDeDominio, mensajeDe } from '../../src/utils/errores.js';

describe('mensajeDe', () => {
  it('enseña el mensaje cuando el fallo es nuestro', () => {
    const fallo = new ErrorDeDominio('No hay conexión con el servidor. Revisa tu red.');
    assert.equal(
      mensajeDe(fallo, 'respaldo'),
      'No hay conexión con el servidor. Revisa tu red.'
    );
  });

  it('enseña el mensaje de cualquier descendiente', () => {
    class ErrorDeCuenta extends ErrorDeDominio {}
    assert.equal(mensajeDe(new ErrorDeCuenta('Ese correo ya tiene cuenta.'), 'respaldo'),
      'Ese correo ya tiene cuenta.');
  });

  /* Este es el defecto que la historia vino a cerrar. Un Error de Firestore
     trae siempre su cadena en inglés, así que el «??» del patrón anterior
     nunca llegaba a sustituir nada: el respaldo estaba escrito y no protegía. */
  it('NO enseña el mensaje de un Error llano, aunque lo tenga', () => {
    const deFirestore = new Error('Missing or insufficient permissions.');
    assert.equal(
      mensajeDe(deFirestore, 'No se pudo completar la operación. Inténtalo de nuevo.'),
      'No se pudo completar la operación. Inténtalo de nuevo.'
    );
  });

  it('NO enseña el TypeError de una petición cortada', () => {
    assert.equal(mensajeDe(new TypeError('Failed to fetch'), 'respaldo'), 'respaldo');
  });

  it('devuelve el respaldo cuando no hay fallo', () => {
    assert.equal(mensajeDe(null, 'respaldo'), 'respaldo');
    assert.equal(mensajeDe(undefined, 'respaldo'), 'respaldo');
  });

  /* Un ErrorDeDominio sin texto —«throw new ErrorDeDominio()»— dejaría la
     pantalla en blanco justo donde tenía que haber una explicación. */
  it('devuelve el respaldo cuando el fallo es nuestro pero no dice nada', () => {
    assert.equal(mensajeDe(new ErrorDeDominio(''), 'respaldo'), 'respaldo');
  });

  it('no confunde con un objeto que solo aparenta serlo', () => {
    const impostor = { name: 'ErrorDeDominio', message: 'Confía en mí.' };
    assert.equal(mensajeDe(impostor, 'respaldo'), 'respaldo');
  });
});

describe('ErrorDeDominio', () => {
  it('sigue siendo un Error, para que «catch» y las pilas funcionen igual', () => {
    const fallo = new ErrorDeDominio('algo');
    assert.ok(fallo instanceof Error);
    assert.equal(typeof fallo.stack, 'string');
  });
});

/**
 * El vacío que no es vacío — HU-31.
 *
 * Se prueba contra instantáneas de mentira porque lo que se comprueba es la
 * decisión, no Firestore: qué se hace con una respuesta según de dónde venga y
 * si trae algo. Las de verdad llevan muchos más campos; aquí solo hacen falta
 * los dos que deciden.
 */
describe('exigirRespuesta', () => {
  const consulta = (vacia, fromCache) => ({ empty: vacia, metadata: { fromCache } });
  const documento = (existe, fromCache) => ({
    exists: () => existe,
    metadata: { fromCache },
  });

  it('deja pasar lo que viene del servidor, tenga o no tenga datos', () => {
    const conDatos = consulta(false, false);
    const vacia = consulta(true, false);
    assert.equal(exigirRespuesta(conDatos, 'el directorio'), conDatos);
    // Una colección de verdad vacía: «todavía no hay ninguno» es la verdad.
    assert.equal(exigirRespuesta(vacia, 'el directorio'), vacia);
  });

  it('deja pasar lo que viene de la caché si trae datos', () => {
    // Sin red, enseñar lo último que se supo es mejor que un error.
    const guardada = consulta(false, true);
    assert.equal(exigirRespuesta(guardada, 'el directorio'), guardada);
  });

  /* El caso que costó descubrir: sin conexión «getDocs» no lanza nada, resuelve
     contra una caché vacía, y el directorio decía «todavía no hay ningún perfil
     publicado» habiendo cuatro. */
  it('lanza un error de conexión cuando viene de la caché y está vacía', () => {
    assert.throws(
      () => exigirRespuesta(consulta(true, true), 'el directorio de actores'),
      (fallo) => {
        assert.ok(fallo instanceof ErrorDeDominio, 'tiene que poder enseñarse');
        assert.match(fallo.message, /No hay conexión con el servidor/);
        assert.match(fallo.message, /el directorio de actores/);
        assert.equal(fallo.codigo, 'sin-conexion');
        return true;
      }
    );
  });

  it('distingue igual un documento suelto, que dice «exists» en vez de «empty»', () => {
    const hallado = documento(true, true);
    assert.equal(exigirRespuesta(hallado, 'tu perfil'), hallado);
    // Un documento que no está en una caché vacía no es un documento que no
    // exista: decir «todavía no has creado tu perfil» a quien sí lo tiene le
    // ofrecería crear uno encima del suyo.
    assert.throws(() => exigirRespuesta(documento(false, true), 'tu perfil'), /No hay conexión/);
    assert.equal(exigirRespuesta(documento(false, false), 'tu perfil').exists(), false);
  });
});
