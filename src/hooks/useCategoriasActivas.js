import { useEffect, useState } from 'react';
import { listarCategoriasActivas } from '../services/categoriasService.js';

/**
 * Las categorías que hoy se ofrecen — HU-17, para HU-18 y HU-21.
 *
 * Distinta de «useCategorias», que trae además el recuento de publicaciones de
 * cada una con una consulta por categoría. Eso es lo que necesita el panel del
 * administrador y lo que un formulario no debe pagar: aquí basta con la lista.
 *
 * No se recarga: el formulario que la usa se abre, se rellena y se envía. Si el
 * administrador desactiva una categoría entretanto, quien la eligió recibe el
 * aviso al guardar, porque la validación compara contra esta misma lista y las
 * reglas la vuelven a comprobar en el servidor.
 */
export function useCategoriasActivas() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    listarCategoriasActivas()
      .then((leidas) => vigente && setCategorias(leidas))
      .catch(
        (fallo) =>
          vigente &&
          setError(
            fallo?.message ?? 'No se pudo leer el catálogo de categorías. Recarga la página.'
          )
      )
      .finally(() => vigente && setCargando(false));

    // El componente puede desmontarse antes de que llegue la respuesta —basta
    // con cambiar de vista—, y escribir estado sobre lo desmontado es un aviso
    // de React y una fuga de memoria pequeña pero real.
    return () => {
      vigente = false;
    };
  }, []);

  return { categorias, cargando, error };
}
