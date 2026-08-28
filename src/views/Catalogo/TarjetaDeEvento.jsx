import { Link } from 'react-router-dom';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { textoDelPeriodo } from '../../utils/fechas.js';

/**
 * Una publicación en el catálogo público — HU-25, segundo criterio.
 *
 * Los cinco datos que el criterio nombra —imagen, título, categoría, fecha y
 * lugar— y ni uno más. La descripción no está: puede llegar a mil caracteres, y
 * doce tarjetas con mil caracteres cada una no son un catálogo que se recorra,
 * son un texto largo partido en cajas. Se lee en el detalle, que es HU-28.
 *
 * **Se pulsa desde HU-28**, y no antes. HU-25 la dejó sin enlazar a propósito
 * porque el destino era la pantalla «V-3 · en construcción», y llevar allí es
 * peor que no ofrecer el enlace. Es la misma decisión que tomó el servicio en
 * HU-21 al no escribir un «listarAprobadas» que nadie llamaba: la pieza la pone
 * la historia que la necesita.
 *
 * El enlace es **el título** y no la tarjeta entera, igual que en el directorio
 * de actores. Una tarjeta-enlace obliga a envolver imagen, fechas y lugar dentro
 * del enlace, y entonces un lector de pantalla lee los cinco datos de corrido
 * como el nombre de un único vínculo. El título dice a dónde lleva.
 *
 * Se distingue de «TarjetaDePublicacion», la del actor que la escribió, en lo
 * que enseña y por eso no se comparten. Aquella lleva el estado de revisión, las
 * observaciones del administrador, la fecha de envío y los botones de editar y
 * borrar; nada de eso es asunto de quien viene a buscar un plan. Lo único común
 * es la fotografía y el periodo, que ya viven en piezas aparte.
 */
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

        {/* Un párrafo y no un «time», aunque sea una fecha. «time» sin
            «datetime» obliga a que su contenido **sea** una fecha en formato
            legible por máquina, y aquí dentro hay un periodo escrito para una
            persona: «1 de septiembre de 2026, de 18:00 a 21:30». Marcarlo
            igualmente sería HTML inválido a cambio de nada. */}
        <p className="tarjeta-evento__cuando">
          {textoDelPeriodo(publicacion.fechaInicio, publicacion.fechaFin)}
        </p>

        <p className="tarjeta-evento__lugar">{publicacion.lugar}</p>
      </div>
    </li>
  );
}
