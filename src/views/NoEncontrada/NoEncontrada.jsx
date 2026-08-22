import { Link, useLocation } from 'react-router-dom';

/**
 * Página de error controlada del enrutador: cualquier dirección que no
 * corresponda a una vista termina aquí, nunca en una pantalla en blanco
 * (tercer criterio de aceptación de HU-07).
 */
export default function NoEncontrada() {
  const { pathname } = useLocation();

  return (
    <section className="contenedor pendiente">
      <p className="pendiente__etiqueta">Error 404</p>
      <h1>Esta página no existe</h1>
      <p>
        No hay ninguna vista en <code>{pathname}</code>. Puede que la dirección esté mal
        escrita o que el contenido ya no esté publicado.
      </p>
      <p>
        <Link className="enlace-boton" to="/">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
