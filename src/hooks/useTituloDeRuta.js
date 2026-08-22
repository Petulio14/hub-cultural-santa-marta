import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';
import { tituloDePagina } from '../utils/titulo.js';

/**
 * Escribe en el título del documento el nombre de la vista activa, tomándolo del
 * campo «handle.titulo» de la ruta. Quien navega con lector de pantalla recibe
 * así el cambio de página, que en una aplicación de página única no ocurre solo.
 */
export function useTituloDeRuta() {
  const coincidencias = useMatches();
  const ultima = coincidencias[coincidencias.length - 1];
  const titulo = ultima?.handle?.titulo;

  useEffect(() => {
    document.title = tituloDePagina(titulo);
  }, [titulo]);
}
