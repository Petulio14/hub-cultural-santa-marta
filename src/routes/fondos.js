/**
 * La imagen de fondo de cada vista.
 *
 * Están en un solo sitio por la misma razón que los accesos principales: el
 * componente que pinta el fondo y cualquier comprobación posterior tienen que
 * leer la misma tabla. Es un dato de navegación, no una ruta.
 *
 * ## Por qué las imágenes vienen ya desvanecidas
 *
 * Se ven nítidas pero muy claras, con solo el 12 % de la imagen sobre el color
 * de arena. Ese desvanecido va dentro del archivo y no en CSS: una imagen con
 * tan poco contraste interno comprime mucho mejor, y cada una se queda en unos
 * 90 KB en lugar de los tres megas del original.
 *
 * El 12 % no es a ojo. Las tres imágenes tienen píxeles negros puros, y el
 * texto tiene que leerse incluso encima de ellos (docs/10 §2 quater). Los
 * originales se conservan en «recursos/fondos/», fuera de «public/» para que no
 * se publiquen; se regeneran con «python herramientas/preparar-fondos.py».
 *
 * ## Por qué solo tres vistas
 *
 * Porque son las tres para las que hay imagen. Las demás se quedan con el color
 * de arena de siempre, y eso es lo que devuelve «null»: añadir una vista es
 * añadir una línea aquí y su archivo al guion que las prepara.
 */
export const FONDOS = {
  '/': '/fondo-inicio.jpg',
  '/actores': '/fondo-actores.jpg',
  '/mapa': '/fondo-mapa.jpg',
};

/**
 * La imagen que le toca a una ruta, o «null» si no le toca ninguna.
 *
 * La coincidencia es exacta y no por prefijo: «/actores/abc» es la ficha de un
 * actor cultural, una vista distinta con su propia imagen de portada, y ponerle
 * detrás el fondo del directorio sería apilar dos fotos.
 */
export function fondoDeRuta(ruta) {
  if (typeof ruta !== 'string') return null;
  // Una ruta con barra final es la misma ruta: «/actores/» y «/actores» llevan
  // al mismo sitio en el enrutador, así que tienen que llevar al mismo fondo.
  const limpia = ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta;
  return FONDOS[limpia] ?? null;
}
