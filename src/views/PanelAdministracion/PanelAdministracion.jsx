import { useState } from 'react';
import Campo from '../../components/Campo.jsx';
import { useCategorias } from '../../hooks/useCategorias.js';
import {
  cambiarEstadoDeCategoria,
  crearCategoria,
  renombrarCategoria,
} from '../../services/categoriasService.js';
import { hayErrores, validarCategoria } from '../../utils/validaciones.js';
import FilaDeCategoria from './FilaDeCategoria.jsx';
import PerfilesDeActores from './PerfilesDeActores.jsx';
import './PanelAdministracion.css';

/**
 * V-7 · Panel de administración — HU-17, HU-18.
 *
 * Gestiona el catálogo de categorías y la aprobación de los perfiles de actores
 * culturales. La cola de moderación de publicaciones llega con HU-24 y los
 * indicadores de uso con HU-34; cada uno añadirá su sección a esta misma vista.
 *
 * Quién puede abrirla lo decide «RutaPrivada» con el rol de administrador
 * (HU-15), y las reglas de seguridad rechazan las escrituras de cualquier otro
 * aunque llegue hasta aquí (docs/15 §2).
 */
export default function PanelAdministracion() {
  const { categorias, cargando, error, recargar } = useCategorias();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [ocupada, setOcupada] = useState(false);

  /**
   * Toda escritura pasa por aquí: deja el aviso escrito, recarga el listado y
   * libera el formulario pase lo que pase. Repetir este try en cada acción es
   * como se olvida un «finally».
   */
  async function ejecutar(accion, mensajeDeExito) {
    setOcupada(true);
    setAviso(null);
    try {
      await accion();
      await recargar();
      setAviso({ tipo: 'exito', texto: mensajeDeExito });
    } catch (fallo) {
      setAviso({
        tipo: 'error',
        texto: fallo?.message ?? 'No se pudo completar la operación. Inténtalo de nuevo.',
      });
    } finally {
      setOcupada(false);
    }
  }

  async function crear(evento) {
    evento.preventDefault();
    const encontrados = validarCategoria(
      { nombre },
      categorias.map((categoria) => categoria.id)
    );
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    await ejecutar(
      () => crearCategoria({ nombre, descripcion }),
      `La categoría «${nombre.trim()}» ya está disponible en los formularios de publicación.`
    );
    setNombre('');
    setDescripcion('');
  }

  const activas = categorias.filter((categoria) => categoria.activa).length;

  return (
    <section className="contenedor panel">
      <h1>Panel de administración</h1>

      <h2>Categorías culturales</h2>
      <p className="panel__intro">
        Clasifican las publicaciones y alimentan los filtros del catálogo. Una categoría nueva
        queda disponible de inmediato para quien publique, sin volver a desplegar nada.
      </p>

      {aviso && (
        <p
          className={aviso.tipo === 'error' ? 'panel__aviso panel__aviso--error' : 'panel__aviso'}
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
        >
          {aviso.texto}
        </p>
      )}

      <form className="panel__alta" onSubmit={crear} noValidate>
        <h3>Añadir una categoría</h3>
        <Campo
          etiqueta="Nombre"
          valor={nombre}
          alCambiar={(valor) => {
            setNombre(valor);
            setErrores({});
          }}
          error={errores.nombre}
          ayuda="Aparecerá tal cual en los filtros. Por ejemplo: Música y danza."
        />
        <Campo
          etiqueta="Descripción"
          valor={descripcion}
          alCambiar={setDescripcion}
          requerido={false}
          ayuda="Opcional. Orienta a quien tiene que clasificar su publicación."
        />
        <button className="boton" type="submit" disabled={ocupada}>
          {ocupada ? 'Un momento…' : 'Crear categoría'}
        </button>
      </form>

      {cargando && <p>Leyendo el catálogo de categorías…</p>}

      {error && (
        <p className="panel__aviso panel__aviso--error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && categorias.length === 0 && (
        <p className="panel__vacio">
          Todavía no hay ninguna categoría. Crea la primera con el formulario de arriba: hasta
          que exista una, quien publique no tendrá cómo clasificar su evento.
        </p>
      )}

      {!cargando && categorias.length > 0 && (
        <table className="categorias">
          {/* «en uso» decía aquí lo que la columna «Publicaciones» desmiente: una
              categoría puede ofrecerse y no clasificar todavía nada. El resumen
              habla ahora de lo mismo que la etiqueta de cada fila. */}
          <caption>
            {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}, {activas}{' '}
            {activas === 1 ? 'se ofrece' : 'se ofrecen'} en los formularios y en los filtros. El
            número de publicaciones se cuenta en el servidor cada vez que se abre esta página.
          </caption>
          <thead>
            <tr>
              <th scope="col">Categoría</th>
              <th scope="col">Publicaciones</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <FilaDeCategoria
                key={categoria.id}
                categoria={categoria}
                ocupada={ocupada}
                alRenombrar={(id, datos) =>
                  ejecutar(() => renombrarCategoria(id, datos), `Categoría renombrada.`)
                }
                alCambiarEstado={(id, activa) =>
                  ejecutar(
                    () => cambiarEstadoDeCategoria(id, activa),
                    activa
                      ? 'La categoría vuelve a ofrecerse en los formularios y en los filtros.'
                      : 'La categoría deja de ofrecerse. Las publicaciones que la usan conservan su clasificación.'
                  )
                }
              />
            ))}
          </tbody>
        </table>
      )}

      <PerfilesDeActores />
    </section>
  );
}
