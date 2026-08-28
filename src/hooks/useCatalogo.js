import { useCallback, useEffect, useState } from 'react';
import { listarPublicacionesAprobadas } from '../services/eventosService.js';
import { TOPE_DE_BUSQUEDA, filtrarPorTermino } from '../utils/busqueda.js';
import { FILTROS_VACIOS, hayFiltros, limitesDeConsulta } from '../utils/filtros.js';
import { anadirPagina } from '../utils/paginacion.js';

const MENSAJE_DE_FALLO =
  'No se pudo leer el catálogo. Revisa la conexión y vuelve a intentarlo.';

/**
 * El catálogo público, con filtros y búsqueda — HU-25, HU-26 y HU-27.
 *
 * Se parece a «useMisPublicaciones» y se distingue en lo único que importa:
 * aquella trae la lista entera de una vez porque son las publicaciones de una
 * persona, y esta trae **las de todo el mundo**. Por eso hay dos estados de
 * carga y no uno.
 *
 * «cargando» es la primera página: mientras dure no hay nada que enseñar y la
 * vista pone un aviso en lugar del catálogo. «cargandoMas» es cualquier página
 * siguiente, y mientras dure **lo que ya está en pantalla no se toca**. Con un
 * solo estado, pedir más borraría lo que se está leyendo para volver a pintarlo
 * un segundo después, que es exactamente lo que hace inutilizable un catálogo
 * largo.
 *
 * El fallo también se guarda aparte de la lista. Si la tercera página falla, las
 * veinticuatro tarjetas anteriores siguen siendo verdad: se enseñan, con el aviso
 * debajo y el botón para reintentar.
 *
 * **Los filtros son estado del gancho y no de la vista** (HU-26). Podrían vivir
 * en el formulario y llegar aquí como argumento, y entonces «cargarMas» tendría
 * que recibirlos otra vez en cada llamada: la página siguiente se pide con los
 * mismos filtros que la primera, y basta que uno de los dos sitios se olvide de
 * pasarlos para que «Ver más» traiga el catálogo sin filtrar. Al vivir aquí, la
 * primera consulta y las siguientes leen el mismo dato.
 *
 * Cambiar un filtro **es una consulta nueva**, no una página más: la lista se
 * sustituye, el cursor se olvida y se vuelve a empezar. Por eso el efecto
 * depende de «filtros» y no hay nada que reiniciar a mano.
 *
 * **Buscar apaga la paginación** (HU-27), y no es una excepción caprichosa:
 * buscar dentro de doce resultados encuentra dentro de doce, así que con término
 * escrito se pide de una vez todo lo que cumple los filtros del servidor —hasta
 * el tope— y el término se aplica en memoria sobre eso. La consecuencia es que
 * «Ver más» desaparece mientras se busca: ya no hay una página siguiente, hay un
 * tope, y la vista dice cuándo se alcanzó.
 */
export function useCatalogo() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [publicaciones, setPublicaciones] = useState([]);
  const [revisadas, setRevisadas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const [topeAlcanzado, setTopeAlcanzado] = useState(false);
  const [error, setError] = useState(null);

  const buscando = (filtros.texto ?? '').trim() !== '';

  useEffect(() => {
    let vigente = true;
    setCargando(true);

    const termino = (filtros.texto ?? '').trim();
    const conTermino = termino !== '';

    listarPublicacionesAprobadas({
      ...limitesDeConsulta(filtros),
      ...(conTermino ? { tamano: TOPE_DE_BUSQUEDA } : {}),
    })
      .then((leido) => {
        if (!vigente) return;
        // Sustituye en lugar de añadir. En desarrollo StrictMode monta el
        // componente dos veces a propósito, y con «anadirPagina» aquí la
        // duplicación quedaría escondida por el descarte en vez de no ocurrir.
        setPublicaciones(
          conTermino ? filtrarPorTermino(leido.publicaciones, termino) : leido.publicaciones
        );
        // Cuántas se miraron, que no es lo mismo que cuántas coinciden. Es el
        // número que hace honesto el recuento de la vista al buscar.
        setRevisadas(leido.publicaciones.length);
        setHayMas(!conTermino && leido.hayMas);
        setTopeAlcanzado(conTermino && leido.hayMas);
        setError(null);
      })
      .catch((fallo) => vigente && setError(fallo?.message ?? MENSAJE_DE_FALLO))
      .finally(() => vigente && setCargando(false));

    // «vigente» importa más desde HU-26: cambiar de filtro deja una consulta en
    // el aire, y si la anterior tarda más que la nueva escribiría sus resultados
    // encima. El catálogo enseñaría entonces lo que se pidió antes, con el
    // formulario diciendo otra cosa.
    return () => {
      vigente = false;
    };
  }, [filtros]);

  /**
   * La página siguiente — tercer criterio de aceptación de HU-25.
   *
   * El cursor es la última publicación que ya se tiene, no un contador de
   * páginas. Contar páginas se rompe en cuanto el catálogo cambia entre una y
   * otra: «sáltate veinticuatro» devuelve otras veinticuatro si el
   * administrador aprobó una entretanto. «Después de esta» sigue siendo cierto.
   *
   * La guarda de arriba no es por prudencia: sin ella, dos pulsaciones seguidas
   * lanzan dos consultas con el mismo cursor y traen la misma página dos veces.
   * Y desde HU-27 cubre además el caso de la búsqueda, donde el último elemento
   * de la lista **no** es el último que trajo la consulta —el término descartó
   * algunos por el camino— y usarlo como cursor se saltaría lo que hay entre uno
   * y otro.
   */
  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hayMas || buscando || publicaciones.length === 0) return;

    setCargandoMas(true);
    try {
      const leido = await listarPublicacionesAprobadas({
        ...limitesDeConsulta(filtros),
        despuesDe: publicaciones.at(-1),
      });
      setPublicaciones((actuales) => anadirPagina(actuales, leido.publicaciones));
      setRevisadas((actuales) => actuales + leido.publicaciones.length);
      setHayMas(leido.hayMas);
      setError(null);
    } catch (fallo) {
      setError(fallo?.message ?? MENSAJE_DE_FALLO);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas, buscando, publicaciones, filtros]);

  /** Cuarto criterio de HU-26: se restituye el catálogo completo. */
  const limpiar = useCallback(() => setFiltros(FILTROS_VACIOS), []);

  return {
    publicaciones,
    revisadas,
    cargando,
    cargandoMas,
    hayMas,
    topeAlcanzado,
    error,
    cargarMas,
    filtros,
    aplicar: setFiltros,
    limpiar,
    filtrado: hayFiltros(filtros),
    buscando,
  };
}
