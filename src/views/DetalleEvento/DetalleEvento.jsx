import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import MapaDeUbicacion from '../../components/MapaDeUbicacion.jsx';
import { registrarInteraccion } from '../../services/interaccionesService.js';
import { mensajeDe } from '../../utils/errores.js';
import ContactoDelActor from './ContactoDelActor.jsx';
import { useNombresDeCategoria } from '../../hooks/useNombresDeCategoria.js';
import { leerActor } from '../../services/actoresService.js';
import { leerPublicacionAprobada } from '../../services/eventosService.js';
import { esPuntoValido, textoDeCoordenadas } from '../../utils/coordenadas.js';
import { textoDelPeriodo, yaTermino } from '../../utils/fechas.js';
import './DetalleEvento.css';

/**
 * V-3 · Ficha completa de una publicación — HU-28 · RF-09, RF-11; HU-29 ·
 * RF-12, RF-15.
 *
 * Es la vista que hace pulsable la tarjeta del catálogo. HU-25 la dejó sin
 * enlazar a propósito —enlazar a «en construcción» es peor que no enlazar
 * (docs/24 §7)—, y el enlace llega con la vista que abre.
 *
 * Dos lecturas y no una: la publicación y **su actor**. El documento del evento
 * guarda el «idActor» y nada más de quien lo publicó, así que el nombre y la
 * imagen del responsable hay que ir a buscarlos. Van en la misma pantalla y se
 * piden por separado, de modo que si la segunda falla la ficha se pinta igual:
 * lo que se vino a leer es la actividad.
 *
 * **El actor puede no estar disponible aunque la publicación sí lo esté**, y no
 * es un caso raro: las reglas dejan leer públicamente solo los perfiles
 * aprobados, y desactivar una cuenta (HU-15) no retira sus publicaciones ya
 * aprobadas. Entonces se dice, y no se enlaza a una dirección que responderá que
 * ese perfil no está disponible (docs/27 §3).
 *
 * Los canales de contacto llegan en HU-29, detrás de un botón y solo si el
 * actor los autorizó (docs/28 §2).
 */
