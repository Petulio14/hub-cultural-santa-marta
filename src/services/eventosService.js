/**
 * Publicaciones culturales — HU-21 · RF-05, RF-07.
 *
 * Único punto del proyecto que lee y escribe la colección «eventos»
 * (docs/03-arquitectura.md §3).
 *
 * Se parece a «actoresService» y «hubsService», pero cambia lo esencial: un actor
 * tiene **un** perfil y **muchas** publicaciones. Ahí se acaba el parecido y
 * empiezan las tres decisiones propias de esta historia.
 *
 * 1. **El identificador se pide antes de escribir.** «doc(collection(...))» sin
 *    ruta devuelve una referencia con identificador ya generado, sin ir a la red.
 *    Con «addDoc» habría que escribir primero y actualizar después para meter el
 *    «idEvento» dentro del documento, y eso son dos escrituras donde cabe una —y
 *    un documento que existe un instante sin su propio identificador.
 *
 * 2. **La fecha de creación la pone el servidor.** «serverTimestamp()» no es una
 *    comodidad: las reglas exigen «fechaCreacion == request.time», que es lo
 *    único que un cliente no puede fabricar. Es el cuarto criterio de aceptación
 *    y la razón de que la cola de moderación de HU-24 pueda ordenarse por
 *    antigüedad sin fiarse de nadie.
 *
 * 3. **La lista propia se filtra en el servidor y se ordena en memoria.** No es
 *    una contradicción con lo que HU-18 dejó escrito: filtrar en memoria es un
 *    defecto porque la consulta alcanzaría documentos que la regla deniega y
 *    Firestore devolvería un error en lugar de menos filas. Ordenar en memoria no
 *    alcanza ningún documento de más —ya están todos leídos y son los propios—,
 *    y evita depender de un índice compuesto que se despliega con otro comando
 *    (docs/04 §10).
 */
