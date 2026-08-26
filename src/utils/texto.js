/**
 * Normalización de texto. Funciones puras, comprobadas con «npm run probar».
 *
 * Se usan en dos sitios que parecen distintos y son el mismo problema: convertir
 * el nombre de una categoría en su identificador (HU-17) y preparar el título de
 * un evento para que la búsqueda no distinga mayúsculas ni tildes (HU-27).
 */

/** Marcas de acento que deja sueltas la descomposición Unicode. */
const TILDES = /[̀-ͯ]/g;

/** Carácter que no aparece en ningún texto escrito: resguarda la eñe. */
const RESGUARDO_ENE = '';

/**
 * Minúsculas y sin tildes, conservando la eñe.
 *
 * «Ñ» no es una N con tilde en español: es otra letra, y «año» y «ano» son dos
 * palabras distintas. La descomposición Unicode la separaría igual que a las
 * vocales acentuadas, así que se aparta antes de descomponer y se restituye
 * después.
 */
export function normalizarTexto(valor) {
  return (valor ?? '')
    .trim()
    .toLowerCase()
    .replaceAll('ñ', RESGUARDO_ENE)
    .normalize('NFD')
    .replace(TILDES, '')
    .replaceAll(RESGUARDO_ENE, 'ñ');
}

/**
 * Identificador de documento a partir de un nombre: «Música y danza» da
 * «musica-y-danza».
 *
 * Legible a propósito. El identificador de una categoría queda escrito dentro de
 * cada evento (`eventos.categoria`), y leer «musica-y-danza» en la base de datos
 * dice qué es; un identificador generado al azar obliga a consultar otra
 * colección para entender el dato que se tiene delante.
 */
export function aIdentificador(nombre) {
  return normalizarTexto(nombre)
    .replace(/[^a-z0-9ñ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Las líneas de trabajo de un hub, a partir de lo que se escribe en una sola
 * caja — HU-20.
 *
 * Se admite separar por comas o por saltos de línea, porque las dos cosas se
 * hacen sin pensar y ninguna es más correcta que la otra. Se quitan los
 * espacios sobrantes, se descartan las vacías —«a,,b» y «a, b» son la misma
 * lista— y se eliminan las repetidas sin distinguir mayúsculas ni tildes, para
 * que «Emprendimiento» y «emprendimiento» no salgan dos veces en el directorio.
 *
 * De las repetidas se conserva **la primera tal como se escribió**: es la que
 * quien la escribió eligió, y normalizarla para mostrarla convertiría «TIC» en
 * «tic».
 */
export function aLineasDeTrabajo(texto) {
  const vistas = new Set();
  const lineas = [];

  for (const trozo of (texto ?? '').split(/[,\n]/)) {
    const limpio = trozo.trim().replace(/\s+/g, ' ');
    if (limpio === '') continue;

    const clave = normalizarTexto(limpio);
    if (vistas.has(clave)) continue;

    vistas.add(clave);
    lineas.push(limpio);
  }

  return lineas;
}
