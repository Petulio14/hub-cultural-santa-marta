import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { textoDeFecha, textoDelPeriodo, yaTermino } from '../../utils/fechas.js';
import EditorDePunto from './EditorDePunto.jsx';

/**
 * Una publicación en la lista del actor que la creó — HU-21.
 *
 * Enseña el estado de revisión **con palabras**, no solo con un color de fondo.
 * Es la misma regla que el enlace activo del menú y que los errores de los
 * campos: el color por sí solo no es un indicador accesible (WCAG 2.1, criterio
 * 1.4.1), y aquí además distingue «esperando» de «publicada», que es lo que se
 * viene a mirar.
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

export default function TarjetaDePublicacion({ publicacion, alGuardarPunto }) {
  const estado = ESTADOS[publicacion.estadoPublicacion] ?? ESTADOS.pendiente;
  const terminada = yaTermino(publicacion.fechaFin);

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

        <p className="tarjeta-publicacion__cuando">
          {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
          {terminada && <span className="tarjeta-publicacion__pasada"> · ya terminó</span>}
        </p>

        <p className="tarjeta-publicacion__lugar">{publicacion.lugar}</p>

        <p className="tarjeta-publicacion__descripcion">{publicacion.descripcion}</p>

        {/* HU-22 · tercer criterio: el punto se puede cambiar después de
            guardar. El editor decide solo si se puede tocar, porque quien sabe
            eso es el estado de moderación y no la tarjeta. */}
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
      </div>
    </li>
  );
}
