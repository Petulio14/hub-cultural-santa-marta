import { Link } from 'react-router-dom';
import { useCatalogo } from '../../hooks/useCatalogo.js';
import { useNombresDeCategoria } from '../../hooks/useNombresDeCategoria.js';
import TarjetaDeEvento from './TarjetaDeEvento.jsx';
import './Catalogo.css';

/**
 * V-2 · Catálogo público de la oferta cultural — HU-25 · RF-09.
 *
 * La vista que hacía falta para que todo el Sprint 5 sirviera de algo: hasta
 * hoy una publicación se podía crear, situar en el mapa, corregir y aprobar, y
 * **no había dónde verla** (docs/23 §9). Esto es ese sitio.
 *
 * Pública de verdad: no se pide cuenta, y el filtro de lo aprobado lo aplica el
 * servidor. Aquí no se descarta nada, porque lo que no está aprobado ni siquiera
 * llega —lo explica «listarPublicacionesAprobadas» y lo demuestran los casos de
 * pruebas/reglas.
 *
 * Los filtros por categoría y fecha son HU-26 y la búsqueda es HU-27. Esta
 * historia deja el catálogo entero y la carga progresiva; ahí se apoyarán las
 * dos siguientes.
 */
export default function Catalogo() {
  const { publicaciones, cargando, cargandoMas, hayMas, error, cargarMas } = useCatalogo();
  const nombreDeCategoria = useNombresDeCategoria();

  const vacio = !cargando && !error && publicaciones.length === 0;

  return (
    <section className="contenedor catalogo">
      <h1>Catálogo de eventos</h1>
      <p className="catalogo__intro">
        Lo que está pasando y lo que va a pasar en Santa Marta: talleres, muestras, fiestas
        y saberes que sostienen los actores culturales de la ciudad. Se ordena por lo que
        está a punto de terminar, así que lo que ves aquí todavía se puede alcanzar.
      </p>

      {cargando && <p>Leyendo el catálogo…</p>}

      {/* El aviso de error va debajo de lo que ya se leyó, no en su lugar. Si
          falla la tercera página, las veinticuatro tarjetas anteriores siguen
          siendo verdad y quitarlas de la pantalla sería mentir por prudencia. */}
      {error && (
        <p className="catalogo__aviso" role="alert">
          {error}
        </p>
      )}

      {/* Cuarto criterio de aceptación: nunca una pantalla en blanco.
          El mensaje dice **las dos** razones por las que el catálogo puede estar
          vacío, porque desde fuera se ven igual y no son lo mismo: que todavía no
          haya nada aprobado, o que lo que hubo ya terminó. */}
      {vacio && (
        <div className="catalogo__vacio">
          <p>
            No hay ninguna actividad en curso ni anunciada por ahora. O todavía no se ha
            publicado nada, o lo que hubo ya terminó: el catálogo solo muestra lo que aún
            no ha pasado.
          </p>
          <p>
            Mientras tanto puedes conocer a los{' '}
            <Link to="/actores">actores culturales de la ciudad</Link>. Y si representas
            una manifestación cultural de Santa Marta,{' '}
            <Link to="/ingreso">crea tu cuenta</Link> y publica la tuya.
          </p>
        </div>
      )}

      {publicaciones.length > 0 && (
        <>
          {/* «aria-live» para que quien usa un lector de pantalla se entere de
              que la lista creció: al pulsar «Ver más» el foco no se mueve, y sin
              esto la página cambiaría en silencio. */}
          <p className="catalogo__recuento" aria-live="polite">
            {publicaciones.length}{' '}
            {publicaciones.length === 1 ? 'actividad' : 'actividades'}
            {hayMas ? ' hasta ahora.' : ' en total.'}
          </p>

          <ul className="catalogo__rejilla">
            {publicaciones.map((publicacion) => (
              <TarjetaDeEvento
                key={publicacion.id}
                publicacion={publicacion}
                nombreDeCategoria={nombreDeCategoria}
              />
            ))}
          </ul>

          {/* Tercer criterio: un botón y no un desplazamiento infinito. El
              desplazamiento infinito deja el pie de página inalcanzable —donde
              están la política de datos y el contacto— y quita a quien navega con
              teclado el control de cuándo llega más contenido. */}
          {hayMas && (
            <p className="catalogo__mas">
              <button
                className="boton boton--secundario"
                type="button"
                onClick={cargarMas}
                disabled={cargandoMas}
              >
                {cargandoMas ? 'Cargando…' : 'Ver más actividades'}
              </button>
            </p>
          )}
        </>
      )}
    </section>
  );
}
