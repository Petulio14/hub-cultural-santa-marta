/**
 * Cuentas y sesión — HU-12, HU-13, HU-14, HU-16.
 *
 * Junto con «firebase.js» es el único punto del proyecto que habla con Firebase
 * Authentication y con la colección «usuarios» (docs/03-arquitectura.md §3). Las
 * vistas llaman a estas funciones y reciben objetos de dominio ya normalizados;
 * nunca ven un «UserCredential» ni un «DocumentSnapshot».
 *
 * Dos decisiones que este archivo concentra:
 *
 * 1. **La contraseña no se guarda en ninguna parte.** La gestiona Authentication
 *    (RNF-05). En «usuarios» solo hay identidad, rol y consentimiento.
 * 2. **El rol vive en Firestore, no en el token.** Un documento por usuario,
 *    cuyo identificador es el uid (docs/04 §3), de modo que las reglas de
 *    seguridad puedan resolverlo con una sola lectura.
 */
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, configuracionCompleta, db } from './firebase.js';

/** Versión de la política aceptada al registrarse (HU-16). */
export const VERSION_POLITICA_DATOS = '1.0';

/** Sesión vacía: la de un visitante. Es también el estado inicial del proveedor. */
export const SESION_VACIA = { cargando: false, usuario: null, rol: null, perfil: null };

/**
 * Error de dominio. La vista lo muestra sin traducir nada: el mensaje ya está
 * escrito para quien lo va a leer, y «campo» indica junto a qué campo ponerlo.
 */
