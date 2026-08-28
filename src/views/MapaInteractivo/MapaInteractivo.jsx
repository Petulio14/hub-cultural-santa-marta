import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapaDeMarcadores from '../../components/MapaDeMarcadores.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { useNombresDeCategoria } from '../../hooks/useNombresDeCategoria.js';
import { listarPublicacionesAprobadas } from '../../services/eventosService.js';
import { esPuntoValido } from '../../utils/coordenadas.js';
import { FILTROS_VACIOS, limitesDeConsulta } from '../../utils/filtros.js';
import { TOPE_DEL_MAPA } from '../../utils/paginacion.js';
import './MapaInteractivo.css';

/**
 * V-6 · La oferta cultural sobre el mapa — HU-30 · RF-11, RF-10.
 *
 * Cierra el Sprint 6 y la épica E5, y salda la otra mitad de la deuda que el
 * Sprint 5 dejó abierta: el punto que HU-22 guarda en cada publicación se
 * enseñaba desde HU-28 **de uno en uno**, en su ficha. Aquí se ven todos juntos,
 * que es lo que sirve para decidir según dónde se está.
 *
 * ## No pagina, y esa es la decisión
 *
 * Un mapa con la mitad de los marcadores no es medio mapa: **es un mapa que
 * miente** sobre dónde hay oferta cultural. Así que se piden todas de una vez,
 * con un tope, igual que hace la búsqueda de HU-27 y por la misma razón
 * (docs/29 §4).
 *
 * No hizo falta tocar el servicio otra vez: pedir muchas es pedir una página
 * grande. Es la tercera vista que se construye sobre
 * «listarPublicacionesAprobadas» sin añadirle nada.
 *
 * ## Sin punto no hay marcador, y se dice cuántas faltan
 *
 * Situar la publicación es opcional desde HU-22, y el primer criterio pide un
 * marcador «por cada publicación aprobada **con coordenadas registradas**». Las
 * que no lo tienen no salen aquí, y callarlo dejaría creer que el mapa enseña
 * toda la oferta. El recuento lo dice.
 *
 * El descarte ocurre en memoria y no en la consulta, y no contradice a HU-25:
 * ahí filtrar en memoria rompía la paginación, y aquí no hay paginación que
 * romper. Firestore tampoco sabría hacerlo sin una desigualdad más y otro índice.
 */
export default function MapaInteractivo() {
  const [categoria, setCategoria] = useState('');
  const [publicaciones, setPublicaciones] = useState([]);
  const [totales, setTotales] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { categorias, cargando: cargandoCategorias } = useCategoriasActivas();
  const nombreDeCategoria = useNombresDeCategoria();
  const navegar = useNavigate();

  useEffect(() => {
    let vigente = true;
    setCargando(true);

    listarPublicacionesAprobadas({
      ...limitesDeConsulta({ ...FILTROS_VACIOS, categoria }),
      tamano: TOPE_DEL_MAPA,
    })
      .then((leido) => {
        if (!vigente) return;
        setTotales(leido.publicaciones.length);
        setPublicaciones(leido.publicaciones.filter((p) => esPuntoValido(p.punto)));
        setError(null);
      })
      .catch(
        (fallo) =>
          vigente &&
          setError(fallo?.message ?? 'No se pudo leer el mapa. Revisa la conexión y recarga.')
      )
      .finally(() => vigente && setCargando(false));

    // Cambiar de categoría deja una consulta en el aire: si la anterior tarda
    // más que la nueva, escribiría sus marcadores encima. Es la misma guarda que
    // el catálogo necesitó en HU-26.
    return () => {
      vigente = false;
    };
  }, [categoria]);

  const sinSituar = totales - publicaciones.length;

  return (
    <section className="contenedor mapa-vista">
      <h1>Mapa de la oferta cultural</h1>
      <p className="mapa-vista__intro">
        Dónde está ocurriendo cada cosa. Pulsa un marcador para ver de qué se trata y abrir
        su ficha completa.
      </p>

      {/* Tercer criterio. Solo la categoría: el rango de fechas es del catálogo,
          donde se lee una lista; aquí se mira un mapa, y quien lo mira está
          decidiendo por dónde se mueve, no por cuándo. */}
      <form className="mapa-vista__filtro" onSubmit={(evento) => evento.preventDefault()}>
        <Seleccion
          etiqueta="Categoría"
          valor={categoria}
          alCambiar={setCategoria}
          opciones={categorias}
          vacia={cargandoCategorias ? 'Leyendo las categorías…' : 'Todas las categorías'}
          vaciaElegible
          requerido={false}
          disabled={cargandoCategorias}
        />
      </form>

      {cargando && <p>Leyendo el mapa…</p>}

      {error && (
        <p className="mapa-vista__aviso" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <p className="mapa-vista__recuento" aria-live="polite">
          {publicaciones.length}{' '}
          {publicaciones.length === 1 ? 'actividad situada' : 'actividades situadas'}
          {categoria && ' en esta categoría'}.
          {/* Se dice cuántas quedan fuera por no tener punto. Sin esto, el mapa
              parecería enseñar toda la oferta y no la enseña. */}
          {sinSituar > 0 && (
            <>
              {' '}
              Otras {sinSituar} están publicadas sin situar y solo aparecen en el{' '}
              <Link to="/eventos">catálogo</Link>.
            </>
          )}
        </p>
      )}

      {!cargando && !error && publicaciones.length === 0 && (
        <div className="mapa-vista__vacio">
          <p>
            {categoria
              ? 'Ninguna actividad de esta categoría está situada en el mapa.'
              : 'Todavía no hay ninguna actividad situada en el mapa.'}{' '}
            El mapa solo muestra lo que no ha terminado y tiene coordenadas registradas.
          </p>
          <p>
            En el <Link to="/eventos">catálogo</Link> está todo lo publicado, con o sin
            punto en el mapa.
          </p>
        </div>
      )}

      {/* El mapa se pinta siempre, también vacío: es la vista, y quitarlo dejaría
          la página en blanco con un mensaje flotando. Ver Santa Marta sin
          marcadores ya dice algo. */}
      {!error && (
        <MapaDeMarcadores
          publicaciones={publicaciones}
          nombreDeCategoria={nombreDeCategoria}
          alAbrir={(id) => navegar(`/eventos/${id}`)}
        />
      )}
    </section>
  );
}
