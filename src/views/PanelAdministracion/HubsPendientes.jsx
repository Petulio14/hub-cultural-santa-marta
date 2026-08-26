import { Link } from 'react-router-dom';
import { useColaDeAprobacion } from '../../hooks/useColaDeAprobacion.js';
import { cambiarEstadoDeHub, listarHubsPendientes } from '../../services/hubsService.js';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';

/**
 * Aprobación de los hubs de innovación — HU-20.
 *
 * Misma mecánica que la cola de perfiles, en «useColaDeAprobacion». Lo que
 * cambia es qué hay que mirar antes de decidir, y por eso la tarjeta enseña
 * **la dirección y el punto** además del texto: un hub mal situado aparecerá en
 * el mapa de HU-30 en un sitio que no es el suyo, y ese es el error que aquí se
 * puede atrapar y luego ya no.
 */
const MENSAJES = {
  alPublicar: (hub) => `«${hub.nombre}» ya figura en el directorio de hubs.`,
  alRetirar: (hub) => `«${hub.nombre}» queda retirado. Su responsable puede seguir editándolo.`,
  alFallarLectura: 'No se pudieron leer los hubs pendientes. Revisa la conexión.',
};

export default function HubsPendientes() {
  const { pendientes, cargando, error, aviso, ocupada, decidir } = useColaDeAprobacion({
    listar: listarHubsPendientes,
    cambiarEstado: cambiarEstadoDeHub,
    mensajes: MENSAJES,
  });

  return (
    <>
      <h2>Hubs de innovación</h2>
      <p className="panel__intro">
        Comprueba sobre todo la dirección y el punto: es lo que situará el hub en el mapa, y
        un punto equivocado no se nota después.
      </p>

      {aviso && (
        <p
          className={aviso.tipo === 'error' ? 'panel__aviso panel__aviso--error' : 'panel__aviso'}
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      {cargando && <p>Leyendo los hubs pendientes…</p>}

      {error && (
        <p className="panel__aviso panel__aviso--error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && pendientes.length === 0 && (
        <p className="panel__vacio">
          No hay ningún hub esperando aprobación. Los que ya están publicados se ven en el{' '}
          <Link to="/hubs">directorio</Link>.
        </p>
      )}

      {pendientes.length > 0 && (
        <ul className="perfiles-pendientes">
          {pendientes.map((hub) => (
            <li className="tarjeta perfil-pendiente" key={hub.id}>
              <h3 className="perfil-pendiente__nombre">{hub.nombre}</h3>

              {hub.lineasDeTrabajo.length > 0 && (
                <ul className="tarjeta-hub__lineas">
                  {hub.lineasDeTrabajo.map((linea) => (
                    <li key={linea}>{linea}</li>
                  ))}
                </ul>
              )}

              <p className="perfil-pendiente__descripcion">{hub.descripcion}</p>

              <p className="perfil-pendiente__direccion">
                {hub.direccion}
                {hub.punto && (
                  <span className="tarjeta-hub__punto">
                    {' · '}
                    {textoDeCoordenadas(hub.punto)}
                  </span>
                )}
              </p>

              <p className="perfil-pendiente__acciones">
                <button
                  className="boton"
                  type="button"
                  disabled={ocupada}
                  onClick={() => decidir(hub, 'aprobado')}
                >
                  Publicar en el directorio
                </button>
                <button
                  className="boton boton--secundario"
                  type="button"
                  disabled={ocupada}
                  onClick={() => decidir(hub, 'inactivo')}
                >
                  Dejar sin publicar
                </button>
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
