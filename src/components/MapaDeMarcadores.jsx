import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { textoDelPeriodo } from '../utils/fechas.js';
import { MARCADOR, RECUADRO, ZOOM_MAXIMO, capaDeTeselas } from './mapa.js';
import './MapaDeMarcadores.css';

/**
 * La oferta cultural entera sobre el mapa — HU-30 · RF-11, RF-10.
 *
 * El **tercer** mapa del proyecto, y el que justifica que las piezas comunes
 * salieran a «mapa.js» en HU-28. Comparte con los otros dos el marcador, las
 * teselas y el rectángulo del distrito; lo demás es suyo.
 *
 * | | HU-22 | HU-28 | HU-30 |
 * | --- | --- | --- | --- |
 * | Para qué | elegir un punto | enseñar uno | recorrerlos todos |
 * | Marcadores | uno, arrastrable | uno, fijo | muchos, con ficha |
 * | Arrastre en móvil | sí | **no** | **sí, con dos dedos** |
 *
 * ## El cuarto criterio, que es lo contrario del de HU-28
 *
 * «Desplazamiento y acercamiento táctil **sin bloquear el desplazamiento de la
 * página**.» Son dos cosas que se estorban: si un dedo sobre el mapa lo
 * desplaza, ese mismo dedo ya no desplaza la página, y quien solo quería seguir
 * bajando se queda atrapado.
 *
 * La salida es la que usan los mapas que se incrustan en artículos: **un dedo
 * desplaza la página, dos mueven el mapa**. Leaflet no lo trae, así que se
 * enciende y se apaga «dragging» según cuántos dedos haya en la pantalla. El
 * acercamiento a pellizco no necesita nada: ya son dos dedos por definición.
 *
 * Y se dice en pantalla. Un gesto que hay que adivinar es un gesto que nadie
 * hace: sin el aviso, el mapa parecería roto.
 *
 * En el escritorio no aplica —no hay dedos— y el mapa se arrastra con el ratón,
 * que es lo que se espera de la vista cuyo contenido principal es el mapa.
 *
 * ## Los marcadores se rehacen enteros
 *
 * Al cambiar el filtro se vacía el grupo y se vuelve a poblar, en lugar de
 * calcular qué marcador sobra y cuál falta. Con doscientos marcadores como tope
 * (docs/29 §4) la diferencia no se nota, y la alternativa es un algoritmo de
 * sincronización que hay que mantener correcto para ahorrar milisegundos que
 * nadie percibe.
 */

/**
 * La ficha que se abre al pulsar un marcador — **segundo criterio**.
 *
 * Se construye con nodos del DOM y no con una cadena de HTML, y esa es una
 * decisión de seguridad y no de estilo. El título y el lugar los escribe un
 * actor cultural: son texto de otra persona. Pasarlos por «innerHTML» dentro de
 * un globo de Leaflet convertiría cualquier publicación aprobada en un sitio
 * donde ejecutar guiones sobre el navegador de un visitante. Con «textContent»
 * el problema no llega a existir, porque el texto nunca se interpreta.
 *
 * El acceso al detalle es un enlace de verdad —con su «href»— y no un botón: así
 * se puede abrir en otra pestaña, copiar la dirección o verla al pasar por
 * encima. El «click» lo intercepta la navegación de React para no recargar la
 * aplicación entera, pero solo cuando es un clic normal: con Ctrl, con Mayús o
 * con el botón central se deja pasar, que es como se abre en otra pestaña.
 */
function fichaDelMarcador(publicacion, categoria, alAbrir) {
  const caja = document.createElement('div');
  caja.className = 'ficha-mapa';

  if (categoria) {
    const etiqueta = document.createElement('p');
    etiqueta.className = 'ficha-mapa__categoria';
    etiqueta.textContent = categoria;
    caja.append(etiqueta);
  }

  const titulo = document.createElement('h2');
  titulo.className = 'ficha-mapa__titulo';
  titulo.textContent = publicacion.titulo;
  caja.append(titulo);

  const cuando = document.createElement('p');
  cuando.className = 'ficha-mapa__cuando';
  cuando.textContent = textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin);
  caja.append(cuando);

  const enlace = document.createElement('a');
  enlace.className = 'enlace-boton';
  enlace.href = `/eventos/${publicacion.id}`;
  enlace.textContent = 'Ver la actividad';
  enlace.addEventListener('click', (evento) => {
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) return;
    evento.preventDefault();
    alAbrir(publicacion.id);
  });
  caja.append(enlace);

  return caja;
}

