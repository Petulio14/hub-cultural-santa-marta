import { Link } from 'react-router-dom';
import { useColaDeAprobacion } from '../../hooks/useColaDeAprobacion.js';
import {
  cambiarEstadoDeActor,
  listarActoresPendientes,
} from '../../services/actoresService.js';

/**
 * Aprobación de los perfiles de actores culturales — HU-18.
 *
 * Un perfil nace `pendiente` y no aparece en el directorio público hasta que
 * alguien lo aprueba (docs/04 §4). Sin esta sección, el quinto criterio de
 * aceptación de HU-18 solo podría cumplirse editando el documento desde la
 * consola de Firebase, es decir, fuera de la plataforma.
 *
 * No es la cola de moderación de HU-24: aquélla modera **publicaciones**, se
 * ordena por antigüedad y deja constancia de cada decisión en la colección
 * `moderaciones`. Aquí se decide únicamente si un perfil se publica.
 *
 * La mecánica —leer, decidir, recargar, avisar— la comparte con la cola de hubs
 * y vive en «useColaDeAprobacion».
 */
const MENSAJES = {
  alPublicar: (actor) => `«${actor.nombre}» ya figura en el directorio público.`,
  alRetirar: (actor) => `«${actor.nombre}» queda retirado. Su dueño puede seguir editándolo.`,
  alFallarLectura: 'No se pudieron leer los perfiles pendientes. Revisa la conexión.',
};

export default function PerfilesDeActores() {
  const { pendientes, cargando, error, aviso, ocupada, decidir } = useColaDeAprobacion({
    listar: listarActoresPendientes,
    cambiarEstado: cambiarEstadoDeActor,
    mensajes: MENSAJES,
  });

  return (
    <>
      <h2>Perfiles de actores culturales</h2>
      <p className="panel__intro">
        Un perfil recién creado no aparece en el directorio hasta que se aprueba. Una vez
        aprobado, su dueño lo edita cuantas veces quiera sin volver a pasar por aquí.
      </p>

      {aviso && (
        <p
          className={aviso.tipo === 'error' ? 'panel__aviso panel__aviso--error' : 'panel__aviso'}
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      {cargando && <p>Leyendo los perfiles pendientes…</p>}

      {error && (
        <p className="panel__aviso panel__aviso--error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && pendientes.length === 0 && (
        <p className="panel__vacio">
          No hay ningún perfil esperando aprobación. Los que ya están publicados se ven en el{' '}
          <Link to="/actores">directorio</Link>.
        </p>
      )}

      {pendientes.length > 0 && (
        <ul className="perfiles-pendientes">
          {pendientes.map((actor) => (
            <li className="tarjeta perfil-pendiente" key={actor.id}>
              <h3 className="perfil-pendiente__nombre">{actor.nombre}</h3>
              <p className="perfil-pendiente__manifestacion">{actor.manifestacion}</p>
              <p className="perfil-pendiente__descripcion">{actor.descripcion}</p>

              <p className="perfil-pendiente__acciones">
                <button
                  className="boton"
                  type="button"
                  disabled={ocupada}
                  onClick={() => decidir(actor, 'aprobado')}
                >
                  Publicar en el directorio
                </button>
                <button
                  className="boton boton--secundario"
                  type="button"
                  disabled={ocupada}
                  onClick={() => decidir(actor, 'inactivo')}
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
