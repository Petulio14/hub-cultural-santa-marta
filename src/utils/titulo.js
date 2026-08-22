export const NOMBRE_PLATAFORMA = 'Hub Cultural Santa Marta';

/**
 * Título de la pestaña del navegador. Función pura: recibe el nombre de la vista
 * y devuelve el texto completo, sin tocar el documento.
 */
export function tituloDePagina(nombreVista) {
  const nombre = (nombreVista || '').trim();
  return nombre ? `${nombre} · ${NOMBRE_PLATAFORMA}` : NOMBRE_PLATAFORMA;
}
