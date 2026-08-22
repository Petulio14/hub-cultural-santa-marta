import { Link, NavLink } from 'react-router-dom';
import { ACCESOS_PRINCIPALES } from '../routes/accesos.js';
import './Cabecera.css';

/**
 * Cabecera común a todas las vistas.
 *
 * El logotipo institucional va sobre placa blanca porque la marca es verde
 * oscuro y la barra es azul profundo: sobre el fondo directo el contraste
 * quedaría por debajo de 4,5 : 1 (docs/05-prototipo-interfaz.md §4 bis).
 *
 * La marca es además el camino de regreso al inicio desde cualquier vista
 * (tercer criterio de aceptación de HU-09), reforzado por el enlace del pie.
 *
 * La versión compacta por debajo de 768 px es HU-10.
 */
export default function Cabecera() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera__interior">
        <Link className="cabecera__marca" to="/">
          <span className="cabecera__placa">
            <img src="/logo-tdea.png" alt="Tecnológico de Antioquia" />
          </span>
          <span className="cabecera__nombre">
            Hub Cultural<small>Santa Marta</small>
          </span>
        </Link>

        <nav className="cabecera__nav" aria-label="Navegación principal">
          {ACCESOS_PRINCIPALES.map((acceso) => (
            <NavLink
              key={acceso.a}
              to={acceso.a}
              className={({ isActive }) =>
                isActive ? 'cabecera__enlace cabecera__enlace--activo' : 'cabecera__enlace'
              }
            >
              {acceso.nombre}
            </NavLink>
          ))}
        </nav>

        <Link className="cabecera__ingresar" to="/ingreso">
          Ingresar
        </Link>
      </div>
    </header>
  );
}
