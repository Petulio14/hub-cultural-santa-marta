/**
 * Inicialización del kit de desarrollo de Firebase.
 *
 * Este es el ÚNICO archivo del proyecto autorizado a importar de «firebase/*»
 * (docs/03-arquitectura.md §3). El resto de servicios toma «auth», «db» y
 * «almacenamiento» de aquí, y las vistas no los ven nunca.
 *
 * La verificación de esa regla es «npm run verificar».
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const configuracion = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const faltantes = Object.keys(configuracion).filter((clave) => !configuracion[clave]);

/** Falso mientras no exista «.env.local» con las seis variables de «.env.example». */
export const configuracionCompleta = faltantes.length === 0;

let app = null;

if (configuracionCompleta) {
  app = initializeApp(configuracion);
} else {
  // Sin proyecto de Firebase la aplicación tiene que seguir arrancando: las
  // vistas estáticas de HU-07, HU-09 y HU-10 no consultan datos. Un aviso en la
  // consola basta, y los servicios que sí lean datos comprobarán «db».
  console.warn(
    'Firebase no se inicializó: faltan las variables ' +
      faltantes.join(', ') +
      '. Copia «.env.example» como «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
  );
}

export const auth = app ? getAuth(app) : null;

// Los correos que envía Authentication —restablecer la contraseña, verificar la
// dirección— salen en el idioma que se declare aquí. Sin esta línea llegan en
// inglés, con la plantilla predeterminada de Firebase, a personas que están
// usando una plataforma escrita entera en español (HU-14, docs/13 §5 ter).
if (auth) auth.languageCode = 'es';
export const db = app ? getFirestore(app) : null;
export const almacenamiento = app ? getStorage(app) : null;
