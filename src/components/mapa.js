import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LIMITES_SANTA_MARTA } from '../utils/coordenadas.js';
import './mapa.css';

/**
 * Las piezas que comparten los mapas del proyecto — HU-22, extraídas en HU-28.
 *
 * Nacieron dentro de «MapaDePunto», que era el único mapa que había. HU-28 trae
 * el segundo —el de la ficha de una publicación, que no se toca— y HU-30 traerá
 * el tercero. Lo que se repetía en los tres es esto: el marcador, la capa de
 * teselas con su atribución y el rectángulo del distrito.
 *
 * Lo que **no** se comparte es cómo se comporta cada mapa, y por eso esto es un
 * archivo de piezas y no un componente configurable con siete propiedades: el de
 * HU-22 se pulsa y se arrastra, el de HU-28 solo se mira, y el de HU-30 tendrá
 * muchos marcadores. Un componente que sirviera para los tres tendría dentro los
 * tres, con banderas.
 */

/**
 * El icono es un elemento HTML —un «divIcon»— y no el PNG de Leaflet.
 *
 * Leaflet trae sus iconos como archivos cuya ruta calcula a partir de la del
 * script. Con un empaquetador esa ruta deja de existir y el marcador desaparece
 * **sin error en consola**: el defecto clásico de Leaflet con Vite. Con un
 * elemento HTML el problema no llega a existir, y de regalo el color sale de la
 * paleta de «variables.css» en vez de ser el azul de Leaflet, que es lo que
 * exige «npm run verificar».
 */
export const MARCADOR = L.divIcon({
  className: 'mapa__marcador',
  html: '<span class="mapa__aguja" aria-hidden="true"></span>',
  iconSize: [24, 34],
  // La punta de la aguja, no su centro: el marcador señala el sitio con la
  // punta, y anclarlo al centro dejaría el punto real 17 px más abajo.
  iconAnchor: [12, 34],
});

/** El mismo rectángulo que valida «estaEnSantaMarta» (docs/21 §2). */
export const RECUADRO = L.latLngBounds(
  [LIMITES_SANTA_MARTA.latMin, LIMITES_SANTA_MARTA.lonMin],
  [LIMITES_SANTA_MARTA.latMax, LIMITES_SANTA_MARTA.lonMax]
);

export const ZOOM_MAXIMO = 18;

/**
 * La cartografía de OpenStreetMap, con la atribución que exige su licencia.
 *
 * Es la decisión ya tomada en docs/03 §6 y la razón de que HU-20 geocodifique
 * con Nominatim: el mismo origen de datos para buscar un sitio y para pintarlo,
 * sin costo (R-02). La atribución no es cortesía, es la condición de uso, y por
 * eso vive aquí y no en cada mapa: un mapa nuevo la hereda en lugar de tener que
 * acordarse.
 */
export function capaDeTeselas() {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: ZOOM_MAXIMO,
  });
}

/**
 * Los mandos del mapa, en español — HU-32 · segundo criterio de aceptación.
 *
 * Leaflet rotula los suyos en inglés y no hay manera de traducirlos desde fuera:
 * el botón de acercar se anuncia «Zoom in» y el crédito de la biblioteca lleva
 * «A JavaScript library for interactive maps». Con el ratón eso es un detalle
 * —los botones dicen «+» y «−»—, pero un lector de pantalla **solo tiene el
 * rótulo**, así que quien recorre el mapa con teclado y voz se encuentra dos
 * mandos en otro idioma en medio de una página en español.
 *
 * Se aplica a los tres mapas después de crearlos, que es el único momento en que
 * los mandos ya existen.
 *
 * Los botones se buscan **por su clase** y no por «instancia.zoomControl
 * ._zoomInButton», que era la primera versión. Ese campo empieza por guion bajo:
 * es interior de Leaflet y puede cambiar de nombre en cualquier versión, y como
 * el acceso iba con «?.» el día que cambiara los rótulos volverían al inglés
 * **sin que nada fallara**. «leaflet-control-zoom-in» es parte de su hoja de
 * estilos, que es lo más parecido a una interfaz pública que ofrece para esto.
 */
const ROTULOS = {
  '.leaflet-control-zoom-in': ['Acercar', 'Acercar el mapa'],
  '.leaflet-control-zoom-out': ['Alejar', 'Alejar el mapa'],
};

export function rotularEnEspanol(instancia) {
  const contenedor = instancia.getContainer();
  for (const [selector, [titulo, nombre]] of Object.entries(ROTULOS)) {
    const boton = contenedor.querySelector(selector);
    if (!boton) continue;
    boton.setAttribute('title', titulo);
    boton.setAttribute('aria-label', nombre);
  }

  // El crédito de Leaflet se conserva —su licencia no lo exige, pero se usa su
  // trabajo— y se escribe en español. La atribución de OpenStreetMap, que sí es
  // condición de uso, la pone «capaDeTeselas» y no se toca aquí.
  instancia.attributionControl?.setPrefix(
    '<a href="https://leafletjs.com/" title="Biblioteca de mapas Leaflet">Leaflet</a>'
  );

  return instancia;
}
