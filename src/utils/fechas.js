/**
 * Fechas de una publicación — HU-21 · RF-05.
 *
 * Todo lo de este archivo existe por una razón: **«datetime-local» habla en hora
 * local y «Date» escribe en UTC**, y confundirlas desplaza un evento cinco horas
 * sin avisar. Santa Marta está en UTC−5 y no cambia de hora, así que el error no
 * se corregiría solo en ninguna época del año: un taller de las 18:00 quedaría
 * guardado a las 23:00, y al reabrir el formulario aparecería el día siguiente.
 *
 * El caso que lo delata es el de la medianoche. «2026-09-01T00:00» en Santa
 * Marta es «2026-09-01T05:00Z»; si se escribe con «toISOString().slice(0, 16)»
 * se lee «2026-09-01T05:00» y el evento se mueve a las cinco de la mañana. Y a
 * partir de las 19:00 hora local el día en UTC ya es el siguiente, así que el
 * evento salta de fecha. Por eso «paraEntradaDeFecha» compone el texto a mano
 * con los métodos locales de «Date» y no pasa nunca por ISO.
 *
 * Funciones puras, comprobadas con «npm run probar».
 */

/** Lo que «<input type="datetime-local">» entiende: «2026-09-01T18:00». */
const FORMA_DE_ENTRADA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const dosDigitos = (numero) => String(numero).padStart(2, '0');

/** ¿Es una fecha utilizable? «new Date('cualquier cosa')» devuelve un Date inválido. */
export function esFechaValida(fecha) {
  return fecha instanceof Date && !Number.isNaN(fecha.getTime());
}

/**
 * Texto del formulario a `Date`, en hora local.
 *
 * «new Date('2026-09-01T18:00')» ya interpreta en local cuando el texto no lleva
 * zona —lo dice la especificación de ECMAScript para las cadenas sin «Z»—, así
 * que aquí no hay que corregir nada. Lo que sí hay que hacer es rechazar lo que
 * no tenga la forma exacta: «new Date('2026-09-01')» **sí** se interpreta en UTC,
 * y ese es justo el desplazamiento que este archivo evita.
 */
export function desdeEntradaDeFecha(texto) {
  const limpio = (texto ?? '').trim();
  if (!FORMA_DE_ENTRADA.test(limpio)) return null;

  const fecha = new Date(limpio);
  return esFechaValida(fecha) ? fecha : null;
}

/**
 * `Date` a texto del formulario, en hora local.
 *
 * Compuesto a mano a propósito: «toISOString()» convierte a UTC y devolvería el
 * evento cinco horas movido, o directamente al día siguiente si empieza después
 * de las 19:00.
 */
export function paraEntradaDeFecha(fecha) {
  if (!esFechaValida(fecha)) return '';

  const dia = `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
  return `${dia}T${hora}`;
}

/** Lo que «<input type="date">» entiende: «2026-09-01». */
const FORMA_DE_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Texto de un «<input type="date">» a `Date`, **en hora local** — HU-26.
 *
 * Aquí vuelve la trampa de la cabecera de este archivo por una puerta nueva, y
 * peor: `new Date('2026-09-01')` **sí** se interpreta en UTC, porque la
 * especificación trata las cadenas de solo fecha como instantes UTC y las de
 * fecha y hora sin zona como locales. En Santa Marta eso deja el día empezando a
 * las 19:00 del día anterior, así que un evento del 31 de agosto entraría en un
 * rango que empieza el 1 de septiembre.
 *
 * Por eso se compone con el constructor de tres números, que sí es local, y no
 * se pasa nunca por el analizador de cadenas.
 */
export function desdeEntradaDeDia(texto) {
  const limpio = (texto ?? '').trim();
  if (!FORMA_DE_DIA.test(limpio)) return null;

  const [ano, mes, dia] = limpio.split('-').map(Number);
  const fecha = new Date(ano, mes - 1, dia);

  // «2026-02-31» pasa la forma y no existe: el constructor lo desplaza al 3 de
  // marzo en silencio. Se compara lo que salió con lo que se pidió.
  const coherente =
    fecha.getFullYear() === ano && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  return coherente ? fecha : null;
}

/**
 * El último instante de ese día, en hora local — HU-26.
 *
 * Un rango de fechas se escribe en días y **un día tiene final**. Sin esto, el
 * límite superior de «hasta el 5 de septiembre» sería las 00:00 del día 5, y una
 * actividad que empieza a las 18:00 de ese mismo día quedaría fuera del rango
 * que la persona acaba de pedir para incluirla. Es el error que no se ve, porque
 * el resultado parece razonable: sale una lista, solo que le falta el último día.
 */
export function finDelDia(fecha) {
  if (!esFechaValida(fecha)) return null;
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    23,
    59,
    59,
    999
  );
}

/** El día, escrito: «1 de septiembre de 2026». */
export function textoDelDia(fecha) {
  if (!esFechaValida(fecha)) return '';

  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * La hora, en veinticuatro: «18:00».
 *
 * Compuesta a mano y no con «toLocaleTimeString». El formato largo del español
 * antepone «a las», y eso convierte cualquier composición en algo que no se
 * puede leer: «1 de septiembre de 2026 a las 18:00 a 21:30». Aquí la hora es un
 * dato y las palabras que la rodean las pone quien la usa.
 */
export function textoDeLaHora(fecha) {
  if (!esFechaValida(fecha)) return '';
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

/** Día y hora: «1 de septiembre de 2026, 18:00». */
export function textoDeFecha(fecha) {
  if (!esFechaValida(fecha)) return '';
  return `${textoDelDia(fecha)}, ${textoDeLaHora(fecha)}`;
}

/** ¿Caen las dos en el mismo día? Se compara el día, no la distancia en horas. */
export function mismoDia(una, otra) {
  return (
    esFechaValida(una) &&
    esFechaValida(otra) &&
    una.getFullYear() === otra.getFullYear() &&
    una.getMonth() === otra.getMonth() &&
    una.getDate() === otra.getDate()
  );
}

/**
 * Cuándo ocurre, en una sola línea.
 *
 * Cuando empieza y termina el mismo día no se repite la fecha: «1 de septiembre
 * de 2026, de 18:00 a 21:30» se lee de un vistazo, y «1 de septiembre de 2026,
 * 18:00 — 1 de septiembre de 2026, 21:30» obliga a comparar dos cadenas casi
 * iguales para descubrir que dicen lo mismo.
 */
export function textoDelPeriodo(inicio, fin) {
  if (!esFechaValida(inicio)) return '';
  if (!esFechaValida(fin)) return textoDeFecha(inicio);

  if (!mismoDia(inicio, fin)) return `${textoDeFecha(inicio)} — ${textoDeFecha(fin)}`;

  return `${textoDelDia(inicio)}, de ${textoDeLaHora(inicio)} a ${textoDeLaHora(fin)}`;
}

/** ¿El periodo está bien puesto? Es el segundo criterio de aceptación de HU-21. */
export function periodoCoherente(inicio, fin) {
  return esFechaValida(inicio) && esFechaValida(fin) && inicio.getTime() <= fin.getTime();
}

/** ¿Ya terminó? Lo usa la lista para distinguir lo vigente de lo pasado. */
export function yaTermino(fin, ahora = new Date()) {
  return esFechaValida(fin) && fin.getTime() < ahora.getTime();
}
