/**
 * Perfiles de actores culturales — HU-18 · RF-03, RF-06, RF-12.
 *
 * Único punto del proyecto que lee y escribe la colección «actoresCulturales»
 * (docs/03-arquitectura.md §3). Lo consumen el formulario del propio actor, el
 * directorio público, la ficha de cada perfil y el panel de administración.
 *
 * Tres decisiones que conviene tener presentes al leerlo:
 *
 * 1. **El identificador del documento es el uid de su dueño.** Un actor tiene un
 *    perfil y solo uno, y esa es la única forma de que las reglas de seguridad
 *    puedan garantizarlo: desde una regla no se puede preguntar «¿existe ya otro
 *    documento con este uid?», solo «¿existe esta ruta?» (docs/17 §2). De paso,
 *    leer el perfil propio es una lectura directa y no una consulta.
 * 2. **El perfil nace pendiente y se edita sin volver a la cola.** Lo primero lo
 *    exige el modelo de moderación; lo segundo es el segundo criterio de HU-18.
 *    Por eso «guardarMiPerfil» nunca escribe «estado» al actualizar.
 * 3. **El directorio se filtra en el servidor, no en memoria.** La regla de
 *    lectura deniega los perfiles sin aprobar, y Firestore rechaza la consulta
 *    entera si alcanza uno solo de ellos: pedir la colección completa y filtrar
 *    después no devuelve menos datos, devuelve un error.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { configuracionCompleta, db } from './firebase.js';

const COLECCION = 'actoresCulturales';

/** Los tres estados del modelo (docs/04 §4). */
export const ESTADOS_DE_ACTOR = ['pendiente', 'aprobado', 'inactivo'];

