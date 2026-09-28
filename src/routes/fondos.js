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
 * ## Por qué es un fondo por omisión y dos excepciones
 *
 * Antes eran tres vistas con imagen y las demás en arena lisa. Ahora ninguna
 * vista se queda en arena: la de inicio es el fondo de la plataforma, y solo
 * «/actores» y «/mapa» lo cambian por el suyo. Eso es lo que pedía el prototipo
 * de HU-06 —un fondo común a todas las vistas (docs/05 §4 bis)— y de paso quita
 * el modo de fallo de la tabla anterior: una vista nueva llegaba sin fondo sin
 * que nada lo dijera, porque una vista en arena lisa no parece un olvido.
 *
 * Añadir una excepción es añadir una línea aquí y su archivo al guion que las
 * prepara. No añadir nada es la opción correcta para casi todo.
 */

/**
 * El fondo de la plataforma. Lo lleva toda vista que no pida otro.
 *
 * No es «el fondo de la vista de inicio» aunque el archivo se llame así: el
 * nombre es de cuando había uno por vista y se conserva para no renombrar un
 * archivo público —y su original en «recursos/fondos/»— sin más motivo.
 */
export const FONDO_GENERAL = '/fondo-inicio.jpg';

/**
 * Las vistas que cambian el fondo general por uno propio.
 *
 * Las dos por lo mismo: la vista trata de algo que su imagen retrata. Un tercer
 * caso tendría que justificarse igual, porque una imagen distinta por vista sin
 * relación con la vista es ruido.
 */
export const FONDOS_PROPIOS = {
  '/actores': '/fondo-actores.jpg',
  '/mapa': '/fondo-mapa.jpg',
};

/**
 * La imagen que le toca a una ruta.
 *
 * La coincidencia de las excepciones es exacta y no por prefijo: «/actores/abc»
 * es la ficha de un actor cultural, una vista distinta, y se lleva el fondo
 * general. Con prefijo se llevaría el del directorio, que es la imagen de
 * *varios* actores puesta detrás de la de uno.
 *
 * Devuelve «null» solo si lo que llega no es una ruta. Es defensa, no un caso:
 * el enrutador siempre da una cadena.
 */
export function fondoDeRuta(ruta) {
  if (typeof ruta !== 'string') return null;
  // Una ruta con barra final es la misma ruta: «/actores/» y «/actores» llevan
  // al mismo sitio en el enrutador, así que tienen que llevar al mismo fondo.
  const limpia = ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta;
  return FONDOS_PROPIOS[limpia] ?? FONDO_GENERAL;
}
