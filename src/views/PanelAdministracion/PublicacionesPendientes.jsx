import { useCallback, useState } from 'react';
import AreaDeTexto from '../../components/AreaDeTexto.jsx';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { useColaDeAprobacion } from '../../hooks/useColaDeAprobacion.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { listarPublicacionesPendientes } from '../../services/eventosService.js';
import { moderarPublicacion } from '../../services/moderacionService.js';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';
import { textoDeFecha, textoDelPeriodo } from '../../utils/fechas.js';
import {
  LONGITUD_MAXIMA_OBSERVACION,
  validarObservacion,
} from '../../utils/validaciones.js';

/**
 * Cola de moderación de publicaciones — HU-24 · RF-13.
 *
 * Tercera cola del panel, y la primera que **no basta con decidir**: aprobar y
 * devolver dejan constancia en «moderaciones», y devolver exige además explicar
 * por qué. La mecánica de leer, decidir y recargar sigue siendo la de
 * «useColaDeAprobacion»; lo que cambia es que la decisión lleva un dato encima.
 *
 * ## El orden de la cola
 *
 * De la más antigua a la más reciente. Es lo que pide el primer criterio, y
 * además es lo correcto para una cola: quien lleva más tiempo esperando se
 * atiende antes. Es el orden **contrario** al de «Mis publicaciones», donde lo
 * último que uno hizo es lo primero que busca.
 *
 * ## Qué se enseña antes de decidir
 *
 * Todo lo que la publicación va a mostrar en el catálogo, incluida la imagen y el
 * punto. Un moderador que decide sobre un resumen aprueba cosas que no ha visto,
 * y el error se descubre cuando ya está publicado.
 */
const MENSAJES = {
  alPublicar: (publicacion) =>
    `«${publicacion.titulo}» ya está en el catálogo y en el mapa.`,
  alRetirar: (publicacion) =>
    `«${publicacion.titulo}» se devolvió a su autor con tus observaciones.`,
  alFallarLectura: 'No se pudieron leer las publicaciones pendientes. Revisa la conexión.',
};

export default function PublicacionesPendientes() {
  const { usuario } = useSesion();
  const uid = usuario?.uid ?? null;

  /**
   * Estable entre repintados, que es lo que el gancho exige de sus argumentos:
   * «recargar» depende de ellos y vive dentro de un efecto, así que una función
   * nueva en cada render volvería a leer la cola sin parar.
   */
  const decidirEnElServidor = useCallback(
    (idEvento, decision, observaciones) =>
      moderarPublicacion({ idEvento, idAdministrador: uid, decision, observaciones }),
    [uid]
  );

  const { pendientes, cargando, error, aviso, ocupada, decidir } = useColaDeAprobacion({
    listar: listarPublicacionesPendientes,
    cambiarEstado: decidirEnElServidor,
    mensajes: MENSAJES,
  });

  /** Qué publicación tiene abierto el cuadro de observaciones, y qué lleva escrito. */
  const [devolviendo, setDevolviendo] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [errorDeObservacion, setErrorDeObservacion] = useState(null);

  function abrirDevolucion(idEvento) {
    setDevolviendo(idEvento);
    setObservaciones('');
    setErrorDeObservacion(null);
  }

  async function devolver(publicacion) {
    const problema = validarObservacion(observaciones);
    setErrorDeObservacion(problema);
    if (problema) return;

    await decidir(publicacion, 'devuelto', observaciones);
    setDevolviendo(null);
    setObservaciones('');
  }

  return (
    <>
      <h2>Publicaciones por revisar</h2>
      <p className="panel__intro">
        Se atienden de la más antigua a la más reciente. Antes de aprobar, mira la fecha, el
        lugar y el punto en el mapa: son los datos con los que alguien va a intentar llegar.
      </p>

      {aviso && (
        <p
          className={aviso.tipo === 'error' ? 'panel__aviso panel__aviso--error' : 'panel__aviso'}
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      {cargando && <p>Leyendo las publicaciones pendientes…</p>}

      {error && (
        <p className="panel__aviso panel__aviso--error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && pendientes.length === 0 && (
        <p className="panel__vacio">
          No hay ninguna publicación esperando revisión. Cuando un actor cultural envíe una,
          aparecerá aquí.
        </p>
      )}

      {pendientes.length > 0 && (
        <ul className="perfiles-pendientes">
          {pendientes.map((publicacion) => (
            <li className="tarjeta perfil-pendiente" key={publicacion.id}>
              <ImagenDeActor
                className="moderacion__imagen"
                imagen={publicacion.imagen}
                nombre={publicacion.titulo}
                alt={`Imagen de la publicación ${publicacion.titulo}`}
              />

              <h3 className="perfil-pendiente__nombre">{publicacion.titulo}</h3>

              <p className="moderacion__cuando">
                {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
              </p>

              <p className="perfil-pendiente__direccion">
                {publicacion.lugar}
                {publicacion.punto ? (
                  <span className="tarjeta-hub__punto">
                    {' · '}
                    {textoDeCoordenadas(publicacion.punto)}
                  </span>
                ) : (
                  <span className="moderacion__sin-punto">
                    {' · '}sin situar en el mapa
                  </span>
                )}
              </p>

              <p className="perfil-pendiente__descripcion">{publicacion.descripcion}</p>

              {publicacion.fechaCreacion && (
                <p className="moderacion__enviada">
                  Enviada el {textoDeFecha(publicacion.fechaCreacion)}
                </p>
              )}

              {devolviendo === publicacion.id ? (
                <div className="moderacion__devolucion">
                  <AreaDeTexto
                    etiqueta="Qué debe corregir"
                    valor={observaciones}
                    alCambiar={(valor) => {
                      setObservaciones(valor);
                      setErrorDeObservacion(null);
                    }}
                    maximo={LONGITUD_MAXIMA_OBSERVACION}
                    error={errorDeObservacion}
                    ayuda="Lo lee su autor tal cual. Di qué falta o qué hay que cambiar, no solo que no sirve."
                    filas={4}
                  />

                  <p className="perfil-pendiente__acciones">
                    {/* «Cancelar» primero, como en el borrado de HU-23: el botón
                        que tiene consecuencias no se pone donde estaba el que se
                        acaba de pulsar. */}
                    <button
                      className="boton boton--secundario"
                      type="button"
                      disabled={ocupada}
                      onClick={() => setDevolviendo(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="boton boton--peligro"
                      type="button"
                      disabled={ocupada}
                      onClick={() => devolver(publicacion)}
                    >
                      {ocupada ? 'Devolviendo…' : 'Devolver con estas observaciones'}
                    </button>
                  </p>
                </div>
              ) : (
                <p className="perfil-pendiente__acciones">
                  <button
                    className="boton"
                    type="button"
                    disabled={ocupada}
                    onClick={() => decidir(publicacion, 'aprobado')}
                  >
                    Aprobar y publicar
                  </button>
                  <button
                    className="boton boton--secundario"
                    type="button"
                    disabled={ocupada}
                    onClick={() => abrirDevolucion(publicacion.id)}
                  >
                    Devolver al autor
                  </button>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
