/**
 * Validación de los formularios — HU-12, HU-13, HU-16, HU-17.
 *
 * Funciones puras: sin React, sin Firebase y sin navegador. Esa es la razón de
 * que vivan en «utils» y no dentro de la vista — se comprueban con «npm run
 * probar», que no necesita emulador ni servidor de desarrollo.
 *
 * Cada validador devuelve «null» cuando el valor es aceptable y el mensaje que
 * debe leer la persona cuando no lo es. El mensaje dice qué falta y cómo
 * corregirlo, nunca «campo inválido».
 */

import { aIdentificador } from './texto.js';

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

/** Longitud máxima del nombre de una categoría: tiene que caber en un filtro. */
export const LONGITUD_MAXIMA_CATEGORIA = 60;

/**
 * Valida el nombre de una categoría cultural (HU-17).
 *
 * «identificadoresExistentes» son los de las categorías ya creadas. La
 * comparación se hace sobre el identificador y no sobre el nombre escrito, de
 * modo que «Música y danza» y «musica y danza» se reconozcan como la misma: el
 * identificador es lo que queda guardado dentro de cada evento, y dos categorías
 * que produjeran el mismo se pisarían la una a la otra.
 */
export function validarCategoria({ nombre }, identificadoresExistentes = []) {
  const limpio = (nombre ?? '').trim();

  if (limpio === '') return { nombre: 'Escribe el nombre de la categoría.' };
  if (limpio.length < 3) return { nombre: 'El nombre debe tener al menos tres caracteres.' };
  if (limpio.length > LONGITUD_MAXIMA_CATEGORIA) {
    return {
      nombre: `El nombre no puede pasar de ${LONGITUD_MAXIMA_CATEGORIA} caracteres: tiene que caber en un filtro.`,
    };
  }

  const identificador = aIdentificador(limpio);
  if (identificador === '') {
    return { nombre: 'El nombre debe contener al menos una letra o un número.' };
  }
  if (identificadoresExistentes.includes(identificador)) {
    return { nombre: 'Ya existe una categoría con ese nombre.' };
  }

  return {};
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}

/** Deja fuera los campos correctos: el objeto solo lleva lo que hay que corregir. */
function sinNulos(candidatos) {
  return Object.fromEntries(Object.entries(candidatos).filter(([, mensaje]) => mensaje !== null));
}
