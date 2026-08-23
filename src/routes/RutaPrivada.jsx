import { Navigate, useLocation } from 'react-router-dom';
import AccesoDenegado from '../components/AccesoDenegado.jsx';
import { useSesion } from '../hooks/useSesion.jsx';

/**
 * Envoltura de las rutas que exigen sesión, y opcionalmente un rol concreto — HU-15.
 *
 * Es la mitad visible del control de acceso: impide llegar a la vista. La otra
 * mitad son las reglas de seguridad de Firestore (HU-11), que rechazan la
 * operación aunque se intente fuera de la interfaz. Una sin la otra no cumple
 * RNF-08 (docs/03-arquitectura.md §4).
 *
 * Hay cuatro maneras de no pasar, y cada una necesita una respuesta distinta:
 *
 * | Situación                        | Respuesta                                  |
 * | -------------------------------- | ------------------------------------------ |
 * | Todavía no se sabe si hay sesión | Esperar. Ni dejar pasar ni echar.          |
 * | No hay sesión                    | Ir a «/ingreso» recordando a dónde iba.    |
 * | Hay sesión, falta el perfil      | Explicar que la cuenta está incompleta.    |
 * | Hay sesión, el rol no encaja     | Decir para qué rol es la vista.            |
 *
 * La tercera no es teórica: si el documento de «usuarios» no llegó a escribirse,
 * la credencial existe y el rol no, y las reglas rechazarán todo lo que intente.
 * Sin este caso la persona vería una vista vacía y errores de permisos sueltos.
 */
export default function RutaPrivada({ rol, roles, children }) {
  const { cargando, usuario, rol: rolActual, perfil } = useSesion();
  const ubicacion = useLocation();

  // Un solo rol o varios: «rol» se conserva porque es lo que leen las rutas.
  const permitidos = roles ?? (rol ? [rol] : []);

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

  if (!perfil) {
    return (
      <AccesoDenegado motivo="Tu cuenta existe pero no tiene un perfil asociado, así que todavía no tiene permisos. Escribe al administrador de la plataforma para que la complete." />
    );
  }

  // Una cuenta desactivada conserva la credencial y pierde los permisos. Las
  // reglas hacen lo mismo: tengoRol() exige estado 'activo'.
  if (perfil.estado !== 'activo') {
    return (
      <AccesoDenegado motivo="Tu cuenta está desactivada. Puedes seguir consultando la parte pública de la plataforma, pero no publicar ni moderar." />
    );
  }

  if (permitidos.length > 0 && !permitidos.includes(rolActual)) {
    return (
      <AccesoDenegado
        motivo="Esta vista corresponde a otro rol dentro de la plataforma."
        rolActual={rolActual}
        rolesPermitidos={permitidos}
      />
    );
  }

  return children;
}
