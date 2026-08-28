import { useEffect, useId, useRef } from 'react';
import L from 'leaflet';
import { CENTRO_SANTA_MARTA, esPuntoValido } from '../utils/coordenadas.js';
import { MARCADOR, RECUADRO, ZOOM_MAXIMO, capaDeTeselas } from './mapa.js';
import './MapaDePunto.css';

/**
 * Elegir un punto sobre el mapa — HU-22 · RF-08, primer criterio.
 *
 * Leaflet sobre cartografía de OpenStreetMap, que es la decisión ya tomada en
 * docs/03-arquitectura.md §6 y la razón de que HU-20 geocodifique con Nominatim:
 * el mismo origen de datos para buscar un sitio y para pintarlo, sin costo (R-02).
 *
 * ## Por qué Leaflet a secas y no «react-leaflet»
 *
 * Leaflet manipula el DOM por su cuenta, que es justo lo que React no espera. La
 * respuesta habitual es «react-leaflet», y se descartó por dos razones: añade una
 * capa que va por detrás de cada versión de React —el proyecto está en React
 * 19—, y lo que aporta se reduce a lo que hay debajo de estas líneas, que son
 * cincuenta y cuya parte difícil habría que entender igual para depurarla. Se
 * paga el envoltorio propio una vez y se lee entero.
 *
 * El trato con React es el mínimo: **un solo «div» que React pinta y no vuelve a
 * tocar**, y Leaflet mandando dentro. De ahí que el mapa y el marcador vivan en
 * «useRef» y no en el estado: no son datos que se pinten, son objetos vivos, y
 * meterlos en «useState» provocaría un repintado por cada arrastre del ratón.
 *
 * ## El marcador y las teselas viven aparte
 *
 * Estaban aquí hasta HU-28, que trajo un segundo mapa. El marcador dibujado con
 * CSS, la capa de OpenStreetMap con su atribución y el rectángulo del distrito
 * son ahora de «mapa.js», que explica por qué cada uno es como es. Lo que se
 * queda aquí es lo único que no comparten: **cómo se comporta este mapa**.
 *
 * ## Este mapa no es el único camino
 *
 * Hacer clic sobre un mapa es un gesto de ratón, y no hay forma razonable de
 * hacerlo con el teclado. Por eso el mapa **nunca es la única manera de fijar el
 * punto**: al lado va siempre el buscador de direcciones, que se recorre con el
 * tabulador y cuyos candidatos son botones. El mapa afina lo que el buscador
 * aproxima; quien no pueda usarlo llega igual al punto (WCAG 2.1.1).
 */

export default function MapaDePunto({
  punto,
  alElegirPunto,
  descripcion = 'Haz clic sobre el mapa para situar el punto, o arrastra el marcador para afinarlo.',
}) {
  const id = useId();
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marcador = useRef(null);

  /**
   * Quien está dentro del mapa cuando ocurre el clic es la función que se pasó
   * en el primer pintado, y esa recordaría el «alElegirPunto» de entonces. Se
   * guarda en una referencia y se lee en el momento del clic para que el mapa no
   * tenga que reconstruirse cada vez que el formulario se repinta.
   */
  const avisar = useRef(alElegirPunto);
  avisar.current = alElegirPunto;

  // Se crea una vez y se destruye al desmontar. Sin el «remove()», volver a
  // entrar en la vista encuentra el contenedor ya inicializado y Leaflet aborta
  // con «Map container is already initialized».
  useEffect(() => {
    const instancia = L.map(contenedor.current, {
      center: [CENTRO_SANTA_MARTA.lat, CENTRO_SANTA_MARTA.lon],
      zoom: 13,
      // El mismo rectángulo que valida «estaEnSantaMarta». Que no se pueda
      // arrastrar fuera del distrito evita el error antes de cometerlo, en lugar
      // de explicarlo después con un mensaje.
      maxBounds: RECUADRO,
      maxBoundsViscosity: 1,
      minZoom: 11,
      maxZoom: ZOOM_MAXIMO,
    });

    capaDeTeselas().addTo(instancia);

    instancia.on('click', (evento) => {
      avisar.current({ lat: evento.latlng.lat, lon: evento.latlng.lng });
    });

    mapa.current = instancia;

    // El mapa nace a menudo dentro de un formulario que todavía se está
    // colocando, y Leaflet mide el contenedor al crearse. Sin esta medición
    // diferida sale medio mapa gris.
    const medir = setTimeout(() => instancia.invalidateSize(), 0);

    return () => {
      clearTimeout(medir);
      instancia.remove();
      mapa.current = null;
      marcador.current = null;
    };
  }, []);

  // El punto puede cambiar desde fuera —al elegir un candidato del buscador—, así
  // que el marcador se sincroniza con la propiedad y no con el clic.
  useEffect(() => {
    const instancia = mapa.current;
    if (!instancia) return;

    if (!esPuntoValido(punto)) {
      if (marcador.current) {
        marcador.current.remove();
        marcador.current = null;
      }
      return;
    }

    const posicion = [punto.lat, punto.lon];

    if (!marcador.current) {
      marcador.current = L.marker(posicion, { icon: MARCADOR, draggable: true }).addTo(instancia);
      marcador.current.on('dragend', (evento) => {
        const { lat, lng } = evento.target.getLatLng();
        avisar.current({ lat, lon: lng });
      });
    } else {
      marcador.current.setLatLng(posicion);
    }

    // Se centra solo si el punto quedó fuera de lo que se está viendo. Recentrar
    // siempre daría un salto en cada arrastre del propio marcador.
    if (!instancia.getBounds().contains(posicion)) instancia.setView(posicion, instancia.getZoom());
  }, [punto]);

  return (
    <div className="mapa-punto">
      <p id={`${id}-ayuda`} className="campo__ayuda">
        {descripcion}
      </p>
      <div
        ref={contenedor}
        className="mapa-punto__lienzo"
        role="application"
        aria-label="Mapa de Santa Marta para situar el punto"
        aria-describedby={`${id}-ayuda`}
      />
    </div>
  );
}
