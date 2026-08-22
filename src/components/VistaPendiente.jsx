import { Link } from 'react-router-dom';

/**
 * Marcador de una vista del prototipo todavía no desarrollada. Declara a qué
 * vista de docs/05-prototipo-interfaz.md corresponde y qué historia la
 * construirá, para que ninguna pantalla del enrutador quede sin explicación.
 *
 * Cada vista sustituye este marcador por su contenido real en su historia.
 */
export default function VistaPendiente({ vista, titulo, historias, descripcion }) {
  return (
    <section className="contenedor pendiente">
      <p className="pendiente__etiqueta">{vista} · en construcción</p>
      <h1>{titulo}</h1>
      <p>{descripcion}</p>
      <p>
        Esta vista se desarrolla en {historias}. La estructura de navegación que la
        contiene es la de HU-07.
      </p>
      <Link className="enlace-boton enlace-boton--secundario" to="/">
        Volver al inicio
      </Link>
    </section>
  );
}
