import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion.js';

/**
 * Envoltura de las rutas que exigen sesión, y opcionalmente un rol concreto.
 *
 * Es la mitad visible del control de acceso: impide llegar a la vista. La otra
 * mitad son las reglas de seguridad de Firestore (HU-11), que rechazan la
 * operación aunque se intente fuera de la interfaz. Una sin la otra no cumple
 * RNF-08 (docs/03-arquitectura.md §4).
 */
export default function RutaPrivada({ rol, children }) {
  const { cargando, usuario, rol: rolActual } = useSesion();
  const ubicacion = useLocation();

  if (cargando) {
    return (
      <section className="contenedor">
        <p>Comprobando la sesión…</p>
      </section>
    );
  }

  if (!usuario) {
    // «desde» permite volver a la vista solicitada una vez iniciada la sesión (HU-13)
    return <Navigate to="/ingreso" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (rol && rolActual !== rol) {
    return (
      <section className="contenedor pendiente">
        <p className="pendiente__etiqueta">Acceso restringido</p>
        <h1>Esta sección no está disponible para tu cuenta</h1>
        <p>La vista solicitada es exclusiva del rol «{rol}».</p>
      </section>
    );
  }

  return children;
}