export default function MapaDeMarcadores({ publicaciones, nombreDeCategoria, alAbrir }) {
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const grupo = useRef(null);

  // Lo mismo que en «MapaDePunto»: quien está dentro del mapa cuando se pulsa un
  // marcador es la función del primer pintado. Se lee desde una referencia para
  // que el mapa no tenga que reconstruirse cada vez que la vista se repinta.
  const abrir = useRef(alAbrir);
  abrir.current = alAbrir;

  useEffect(() => {
    const enTelefono = L.Browser.mobile;

    const instancia = L.map(contenedor.current, {
      center: RECUADRO.getCenter(),
      zoom: 13,
      maxBounds: RECUADRO,
      maxBoundsViscosity: 1,
      minZoom: 11,
      maxZoom: ZOOM_MAXIMO,
      // En el teléfono empieza apagado y lo enciende el segundo dedo.
      dragging: !enTelefono,
    });

    capaDeTeselas().addTo(instancia);
    grupo.current = L.layerGroup().addTo(instancia);
    mapa.current = instancia;

    const alCambiarLosDedos = (evento) => {
      if (evento.touches.length > 1) instancia.dragging.enable();
      else instancia.dragging.disable();
    };

    const lienzo = contenedor.current;
    if (enTelefono) {
      lienzo.addEventListener('touchstart', alCambiarLosDedos, { passive: true });
      lienzo.addEventListener('touchend', alCambiarLosDedos, { passive: true });
    }

    // Leaflet mide el contenedor al crearse, y aquí nace dentro de una vista que
    // todavía se está colocando.
    const medir = setTimeout(() => instancia.invalidateSize(), 0);

    // Sin el «remove()», volver a entrar en la vista encuentra el contenedor ya
    // inicializado y Leaflet aborta con «Map container is already initialized».
    // Con StrictMode eso ocurre en el primer montaje, no en el segundo.
    return () => {
      clearTimeout(medir);
      if (enTelefono) {
        lienzo.removeEventListener('touchstart', alCambiarLosDedos);
        lienzo.removeEventListener('touchend', alCambiarLosDedos);
      }
      instancia.remove();
      mapa.current = null;
      grupo.current = null;
    };
  }, []);

  useEffect(() => {
    const instancia = mapa.current;
    if (!instancia || !grupo.current) return;

    grupo.current.clearLayers();

    const marcadores = publicaciones.map((publicacion) => {
      const marcador = L.marker([publicacion.punto.lat, publicacion.punto.lon], {
        icon: MARCADOR,
        // El texto que sale al pasar el ratón por encima.
        title: publicacion.titulo,
      });
      marcador.bindPopup(() =>
        fichaDelMarcador(publicacion, nombreDeCategoria(publicacion.categoria), (id) =>
          abrir.current(id)
        )
      );
      marcador.addTo(grupo.current);

      // **El nombre accesible se pone después de añadirlo**, y no con la opción
      // «alt» del marcador. «alt» solo sirve cuando el icono es una imagen, y el
      // de este proyecto es un «divIcon»: un div no tiene «alt», así que la
      // opción se acepta sin efecto y el marcador se queda sin nombre. Se
      // comprobó en el navegador —el atributo no aparecía— antes de escribirlo
      // así (docs/29 §6).
      //
      // Leaflet ya le pone «role="button"» y «tabindex="0"», de modo que los
      // marcadores se recorren con el tabulador y se abren con Intro. Lo único
      // que faltaba era **qué** anuncia cada uno.
      marcador.getElement()?.setAttribute('aria-label', publicacion.titulo);

      return marcador;
    });

    // Se encuadra lo que hay, en lugar de dejar fijo el centro del distrito: con
    // el filtro puesto, tres marcadores en el mismo barrio quedarían como tres
    // puntos diminutos en una esquina. «maxZoom» evita que un solo marcador
    // acerque hasta el portal.
    if (marcadores.length > 0) {
      instancia.fitBounds(L.featureGroup(marcadores).getBounds(), {
        padding: [40, 40],
        maxZoom: 16,
      });
    } else {
      instancia.fitBounds(RECUADRO);
    }
  }, [publicaciones, nombreDeCategoria]);

  return (
    <div className="mapa-marcadores">
      {L.Browser.mobile && (
        <p className="mapa-marcadores__gesto" role="status">
          Usa <strong>dos dedos</strong> para mover el mapa. Con uno se desplaza la página.
        </p>
      )}
      <div
        ref={contenedor}
        className="mapa-marcadores__lienzo"
        role="application"
        aria-label="Mapa de Santa Marta con las actividades culturales situadas"
      />
    </div>
  );
}
