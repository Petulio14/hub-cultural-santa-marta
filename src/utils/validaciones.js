/**
 * Validación de los formularios de cuenta — HU-12, HU-13, HU-16.
 *
 * Funciones puras: sin React, sin Firebase y sin navegador. Esa es la razón de
 * que vivan en «utils» y no dentro de la vista — se comprueban con «npm run
 * probar», que no necesita emulador ni servidor de desarrollo.
 *
 * Cada validador devuelve «null» cuando el valor es aceptable y el mensaje que
 * debe leer la persona cuando no lo es. El mensaje dice qué falta y cómo
 * corregirlo, nunca «campo inválido».
 */

/** Mínimo exigido por el primer criterio de aceptación de HU-12. */
export const LONGITUD_MINIMA_CONTRASENA = 8;

/**
 * Forma del correo. No comprueba que exista —eso solo lo sabe el servidor de
 * correo—, sino que haya algo antes de la arroba, algo después y un dominio con
 * punto. Una expresión más estricta rechazaría direcciones legítimas.
 */
const FORMA_DE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNombre(valor) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return 'Escribe el nombre del actor cultural o del colectivo.';
  if (limpio.length < 3) return 'El nombre debe tener al menos tres caracteres.';
  return null;
}

export function validarCorreo(valor) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return 'Escribe tu correo electrónico.';
  if (!FORMA_DE_CORREO.test(limpio)) return 'Ese correo no tiene un formato válido. Ejemplo: nombre@dominio.com';
  return null;
}

export function validarContrasena(valor) {
  const contrasena = valor ?? '';
  if (contrasena === '') return 'Escribe una contraseña.';
  if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`;
  }
  return null;
}

export function validarConfirmacion(contrasena, confirmacion) {
  if ((confirmacion ?? '') === '') return 'Repite la contraseña para confirmarla.';
  if (contrasena !== confirmacion) return 'Las dos contraseñas no coinciden.';
  return null;
}

/** HU-16: sin aceptación expresa no hay registro. */
export function validarConsentimiento(aceptado) {
  if (aceptado !== true) {
    return 'Para crear la cuenta debes aceptar la política de tratamiento de datos personales.';
  }
  return null;
}

/**
 * Valida el formulario de registro completo y devuelve un objeto con un mensaje
 * por cada campo que falle. Devolverlos todos de una vez, y no solo el primero,
 * evita que la persona corrija un campo, envíe, y descubra el siguiente error.
 */
export function validarRegistro({ nombre, correo, contrasena, confirmacion, consentimiento }) {
  return sinNulos({
    nombre: validarNombre(nombre),
    correo: validarCorreo(correo),
    contrasena: validarContrasena(contrasena),
    confirmacion: validarConfirmacion(contrasena, confirmacion),
    consentimiento: validarConsentimiento(consentimiento),
  });
}

/**
 * Valida el formulario de ingreso. Aquí la contraseña solo se comprueba vacía:
 * exigir ocho caracteres al iniciar sesión delataría la regla con la que se
 * crearon las cuentas y no evita ningún intento.
 */
export function validarIngreso({ correo, contrasena }) {
  return sinNulos({
    correo: validarCorreo(correo),
    contrasena: (contrasena ?? '') === '' ? 'Escribe tu contraseña.' : null,
  });
}

/** Valida la solicitud de restablecimiento de contraseña (HU-14). */
export function validarRecuperacion({ correo }) {
  return sinNulos({ correo: validarCorreo(correo) });
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}

/** Deja fuera los campos correctos: el objeto solo lleva lo que hay que corregir. */
function sinNulos(candidatos) {
  return Object.fromEntries(Object.entries(candidatos).filter(([, mensaje]) => mensaje !== null));
}
