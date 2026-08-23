/**
 * Qué puede hacer cada rol dentro de la interfaz — HU-13, HU-15.
 *
 * Es la mitad visible del control de acceso, y está en un único archivo por la
 * misma razón que los accesos principales: el menú, la redirección posterior al
 * ingreso y las rutas privadas tienen que coincidir. Si cada uno decidiera por
 * su cuenta, tarde o temprano el menú ofrecería una vista que la ruta rechaza.
 *
 * La otra mitad son las reglas de seguridad (docs/11-reglas-de-seguridad.md).
 * Esta tabla decide qué se ve; las reglas deciden qué se puede hacer, y no se
 * fían de esta.
 */

/** Los tres roles que crean documento en «usuarios» (docs/04 §3). */
export const ROLES = {
  actor: {
    etiqueta: 'Actor cultural',
    inicio: '/mis-publicaciones',
    enlaces: [{ a: '/mis-publicaciones', nombre: 'Mis publicaciones' }],
  },
  hub: {
    etiqueta: 'Hub de innovación',
    // El perfil del hub llega en HU-20; hasta entonces su inicio es el directorio.
    inicio: '/hubs',
    enlaces: [],
  },
  administrador: {
    etiqueta: 'Administrador',
    inicio: '/admin',
    enlaces: [{ a: '/admin', nombre: 'Panel de administración' }],
  },
};

/** Nombre legible del rol. El visitante sin cuenta no tiene ninguno. */
export function etiquetaDeRol(rol) {
  return ROLES[rol]?.etiqueta ?? 'Cuenta sin rol asignado';
}

/**
 * Dónde aterriza cada rol al iniciar sesión (primer criterio de HU-13).
 * Un rol desconocido o ausente va al inicio público, que es lo que cualquiera
 * puede ver.
 */
export function destinoTrasIngresar(rol) {
  return ROLES[rol]?.inicio ?? '/';
}

/** Enlaces privados que el menú añade para ese rol, y solo para ese rol. */
export function enlacesDeRol(rol) {
  return ROLES[rol]?.enlaces ?? [];
}
