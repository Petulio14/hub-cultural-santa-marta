import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImagenDeActor from '../../components/ImagenDeActor.jsx';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import { useSesion } from '../../hooks/useSesion.jsx';
import { leerActor } from '../../services/actoresService.js';
import {
  enlaceDeCorreo,
  enlaceDeTelefono,
  enlaceDeWhatsapp,
} from '../../utils/contacto.js';
import './PerfilActor.css';

/**
 * V-4 · Perfil público de un actor cultural — HU-18, quinto criterio; HU-19.
 *
 * Cada perfil aprobado tiene su propia dirección, «/actores/:id», que se puede
 * copiar y compartir. Eso es lo que convierte el perfil en algo que el actor
 * puede enseñar fuera de la plataforma, y no solo en una ficha interna.
 *
 * Un perfil que no existe y uno que existe pero no está aprobado dan la misma
 * respuesta, por lo explicado en «leerActor»: distinguirlos convertiría esta
 * dirección en un detector de perfiles pendientes.
 *
 * El listado de publicaciones del actor llega en HU-25.
 */
export default function PerfilActor() {
  const { id } = useParams();
  const { usuario } = useSesion();

  const [actor, setActor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { categorias } = useCategoriasActivas();

  useEffect(() => {
    let vigente = true;
    setCargando(true);

    leerActor(id)
      .then((leido) => vigente && setActor(leido))
      .catch(
        (fallo) =>
          vigente &&
          setError(fallo?.message ?? 'No se pudo leer el perfil. Revisa la conexión y recarga.')
      )
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <section className="contenedor perfil">
        <p>Leyendo el perfil…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="contenedor perfil">
        <h1>Perfil del actor cultural</h1>
        <p className="perfil__aviso" role="alert">
          {error}
        </p>
      </section>
    );
  }

  if (!actor) {
    return (
      <section className="contenedor perfil">
        <h1>Ese perfil no está disponible</h1>
        <p>
          La dirección no corresponde a ningún perfil publicado. Puede que se haya escrito mal o
          que el perfil todavía no esté aprobado.
        </p>
        <Link className="enlace-boton enlace-boton--secundario" to="/actores">
          Volver al directorio
        </Link>
      </section>
    );
  }

  const categoria = categorias.find((c) => c.id === actor.categoria)?.nombre ?? null;
  const soyElDueno = usuario?.uid === actor.uid;
  const { telefono, whatsapp, correo } = actor.contacto;
  const hayContacto = Boolean(telefono || whatsapp || correo);

  return (
    <section className="contenedor perfil">
      {actor.estado !== 'aprobado' && (
        <p className="perfil__borrador" role="status">
          Este perfil todavía no está aprobado: ningún visitante puede abrir esta dirección. Lo
          ves porque es tuyo o porque administras la plataforma.
        </p>
      )}

      <p className="perfil__migas">
        <Link to="/actores">Actores culturales</Link>
      </p>

      <div className="perfil__encabezado">
        <ImagenDeActor
          imagen={actor.imagen}
          nombre={actor.nombre}
          className="perfil__imagen"
        />
        <div>
          <h1>{actor.nombre}</h1>
          <p className="perfil__manifestacion">{actor.manifestacion}</p>
          {categoria && <p className="perfil__categoria">{categoria}</p>}
        </div>
      </div>

      <h2>Sobre la propuesta</h2>
      {/* «pre-wrap» en la hoja de estilos: respeta los saltos de línea que
          escribió el actor sin interpretar nada más de lo que tecleó. */}
      <p className="perfil__descripcion">{actor.descripcion}</p>

      <h2>Contacto</h2>
      {hayContacto ? (
        <ul className="perfil__contacto">
          {telefono && (
            <li>
              Teléfono: <a href={enlaceDeTelefono(telefono)}>{telefono}</a>
            </li>
          )}
          {whatsapp && (
            <li>
              WhatsApp:{' '}
              {/* «noreferrer» además de «noopener»: la pestaña que se abre no
                  tiene por qué saber desde qué perfil se llegó. */}
              <a href={enlaceDeWhatsapp(whatsapp)} target="_blank" rel="noopener noreferrer">
                {whatsapp}
              </a>
            </li>
          )}
          {correo && (
            <li>
              Correo: <a href={enlaceDeCorreo(correo)}>{correo}</a>
            </li>
          )}
        </ul>
      ) : (
        <p>Este perfil no publicó canales de contacto.</p>
      )}

      {soyElDueno && (
        <p>
          <Link className="enlace-boton enlace-boton--secundario" to="/mi-perfil">
            Editar mi perfil
          </Link>
        </p>
      )}
    </section>
  );
}
