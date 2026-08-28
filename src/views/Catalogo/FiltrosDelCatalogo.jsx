import { useState } from 'react';
import Campo from '../../components/Campo.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { FILTROS_VACIOS, hayFiltros, rangoInvertido } from '../../utils/filtros.js';

/**
 * Los filtros del catálogo — HU-26 · RF-10.
 *
 * Un formulario con botón, no tres campos que consultan al escribir. Con dos
 * fechas que se rellenan de una en una, aplicar al vuelo dispararía una consulta
 * con el rango a medias —«desde el 1» y nada más— y enseñaría un resultado que
 * nadie pidió antes de terminar de pedirlo. El botón marca cuándo la pregunta
 * está completa.
 *
 * Guarda su propio borrador y solo lo entrega al enviar. Lo que está aplicado
 * vive en el gancho; lo que se está escribiendo, aquí. Mezclarlo obligaría a
 * consultar en cada tecla.
 *
 * Las categorías que ofrece son **las activas**, que es lo contrario de lo que
 * hace la tarjeta al escribir el nombre de una (docs/24 §4). No es incoherencia:
 * ofrecer una categoría retirada sería invitar a filtrar por algo que la
 * plataforma ya no clasifica, mientras que **leer** el nombre de la que una
 * publicación tiene escrita sigue haciendo falta aunque se haya retirado.
 */
export default function FiltrosDelCatalogo({ filtros, alAplicar, alLimpiar, filtrado }) {
  const [borrador, setBorrador] = useState(filtros);
  const { categorias, cargando } = useCategoriasActivas();

  const invertido = rangoInvertido(borrador);
  const hayAlgoQueLimpiar = filtrado || hayFiltros(borrador);

  const cambiar = (campo) => (valor) => setBorrador((actual) => ({ ...actual, [campo]: valor }));

  function enviar(evento) {
    evento.preventDefault();
    if (invertido) return;
    alAplicar(borrador);
  }

  function limpiar() {
    // Se limpian los dos a la vez. Vaciar solo lo aplicado dejaría el formulario
    // con las fechas escritas y el catálogo entero debajo, que se lee como que
    // el filtro no funciona.
    setBorrador(FILTROS_VACIOS);
    alLimpiar();
  }

  return (
    <form className="filtros" onSubmit={enviar}>
      <fieldset className="filtros__grupo">
        <legend className="filtros__titulo">Afina la búsqueda</legend>

        <Seleccion
          etiqueta="Categoría"
          valor={borrador.categoria}
          alCambiar={cambiar('categoria')}
          opciones={categorias}
          // Elegible, al revés que en el formulario de publicación: aquí
          // «todas» es una respuesta y hay que poder volver a ella.
          vacia={cargando ? 'Leyendo las categorías…' : 'Todas las categorías'}
          vaciaElegible
          requerido={false}
          disabled={cargando}
        />

        <Campo
          etiqueta="Desde"
          tipo="date"
          valor={borrador.desde}
          alCambiar={cambiar('desde')}
          ayuda="El día que llegas"
          requerido={false}
        />

        <Campo
          etiqueta="Hasta"
          tipo="date"
          valor={borrador.hasta}
          alCambiar={cambiar('hasta')}
          ayuda="El día que te vas"
          requerido={false}
          error={invertido ? 'La fecha de salida es anterior a la de llegada.' : null}
        />
      </fieldset>

      <p className="filtros__acciones">
        <button className="boton" type="submit" disabled={invertido}>
          Aplicar
        </button>

        {/* Cuarto criterio de aceptación. Solo aparece cuando hay algo que
            limpiar: un botón permanentemente sin efecto enseña a no mirarlo. */}
        {hayAlgoQueLimpiar && (
          <button className="boton boton--secundario" type="button" onClick={limpiar}>
            Limpiar los filtros
          </button>
        )}
      </p>
    </form>
  );
}
