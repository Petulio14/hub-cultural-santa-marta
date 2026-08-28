import { useState } from 'react';
import Campo from '../../components/Campo.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { FILTROS_VACIOS, hayFiltros, rangoInvertido } from '../../utils/filtros.js';

/**
 * Buscar y filtrar el catálogo — HU-26 · RF-10, ampliado en HU-27.
 *
 * Un formulario con botón, no campos que consultan al escribir. Con dos fechas
 * que se rellenan de una en una, aplicar al vuelo dispararía una consulta con el
 * rango a medias —«desde el 1» y nada más— y enseñaría un resultado que nadie
 * pidió antes de terminar de pedirlo. El botón marca cuándo la pregunta está
 * completa.
 *
 * La búsqueda de HU-27 se une a esa misma regla, y ahí hay una decisión: buscar
 * al escribir es lo habitual y aquí **cada tecla cuesta una consulta al
 * servidor**, porque con término se pide de una vez todo lo que cumple los
 * filtros (docs/26 §2). Escribir «tambora» serían siete consultas de hasta
 * doscientos documentos. Un botón lo deja en una.
 *
 * Guarda su propio borrador y solo lo entrega al enviar. Lo que está aplicado
 * vive en el gancho; lo que se está escribiendo, aquí. Mezclarlo obligaría a
 * consultar en cada tecla, que es justo lo que se acaba de descartar.
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
    <form className="filtros" onSubmit={enviar} role="search">
      <fieldset className="filtros__grupo">
        <legend className="filtros__titulo">Busca y afina</legend>

        {/* Ocupa su propia línea y va primero: es la pregunta que se hace
            cuando ya se sabe qué se busca, y las otras tres son para cuando
            no. «type=search» le da al móvil el teclado con la lupa. */}
        <div className="filtros__busqueda">
          <Campo
            etiqueta="Palabra clave"
            tipo="search"
            valor={borrador.texto}
            alCambiar={cambiar('texto')}
            ayuda="Busca en el título y en la descripción"
            requerido={false}
          />
        </div>

        <div className="filtros__afinar">
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
        </div>
      </fieldset>

      <p className="filtros__acciones">
        <button className="boton" type="submit" disabled={invertido}>
          Buscar
        </button>

        {/* Cuarto criterio de aceptación de HU-26, y el segundo de HU-27 lo
            reclama por su nombre: «sugerirse limpiar los filtros». Solo aparece
            cuando hay algo que limpiar; un botón permanentemente sin efecto
            enseña a no mirarlo. */}
        {hayAlgoQueLimpiar && (
          <button className="boton boton--secundario" type="button" onClick={limpiar}>
            Limpiar los filtros
          </button>
        )}
      </p>
    </form>
  );
}
