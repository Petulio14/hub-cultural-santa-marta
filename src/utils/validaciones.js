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

import { estaEnSantaMarta } from './coordenadas.js';
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

/* ------------------------------------------------------------------ HU-18 --
 * Perfil de actor cultural.
 *
 * Los topes coinciden con los que imponen las reglas de seguridad
 * (firestore.rules, colección «actoresCulturales»). Están escritos dos veces a
 * propósito y por motivos distintos: aquí para poder avisar **antes** del envío,
 * que es el tercer criterio de aceptación, y allí para que el aviso no dependa
 * de que quien escribe use esta interfaz. Si uno cambia, el otro también.
 */

/** El tope del modelo de datos (docs/04 §4) y de las reglas. */
export const LONGITUD_MAXIMA_DESCRIPCION_ACTOR = 1000;

/** Por debajo de esto la descripción no orienta a nadie sobre la propuesta. */
export const LONGITUD_MINIMA_DESCRIPCION_ACTOR = 30;

/** Tiene que caber en la tarjeta del directorio sin partirse en tres líneas. */
export const LONGITUD_MAXIMA_NOMBRE_ACTOR = 80;

/** «Danza de la tambora del Magdalena Grande» cabe; un párrafo no debe caber. */
export const LONGITUD_MAXIMA_MANIFESTACION = 120;

/**
 * Forma de un teléfono colombiano, deliberadamente laxa: se aceptan espacios,
 * guiones, paréntesis y prefijo internacional, y se cuenta solo lo que queda.
 * Un móvil tiene 10 dígitos y un fijo 7 más el indicativo; con prefijo +57 se
 * llega a 12. Rechazar por formato un número que sí existe es peor que aceptar
 * uno mal escrito: el teléfono lo verifica quien llama, no el formulario.
 */
const SOLO_DIGITOS = /\D+/g;

export function validarTelefono(valor, { obligatorio = false } = {}) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return obligatorio ? 'Escribe un número de teléfono.' : null;

  const digitos = limpio.replace(SOLO_DIGITOS, '');
  if (digitos.length < 7 || digitos.length > 13) {
    return 'Ese teléfono no parece completo. Un móvil tiene 10 dígitos y un fijo 7 más el indicativo.';
  }
  return null;
}

export function validarManifestacion(valor) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') {
    return 'Escribe qué manifestación o práctica cultural representas. Por ejemplo: tambora, cocina tradicional, tejido en fique.';
  }
  if (limpio.length < 3) return 'La manifestación debe tener al menos tres caracteres.';
  if (limpio.length > LONGITUD_MAXIMA_MANIFESTACION) {
    return `La manifestación no puede pasar de ${LONGITUD_MAXIMA_MANIFESTACION} caracteres. Lo que no quepa aquí va en la descripción.`;
  }
  return null;
}

/**
 * Tercer criterio de aceptación de HU-18: el aviso llega **antes** del envío.
 * Por eso el contador de caracteres de la vista llama a esta misma función en
 * cada pulsación, y no solo al pulsar «Guardar».
 */
export function validarDescripcionDeActor(valor) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return 'Describe tu propuesta: es lo que va a leer quien te encuentre.';
  if (limpio.length < LONGITUD_MINIMA_DESCRIPCION_ACTOR) {
    return `La descripción debe tener al menos ${LONGITUD_MINIMA_DESCRIPCION_ACTOR} caracteres para decir algo de tu propuesta.`;
  }
  if (limpio.length > LONGITUD_MAXIMA_DESCRIPCION_ACTOR) {
    const sobran = limpio.length - LONGITUD_MAXIMA_DESCRIPCION_ACTOR;
    const cuenta = sobran === 1 ? 'sobra 1 carácter' : `sobran ${sobran} caracteres`;
    return `Te ${cuenta}: el máximo es ${LONGITUD_MAXIMA_DESCRIPCION_ACTOR}.`;
  }
  return null;
}

/**
 * La categoría se comprueba contra las que el administrador ofrece hoy, no
 * contra una lista escrita aquí: el catálogo es un dato de la base (HU-17), y
 * copiarlo al código lo dejaría desfasado en cuanto se cree una categoría nueva.
 */
export function validarCategoriaDeActor(valor, identificadoresOfrecidos = []) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return 'Elige la categoría que mejor clasifica tu manifestación.';
  if (identificadoresOfrecidos.length > 0 && !identificadoresOfrecidos.includes(limpio)) {
    return 'Esa categoría ya no está disponible. Elige otra de la lista.';
  }
  return null;
}

/**
 * Canales de contacto (RF-12).
 *
 * Se exige **al menos uno**, y no los tres. Un perfil sin ninguna forma de
 * contacto incumple el propósito de la historia —«antes de contactarme»—, pero
 * obligar a los tres forzaría a publicar un número personal a quien solo quiere
 * dar un correo. Publicar un dato de contacto es una decisión del actor, y la
 * política de tratamiento de datos la respalda como tal (docs/14 §3).
 */
export function validarContacto({ telefono, correo, whatsapp } = {}) {
  const errores = sinNulos({
    telefono: validarTelefono(telefono),
    whatsapp: validarTelefono(whatsapp),
    correo: (correo ?? '').trim() === '' ? null : validarCorreo(correo),
  });

  const hayAlguno = [telefono, correo, whatsapp].some((canal) => (canal ?? '').trim() !== '');
  if (!hayAlguno) {
    errores.contacto =
      'Deja al menos un canal de contacto: teléfono, WhatsApp o correo. Sin ninguno, quien te encuentre no puede escribirte.';
  }

  return errores;
}

