/**
 * Sesión del usuario y su rol.
 *
 * PROVISIONAL: la autenticación se incorpora en HU-12 (registro), HU-13 (inicio
 * de sesión) y HU-15 (control de acceso por rol). Hasta entonces esta función
 * declara que no hay nadie autenticado, lo que hace que las rutas privadas
 * redirijan a la vista de ingreso: es el comportamiento correcto para un
 * visitante, y el que seguirá vigente cuando el cuerpo se sustituya por el
 * escuchador de Firebase Authentication de «authService».
 */
export function useSesion() {
  return { cargando: false, usuario: null, rol: null };
}
