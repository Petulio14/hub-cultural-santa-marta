import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion.jsx';
import { ACCESOS_PRINCIPALES } from '../routes/accesos.js';
import { enlacesDeRol, etiquetaDeRol } from '../routes/roles.js';
import { cerrarSesion } from '../services/authService.js';
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
 * Por debajo de 768 px el menú se presenta compacto (HU-10). Quién decide si
 * está compacto es el CSS, no este componente: aquí solo se guarda si el panel
 * está abierto, y en escritorio ese estado es irrelevante porque el menú se
 * muestra siempre.
 */
export default function Cabecera() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const { cargando, usuario, rol, perfil } = useSesion();
  const idPanel = useId();
  const botonRef = useRef(null);

  // Una cuenta desactivada conserva la sesión y pierde los permisos, así que
  // tampoco ve los enlaces que llevan a lo que ya no puede hacer (HU-15).
  const activa = perfil?.estado === 'activo';

  // Al cambiar de vista el panel se cierra: dejarlo abierto taparía la vista
  // recién abierta.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  // Escape cierra el panel y devuelve el foco a su botón, para no perder el
  // punto de navegación con teclado.
  useEffect(() => {
    if (!abierto) return undefined;
    function alPulsar(evento) {
      if (evento.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [abierto]);

  // Al cerrar sesión se vuelve al inicio público. Quedarse en la vista privada
  // acabaría en la pantalla de ingreso, que parece un fallo y no una salida.
  async function salir() {
    await cerrarSesion();
    navegar('/', { replace: true });
  }

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

        <button
          type="button"
          ref={botonRef}
          className="cabecera__hamburguesa"
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto((estaba) => !estaba)}
        >
          <span className="cabecera__barras" aria-hidden="true" />
          {abierto ? 'Cerrar' : 'Menú'}
        </button>

        <div
          className={abierto ? 'cabecera__panel cabecera__panel--abierto' : 'cabecera__panel'}
          id={idPanel}
        >
          <nav className="cabecera__nav" aria-label="Navegación principal">
            {[...ACCESOS_PRINCIPALES, ...(activa ? enlacesDeRol(rol) : [])].map((acceso) => (
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

          {/* Mientras Authentication responde no se muestra ni «Ingresar» ni el
              nombre: pintar «Ingresar» y sustituirlo medio segundo después haría
              parpadear la cabecera en cada recarga. */}
          {cargando ? null : usuario ? (
            <div className="cabecera__sesion">
              <span className="cabecera__quien">
                {usuario.nombre}
                <small>{activa ? etiquetaDeRol(rol) : 'Cuenta desactivada'}</small>
              </span>
              <button type="button" className="cabecera__salir" onClick={salir}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link className="cabecera__ingresar" to="/ingreso">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
