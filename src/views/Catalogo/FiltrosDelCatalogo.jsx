import { useState } from 'react';
import Campo from '../../components/Campo.jsx';
import Seleccion from '../../components/Seleccion.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { FILTROS_VACIOS, hayFiltros, rangoInvertido } from '../../utils/filtros.js';

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
            ayuda="Elige una categoría"
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
