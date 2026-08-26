/**
 * Hubs de innovación — HU-20 · RF-04, RF-09.
 *
 * Único punto del proyecto que lee y escribe la colección «hubs»
 * (docs/03-arquitectura.md §3). Es el gemelo de «actoresService.js» y comparte
 * con él las tres decisiones de HU-18, por las mismas razones y sin excepción:
 *
 * 1. **El identificador del documento es el uid de su dueño.** Un responsable,
 *    un hub. Es lo único que las reglas pueden garantizar (docs/17 §2).
 * 2. **El hub nace pendiente y se edita sin volver a la cola.** Por eso
 *    «guardarMiHub» nunca escribe «estado» al actualizar.
 * 3. **El directorio filtra en el servidor**, porque una consulta que alcance un
 *    documento denegado no devuelve menos datos: devuelve un error.
 *
 * Lo propio del hub es el punto en el mapa. Se guarda como «GeoPoint», que es el
 * tipo que Firestore entiende y sobre el que sabe consultar por proximidad
 * cuando llegue el mapa (HU-30). Hacia fuera se entrega como «{ lat, lon }»,
 * porque una vista no tiene por qué conocer los tipos del kit.
 */
import {
  GeoPoint,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ErrorDeDatos, intentar } from './errores.js';
import { configuracionCompleta, db } from './firebase.js';

const COLECCION = 'hubs';

export class ErrorDeHub extends ErrorDeDatos {
  constructor(mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorDeHub';
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeHub(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

const oNulo = (valor) => {
  const limpio = (valor ?? '').trim();
  return limpio === '' ? null : limpio;
};

/** Documento de Firestore a objeto de dominio. Las vistas no ven instantáneas. */
function aHub(documento) {
  const datos = documento.data();
  const punto = datos.coordenadas;

  return {
    id: documento.id,
    uid: datos.uid,
    nombre: datos.nombre,
    descripcion: datos.descripcion ?? '',
    lineasDeTrabajo: Array.isArray(datos.lineasDeTrabajo) ? datos.lineasDeTrabajo : [],
    direccion: datos.direccion ?? '',
    // El GeoPoint se traduce aquí y no en la vista: «latitude» y «longitude» son
    // vocabulario del kit de Firebase, y ninguna vista debe conocerlo.
    punto: punto ? { lat: punto.latitude, lon: punto.longitude } : null,
    contacto: {
      telefono: datos.contacto?.telefono ?? null,
      correo: datos.contacto?.correo ?? null,
      whatsapp: datos.contacto?.whatsapp ?? null,
    },
    estado: datos.estado ?? 'pendiente',
  };
}

const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

/** Los campos que el responsable controla. «uid», «idHub» y «estado» no están. */
function camposEditables({ nombre, descripcion, lineasDeTrabajo, direccion, punto, contacto }) {
  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    lineasDeTrabajo,
    direccion: direccion.trim(),
    coordenadas: new GeoPoint(punto.lat, punto.lon),
    contacto: {
      telefono: oNulo(contacto?.telefono),
      correo: oNulo(contacto?.correo)?.toLowerCase() ?? null,
      whatsapp: oNulo(contacto?.whatsapp),
    },
  };
}

/** El hub de quien tiene la sesión abierta, o null si todavía no lo ha creado. */
export async function leerMiHub(uid) {
  exigirConfiguracion();
  return intentar(async () => {
    const instantanea = await getDoc(doc(db, COLECCION, uid));
    return instantanea.exists() ? aHub(instantanea) : null;
  });
}

/**
 * Crea el hub o actualiza el que ya existe (primer criterio de HU-20).
 *
 * Al crear se escriben además «idHub», «uid» y «estado: pendiente», que son los
 * tres campos que las reglas comprueban y que el formulario no ofrece. Al
 * actualizar se escriben solo los editables: dejar «estado» fuera es lo que hace
 * que editar no devuelva el hub a la cola de aprobación.
 */
export async function guardarMiHub(uid, datos) {
  exigirConfiguracion();

  const referencia = doc(db, COLECCION, uid);
  const editables = camposEditables(datos);

  // Lo que se devuelve es el objeto de dominio, no lo que se escribió: la vista
  // espera «punto» y no un GeoPoint, y devolverle lo segundo la obligaría a
  // conocer los tipos del kit justo después de haberla librado de ellos.
  const comoDominio = (estado) => ({
    id: uid,
    uid,
    nombre: editables.nombre,
    descripcion: editables.descripcion,
    lineasDeTrabajo: editables.lineasDeTrabajo,
    direccion: editables.direccion,
    punto: { lat: datos.punto.lat, lon: datos.punto.lon },
    contacto: editables.contacto,
    estado,
  });

  return intentar(async () => {
    const existente = await getDoc(referencia);

    if (existente.exists()) {
      await updateDoc(referencia, editables);
      return comoDominio(existente.data().estado ?? 'pendiente');
    }

    await setDoc(referencia, { idHub: uid, uid, ...editables, estado: 'pendiente' });
    return comoDominio('pendiente');
  });
}

/** Los hubs aprobados: es lo que ve cualquiera (segundo criterio de HU-20). */
export async function listarHubsAprobados() {
  exigirConfiguracion();
  const consulta = query(collection(db, COLECCION), where('estado', '==', 'aprobado'));
  return intentar(async () => (await getDocs(consulta)).docs.map(aHub).sort(porNombre));
}

/** Los hubs que esperan aprobación. Solo el administrador puede leerlos. */
export async function listarHubsPendientes() {
  exigirConfiguracion();
  const consulta = query(collection(db, COLECCION), where('estado', '==', 'pendiente'));
  return intentar(async () => (await getDocs(consulta)).docs.map(aHub).sort(porNombre));
}

/** Mueve el estado de un hub. Es potestad exclusiva del administrador. */
export async function cambiarEstadoDeHub(idHub, estado) {
  exigirConfiguracion();
  if (!['pendiente', 'aprobado', 'inactivo'].includes(estado)) {
    throw new ErrorDeHub(`«${estado}» no es un estado de hub válido.`);
  }
  await intentar(() => updateDoc(doc(db, COLECCION, idHub), { estado }));
}
