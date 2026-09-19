import { useLocation } from 'react-router-dom';
import { fondoDeRuta } from '../routes/fondos.js';
import './Fondo.css';

/**
 * La imagen desenfocada del fondo, detrás de todo el contenido.
 *
 * Va en una capa fija y no en el «background» del body por dos motivos: el body
 * mide lo que mide el contenido —en una vista larga la imagen se repetiría o se
 * estiraría—, y «background-attachment: fixed» es justo lo que los navegadores
 * de iOS pintan a tirones al desplazar.
 *
 * La ruta de la imagen se escribe en el estilo del elemento, y no en la hoja,
 * porque la tabla que decide qué imagen va en qué vista vive en «fondos.js».
 * Repetirla en el CSS sería tener dos listas que pueden discrepar.
 *
 * Es decorativa: «aria-hidden» la saca del árbol de accesibilidad. No aporta
 * ninguna información que el texto de la vista no dé, y anunciarla sería ruido.
 */
export default function Fondo() {
  const { pathname } = useLocation();
  const imagen = fondoDeRuta(pathname);

  // Las vistas sin fondo no pintan una capa transparente: no pintan nada.
  if (imagen === null) return null;

  return (
    <div
      className="fondo"
      style={{ backgroundImage: `url("${imagen}")` }}
      aria-hidden="true"
    />
  );
}