export class ErrorDeActor extends Error {
  constructor(mensaje, { campo = null, codigo = null } = {}) {
    super(mensaje);
    this.name = 'ErrorDeActor';
    this.campo = campo;
    this.codigo = codigo;
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeActor(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

/**
 * Traduce los códigos de Firestore a mensajes en español.
 *
 * Sin esto, un fallo del servidor llega a la pantalla como lo escribió el kit:
 * «Missing or insufficient permissions.» Es exactamente lo que leyó quien probó
 * la aplicación el 26/08/2026, y no dice a quién le falta permiso, ni para qué,
 * ni qué hacer a continuación. La misma decisión que ya tomó «authService.js»
 * para Authentication.
 */
function traducir(fallo) {
  if (fallo instanceof ErrorDeActor) return fallo;

  const codigo = fallo?.code ?? '';

  if (codigo === 'permission-denied') {
    return new ErrorDeActor(
      'Tu cuenta no tiene permiso para esta operación. Si acabas de registrarte, cierra sesión y vuelve a entrar.',
      { codigo }
    );
  }
  if (codigo === 'unavailable' || codigo === 'deadline-exceeded') {
    return new ErrorDeActor('No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.', {
      codigo,
    });
  }
  if (codigo === 'not-found') {
    return new ErrorDeActor('Ese perfil ya no existe.', { codigo });
  }

  return new ErrorDeActor('No se pudo completar la operación. Inténtalo de nuevo.', { codigo });
}

/** Ejecuta la operación y convierte cualquier fallo en un mensaje legible. */
async function intentar(operacion) {
  try {
    return await operacion();
  } catch (fallo) {
    throw traducir(fallo);
  }
}

/**
 * Un canal de contacto vacío se guarda como nulo y no como cadena vacía.
 *
 * No es cosmético: el modelo declara esos campos como «string | null» y la
 * interfaz decide si pinta el enlace preguntando por el nulo. Guardar «''»
 * dejaría un enlace «tel:» que no llama a ninguna parte.
 */
const oNulo = (valor) => {
  const limpio = (valor ?? '').trim();
  return limpio === '' ? null : limpio;
};

/** Documento de Firestore a objeto de dominio. Las vistas no ven instantáneas. */
function aActor(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    uid: datos.uid,
    nombre: datos.nombre,
    manifestacion: datos.manifestacion ?? '',
    descripcion: datos.descripcion ?? '',
    categoria: datos.categoria ?? '',
    contacto: {
      telefono: datos.contacto?.telefono ?? null,
      correo: datos.contacto?.correo ?? null,
      whatsapp: datos.contacto?.whatsapp ?? null,
    },
    imagenUrl: datos.imagenUrl ?? null,
    estado: datos.estado ?? 'pendiente',
  };
}

const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

/** Los campos que el actor controla. «uid», «idActor» y «estado» no están aquí. */
function camposEditables({ nombre, manifestacion, descripcion, categoria, contacto }) {
  return {
    nombre: nombre.trim(),
    manifestacion: manifestacion.trim(),
    descripcion: descripcion.trim(),
    categoria: categoria.trim(),
    contacto: {
      telefono: oNulo(contacto?.telefono),
      correo: oNulo(contacto?.correo)?.toLowerCase() ?? null,
      whatsapp: oNulo(contacto?.whatsapp),
    },
  };
}

/**
 * El perfil de quien tiene la sesión abierta, o null si todavía no lo ha creado.
 *
 * Una sola lectura por identificador, sin consulta ni índice, porque el
 * identificador es el uid. Devolver null y no lanzar es deliberado: no tener
 * perfil es el estado normal de una cuenta recién registrada, no un fallo.
 */
export async function leerMiPerfil(uid) {
  exigirConfiguracion();
  return intentar(async () => {
    const instantanea = await getDoc(doc(db, COLECCION, uid));
    return instantanea.exists() ? aActor(instantanea) : null;
  });
}

/**
 * Crea el perfil o actualiza el que ya existe (HU-18, criterios primero y
 * segundo).
 *
 * Al **crear** se escriben además «idActor», «uid» y «estado: pendiente», que son
 * los tres campos que las reglas comprueban y que el formulario no ofrece. Al
 * **actualizar** se escriben solo los campos editables: dejar «estado» fuera es
 * lo que hace que editar no devuelva el perfil a la cola de aprobación, y
 * escribirlo —aunque fuera con el mismo valor— haría que las reglas rechazaran
 * la operación, porque el dueño no puede tocar ese campo.
 */
export async function guardarMiPerfil(uid, datos) {
  exigirConfiguracion();

  const referencia = doc(db, COLECCION, uid);
  const editables = camposEditables(datos);

  return intentar(async () => {
    const existente = await getDoc(referencia);

    if (existente.exists()) {
      await updateDoc(referencia, editables);
      return { ...aActor(existente), ...editables };
    }

    const perfil = { idActor: uid, uid, ...editables, imagenUrl: null, estado: 'pendiente' };
    await setDoc(referencia, perfil);
    return { id: uid, ...perfil };
  });
}

/**
 * Los perfiles aprobados, que son los que ve cualquiera (quinto criterio de
 * HU-18). El filtro va en la consulta por lo dicho en la cabecera del archivo.
 */
export async function listarActoresAprobados() {
  exigirConfiguracion();
  const consulta = query(collection(db, COLECCION), where('estado', '==', 'aprobado'));
  return intentar(async () => (await getDocs(consulta)).docs.map(aActor).sort(porNombre));
}

/**
 * Un perfil por su dirección pública «/actores/:id».
 *
 * Devuelve null tanto si el documento no existe como si las reglas deniegan la
 * lectura por no estar aprobado. La vista dice lo mismo en ambos casos: existe
 * una diferencia entre «no hay tal perfil» y «hay uno que no puedes ver», y
 * contarla convertiría la dirección en un detector de perfiles pendientes.
 */
export async function leerActor(idActor) {
  exigirConfiguracion();
  try {
    const instantanea = await getDoc(doc(db, COLECCION, idActor));
    return instantanea.exists() ? aActor(instantanea) : null;
  } catch (fallo) {
    if (fallo?.code === 'permission-denied') return null;
    throw traducir(fallo);
  }
}

/** Los perfiles que esperan aprobación. Solo el administrador puede leerlos. */
export async function listarActoresPendientes() {
  exigirConfiguracion();
  const consulta = query(collection(db, COLECCION), where('estado', '==', 'pendiente'));
  return intentar(async () => (await getDocs(consulta)).docs.map(aActor).sort(porNombre));
}

/**
 * Mueve el estado de un perfil. Es potestad exclusiva del administrador, y las
 * reglas lo rechazan para cualquier otro aunque llegue hasta aquí.
 */
export async function cambiarEstadoDeActor(idActor, estado) {
  exigirConfiguracion();
  if (!ESTADOS_DE_ACTOR.includes(estado)) {
    throw new ErrorDeActor(`«${estado}» no es un estado de perfil válido.`);
  }
  await intentar(() => updateDoc(doc(db, COLECCION, idActor), { estado }));
}
