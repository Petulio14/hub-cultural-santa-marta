import { useCallback, useEffect, useState } from 'react';
import { listarCategoriasConRecuento } from '../services/categoriasService.js';

/**
 * Las categorías con su recuento de publicaciones — HU-17.
 *
 * Encapsula lo que toda vista que las use necesita repetir: el estado de carga,
 * el error si la lectura falla y la recarga después de un cambio. Lo usará
 * también el catálogo cuando llegue HU-26, con la variante que solo lista las
 * activas.
 *
 * Se recarga entero después de crear o desactivar en lugar de retocar el arreglo
 * en memoria. Es una lectura más, y a cambio lo que se ve en pantalla es lo que
 * hay en la base de datos: si otra persona creó una categoría entretanto,
 * aparece.
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setCategorias(await listarCategoriasConRecuento());
      setError(null);
    } catch (fallo) {
      setError(
        fallo?.message ?? 'No se pudieron leer las categorías. Revisa la conexión y recarga.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { categorias, cargando, error, recargar };
}
