import { useCallback, useEffect, useState } from 'react';
import { listarMisPublicaciones } from '../services/eventosService.js';

/**
 * Las publicaciones del actor que tiene la sesión abierta — HU-21.
 *
 * «idActor» puede llegar nulo por dos motivos distintos y el gancho no los
 * distingue: la sesión todavía no ha resuelto, o esta cuenta aún no tiene perfil
 * de actor. Quien sí tiene que distinguirlos es la vista, porque el segundo caso
 * no se arregla esperando —hay que ir a crear el perfil— y el primero sí.
 *
 * Por eso aquí un «idActor» nulo deja la lista vacía y **apaga «cargando»**: no
 * hay ninguna consulta en marcha que justifique un «Leyendo…» que no termina.
 */
export function useMisPublicaciones(idActor) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!idActor) {
      setPublicaciones([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      setPublicaciones(await listarMisPublicaciones(idActor));
      setError(null);
    } catch (fallo) {
      setError(
        fallo?.message ?? 'No se pudieron leer tus publicaciones. Revisa la conexión y recarga.'
      );
    } finally {
      setCargando(false);
    }
  }, [idActor]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  /**
   * Añade una publicación recién creada sin volver a consultar.
   *
   * Se antepone porque la lista va de la más reciente a la más antigua y esta
   * acaba de nacer. Recargar entera funcionaría igual, pero cobraría una lectura
   * por documento para colocar uno que ya se tiene delante.
   */
  const anadir = useCallback((publicacion) => {
    setPublicaciones((actuales) => [publicacion, ...actuales]);
  }, []);

  /**
   * Sustituye una publicación por su versión ya guardada — HU-22.
   *
   * Conserva su sitio en la lista en lugar de reordenar: el orden es por fecha de
   * creación, y cambiar el punto no cambia cuándo se creó. Recolocar la tarjeta
   * bajo el dedo de quien acaba de pulsar «Guardar» sería moverle lo que está
   * mirando por un dato que no ha cambiado.
   */
  const reemplazar = useCallback((publicacion) => {
    setPublicaciones((actuales) =>
      actuales.map((actual) => (actual.id === publicacion.id ? publicacion : actual))
    );
  }, []);

  /**
   * Retira una publicación de la lista — HU-23, segundo criterio.
   *
   * Se llama **después** de que el servidor confirme el borrado, no antes.
   * Quitarla al pulsar y devolverla si falla se ve más rápido, pero enseña
   * durante un instante un estado que puede no ser verdad, y en un borrado eso es
   * peor que esperar: quien ve desaparecer su publicación y luego reaparecer no
   * sabe si se borró.
   */
  const quitar = useCallback((idEvento) => {
    setPublicaciones((actuales) => actuales.filter((actual) => actual.id !== idEvento));
  }, []);

  return { publicaciones, cargando, error, recargar, anadir, reemplazar, quitar };
}
