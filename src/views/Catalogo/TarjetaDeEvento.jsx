import { Link } from 'react-router-dom';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { textoDelPeriodo } from '../../utils/fechas.js';

export default function TarjetaDeEvento({ publicacion, nombreDeCategoria }) {
  const categoria = nombreDeCategoria(publicacion.categoria);

  return (
    <li className="tarjeta tarjeta-evento">
      <ImagenDeActor
        className="tarjeta-evento__imagen"
        imagen={publicacion.imagen}
        nombre={publicacion.titulo}
        // No es «el perfil de» nadie: es la imagen de una actividad. El
        // componente admite sustituir el texto justo para esto.
        alt={`Imagen de ${publicacion.titulo}`}
      />

      <div className="tarjeta-evento__cuerpo">
        {categoria && <p className="tarjeta-evento__categoria">{categoria}</p>}

        <h2 className="tarjeta-evento__titulo">
          <Link to={`/eventos/${publicacion.id}`}>{publicacion.titulo}</Link>
        </h2>

        {}
        <p className="tarjeta-evento__cuando">
          {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
        </p>

        <p className="tarjeta-evento__lugar">{publicacion.lugar}</p>
      </div>
    </li>
  );
}