export class ErrorDeCuenta extends Error {
  constructor(mensaje, { campo = null, codigo = null } = {}) {
    super(mensaje);
    this.name = 'ErrorDeCuenta';
    this.campo = campo;
    this.codigo = codigo;
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeCuenta(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

const normalizarCorreo = (correo) => (correo ?? '').trim().toLowerCase();

/**
 * Traduce los códigos de Authentication a mensajes en español.
 *
 * Al **iniciar sesión** todos los fallos de credencial comparten un único
 * mensaje: decir «ese correo no existe» permitiría averiguar quién tiene cuenta
 * en la plataforma probando direcciones (segundo criterio de HU-13). Al
 * **registrarse** sí se distingue el correo ya usado, porque ahí el criterio de
 * aceptación exige decirlo y porque el propio servicio lo revela de todos modos:
 * no se puede crear dos veces la misma cuenta.
 */
function traducir(error, contexto) {
  const codigo = error?.code ?? '';

  if (contexto === 'registro' && codigo === 'auth/email-already-in-use') {
    return new ErrorDeCuenta(
      'Ese correo ya tiene una cuenta en la plataforma. Inicia sesión o recupera tu contraseña.',
      { campo: 'correo', codigo }
    );
  }

  if (contexto === 'ingreso') {
    const fallosDeCredencial = [
      'auth/invalid-credential',
      'auth/invalid-email',
      'auth/user-not-found',
      'auth/wrong-password',
    ];
    if (fallosDeCredencial.includes(codigo)) {
      return new ErrorDeCuenta('El correo o la contraseña no son correctos.', { codigo });
    }
    if (codigo === 'auth/user-disabled') {
      return new ErrorDeCuenta(
        'Esta cuenta está inhabilitada. Escribe al administrador de la plataforma.',
        { codigo }
      );
    }
  }

  if (codigo === 'auth/weak-password') {
    return new ErrorDeCuenta('La contraseña es demasiado débil. Usa al menos ocho caracteres.', {
      campo: 'contrasena',
      codigo,
    });
  }
  if (codigo === 'auth/invalid-email') {
    return new ErrorDeCuenta('Ese correo no tiene un formato válido.', { campo: 'correo', codigo });
  }
  if (codigo === 'auth/too-many-requests') {
    return new ErrorDeCuenta(
      'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.',
      { codigo }
    );
  }
  if (codigo === 'auth/network-request-failed') {
    return new ErrorDeCuenta(
      'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.',
      { codigo }
    );
  }

  return new ErrorDeCuenta('No se pudo completar la operación. Inténtalo de nuevo.', { codigo });
}

/** Lee el documento de «usuarios». Devuelve null si todavía no existe. */
async function leerPerfil(uid) {
  const instantanea = await getDoc(doc(db, 'usuarios', uid));
  return instantanea.exists() ? instantanea.data() : null;
}

/** Sesión en el formato que consume la interfaz. */
function componerSesion(cuenta, perfil) {
  if (!cuenta) return SESION_VACIA;
  return {
    cargando: false,
    usuario: {
      uid: cuenta.uid,
      correo: cuenta.email,
      nombre: perfil?.nombre ?? cuenta.displayName ?? cuenta.email,
    },
    rol: perfil?.rol ?? null,
    perfil,
  };
}

/**
 * Registro de un actor cultural (HU-12).
 *
 * Son dos escrituras en dos sistemas distintos —la credencial en Authentication
 * y el perfil en Firestore— y no hay transacción que las abarque. Si la segunda
 * falla, la primera se deshace: una credencial sin documento de «usuarios» es
 * una cuenta que puede entrar y no puede hacer nada, porque las reglas resuelven
 * el rol leyendo justamente ese documento.
 */
export async function registrarActorCultural({ nombre, correo, contrasena }) {
  exigirConfiguracion();

  const nombreLimpio = nombre.trim();
  const correoLimpio = normalizarCorreo(correo);

  let credencial;
  try {
    credencial = await createUserWithEmailAndPassword(auth, correoLimpio, contrasena);
  } catch (error) {
    throw traducir(error, 'registro');
  }

  try {
    await updateProfile(credencial.user, { displayName: nombreLimpio });
    await setDoc(doc(db, 'usuarios', credencial.user.uid), {
      uid: credencial.user.uid,
      nombre: nombreLimpio,
      correo: correoLimpio,
      rol: 'actor',
      estado: 'activo',
      fechaRegistro: serverTimestamp(),
      // Evidencia del consentimiento, con su fecha y la versión aceptada (HU-16).
      consentimientoDatos: {
        aceptado: true,
        fecha: serverTimestamp(),
        version: VERSION_POLITICA_DATOS,
      },
    });
  } catch (error) {
    await credencial.user.delete().catch(() => {});
    throw new ErrorDeCuenta(
      'La cuenta no pudo completarse y no se creó. Inténtalo de nuevo en unos minutos.',
      { codigo: error?.code ?? null }
    );
  }

  return componerSesion(credencial.user, await leerPerfil(credencial.user.uid));
}

/** Inicio de sesión (HU-13). */
export async function iniciarSesion({ correo, contrasena }) {
  exigirConfiguracion();
  try {
    // Persistencia local: la sesión sobrevive a recargar la página y a cerrar la
    // pestaña, que es el cuarto criterio de HU-13. Es el valor por omisión del
    // kit en navegador; se declara para que sea una decisión y no un descuido.
    await setPersistence(auth, browserLocalPersistence);
    const credencial = await signInWithEmailAndPassword(auth, normalizarCorreo(correo), contrasena);
    return componerSesion(credencial.user, await leerPerfil(credencial.user.uid));
  } catch (error) {
    if (error instanceof ErrorDeCuenta) throw error;
    throw traducir(error, 'ingreso');
  }
}

/** Cierre de sesión (HU-13). */
export async function cerrarSesion() {
  exigirConfiguracion();
  await signOut(auth);
}

/**
 * Envío del correo de restablecimiento (HU-14).
 *
 * Devuelve lo mismo exista o no la cuenta. Si Firebase responde que el usuario
 * no existe, la respuesta visible sigue siendo un éxito: lo contrario convertiría
 * este formulario en un detector de correos registrados.
 */
export async function enviarCorreoDeRestablecimiento(correo) {
  exigirConfiguracion();
  try {
    await sendPasswordResetEmail(auth, normalizarCorreo(correo));
  } catch (error) {
    const silenciables = ['auth/user-not-found', 'auth/invalid-email'];
    if (!silenciables.includes(error?.code)) throw traducir(error, 'recuperacion');
  }
}

/** Sesión actual, releyendo el perfil. La usa el proveedor tras registrar o entrar. */
export async function leerSesionActual() {
  if (!configuracionCompleta || !auth?.currentUser) return SESION_VACIA;
  return componerSesion(auth.currentUser, await leerPerfil(auth.currentUser.uid));
}

/**
 * Observa la sesión y avisa cada vez que cambia. Devuelve la función que deja de
 * observar. Es lo que permite que al recargar la página la sesión reaparezca sin
 * que nadie vuelva a escribir la contraseña.
 */
export function observarSesion(alCambiar) {
  if (!configuracionCompleta) {
    alCambiar(SESION_VACIA);
    return () => {};
  }

  return onAuthStateChanged(auth, async (cuenta) => {
    if (!cuenta) {
      alCambiar(SESION_VACIA);
      return;
    }
    try {
      alCambiar(componerSesion(cuenta, await leerPerfil(cuenta.uid)));
    } catch {
      // El perfil no se pudo leer: hay sesión pero no rol, y las rutas privadas
      // por rol quedarán cerradas. Es el lado seguro del fallo.
      alCambiar(componerSesion(cuenta, null));
    }
  });
}
