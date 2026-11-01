/**
 * Inicialización del kit de desarrollo de Firebase.
 *
 * Este es el ÚNICO archivo del proyecto autorizado a importar de «firebase/*»
 * (docs/03-arquitectura.md §3). El resto de servicios toma «auth» y «db» de
 * aquí, y las vistas no los ven nunca.
 *
 * La verificación de esa regla es «npm run verificar».
 *
 * Hubo aquí un tercer export, «almacenamiento», que inicializaba Firebase
 * Storage. Se retira el 01/11/2026 al documentar la arquitectura para HU-39:
 * **no lo importaba nadie**. Activar Storage exige pasar el proyecto a plan de
 * facturación y el proyecto no tiene presupuesto (RNF-10), así que las imágenes
 * se reducen en el navegador y viajan dentro del documento de Firestore
 * (docs/03 §6.1, docs/18 §11). Un cliente inicializado que nadie usa hacía que
 * la arquitectura pareciera otra de la que es, que es justo lo que esta
 * historia tiene que evitar. «storage.rules» se conserva escrito por si algún
 * día se activa.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const configuracion = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Sigue aquí aunque no se suba ni un archivo: es uno de los seis valores que
  // la consola de Firebase entrega juntos, y «configuracionCompleta» los exige
  // los seis. Quitarlo dejaría arrancar con cinco, que es un cambio de
  // comportamiento y no una limpieza.
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
