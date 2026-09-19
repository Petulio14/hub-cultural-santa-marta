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
 * Los logotipos institucionales van sobre placa blanca porque sus marcas son
 * oscuras y la barra es azul profundo: sobre el fondo directo el contraste
 * quedaría por debajo de 4,5 : 1 (docs/05-prototipo-interfaz.md §4 bis).
 *
 * Son tres —Tecnológico de Antioquia, Universidad Autónoma del Estado de México
 * y Universidad del Magdalena— y por eso **el enlace al inicio es el nombre del
 * sitio y no la placa**. Antes el logotipo entero era el enlace, y con uno solo
 * eso funcionaba; con tres, pulsar el sello de una universidad para acabar en el
 * inicio de esta plataforma sería llevar a otro sitio del que se anuncia, y el
 * enlace pasaría a nombrarse con los tres rótulos seguidos antes del suyo.
 *
 * El camino de regreso al inicio desde cualquier vista sigue existiendo y sigue
 * estando arriba a la izquierda (tercer criterio de aceptación de HU-09),
 * reforzado por el enlace del pie.
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
        <div className="cabecera__marca">
          {/* Cada logotipo lleva su «alt» con el nombre de la institución: son
              la atribución académica del trabajo, no adorno, así que ninguno
              puede quedarse sin nombre accesible. */}
          <span className="cabecera__placa">
            <img
              className="cabecera__logo"
              src="/logo-tdea.png"
              alt="Tecnológico de Antioquia"
            />
            <img
              className="cabecera__logo cabecera__logo--sello"
              src="/UAEMex.svg"
              alt="Universidad Autónoma del Estado de México"
            />
            <img
              className="cabecera__logo cabecera__logo--sello"
              src="/UDM.png"
              alt="Universidad del Magdalena"
            />
          </span>
          <Link className="cabecera__nombre" to="/">
            Hub Cultural<small>Santa Marta</small>
          </Link>
        </div>

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
