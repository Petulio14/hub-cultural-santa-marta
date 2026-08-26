/**
 * Coordenadas geográficas — HU-20 · RF-09, para HU-22 y HU-30.
 *
 * Funciones puras, comprobadas con «npm run probar». Aquí no se busca nada en la
 * red: eso lo hace «geocodificacionService.js». Aquí se decide si un punto es
 * aceptable y cómo se escribe, que es lo que tiene casos límite.
 */

/**
 * El rectángulo que abarca Santa Marta y su entorno inmediato, incluidos El
 * Rodadero, Taganga, Minca y la franja de la Sierra que pertenece al distrito.
 *
 * Existe porque el buscador de direcciones **acierta poco y falla mucho** con la
 * nomenclatura colombiana, y un fallo suyo no siempre parece un fallo: pedir
 * «Calle 22» sin acotar devuelve una calle 22 de cualquier ciudad, con su punto
 * y su nombre, perfectamente creíble. Un resultado fuera de este rectángulo no
 * es el hub de nadie de esta plataforma.
 */
export const LIMITES_SANTA_MARTA = {
  latMin: 10.9,
  latMax: 11.5,
  lonMin: -74.6,
  lonMax: -73.7,
};

/** ¿Es un número real y no un NaN disfrazado? */
const esNumero = (valor) => typeof valor === 'number' && Number.isFinite(valor);

/** Latitud válida en el planeta: de −90 a 90. */
export function esLatitudValida(lat) {
  return esNumero(lat) && lat >= -90 && lat <= 90;
}

/** Longitud válida en el planeta: de −180 a 180. */
export function esLongitudValida(lon) {
  return esNumero(lon) && lon >= -180 && lon <= 180;
}

export function esPuntoValido(punto) {
  return Boolean(punto) && esLatitudValida(punto.lat) && esLongitudValida(punto.lon);
}

/** ¿Cae el punto dentro del rectángulo de arriba? */
export function estaEnSantaMarta(punto) {
  if (!esPuntoValido(punto)) return false;
  const l = LIMITES_SANTA_MARTA;
  return (
    punto.lat >= l.latMin &&
    punto.lat <= l.latMax &&
    punto.lon >= l.lonMin &&
    punto.lon <= l.lonMax
  );
}

/**
 * Cinco decimales, que es aproximadamente un metro, y con la coma decimal del
 * español. Más decimales serían precisión inventada: el buscador devuelve el
 * centro de un edificio o de un tramo de calle, no la puerta.
 */
export function formatearCoordenada(valor) {
  return esNumero(valor) ? valor.toFixed(5).replace('.', ',') : '';
}

/** El punto escrito para que alguien lo lea o lo copie. */
export function textoDeCoordenadas(punto) {
  if (!esPuntoValido(punto)) return '';
  return `${formatearCoordenada(punto.lat)}, ${formatearCoordenada(punto.lon)}`;
}
