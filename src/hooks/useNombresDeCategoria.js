import { useCallback, useEffect, useState } from 'react';
import { listarCategorias } from '../services/categoriasService.js';

/**
 * Traduce el identificador de categoría que lleva dentro una publicación al
 * nombre que se lee en pantalla — HU-25, segundo criterio.
 *
 * Lee **todas** las categorías, activas y desactivadas, y ahí está la razón de
 * que este gancho exista en lugar de reutilizar «useCategoriasActivas».
 *
 * HU-17 decidió que una categoría no se borra, se desactiva: deja de ofrecerse
 * en los formularios y las publicaciones que ya la usan conservan su
 * clasificación (docs/16 §3). Consecuencia directa en el catálogo: una
 * publicación aprobada bajo «Cine y video», si el administrador desactiva esa
 * categoría después, seguiría en el catálogo —está aprobada— y con la lista de
 * activas se quedaría **sin categoría a la vista**. El segundo criterio pide
 * cinco datos por tarjeta, y uno de ellos desaparecería sin que nada avisara.
 *
 * La distinción no es la del panel del administrador: allí «activa o no» es el
 * dato que se administra. Aquí no se enseña; solo se necesita el nombre.
 *
 * Devuelve una función y no el arreglo. Quien lo usa no quiere las categorías,
 * quiere el nombre de una; y buscar dentro de un arreglo en cada tarjeta es
 * repetir el mismo «find» en cada vista que las muestre.
 */
export function useNombresDeCategoria() {
  const [porIdentificador, setPorIdentificador] = useState({});

  useEffect(() => {
    let vigente = true;

    listarCategorias()
      .then((categorias) => {
        if (!vigente) return;
        setPorIdentificador(Object.fromEntries(categorias.map((c) => [c.id, c.nombre])));
      })
      // Sin «catch» a la vista y es deliberado: si esta lectura falla, la tarjeta
      // se pinta igual con los otros cuatro datos. Un aviso de error sobre el
      // catálogo entero porque no se pudo traducir una etiqueta sería peor que
      // la etiqueta que falta.
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, []);

  return useCallback((idCategoria) => porIdentificador[idCategoria] ?? null, [porIdentificador]);
}