/**
 * Valida el formulario completo del perfil (HU-18). Los errores del mapa de
 * contacto se aplanan con el prefijo «contacto.» para que la vista pueda
 * localizarlos junto a su campo sin recorrer un objeto anidado.
 */
export function validarPerfilDeActor(
  { nombre, manifestacion, descripcion, categoria, contacto } = {},
  identificadoresOfrecidos = []
) {
  const nombreLimpio = (nombre ?? '').trim();
  const excedeNombre =
    nombreLimpio.length > LONGITUD_MAXIMA_NOMBRE_ACTOR
      ? `El nombre no puede pasar de ${LONGITUD_MAXIMA_NOMBRE_ACTOR} caracteres.`
      : null;

  const errores = sinNulos({
    nombre: validarNombre(nombre) ?? excedeNombre,
    manifestacion: validarManifestacion(manifestacion),
    descripcion: validarDescripcionDeActor(descripcion),
    categoria: validarCategoriaDeActor(categoria, identificadoresOfrecidos),
  });

  for (const [campo, mensaje] of Object.entries(validarContacto(contacto))) {
    errores[campo === 'contacto' ? 'contacto' : `contacto.${campo}`] = mensaje;
  }

  return errores;
}

/* ------------------------------------------------------------------ HU-20 --
 * Perfil de un hub de innovación.
 *
 * Comparte con el perfil de actor (HU-18) el nombre, la descripción y los
 * canales de contacto, y reutiliza sus validadores. Lo propio del hub son tres
 * cosas que un actor cultural no tiene: las líneas de trabajo, la dirección
 * física y el punto en el mapa.
 */

/** Al menos una línea, y no más de las que caben en una tarjeta del directorio. */
export const MAXIMO_LINEAS_DE_TRABAJO = 8;

/** Una línea de trabajo es una etiqueta, no una frase. */
export const LONGITUD_MAXIMA_LINEA = 60;

/** Lo bastante para «Calle 22 # 1-40, El Rodadero» y no para un párrafo. */
export const LONGITUD_MAXIMA_DIRECCION = 200;

export function validarLineasDeTrabajo(lineas) {
  const lista = Array.isArray(lineas) ? lineas : [];

  if (lista.length === 0) {
    return 'Escribe al menos una línea de trabajo, separadas por comas. Por ejemplo: emprendimiento, economía naranja, formación.';
  }
  if (lista.length > MAXIMO_LINEAS_DE_TRABAJO) {
    return `Son ${lista.length} líneas y el máximo son ${MAXIMO_LINEAS_DE_TRABAJO}. Deja las que mejor te describan.`;
  }
  if (lista.some((linea) => linea.length > LONGITUD_MAXIMA_LINEA)) {
    return `Cada línea de trabajo es una etiqueta corta, de ${LONGITUD_MAXIMA_LINEA} caracteres como mucho. Lo que no quepa va en la descripción.`;
  }
  return null;
}

export function validarDireccion(valor) {
  const limpio = (valor ?? '').trim();
  if (limpio === '') return 'Escribe la dirección del espacio.';
  if (limpio.length < 5) return 'Esa dirección es demasiado corta para encontrar el sitio.';
  if (limpio.length > LONGITUD_MAXIMA_DIRECCION) {
    return `La dirección no puede pasar de ${LONGITUD_MAXIMA_DIRECCION} caracteres.`;
  }
  return null;
}

/**
 * El punto en el mapa (tercer criterio de HU-20).
 *
 * Se exige **confirmado**, no deducido. El buscador de direcciones acierta con
 * los sitios con nombre y falla con la nomenclatura de «carrera con calle»
 * (véase la cabecera de geocodificacionService.js), así que geocodificar en
 * silencio al guardar pondría en el mapa puntos que nadie ha visto. Quien
 * registra el hub busca, mira lo que se encontró y confirma que es el suyo.
 */
export function validarPunto(punto) {
  if (!punto) {
    return 'Busca la dirección y confirma el punto: sin él, el hub no puede aparecer en el mapa.';
  }
  if (!estaEnSantaMarta(punto)) {
    return 'Ese punto queda fuera de Santa Marta y su área. Busca de nuevo con un lugar de referencia cercano.';
  }
  return null;
}

/** Valida el formulario completo del hub (HU-20). */
export function validarPerfilDeHub(
  { nombre, descripcion, lineasDeTrabajo, direccion, punto, contacto } = {}
) {
  const nombreLimpio = (nombre ?? '').trim();
  const excedeNombre =
    nombreLimpio.length > LONGITUD_MAXIMA_NOMBRE_ACTOR
      ? `El nombre no puede pasar de ${LONGITUD_MAXIMA_NOMBRE_ACTOR} caracteres.`
      : null;

  const errores = sinNulos({
    nombre: validarNombre(nombre) ?? excedeNombre,
    descripcion: validarDescripcionDeActor(descripcion),
    lineasDeTrabajo: validarLineasDeTrabajo(lineasDeTrabajo),
    direccion: validarDireccion(direccion),
    punto: validarPunto(punto),
  });

  for (const [campo, mensaje] of Object.entries(validarContacto(contacto))) {
    errores[campo === 'contacto' ? 'contacto' : `contacto.${campo}`] = mensaje;
  }

  return errores;
}
