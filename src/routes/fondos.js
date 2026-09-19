/**
 * La imagen de fondo de cada vista.
 *
 * Están en un solo sitio por la misma razón que los accesos principales: el
 * componente que pinta el fondo y cualquier comprobación posterior tienen que
 * leer la misma tabla. Es un dato de navegación, no una ruta.
 *
 * ## Por qué las imágenes vienen ya desenfocadas
 *
 * El desenfoque no se hace en CSS con «filter: blur()». Podría, pero entonces
 * el navegador tendría que descargar la imagen nítida —tres megas— y desenfocar
 * en cada pintado lo que nadie va a ver nítido nunca. Se hace una vez, al
 * preparar el archivo, y de paso se descarta la resolución que el desenfoque ya
 * ha destruido: de 1672 px se baja a 480, que el navegador vuelve a estirar
 * sobre la pantalla suavizándolo todavía un poco más.
 *
 * Son 5 KB por imagen en lugar de tres megas, y **la nitidez perdida es
 * exactamente la que el desenfoque iba a borrar**. Los originales se conservan
 * en «recursos/fondos/», fuera de «public/» para que no se publiquen; se
 * regeneran con «python herramientas/preparar-fondos.py» (docs/10 §2 quater).
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