import {
  GeoPoint,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { normalizarTexto } from '../utils/texto.js';
import { ErrorDeDatos, intentar } from './errores.js';
import { configuracionCompleta, db } from './firebase.js';

const COLECCION = 'eventos';

/** Los tres estados de moderación del modelo (docs/04 §6). */
export const ESTADOS_DE_PUBLICACION = ['pendiente', 'aprobado', 'devuelto'];

export class ErrorDePublicacion extends ErrorDeDatos {
  constructor(mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorDePublicacion';
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDePublicacion(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

/**
 * Un «Timestamp» de Firestore a `Date`.
 *
 * Puede llegar nulo sin que nada esté roto: entre que «serverTimestamp()» se
 * envía y el servidor lo resuelve, una lectura local del mismo documento ve el
 * campo vacío. Por eso «crearPublicacion» vuelve a leer el documento en lugar de
 * devolver lo que acaba de escribir.
 */
const aFecha = (marca) => (marca?.toDate ? marca.toDate() : null);

/** Documento de Firestore a objeto de dominio. Las vistas no ven instantáneas. */
function aPublicacion(documento) {
  const datos = documento.data();
  const punto = datos.coordenadas;

  return {
    id: documento.id,
    idActor: datos.idActor,
    titulo: datos.titulo ?? '',
    descripcion: datos.descripcion ?? '',
    categoria: datos.categoria ?? '',
    fechaInicio: aFecha(datos.fechaInicio),
    fechaFin: aFecha(datos.fechaFin),
    lugar: datos.lugar ?? '',
    // Igual que en «hubsService»: el GeoPoint se traduce aquí y no en la vista.
    punto: punto ? { lat: punto.latitude, lon: punto.longitude } : null,
    imagen: datos.imagen ?? null,
    estadoPublicacion: datos.estadoPublicacion ?? 'pendiente',
    fechaCreacion: aFecha(datos.fechaCreacion),
    contadorConsultas: datos.contadorConsultas ?? 0,
  };
}

/** De la más reciente a la más antigua: lo último que se hizo se busca primero. */
const porCreacionDescendente = (a, b) =>
  (b.fechaCreacion?.getTime() ?? 0) - (a.fechaCreacion?.getTime() ?? 0);

/**
 * Los campos que el actor controla.
 *
 * «idEvento», «idActor», «estadoPublicacion», «fechaCreacion» y
 * «contadorConsultas» no están: los pone el servicio al crear y las reglas los
 * defienden después.
 */
/**
 * El punto del dominio al tipo de Firestore — HU-22.
 *
 * Nulo entra y nulo sale: una publicación sin punto es válida y no aparece en el
 * mapa (docs/04 §6). Es la traducción inversa de la que hace «aPublicacion», y
 * las dos viven aquí por lo mismo: «latitude» y «longitude» son vocabulario del
 * SDK, y una vista no habla ese idioma (docs/03 §3).
 */
const aGeoPoint = (punto) => (punto ? new GeoPoint(punto.lat, punto.lon) : null);

function camposEditables({
  titulo,
  descripcion,
  categoria,
  fechaInicio,
  fechaFin,
  lugar,
  punto,
  imagen,
}) {
  const tituloLimpio = titulo.trim();

  return {
    coordenadas: aGeoPoint(punto),
    titulo: tituloLimpio,
    // Se guarda calculado y no se calcula al buscar: Firestore no sabe comparar
    // sin distinguir tildes, así que la única forma de que «Cumbia» encuentre
    // «cumbia» en HU-27 es que el documento ya lleve la versión normalizada.
    tituloNormalizado: normalizarTexto(tituloLimpio),
    descripcion: descripcion.trim(),
    categoria,
    fechaInicio,
    fechaFin,
    lugar: lugar.trim(),
    imagen: imagen ?? null,
  };
}

/**
 * Crea una publicación — **primer y cuarto criterio de aceptación de HU-21**,
 * y **primer criterio de HU-22** desde que «coordenadas» puede llegar con punto.
 *
 * Nace «pendiente». «coordenadas» ya no se fija aquí a nulo: la escribe
 * «camposEditables», que traduce el punto del formulario y deja nulo si no lo
 * hay. La clave sigue estando siempre presente, con punto o sin él, para que el
 * documento no cambie de forma a mitad de vida.
 */
export async function crearPublicacion(idActor, datos) {
  exigirConfiguracion();

  const referencia = doc(collection(db, COLECCION));

  return intentar(async () => {
    await setDoc(referencia, {
      idEvento: referencia.id,
      idActor,
      ...camposEditables(datos),
      estadoPublicacion: 'pendiente',
      fechaCreacion: serverTimestamp(),
      contadorConsultas: 0,
    });

    // Se vuelve a leer para devolver la fecha que puso el servidor. Devolver lo
    // que se acaba de escribir daría «fechaCreacion» en nulo, que es justo el
    // dato que el cuarto criterio manda comprobar.
    return aPublicacion(await getDoc(referencia));
  });
}

/**
 * Cambia el punto de una publicación ya guardada — **tercer criterio de HU-22**.
 *
 * Escribe **una sola clave** y no el documento entero. No es por la regla: «toca»
 * compara con «diff().affectedKeys()», que mira valores y no claves enviadas, así
 * que reenviar el documento igual pasaría —hay un caso en pruebas/reglas que lo
 * comprueba en lugar de suponerlo—. Es por lo que cuesta: el documento lleva
 * dentro la imagen reducida, hasta 120 KB (docs/03 §6.1), y reenviarla en cada
 * ajuste del marcador serían 120 KB de subida para mover un punto tres metros.
 *
 * **Solo mientras está pendiente.** No es una decisión de esta historia: la regla
 * de HU-21 exige «estadoPublicacion == 'pendiente'» en lo que se escribe, así que
 * una publicación ya aprobada no la puede modificar su autor. Mover el punto de
 * algo que un administrador aprobó sería cambiar lo aprobado después del visto
 * bueno. Quien necesite corregirlo tendrá que pasar por HU-23, que devuelve la
 * publicación a revisión al editarla.
 */
export async function actualizarPunto(idEvento, punto) {
  exigirConfiguracion();

  const referencia = doc(db, COLECCION, idEvento);

  return intentar(async () => {
    await updateDoc(referencia, { coordenadas: aGeoPoint(punto) });
    return aPublicacion(await getDoc(referencia));
  });
}

/** Las publicaciones de un actor, las suyas y todas, en cualquier estado. */
export async function listarMisPublicaciones(idActor) {
  exigirConfiguracion();

  const consulta = query(collection(db, COLECCION), where('idActor', '==', idActor));
  return intentar(async () =>
    (await getDocs(consulta)).docs.map(aPublicacion).sort(porCreacionDescendente)
  );
}

/**
 * El **tercer criterio** —«no debe aparecer en el catálogo hasta ser aprobada»—
 * no tiene función aquí, y es a propósito.
 *
 * El catálogo público lo construye HU-25. Escribir hoy un «listarAprobadas» que
 * nadie llama sería dejar API muerta esperando a una historia que puede pedirla
 * distinta —con paginación, con filtros de HU-26—. Lo que sostiene el criterio
 * mientras tanto no es código de lectura sino la regla que lo impide: una
 * consulta de visitante que alcance una publicación pendiente **falla**, y hay
 * casos de prueba que lo demuestran (docs/20 §7).
 */
