import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarHubsAprobados } from '../../services/hubsService.js';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';
import {
  enlaceDeCorreo,
  enlaceDeTelefono,
  enlaceDeWhatsapp,
} from '../../utils/contacto.js';
import './DirectorioHubs.css';

/**
 * V-5 · Directorio de hubs de innovación — HU-20, segundo criterio.
 *
 * Vista **pública**: no se pide cuenta para leerla, y por eso lista solo los
 * hubs aprobados. El filtro lo aplica el servidor.
 *
 * A diferencia de los actores culturales, un hub **no tiene página propia**. El
 * prototipo (V-5) pide «listado de hubs aprobados con nombre, descripción,
 * líneas de trabajo, dirección y contacto», y eso cabe entero en la tarjeta: una
 * página aparte por cada hub sería un clic para no leer nada nuevo. Cuando
 * llegue el mapa (HU-30), el punto que se guarda aquí es lo que los sitúa.
 */
export default function DirectorioHubs() {
  const [hubs, setHubs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    listarHubsAprobados()
      .then((leidos) => vigente && setHubs(leidos))
      .catch(
        (fallo) =>
          vigente &&
          setError(
            fallo?.message ?? 'No se pudo leer el directorio. Revisa la conexión y recarga.'
          )
      )
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, []);

  return (
    <section className="contenedor hubs">
      <h1>Hubs de innovación</h1>
      <p className="hubs__intro">
        Espacios que acogen, forman y conectan a quienes trabajan en cultura e innovación en
        Santa Marta. Cada uno indica sus líneas de trabajo, dónde está y cómo contactarlo.
      </p>

      {cargando && <p>Leyendo el directorio…</p>}

      {error && (
        <p className="hubs__aviso" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && hubs.length === 0 && (
        <p className="hubs__vacio">
          Todavía no hay ningún hub publicado. Los hubs aparecen aquí cuando el administrador
          los aprueba. Si diriges un espacio de innovación en la ciudad,{' '}
          <Link to="/ingreso">crea tu cuenta</Link> y registra el tuyo.
        </p>
      )}

      {hubs.length > 0 && (
        <>
          <p className="hubs__recuento">
            {hubs.length} {hubs.length === 1 ? 'hub publicado' : 'hubs publicados'}.
          </p>

          <ul className="hubs__rejilla">
            {hubs.map((hub) => {
              const { telefono, whatsapp, correo } = hub.contacto;
              return (
                <li className="tarjeta tarjeta-hub" key={hub.id}>
                  <h2 className="tarjeta-hub__nombre">{hub.nombre}</h2>

                  {hub.lineasDeTrabajo.length > 0 && (
                    <ul className="tarjeta-hub__lineas">
                      {hub.lineasDeTrabajo.map((linea) => (
                        <li key={linea}>{linea}</li>
                      ))}
                    </ul>
                  )}

                  <p className="tarjeta-hub__descripcion">{hub.descripcion}</p>

                  <p className="tarjeta-hub__direccion">
                    {hub.direccion}
                    {hub.punto && (
                      // Las coordenadas se escriben además de la dirección
                      // porque son el dato con el que el hub aparece en el mapa,
                      // y verlas es la forma de comprobar que son las suyas.
                      <span className="tarjeta-hub__punto">
                        {' · '}
                        {textoDeCoordenadas(hub.punto)}
                      </span>
                    )}
                  </p>

                  {(telefono || whatsapp || correo) && (
                    <ul className="tarjeta-hub__contacto">
                      {telefono && (
                        <li>
                          <a href={enlaceDeTelefono(telefono)}>{telefono}</a>
                        </li>
                      )}
                      {whatsapp && (
                        <li>
                          <a
                            href={enlaceDeWhatsapp(whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                        </li>
                      )}
                      {correo && (
                        <li>
                          <a href={enlaceDeCorreo(correo)}>{correo}</a>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
