import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

/**
 * Red de seguridad del enrutador: si una vista falla al cargar o al renderizar,
 * el usuario ve un mensaje comprensible y una salida, no una pantalla en blanco.
 * Se distingue del 404 en que aquí sí ocurrió un fallo del programa.
 */
export default function ErrorDeRuta() {
  const error = useRouteError();
  const esRespuesta = isRouteErrorResponse(error);
  const detalle = esRespuesta
    ? `${error.status} · ${error.statusText}`
    : error?.message || 'Error inesperado';

  return (
    <main className="disposicion__principal">
      <section className="contenedor pendiente">
        <p className="pendiente__etiqueta">Algo salió mal</p>
        <h1>No pudimos mostrar esta página</h1>
        <p>
          Inténtalo de nuevo en un momento. Si vuelve a ocurrir, avísanos indicando qué
          estabas consultando.
        </p>
        <p>
          <small>{detalle}</small>
        </p>
        <p>
          <Link className="enlace-boton" to="/">
            Volver al inicio
          </Link>
        </p>
      </section>
    </main>
  );
}