export default function DetalleEvento() {
  const { id } = useParams();
  const nombreDeCategoria = useNombresDeCategoria();

  const [publicacion, setPublicacion] = useState(null);
  const [actor, setActor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  /*
   * De qué publicaciones ya se anotó la consulta — HU-34 · segundo criterio.
   *
   * Hace falta por dos motivos, y el segundo es el que obliga:
   *
   * 1. El efecto se vuelve a ejecutar cuando cambia «id», y sin la marca una
   *    vuelta atrás del navegador contaría otra consulta de algo que ya se
   *    contó en esta misma visita.
   * 2. **React monta y desmonta cada efecto dos veces en desarrollo** —es lo que
   *    hace «StrictMode», y está encendido en «main.jsx»— así que sin esto todo
   *    número del panel saldría el doble mientras se desarrolla. Un indicador
   *    que miente solo en desarrollo es peor que uno que miente siempre: nadie
   *    lo mira dos veces.
   *
   * Es un «ref» y no un estado porque cambiarlo no tiene que repintar nada.
   */
  const consultasAnotadas = useRef(new Set());

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setActor(null);

    leerPublicacionAprobada(id)
      .then((leida) => {
        if (!vigente) return null;
        setPublicacion(leida);

        /*
         * La consulta se anota **solo si la publicación existe**. Una dirección
         * mal escrita no es una consulta de nada, y contarla metería en los
         * indicadores identificadores de evento que no corresponden a ninguno.
         *
         * Se dispara y no se espera, igual que el contacto de HU-29 (docs/28 §6):
         * quien abre una ficha quiere leerla, no esperar a que se anote que la
         * abrió. La contrapartida está dicha en el panel: el número es una cota
         * inferior.
         */
        if (leida && !consultasAnotadas.current.has(id)) {
          consultasAnotadas.current.add(id);
          registrarInteraccion({ idEvento: id, tipo: 'consulta' }).catch(() => {});
        }

        // Sin publicación no hay a quién buscar, y pedir el perfil igualmente
        // sería una lectura pagada para no enseñar nada.
        return leida ? leerActor(leida.idActor) : null;
      })
      .then((leido) => vigente && setActor(leido))
      .catch(
        (fallo) =>
          vigente &&
          setError(
            mensajeDe(fallo, 'No se pudo leer la publicación. Revisa la conexión y recarga.')
          )
      )
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <section className="contenedor detalle">
        <p>Leyendo la publicación…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="contenedor detalle">
        <h1>Detalle de la actividad</h1>
        <p className="detalle__aviso" role="alert">
          {error}
        </p>
      </section>
    );
  }

  // Igual que en el perfil de actor: «no existe» y «existe y no puedes verla»
  // dan la misma respuesta. Distinguirlas convertiría esta dirección en un
  // detector de publicaciones pendientes.
  if (!publicacion) {
    return (
      <section className="contenedor detalle">
        <h1>Esa actividad no está disponible</h1>
        <p>
          La dirección no corresponde a ninguna actividad publicada. Puede que se haya
          escrito mal, que la actividad se haya retirado o que todavía no esté aprobada.
        </p>
        <Link className="enlace-boton enlace-boton--secundario" to="/eventos">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const categoria = nombreDeCategoria(publicacion.categoria);
  const terminada = yaTermino(publicacion.fechaFin);
  const situada = esPuntoValido(publicacion.punto);

  return (
    <section className="contenedor detalle">
      {publicacion.estadoPublicacion !== 'aprobado' && (
        <p className="detalle__borrador" role="status">
          Esta actividad todavía no está aprobada: ningún visitante puede abrir esta
          dirección. La ves porque es tuya o porque administras la plataforma.
        </p>
      )}

      <p className="detalle__migas">
        <Link to="/eventos">Catálogo de eventos</Link>
      </p>

      <ImagenDeActor
        className="detalle__imagen"
        imagen={publicacion.imagen}
        nombre={publicacion.titulo}
        alt={`Imagen de ${publicacion.titulo}`}
      />

      {categoria && <p className="detalle__categoria">{categoria}</p>}

      <h1>{publicacion.titulo}</h1>

      <p className="detalle__cuando">
        {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
        {/* Se dice, en lugar de esconder la actividad. Al catálogo no llega lo
            que ya terminó, pero un enlace guardado o compartido sí llega aquí, y
            una ficha que calla la fecha pasada hace perder el viaje. */}
        {/* El separador va fuera del «span» porque el «span» lleva fondo propio:
            dentro, la pildora empezaria por un punto medio suelto. */}
        {terminada && (
          <>
            {' · '}
            <span className="detalle__pasada">ya terminó</span>
          </>
        )}
      </p>

      <h2>Sobre la actividad</h2>
      {/* «pre-wrap» en la hoja de estilos: respeta los saltos de línea que
          escribió quien la publicó sin interpretar nada más de lo que tecleó. */}
      <p className="detalle__descripcion">{publicacion.descripcion}</p>

      <h2>Dónde</h2>
      <p className="detalle__lugar">{publicacion.lugar}</p>

      {/* Tercer criterio: el mapa aparece **solo si hay coordenadas**. Situar la
          publicación es opcional desde HU-22, y un mapa centrado en el centro
          histórico para una actividad que nadie situó afirmaría algo falso. */}
      {situada ? (
        <>
          <MapaDeUbicacion punto={publicacion.punto} titulo={publicacion.titulo} />
          <p className="detalle__coordenadas">{textoDeCoordenadas(publicacion.punto)}</p>
        </>
      ) : (
        <p className="detalle__sin-mapa">
          Quien la publicó no la situó en el mapa. La dirección de arriba es lo que hay.
        </p>
      )}

      <h2>Quién la organiza</h2>
      {/* Segundo criterio: el acceso al perfil del actor. Cuando el perfil no
          está disponible se dice y no se enlaza: un enlace que lleva a «ese
          perfil no está disponible» es peor que la frase que lo explica. */}
      {actor ? (
        <>
          <div className="detalle__actor">
            <ImagenDeActor
              imagen={actor.imagen}
              nombre={actor.nombre}
              className="detalle__actor-imagen"
            />
            <div>
              <p className="detalle__actor-nombre">
                <Link to={`/actores/${actor.id}`}>{actor.nombre}</Link>
              </p>
              <p className="detalle__actor-manifestacion">{actor.manifestacion}</p>
            </div>
          </div>

          {/* HU-29 · primer criterio. Debajo de quién organiza y no dentro:
              quién organiza es un dato de la actividad, y contactar es una
              acción. Sin perfil disponible no hay a quién escribir, así que
              tampoco hay botón (docs/27 §3). */}
          <ContactoDelActor publicacion={publicacion} actor={actor} />
        </>
      ) : (
        <p className="detalle__sin-actor">
          El perfil de quien organiza esta actividad no está disponible en este momento.
        </p>
      )}
    </section>
  );
}
