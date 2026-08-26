/**
 * Errores de acceso a datos, en español — HU-18, HU-19, HU-20.
 *
 * Cuando algo falla en Firestore, el kit lanza un error con su código y su
 * mensaje **en inglés**: «Missing or insufficient permissions.» Eso es lo que
 * leyó quien probó la aplicación el 26/08/2026 (docs/17 §10), y no dice a quién
 * le falta permiso, ni para qué, ni qué hacer a continuación.
 *
 * Este archivo existe para que la traducción se escriba una sola vez. Nació
 * dentro de «actoresService.js» y salió de ahí en HU-20, cuando el servicio de
 * hubs iba a necesitar exactamente lo mismo: dos copias de una tabla de mensajes
 * se separan a la primera corrección que solo se aplique a una.
 *
 * La contrapartida en Authentication la sigue haciendo «authService.js», que
 * traduce códigos distintos y con un matiz que aquí no aplica —al iniciar sesión
 * todos los fallos de credencial comparten mensaje para no delatar quién tiene
 * cuenta—, así que no se unifican.
 */

/**
 * Error de dominio. La vista lo muestra sin traducir nada: el mensaje ya está
 * escrito para quien lo va a leer, «campo» indica junto a qué campo ponerlo y
 * «codigo» conserva el original de Firestore para poder diagnosticar.
 */
export class ErrorDeDatos extends Error {
  constructor(mensaje, { campo = null, codigo = null } = {}) {
    super(mensaje);
    this.name = 'ErrorDeDatos';
    this.campo = campo;
    this.codigo = codigo;
  }
}

/** Traduce el fallo, o lo deja pasar si ya es un mensaje nuestro. */
export function traducir(fallo) {
  if (fallo instanceof ErrorDeDatos) return fallo;

  const codigo = fallo?.code ?? '';

  if (codigo === 'permission-denied') {
    return new ErrorDeDatos(
      'Tu cuenta no tiene permiso para esta operación. Si acabas de registrarte, cierra sesión y vuelve a entrar.',
      { codigo }
    );
  }
  if (codigo === 'unavailable' || codigo === 'deadline-exceeded') {
    return new ErrorDeDatos('No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.', {
      codigo,
    });
  }
  if (codigo === 'not-found') {
    return new ErrorDeDatos('Ese documento ya no existe.', { codigo });
  }
  if (codigo === 'resource-exhausted') {
    return new ErrorDeDatos(
      'La plataforma alcanzó su cuota diaria de uso. Inténtalo mañana.',
      { codigo }
    );
  }

  return new ErrorDeDatos('No se pudo completar la operación. Inténtalo de nuevo.', { codigo });
}

/** Ejecuta la operación y convierte cualquier fallo en un mensaje legible. */
export async function intentar(operacion) {
  try {
    return await operacion();
  } catch (fallo) {
    throw traducir(fallo);
  }
}
