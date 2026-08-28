import { useCallback, useEffect, useState } from 'react';
import { listarPublicacionesAprobadas } from '../services/eventosService.js';
import { anadirPagina } from '../utils/paginacion.js';

const MENSAJE_DE_FALLO =
  'No se pudo leer el catálogo. Revisa la conexión y vuelve a intentarlo.';

/**
 * El catálogo público, página a página — HU-25 · RF-09.
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
 */
export function useCatalogo() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    listarPublicacionesAprobadas()
      .then((leido) => {
        if (!vigente) return;
        // Sustituye en lugar de añadir. En desarrollo StrictMode monta el
        // componente dos veces a propósito, y con «anadirPagina» aquí la
        // duplicación quedaría escondida por el descarte en vez de no ocurrir.
        setPublicaciones(leido.publicaciones);
        setHayMas(leido.hayMas);
        setError(null);
      })
      .catch((fallo) => vigente && setError(fallo?.message ?? MENSAJE_DE_FALLO))
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, []);

  /**
   * La página siguiente — tercer criterio de aceptación.
   *
   * El cursor es la última publicación que ya se tiene, no un contador de
   * páginas. Contar páginas se rompe en cuanto el catálogo cambia entre una y
   * otra: «sáltate veinticuatro» devuelve otras veinticuatro si el
   * administrador aprobó una entretanto. «Después de esta» sigue siendo cierto.
   *
   * La guarda de arriba no es por prudencia: sin ella, dos pulsaciones seguidas
   * lanzan dos consultas con el mismo cursor y traen la misma página dos veces.
   */
  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hayMas || publicaciones.length === 0) return;

    setCargandoMas(true);
    try {
      const leido = await listarPublicacionesAprobadas({ despuesDe: publicaciones.at(-1) });
      setPublicaciones((actuales) => anadirPagina(actuales, leido.publicaciones));
      setHayMas(leido.hayMas);
      setError(null);
    } catch (fallo) {
      setError(fallo?.message ?? MENSAJE_DE_FALLO);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, hayMas, publicaciones]);

  return { publicaciones, cargando, cargandoMas, hayMas, error, cargarMas };
}
