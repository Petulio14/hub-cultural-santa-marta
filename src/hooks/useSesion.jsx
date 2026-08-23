import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SESION_VACIA, leerSesionActual, observarSesion } from '../services/authService.js';

/**
 * Sesión del usuario y su rol — HU-13, HU-15.
 *
 * Un solo observador para toda la aplicación. Si cada componente llamara por su
 * cuenta a «observarSesion» habría tantos escuchadores como componentes
 * montados, y cada uno releería el perfil en Firestore al arrancar; con el
 * proveedor la lectura ocurre una vez y el resultado se comparte.
 *
 * «cargando» empieza en verdadero a propósito: hasta que Authentication no
 * responde no se sabe si hay sesión, y tratar ese instante como «no hay nadie»
 * expulsaría a la vista de ingreso a quien sí tiene la sesión abierta cada vez
 * que recarga la página.
 */
const ContextoDeSesion = createContext(null);

export function ProveedorDeSesion({ children }) {
  const [sesion, setSesion] = useState({ ...SESION_VACIA, cargando: true });

  useEffect(() => observarSesion(setSesion), []);

  /**
   * Vuelve a leer el perfil. Se usa después de registrarse: el observador puede
   * avisar de la nueva credencial antes de que el documento de «usuarios» exista,
   * y entonces el rol llegaría nulo.
   */
  const recargar = useCallback(async () => {
    setSesion(await leerSesionActual());
  }, []);

  /** Aplica una sesión ya resuelta por el servicio, sin volver a leer nada. */
  const aplicar = useCallback((nueva) => setSesion(nueva), []);

  const valor = useMemo(() => ({ ...sesion, recargar, aplicar }), [sesion, recargar, aplicar]);

  return <ContextoDeSesion.Provider value={valor}>{children}</ContextoDeSesion.Provider>;
}

export function useSesion() {
  const valor = useContext(ContextoDeSesion);
  if (valor === null) {
    throw new Error('useSesion solo funciona dentro de <ProveedorDeSesion> (src/main.jsx).');
  }
  return valor;
}
