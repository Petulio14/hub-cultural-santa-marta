import { useCallback, useEffect, useState } from 'react';
import { leerMiHub } from '../services/hubsService.js';

/**
 * El hub de quien tiene la sesión abierta — HU-20.
 *
 * Gemelo de «useMiPerfilDeActor». «hub» en null significa dos cosas distintas
 * mientras «cargando» sea cierto —«todavía no se sabe»— y una sola cuando deja
 * de serlo: esta cuenta aún no ha registrado su espacio.
 */
export function useMiHub(uid) {
  const [hub, setHub] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!uid) {
      setHub(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      setHub(await leerMiHub(uid));
      setError(null);
    } catch (fallo) {
      setError(fallo?.message ?? 'No se pudo leer tu hub. Revisa la conexión y recarga.');
    } finally {
      setCargando(false);
    }
  }, [uid]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { hub, cargando, error, recargar, aplicar: setHub };
}
