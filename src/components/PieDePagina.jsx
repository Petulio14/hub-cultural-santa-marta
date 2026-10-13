import { Link } from 'react-router-dom';
import './PieDePagina.css';

/**
 * Pie común. Su enlace de regreso al inicio es la segunda salida visible desde
 * cualquier vista, junto a la marca de la cabecera: el tercer criterio de
 * aceptación de HU-09 pide que ese camino exista siempre, y una vista larga
 * puede dejar la cabecera fuera de la pantalla.
 */
export default function PieDePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie__interior">
        <p className="pie__creditos">
          Hub Cultural Santa Marta — trabajo de grado de Ingeniería en Software,
          Tecnológico de Antioquia.
        </p>
        <Link className="pie__inicio" to="/">
          Volver al inicio
        </Link>
        {/* La política tiene que ser alcanzable desde cualquier vista, y no solo
            desde el registro: es donde se ejercen los derechos del titular. */}
        <Link className="pie__inicio" to="/politica-de-datos">
          Tratamiento de datos
        </Link>
        <p className="pie__nota">
          Prototipo académico en construcción. Los datos publicados se tratan conforme a la
          Ley 1581 de 2012.
        </p>
        {/* HU-37, tercer criterio: para contrastar lo que se está viendo con el
            repositorio hace falta que la página diga de dónde salió. Los dos
            valores los escribe «vite.config.js» al compilar, así que no pueden
            desfasarse de lo publicado; el commit es el que la etiqueta señala. */}
        <p className="pie__version">
          Versión {__VERSION__} · compilación <code>{__COMMIT__}</code>
        </p>
      </div>
    </footer>
  );
}
