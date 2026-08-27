import { useCallback, useState } from 'react';
import {
  ErrorDeGeocodificacion,
  buscarDireccion,
} from '../services/geocodificacionService.js';

/**
 * Buscar una dirección y quedarse con los candidatos — HU-20, reutilizado en HU-22.
 *
 * Nace en HU-22 y no en HU-20 por una razón concreta: hasta ahora solo el
 * formulario del hub buscaba direcciones, y una sola vez no es duplicación. Al
 * llegar la publicación cultural hay dos sitios que hacen exactamente lo mismo
 * —pedir, esperar, guardar tres candidatos, traducir el fallo— y solo se
 * diferencian en cómo lo pintan. Eso es lo que sube aquí; el marcado se queda
 * abajo, porque el hub enseña candidatos y la publicación enseña además un mapa.
 *
 * **Un arreglo vacío no es un error.** Una dirección puede no estar cartografiada
 * —el caso más frecuente en Santa Marta, véase la cabecera de
 * «geocodificacionService.js»—, así que «candidatos: []» y «fallo: null» a la vez
 * es un resultado legítimo, y quien lo pinta tiene que decir algo distinto de
 * «se rompió». De ahí que «candidatos» empiece en nulo y no en «[]»: nulo es
 * «todavía no se ha buscado», y son dos estados que la vista necesita separar.
 */
export function useBusquedaDeDireccion() {
  const [candidatos, setCandidatos] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(null);

  const buscar = useCallback(async (direccion) => {
    setBuscando(true);
    setFallo(null);
    setCandidatos(null);
    try {
      const encontrados = await buscarDireccion(direccion);
      setCandidatos(encontrados);
      return encontrados;
    } catch (error) {
      setFallo(
        error instanceof ErrorDeGeocodificacion
          ? error.message
          : 'No se pudo buscar la dirección. Inténtalo de nuevo.'
      );
      return [];
    } finally {
      setBuscando(false);
    }
  }, []);

  /** Vuelve al estado «todavía no se ha buscado». */
  const limpiar = useCallback(() => {
    setCandidatos(null);
    setFallo(null);
  }, []);

  return { candidatos, buscando, fallo, buscar, limpiar };
}
