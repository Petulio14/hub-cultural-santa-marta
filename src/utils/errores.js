/**
 * Qué error se puede enseñar y cuál no — HU-31.
 *
 * Vive en «utils» y no en «services» porque no sabe nada de Firebase ni de
 * React: es una clase y una función puras, y desde aquí las pueden usar las dos
 * capas —«services/errores.js» para traducir Firestore, «utils/imagen.js» para
 * sus propios fallos— sin que ninguna dependa de la otra. Se comprueba con
 * «npm run probar».
 *
 * ## El problema que resuelve
 *
 * La diferencia entre un fallo que se enseña y uno que no, no está en que tenga
 * mensaje: todos lo tienen. Está en para quién se escribió. «Missing or
 * insufficient permissions.» y «Failed to fetch» son mensajes de Error tan
 * legítimos como los de este proyecto, y por eso el patrón que usaban las
 * veinticuatro vistas —«fallo?.message ?? algo comprensible»— **nunca llegaba a
 * su respaldo**: «??» solo sustituye lo nulo, y un Error de Firestore trae
 * siempre su cadena en inglés. El respaldo estaba escrito, se leía como una
 * precaución razonable y no protegía de nada.
 *
 * Heredar de «ErrorDeDominio» es la marca de que el mensaje está escrito para
 * quien lo va a leer. Lo que no hereda no se enseña.
 */

/** Raíz de los errores cuyo mensaje se puede pintar en pantalla. */
export class ErrorDeDominio extends Error {}

/**
 * El texto que se puede enseñar — tercer criterio de aceptación de HU-31.
 *
 * Sustituye a «fallo?.message ?? respaldo», que es lo mismo solo mientras el
 * servicio traduzca. Aquí la vista deja de depender de eso: si el fallo no es
 * nuestro se enseña el respaldo, traiga o no traiga mensaje.
 */
export function mensajeDe(fallo, respaldo) {
  return fallo instanceof ErrorDeDominio && fallo.message ? fallo.message : respaldo;
}
