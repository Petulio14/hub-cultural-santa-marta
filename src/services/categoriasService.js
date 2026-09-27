/**
 * Catálogo de categorías culturales — HU-17 · RF-07, RF-14.
 *
 * Único punto del proyecto que lee y escribe la colección «categorias»
 * (docs/03-arquitectura.md §3). Lo consumen el panel de administración, y a
 * partir de HU-21 y HU-26 también el formulario de publicación y los filtros del
 * catálogo: por eso «listarActivas» está aquí y no dentro de una vista.
 *
 * Dos decisiones que conviene tener presentes al leerlo:
 *
 * 1. **Una categoría no se elimina, se desactiva.** El porqué está en
 *    docs/16-categorias.md §3: las reglas de seguridad no pueden contar
 *    documentos de otra colección, así que la única garantía real de que no se
 *    pierda la clasificación de un evento es que el documento no se borre nunca.
 * 2. **El identificador no cambia al renombrar.** «eventos.categoria» guarda ese
 *    identificador; cambiarlo dejaría huérfanas las publicaciones existentes.
 *
 * ## Lo que HU-31 vino a arreglar
 *
 * Este servicio es de HU-17, y «errores.js» se extrajo después, en HU-20. Nadie
 * volvió a pasar por aquí: hasta HU-31 ninguna de sus siete funciones traducía
 * un fallo de Firestore, así que un corte de red o un permiso denegado llegaban
 * a la pantalla como «Missing or insufficient permissions.». Es exactamente el
 * defecto que «errores.js» nació para cerrar, sobreviviendo en el único sitio
 * que no se revisó al extraerlo.
 */
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { ErrorDeDominio } from '../utils/errores.js';
import { aIdentificador } from '../utils/texto.js';
import { exigirRespuesta, intentar } from './errores.js';
import { configuracionCompleta, db } from './firebase.js';

const COLECCION = 'categorias';

export class ErrorDeCategoria extends ErrorDeDominio {
  constructor(mensaje, { campo = null } = {}) {
    super(mensaje);
    this.name = 'ErrorDeCategoria';
    this.campo = campo;
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeCategoria(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

/** Documento de Firestore a objeto de dominio. Las vistas no ven instantáneas. */
function aCategoria(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    nombre: datos.nombre,
    descripcion: datos.descripcion ?? '',
    // Las categorías sembradas antes de HU-17 no tienen el campo: se consideran
    // activas, que es como se venían comportando.
    activa: datos.activa !== false,
  };
}

/** Por nombre y no por identificador: es el orden en que se leen. */
const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

/** Todas las categorías, activas o no. Es la vista del administrador. */
export async function listarCategorias() {
  exigirConfiguracion();
  return intentar(async () => {
    const instantanea = exigirRespuesta(
      await getDocs(collection(db, COLECCION)),
      'el catálogo de categorías'
    );
    return instantanea.docs.map(aCategoria).sort(porNombre);
  });
}

/**
 * Solo las activas. Es lo que ofrecen el formulario de publicación (HU-21) y los
 * filtros del catálogo (HU-26): una categoría desactivada deja de ofrecerse sin
 * que las publicaciones que ya la usan pierdan su clasificación.
 */
export async function listarCategoriasActivas() {
  return (await listarCategorias()).filter((categoria) => categoria.activa);
}

/**
 * Cuántas publicaciones usan una categoría.
 *
 * Una consulta de recuento: el servidor devuelve el número sin traer los
 * documentos, así que contar diez categorías no descarga el catálogo entero.
 */
export async function contarPublicaciones(idCategoria) {
  exigirConfiguracion();
  return intentar(async () => {
    const consulta = query(collection(db, 'eventos'), where('categoria', '==', idCategoria));
    return (await getCountFromServer(consulta)).data().count;
  });
}

/** Las categorías con su recuento, que es lo que muestra el listado del panel. */
export async function listarCategoriasConRecuento() {
  const categorias = await listarCategorias();
  const recuentos = await Promise.all(categorias.map((c) => contarPublicaciones(c.id)));
  return categorias.map((categoria, i) => ({ ...categoria, publicaciones: recuentos[i] }));
}

/**
 * Crea una categoría. El identificador sale del nombre: «Música y danza» da
 * «musica-y-danza».
 *
 * La comprobación de que no exista se repite en el servidor por «setDoc» sobre un
 * identificador ya usado, que sobrescribiría. Por eso se lee antes: no es una
 * validación de cortesía, es lo que impide pisar una categoría existente cuando
 * dos nombres distintos producen el mismo identificador.
 */
export async function crearCategoria({ nombre, descripcion = '' }) {
  exigirConfiguracion();

  const nombreLimpio = nombre.trim();
  const id = aIdentificador(nombreLimpio);
  if (id === '') {
    throw new ErrorDeCategoria('El nombre debe contener al menos una letra o un número.', {
      campo: 'nombre',
    });
  }

  const referencia = doc(db, COLECCION, id);

  // El ErrorDeCategoria de aquí dentro sale intacto: «traducir» deja pasar todo
  // lo que hereda de ErrorDeDominio, y «Ya existe una categoría con ese nombre»
  // dice mucho más que el mensaje genérico que lo sustituiría.
  return intentar(async () => {
    if ((await getDoc(referencia)).exists()) {
      throw new ErrorDeCategoria('Ya existe una categoría con ese nombre.', { campo: 'nombre' });
    }

    const categoria = {
      idCategoria: id,
      nombre: nombreLimpio,
      descripcion: descripcion.trim(),
      activa: true,
    };
    await setDoc(referencia, categoria);
    return { id, ...categoria, publicaciones: 0 };
  });
}

/**
 * Cambia el nombre o la descripción. El identificador se queda como está: es lo
 * que llevan escrito dentro las publicaciones ya clasificadas.
 */
export async function renombrarCategoria(id, { nombre, descripcion = '' }) {
  exigirConfiguracion();
  await intentar(() =>
    updateDoc(doc(db, COLECCION, id), {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    })
  );
}

/** Desactiva o reactiva. No hay eliminar: ver la cabecera de este archivo. */
export async function cambiarEstadoDeCategoria(id, activa) {
  exigirConfiguracion();
  await intentar(() => updateDoc(doc(db, COLECCION, id), { activa }));
}
