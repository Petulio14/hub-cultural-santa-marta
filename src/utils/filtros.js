/**
 * Los filtros del catálogo — HU-26 · RF-10.
 *
 * Funciones puras, comprobadas con «npm run probar». Traducen lo que hay escrito
 * en tres campos de un formulario a los límites que entiende la consulta, y esa
 * traducción tiene tres decisiones que no se ven en pantalla.
 */
import { desdeEntradaDeDia, finDelDia } from './fechas.js';

/**
 * Ningún filtro puesto. Es también lo que restituye «Limpiar» (cuarto criterio).
 *
 * «texto» entra en HU-27 y es el único de los cuatro que **no viaja al
 * servidor**: Firestore no sabe buscar dentro de un texto, así que se compara en
 * memoria sobre lo que la consulta trajo (docs/26 §1). Vive aquí de todas formas
 * porque para la persona que lo escribe es un filtro más: se pone con los otros,
 * se aplica con el mismo botón y se quita con el mismo «Limpiar».
 */
export const FILTROS_VACIOS = { categoria: '', desde: '', hasta: '', texto: '' };

/** ¿Hay alguno puesto? Lo pregunta la vista para saber qué mensaje escribir. */
export function hayFiltros(filtros) {
  return Object.values(filtros ?? {}).some((valor) => valor !== '');
}

/**
 * ¿El rango está del revés?
 *
 * Se pregunta antes de consultar y no después: un rango invertido no devuelve
 * pocos resultados, devuelve **cero**, y cero es indistinguible de «no hay nada
 * ese fin de semana». Quien escribió las fechas al revés se llevaría la
 * conclusión contraria a la verdad sin que nada se lo advirtiera.
 */
export function rangoInvertido(filtros) {
  const desde = desdeEntradaDeDia(filtros?.desde);
  const hasta = desdeEntradaDeDia(filtros?.hasta);
  if (desde === null || hasta === null) return false;
  return desde.getTime() > hasta.getTime();
}

/**
 * De los tres campos a los límites de la consulta.
 *
 * 1. **El día de partida nunca es anterior a ahora.** El catálogo enseña lo que
 *    todavía no ha terminado (docs/24 §1), y un
 *    rango que empiece el mes pasado no puede reabrir esa puerta: lo que ya pasó
 *    no se puede alcanzar aunque se pida por fecha. Se toma el más tardío de los
 *    dos.
 *
 * 2. **El día de llegada se estira hasta su último instante.** «Hasta el 5 de
 *    septiembre» incluye el día 5 entero, no sus 00:00. Lo hace «finDelDia», y
 *    la razón está escrita allí porque es donde vuelve a hacer daño.
 *
 * 3. **«Vigente en el rango» es un solapamiento, no una pertenencia.** Una
 *    actividad cuenta si no ha terminado cuando la persona llega y ya ha
 *    empezado —o empieza— antes de que se vaya. Son dos condiciones sobre dos
 *    campos distintos:
 *
 *        fechaFin   >= el día que llega
 *        fechaInicio <= el día que se va
 *
 *    Preguntar en cambio «¿empieza dentro del rango?» sería una sola condición y
 *    mucho más barato, y dejaría fuera el festival de una semana que empezó la
 *    víspera de su llegada — que es justo el que sí puede ver.
 *
 * «hasta» sale nulo cuando no se ha escrito, y esa distinción importa: el
 * servicio la usa para decidir si la consulta lleva una desigualdad o dos.
 *
 * «texto» no sale: no es un límite de la consulta y el servicio no sabría qué
 * hacer con él.
 */
export function limitesDeConsulta(filtros, ahora = new Date()) {
  const desdeEscrito = desdeEntradaDeDia(filtros?.desde);
  const hastaEscrito = desdeEntradaDeDia(filtros?.hasta);

  const desde =
    desdeEscrito !== null && desdeEscrito.getTime() > ahora.getTime() ? desdeEscrito : ahora;

  return {
    categoria: filtros?.categoria || null,
    desde,
    hasta: hastaEscrito === null ? null : finDelDia(hastaEscrito),
  };
}
