import { useCallback, useEffect, useState } from 'react';
import { leerMiPerfil } from '../services/actoresService.js';

/**
 * El perfil del actor que tiene la sesión abierta — HU-18.
 *
 * «perfil» en null significa dos cosas distintas mientras «cargando» sea cierto
 * («todavía no se sabe») y una sola cuando deja de serlo: esta cuenta aún no ha
 * creado su perfil. La vista necesita distinguirlas para no enseñar el
 * formulario de alta durante el instante en que solo está esperando.
 */
export function useMiPerfilDeActor(uid) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    if (!uid) {
      setPerfil(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    try {
      setPerfil(await leerMiPerfil(uid));
      setError(null);
    } catch (fallo) {
      setError(fallo?.message ?? 'No se pudo leer tu perfil. Revisa la conexión y recarga.');
    } finally {
      setCargando(false);
    }
  }, [uid]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { perfil, cargando, error, recargar, aplicar: setPerfil };
}
