import { useState } from 'react';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { textoDeFecha, textoDelPeriodo, yaTermino } from '../../utils/fechas.js';
import { valoresDeFormulario } from '../../utils/publicaciones.js';
import ConfirmacionDeBorrado from './ConfirmacionDeBorrado.jsx';
import EditorDePunto from './EditorDePunto.jsx';
import FormularioDePublicacion from './FormularioDePublicacion.jsx';

/**
 * Una publicación en la lista del actor que la creó — HU-21, ampliada en HU-23.
 *
 * Enseña el estado de revisión **con palabras**, no solo con un color de fondo.
 * Es la misma regla que el enlace activo del menú y que los errores de los
 * campos: el color por sí solo no es un indicador accesible (WCAG 2.1, criterio
 * 1.4.1), y aquí además distingue «esperando» de «publicada», que es lo que se
 * viene a mirar.
 *
 * Desde HU-23 la tarjeta tiene dos modos. En lectura enseña la publicación; en
 * edición **se convierte en el formulario**, el mismo que sirve para crear
 * (docs/22 §2). El editor de punto se retira mientras se edita: el formulario ya
 * trae su propio mapa, y dos mapas en la misma tarjeta serían dos sitios donde
 * arrastrar el mismo marcador con resultados distintos.
 */
const ESTADOS = {
  pendiente: {
    etiqueta: 'En revisión',
    explicacion: 'Todavía no aparece en el catálogo público.',
  },
  aprobado: {
    etiqueta: 'Publicada',
    explicacion: 'Cualquier persona puede encontrarla en el catálogo.',
  },
  devuelto: {
    etiqueta: 'Devuelta',
    explicacion: 'El administrador la devolvió. Revisa las observaciones antes de reenviarla.',
  },
};

export default function TarjetaDePublicacion({
  publicacion,
  categorias,
  cargandoCategorias,
  alGuardarPunto,
  alGuardarCambios,
  alEliminar,
}) {
  const estado = ESTADOS[publicacion.estadoPublicacion] ?? ESTADOS.pendiente;
  const terminada = yaTermino(publicacion.fechaFin);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorDeEdicion, setErrorDeEdicion] = useState(null);

  /**
   * Devuelve la publicación guardada, o null si falló.
   *
   * El formulario usa ese valor para decidir si se cierra, igual que en la
   * creación lo usa para decidir si se vacía: un fallo de red no puede costar el
   * texto que alguien acaba de reescribir.
   */
  async function guardar(datos) {
    setGuardando(true);
    setErrorDeEdicion(null);
    try {
      const guardada = await alGuardarCambios(publicacion.id, datos);
      setEditando(false);
      return guardada;
    } catch (fallo) {
      setErrorDeEdicion(
        fallo?.message ?? 'No se pudieron guardar los cambios. Revisa la conexión.'
      );
      return null;
    } finally {
      setGuardando(false);
    }
  }

  return (
    <li className="tarjeta tarjeta-publicacion">
      <ImagenDeActor
        className="tarjeta-publicacion__imagen"
        imagen={publicacion.imagen}
        nombre={publicacion.titulo}
      />

      <div className="tarjeta-publicacion__cuerpo">
        <h3 className="tarjeta-publicacion__titulo">{publicacion.titulo}</h3>

        <p
          className={`tarjeta-publicacion__estado tarjeta-publicacion__estado--${publicacion.estadoPublicacion}`}
        >
          <strong>{estado.etiqueta}.</strong> {estado.explicacion}
        </p>

        {editando ? (
          <>
            {/* Se avisa antes de tocar nada, no después de guardar: quien edita
                algo ya publicado tiene derecho a saber que lo va a retirar del
                catálogo mientras lo revisan otra vez. */}
            {publicacion.estadoPublicacion === 'aprobado' && (
              <p className="tarjeta-publicacion__aviso-revision" role="status">
                Esta publicación está en el catálogo. Al guardar los cambios volverá a
                revisión y dejará de verse hasta que la aprueben de nuevo.
              </p>
            )}

            {errorDeEdicion && (
              <p className="campo__error" role="alert">
                {errorDeEdicion}
              </p>
            )}

            <FormularioDePublicacion
              categorias={categorias}
              cargandoCategorias={cargandoCategorias}
              alEnviar={guardar}
              guardando={guardando}
              valoresIniciales={valoresDeFormulario(publicacion)}
              textoDeEnvio="Guardar los cambios"
              textoGuardando="Guardando…"
              textoSinPunto="Guardar sin situarla en el mapa"
              alCancelar={() => {
                setEditando(false);
                setErrorDeEdicion(null);
              }}
              limpiarAlGuardar={false}
            />
          </>
        ) : (
          <>
            <p className="tarjeta-publicacion__cuando">
              {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
              {terminada && <span className="tarjeta-publicacion__pasada"> · ya terminó</span>}
            </p>

            <p className="tarjeta-publicacion__lugar">{publicacion.lugar}</p>

            <p className="tarjeta-publicacion__descripcion">{publicacion.descripcion}</p>

            {/* HU-22 · tercer criterio: el punto se puede cambiar sin abrir el
                formulario entero, que es el ajuste más frecuente. */}
            <EditorDePunto
              publicacion={publicacion}
              alGuardar={(punto) => alGuardarPunto(publicacion.id, punto)}
            />

            {/* La fecha de creación no es decorativa: es el dato que el cuarto
                criterio de aceptación manda conservar, y la pone el servidor. */}
            {publicacion.fechaCreacion && (
              <p className="tarjeta-publicacion__creada">
                Enviada el {textoDeFecha(publicacion.fechaCreacion)}
              </p>
            )}

            <p className="tarjeta-publicacion__acciones">
              <button
                className="boton boton--secundario"
                type="button"
                onClick={() => setEditando(true)}
              >
                Editar
              </button>

              <ConfirmacionDeBorrado
                publicacion={publicacion}
                alConfirmar={() => alEliminar(publicacion.id)}
              />
            </p>
          </>
        )}
      </div>
    </li>
  );
}
