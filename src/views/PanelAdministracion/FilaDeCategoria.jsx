import { useState } from 'react';
import Campo from '../../components/Campo.jsx';
import { validarCategoria } from '../../utils/validaciones.js';

/**
 * Una categoría dentro del listado del panel — HU-17, revisada en HU-31.
 *
 * Tiene tres estados: en reposo, renombrándose y con la advertencia de
 * eliminación abierta. Están aquí y no en la vista porque son de la fila: abrir
 * el renombrado de una no debe afectar a las demás.
 *
 * ## Las dos cosas que HU-31 corrigió
 *
 * **Validaba con una regla escrita a mano** —«al menos tres caracteres»— en
 * lugar de con «validarCategoria», que es la que usa el formulario de alta tres
 * archivos más arriba. La consecuencia no era el mínimo, que coincidía: era todo
 * lo demás. Por aquí pasaban un nombre de doscientos caracteres, uno hecho solo
 * de signos y, sobre todo, **un nombre que ya tenía otra categoría**. Renombrar
 * no cambia el identificador, así que dos filas podían acabar llamándose igual
 * y el filtro del catálogo las habría ofrecido dos veces sin forma de
 * distinguirlas.
 *
 * **Y se cerraba aunque el guardado fallara.** «alRenombrar» no devolvía nada
 * —el «try» vive en la vista—, así que la fila volvía a reposo en los dos casos
 * y se llevaba por delante el nombre recién escrito, que es literalmente lo que
 * el segundo criterio de aceptación prohíbe. Ahora se queda abierta con el texto
 * puesto, y el aviso de arriba explica qué pasó.
 */
export default function FilaDeCategoria({
  categoria,
  alRenombrar,
  alCambiarEstado,
  ocupada,
  identificadoresExistentes = [],
}) {
  const [modo, setModo] = useState('reposo');
  const [nombre, setNombre] = useState(categoria.nombre);
  const [descripcion, setDescripcion] = useState(categoria.descripcion);
  const [error, setError] = useState(null);

  const enUso = categoria.publicaciones > 0;

  // Todas menos ella misma: dejarse dentro haría que renombrarse a su propio
  // nombre —al corregir solo la descripción, por ejemplo— se rechazara por
  // duplicado.
  const ajenas = identificadoresExistentes.filter((id) => id !== categoria.id);

  function cancelar() {
    setModo('reposo');
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setError(null);
  }

  async function guardar(evento) {
    evento.preventDefault();

    const problema = validarCategoria({ nombre }, ajenas).nombre ?? null;
    setError(problema);
    if (problema) return;

    if (await alRenombrar(categoria.id, { nombre, descripcion })) setModo('reposo');
  }

  if (modo === 'renombrar') {
    return (
      <tr>
        <td colSpan={4}>
          <form className="categorias__edicion" onSubmit={guardar} noValidate>
            <Campo etiqueta="Nombre" valor={nombre} alCambiar={setNombre} error={error} />
            <Campo
              etiqueta="Descripción"
              valor={descripcion}
              alCambiar={setDescripcion}
              requerido={false}
              ayuda="Opcional. Orienta a quien clasifica su publicación."
            />
            <p className="categorias__nota">
              El identificador <code>{categoria.id}</code> no cambia: es lo que llevan escrito
              las publicaciones ya clasificadas.
            </p>
            <div className="categorias__acciones">
              <button className="boton" type="submit" disabled={ocupada}>
                Guardar
              </button>
              <button className="boton boton--secundario" type="button" onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={categoria.activa ? undefined : 'categorias__fila--inactiva'}>
      <th scope="row">
        <span className="categorias__nombre">{categoria.nombre}</span>
        <code className="categorias__id">{categoria.id}</code>
        {categoria.descripcion && (
          <span className="categorias__descripcion">{categoria.descripcion}</span>
        )}
      </th>

      <td className="categorias__numero">{categoria.publicaciones}</td>

      <td>
        <span className={categoria.activa ? 'etiqueta etiqueta--activa' : 'etiqueta'}>
          {categoria.activa ? 'Se ofrece' : 'No se ofrece'}
        </span>
      </td>

      <td>
        {modo === 'advertencia' ? (
          <div className="categorias__advertencia" role="alert">
            <p>
              {enUso ? (
                <>
                  Esta categoría clasifica <strong>{categoria.publicaciones}</strong>{' '}
                  {categoria.publicaciones === 1 ? 'publicación' : 'publicaciones'}. Eliminarla
                  las dejaría sin clasificar, así que <strong>no se elimina</strong>.
                </>
              ) : (
                <>
                  Ninguna publicación la usa ahora mismo, pero el catálogo{' '}
                  <strong>no elimina categorías</strong>: un evento antiguo no puede quedarse
                  sin clasificación.
                </>
              )}{' '}
              Al desactivarla deja de ofrecerse en los formularios y en los filtros, y lo ya
              clasificado se conserva.
            </p>
            <div className="categorias__acciones">
              <button
                className="boton"
                type="button"
                disabled={ocupada}
                onClick={async () => {
                  await alCambiarEstado(categoria.id, false);
                  setModo('reposo');
                }}
              >
                Desactivar
              </button>
              <button
                className="boton boton--secundario"
                type="button"
                onClick={() => setModo('reposo')}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="categorias__acciones">
            <button
              className="boton boton--secundario"
              type="button"
              onClick={() => setModo('renombrar')}
            >
              Renombrar
            </button>
            {categoria.activa ? (
              <button
                className="boton boton--secundario"
                type="button"
                onClick={() => setModo('advertencia')}
              >
                Eliminar
              </button>
            ) : (
              <button
                className="boton boton--secundario"
                type="button"
                disabled={ocupada}
                onClick={() => alCambiarEstado(categoria.id, true)}
              >
                Reactivar
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
