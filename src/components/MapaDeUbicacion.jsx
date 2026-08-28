import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { esPuntoValido, textoDeCoordenadas } from '../utils/coordenadas.js';
import { MARCADOR, RECUADRO, ZOOM_MAXIMO, capaDeTeselas } from './mapa.js';
import './MapaDeUbicacion.css';

/**
 * Dónde queda algo, sobre el mapa — HU-28 · RF-11, tercer criterio.
 *
 * El segundo mapa del proyecto, y el primero que **no se toca**. Comparte con el
 * de HU-22 el marcador, las teselas y el rectángulo del distrito (mapa.js), y no
 * comparte nada de lo demás, que es justo la razón de que sean dos componentes y
 * no uno con una bandera: aquel existe para elegir un punto y este para
 * enseñarlo.
 *
 * ## Tres cosas que este mapa hace al revés
 *
 * 1. **Nace centrado en el punto**, y con más acercamiento. El de HU-22 abre en
 *    el centro histórico porque todavía no hay punto que enseñar; aquí el punto
 *    es el motivo de que el mapa exista.
 *
 * 2. **No captura la rueda del ratón.** Un mapa en mitad de una página que se
 *    desplaza y que se traga la rueda deja a quien pasaba de largo dando vueltas
 *    sobre Santa Marta. Los botones de acercar y alejar siguen ahí para quien sí
 *    quiera moverlo.
 *
 * 3. **En un móvil no se arrastra.** Es el mismo problema con el dedo y peor:
 *    un arrastre sobre el mapa desplazaría el mapa en lugar de la página, y la
 *    ficha se vuelve una trampa. `L.Browser.mobile` es la comprobación que la
 *    propia documentación de Leaflet recomienda para esto. Anticipa el cuarto
 *    criterio de HU-30, que pide exactamente lo contrario para el mapa grande:
 *    allí desplazar el mapa **es** lo que se va a hacer.
 *
 * ## No es la única forma de saber dónde es
 *
 * El lugar está escrito al lado, con su dirección, y las coordenadas van en el
 * texto alternativo. Un mapa es una imagen: quien no pueda verlo no se queda sin
 * la información, que es la misma regla que siguió HU-22 con el buscador de
 * direcciones (WCAG 1.1.1).
 */
export default function MapaDeUbicacion({ punto, titulo }) {
  const contenedor = useRef(null);

  useEffect(() => {
    if (!esPuntoValido(punto)) return undefined;

    const instancia = L.map(contenedor.current, {
      center: [punto.lat, punto.lon],
      zoom: 16,
      maxBounds: RECUADRO,
      maxBoundsViscosity: 1,
      minZoom: 11,
      maxZoom: ZOOM_MAXIMO,
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
    });

    capaDeTeselas().addTo(instancia);
    L.marker([punto.lat, punto.lon], { icon: MARCADOR, keyboard: false }).addTo(instancia);

    // Igual que en el otro mapa: Leaflet mide el contenedor al crearse, y aquí
    // nace dentro de una ficha que todavía se está colocando.
    const medir = setTimeout(() => instancia.invalidateSize(), 0);

    // Sin el «remove()», volver a entrar en la vista encuentra el contenedor ya
    // inicializado y Leaflet aborta con «Map container is already initialized».
    // Con StrictMode eso ocurre en el primer montaje, no en el segundo.
    return () => {
      clearTimeout(medir);
      instancia.remove();
    };
  }, [punto]);

  if (!esPuntoValido(punto)) return null;

  return (
    <div
      ref={contenedor}
      className="mapa-ubicacion__lienzo"
      role="img"
      aria-label={`Mapa con la ubicación de ${titulo} en Santa Marta: ${textoDeCoordenadas(punto)}`}
    />
  );
}
