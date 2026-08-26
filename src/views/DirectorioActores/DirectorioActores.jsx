import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarActoresAprobados } from '../../services/actoresService.js';
import { useCategoriasActivas } from '../../hooks/useCategoriasActivas.js';
import './DirectorioActores.css';

/**
 * V-4 · Directorio de actores culturales — HU-18, quinto criterio.
 *
 * El prototipo especifica el perfil de un actor, pero los cuatro accesos de la
 * página de inicio exigen además una puerta de entrada a todos ellos (véase la
 * nota de docs/09-navegacion-e-inicio.md §5).
 *
 * Es una vista **pública**: no se pide cuenta para leerla, y por eso lista solo
 * los perfiles aprobados. El filtro lo aplica el servidor —lo explica la
 * cabecera de actoresService.js—, así que aquí no hay nada que descartar.
 */
export default function DirectorioActores() {
  const [actores, setActores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Solo para traducir el identificador de categoría a su nombre. Si la lectura
  // falla, la tarjeta se pinta igual: la categoría es un dato de apoyo, no el
  // contenido del directorio.
  const { categorias } = useCategoriasActivas();
  const nombreDeCategoria = (id) => categorias.find((c) => c.id === id)?.nombre ?? null;

  useEffect(() => {
    let vigente = true;

    listarActoresAprobados()
      .then((leidos) => vigente && setActores(leidos))
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
    <section className="contenedor directorio">
      <h1>Actores culturales</h1>
      <p className="directorio__intro">
        Quiénes sostienen la vida cultural de Santa Marta: gestores, colectivos, artesanos y
        portadores de saberes. Abre un perfil para conocer su propuesta y cómo contactarlos.
      </p>

      {cargando && <p>Leyendo el directorio…</p>}

      {error && (
        <p className="directorio__aviso" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && actores.length === 0 && (
        <p className="directorio__vacio">
          Todavía no hay ningún perfil publicado. Los perfiles aparecen aquí cuando el
          administrador los aprueba. Si representas una manifestación cultural de la ciudad,{' '}
          <Link to="/ingreso">crea tu cuenta</Link> y publica el tuyo.
        </p>
      )}

      {actores.length > 0 && (
        <>
          <p className="directorio__recuento">
            {actores.length} {actores.length === 1 ? 'perfil publicado' : 'perfiles publicados'}.
          </p>

          <ul className="directorio__rejilla">
            {actores.map((actor) => {
              const categoria = nombreDeCategoria(actor.categoria);
              return (
                <li className="tarjeta tarjeta-actor" key={actor.id}>
                  <h2 className="tarjeta-actor__nombre">
                    <Link to={`/actores/${actor.id}`}>{actor.nombre}</Link>
                  </h2>
                  <p className="tarjeta-actor__manifestacion">{actor.manifestacion}</p>
                  {categoria && <p className="tarjeta-actor__categoria">{categoria}</p>}
                  <p className="tarjeta-actor__descripcion">{actor.descripcion}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
