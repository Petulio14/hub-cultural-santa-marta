import { Link } from 'react-router-dom';
import { ACCESOS_PRINCIPALES } from '../../routes/accesos.js';
import './Inicio.css';

/**
 * V-1 · Inicio. Presenta el propósito de la plataforma y los cuatro accesos
 * principales —eventos, actores culturales, hubs y mapa—, que es el primer
 * criterio de aceptación de HU-09.
 *
 * Los accesos se leen de ACCESOS_PRINCIPALES, la misma lista que usa la
 * cabecera: si mañana cambia uno, no puede quedar distinto en los dos sitios.
 */
export default function Inicio() {
  return (
    <>
      <section className="contenedor">
        <div className="heroe">
          <p className="heroe__antetitulo">Plataforma pública de descubrimiento</p>
          <h1>La cultura de Santa Marta, toda en un mismo lugar</h1>
          <p className="heroe__texto">
            Encuentra talleres, rutas, música y saberes que sostienen las comunidades del
            Magdalena, publicados por quienes los llevan a cabo. Sin intermediarios y sin
            registro para consultar.
          </p>
          <div className="heroe__acciones">
            <Link className="enlace-boton" to="/eventos">
              Ver la oferta cultural
            </Link>
            <Link className="enlace-boton enlace-boton--secundario" to="/ingreso">
              Soy actor cultural
            </Link>
          </div>
        </div>
      </section>

      <section className="contenedor" aria-labelledby="accesos">
        <h2 id="accesos">Cuatro formas de empezar</h2>
        <ul className="accesos">
          {ACCESOS_PRINCIPALES.map((acceso) => (
            <li key={acceso.a}>
              <Link className="acceso" to={acceso.a}>
                <strong className="acceso__nombre">{acceso.nombre}</strong>
                <span className="acceso__descripcion">{acceso.descripcion}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
