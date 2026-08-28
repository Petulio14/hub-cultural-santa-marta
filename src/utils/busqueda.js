/**
 * La búsqueda por palabra clave — HU-27 · RF-10.
 *
 * Funciones puras, comprobadas con «npm run probar».
 *
 * **Por qué ocurre en el cliente.** Firestore no hace búsqueda de texto: sabe
 * comparar por igualdad y por rango, y nada más. Las tres salidas posibles eran
 * estas, y solo una cabe en el proyecto:
 *
 * 1. Un índice de texto externo —Algolia, Typesense, la extensión de Firebase—.
 *    Exige el plan Blaze, que es la misma restricción que dejó las imágenes
 *    fuera de Storage (docs/18 §1) y la devolución sin correo (docs/23 §3).
 * 2. Una consulta por prefijo sobre «tituloNormalizado». Es lo único que
 *    Firestore puede hacer solo, y **no cumple el criterio**: encuentra
 *    «cumbia» al principio del título y no en medio, y no mira la descripción.
 * 3. Comparar en memoria sobre lo que se ha traído. Es lo que docs/04 §11 dejó
 *    escrito desde HU-05, y es lo que hay aquí.
 *
 * La consecuencia se asume y se dice en pantalla: la búsqueda mira hasta
 * doscientas actividades, no el archivo entero (docs/26 §3).
 */
import { normalizarTexto } from './texto.js';

/**
 * Cuántas actividades se traen para buscar dentro.
 *
 * No es el tamaño de una página: cuando hay término, la paginación de HU-25
 * estorba —buscar dentro de doce resultados encuentra dentro de doce— así que se
 * pide todo lo que cumple los filtros del servidor de una vez, con un tope.
 *
 * El tope existe porque una consulta sin límite crece con el catálogo y cada
 * documento se paga. Doscientos son más de dieciséis páginas del catálogo:
 * bastante más de lo que nadie recorre a mano, y poco para el bolsillo. Cuando se alcanza, la vista
 * lo dice en lugar de fingir que la búsqueda fue exhaustiva.
 */
export const TOPE_DE_BUSQUEDA = 200;

/**
 * El término, partido en palabras normalizadas.
 *
 * **Se busca por palabras y no por la cadena entera**, y eso es una lectura
 * deliberada del criterio. «Contener el término» en sentido estricto haría que
 * «taller tambora» no encontrara «Taller de tambora», que es exactamente lo que
 * quien lo escribe está buscando. Buscar por palabras encuentra todo lo que
 * encontraría la cadena entera y además eso: es un superconjunto, así que no
 * deja fuera nada de lo que el criterio exige.
 */
export function palabrasDe(termino) {
  return normalizarTexto(termino)
    .split(/\s+/)
    .filter((palabra) => palabra !== '');
}

/**
 * ¿Esta publicación responde a esas palabras? — **primer y tercer criterio**.
 *
 * Título **y** descripción, porque el criterio dice «título o descripción» y una
 * actividad se describe donde le toca: hay talleres cuyo título es un juego de
 * palabras y cuya descripción dice de qué van.
 *
 * El título llega ya normalizado desde el documento y la descripción se
 * normaliza aquí, y esa asimetría no es un descuido: HU-21 guardó
 * «tituloNormalizado» anticipando una comparación **en el servidor**, que es
 * donde no se puede normalizar al vuelo. Como la mitad de la comparación ocurre
 * en memoria de todas formas, el campo guardado ahorra poco; lo que de verdad lo
 * justificaría es la búsqueda por prefijo que ningún criterio pide (docs/26 §4).
 *
 * Tildes y mayúsculas desaparecen de los dos lados —lo hace «normalizarTexto»,
 * que conserva la eñe—, y ahí queda cumplido el tercer criterio.
 */
export function coincide(publicacion, palabras) {
  if (palabras.length === 0) return true;

  const texto = `${publicacion.tituloNormalizado || normalizarTexto(publicacion.titulo)} ${normalizarTexto(publicacion.descripcion)}`;

  // Todas las palabras, no cualquiera de ellas. Quien escribe dos palabras está
  // acotando, no ampliando: «taller cumbia» busca lo que es las dos cosas.
  return palabras.every((palabra) => texto.includes(palabra));
}

/** Las que responden al término. Sin término, todas: no buscar no es filtrar. */
export function filtrarPorTermino(publicaciones, termino) {
  const palabras = palabrasDe(termino);
  if (palabras.length === 0) return publicaciones;
  return publicaciones.filter((publicacion) => coincide(publicacion, palabras));
}
