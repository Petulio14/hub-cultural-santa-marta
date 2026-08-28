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
