/**
 * Publicaciones culturales — HU-21 · RF-05, RF-07.
 *
 * Punto único del proyecto que lee y escribe la colección «eventos», con **una
 * excepción declarada**: la transición de moderación vive en
 * «moderacionService.js», porque cambiar el estado y dejar constancia de quién lo
 * cambió tienen que ocurrir en la misma escritura o en ninguna, y eso obliga a un
 * lote que toca dos colecciones a la vez (docs/03 §3, docs/23 §2).
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
  deleteDoc,
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
 * El punto del dominio al tipo de Firestore — HU-22.
 *
 * Nulo entra y nulo sale: una publicación sin punto es válida y no aparece en el
 * mapa (docs/04 §6). Es la traducción inversa de la que hace «aPublicacion», y
 * las dos viven aquí por lo mismo: «latitude» y «longitude» son vocabulario del
 * SDK, y una vista no habla ese idioma (docs/03 §3).
 */
const aGeoPoint = (punto) => (punto ? new GeoPoint(punto.lat, punto.lon) : null);

/**
 * Los campos que el actor controla.
 *
 * «idEvento», «idActor», «estadoPublicacion», «fechaCreacion» y
 * «contadorConsultas» no están: los pone el servicio al crear y las reglas los
 * defienden después.
 */
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
 * Escribe **dos claves** y no el documento entero. No es por la regla: «toca»
 * compara con «diff().affectedKeys()», que mira valores y no claves enviadas, así
 * que reenviar el documento igual pasaría —hay un caso en pruebas/reglas que lo
 * comprueba en lugar de suponerlo—. Es por lo que cuesta: el documento lleva
 * dentro la imagen reducida, hasta 120 KB (docs/03 §6.1), y reenviarla en cada
 * ajuste del marcador serían 120 KB de subida para mover un punto tres metros.
 *
 * La segunda clave llega con HU-23 y **levanta el límite que HU-22 documentó**.
 * Entonces esta función escribía solo «coordenadas», así que sobre una
 * publicación aprobada chocaba con la regla —que exige que lo escrito siga
 * siendo 'pendiente'— y el punto se quedaba sin poder corregir. Mover el punto es
 * editar, y editar devuelve a revisión: es el primer criterio de HU-23 aplicado
 * al caso más pequeño que existe.
 */
export async function actualizarPunto(idEvento, punto) {
  exigirConfiguracion();

  const referencia = doc(db, COLECCION, idEvento);

  return intentar(async () => {
    await updateDoc(referencia, {
      coordenadas: aGeoPoint(punto),
      estadoPublicacion: 'pendiente',
    });
    return aPublicacion(await getDoc(referencia));
  });
}

/**
 * Guarda los cambios de una publicación — **primer criterio de HU-23**.
 *
 * «Vuelve a estado pendiente» no lo decide esta línea, lo decide la regla: exige
 * que lo escrito lleve «estadoPublicacion == 'pendiente'», así que una edición
 * que intentara conservar el visto bueno sería rechazada por el servidor. Aquí se
 * escribe porque es lo único que la regla acepta, no porque el cliente sea quien
 * lo garantiza. La diferencia importa: el criterio se sostiene aunque alguien
 * escriba por fuera de esta interfaz.
 *
 * Es la decisión contraria a la de los perfiles de actor, que **no** vuelven a
 * pendiente al editarse (docs/17 §5). Un evento anuncia una fecha y un lugar que
 * pueden cambiar a algo que no debería publicarse; un perfil describe a quien ya
 * fue admitido en la plataforma.
 */
export async function actualizarPublicacion(idEvento, datos) {
  exigirConfiguracion();

  const referencia = doc(db, COLECCION, idEvento);

  return intentar(async () => {
    await updateDoc(referencia, {
      ...camposEditables(datos),
      estadoPublicacion: 'pendiente',
    });
    return aPublicacion(await getDoc(referencia));
  });
}

/**
 * Elimina una publicación — **segundo criterio de HU-23**.
 *
 * La confirmación no está aquí y no es un olvido. Un servicio que preguntara
 * antes de borrar sería un servicio imposible de llamar desde una prueba, y la
 * pregunta es asunto de la interfaz: es ella la que sabe **qué** se va a borrar y
 * puede enseñarlo. Aquí solo se borra.
 *
 * La regla no mira el estado: se puede retirar una publicación aprobada. Es
 * deliberado y es lo contrario que en la edición —donde el visto bueno se pierde
 * en lugar de conservarse—. Retirar lo propio del catálogo no necesita permiso de
 * nadie; cambiar lo que ya se aprobó, sí vuelve a pedirlo.
 */
export async function eliminarPublicacion(idEvento) {
  exigirConfiguracion();

  return intentar(async () => {
    await deleteDoc(doc(db, COLECCION, idEvento));
    return idEvento;
  });
}

/**
 * La cola de moderación — **primer criterio de HU-24**.
 *
 * Filtra en el servidor y ordena en memoria, igual que la lista propia y por lo
 * mismo. Lo que cambia es **el sentido del orden**: aquí de la más antigua a la
 * más reciente, porque una cola se atiende por orden de llegada, y en «Mis
 * publicaciones» al revés, porque lo último que uno hizo es lo primero que busca.
 * Los dos órdenes son deliberados y no conviene «unificarlos».
 *
 * El índice compuesto que declara docs/04 §10 para esta consulta tampoco hace
 * falta por ahora, por la misma razón que en HU-23: ordenar en memoria no alcanza
 * ningún documento de más, ya están todos leídos.
 */
export async function listarPublicacionesPendientes() {
  exigirConfiguracion();

  const consulta = query(
    collection(db, COLECCION),
    where('estadoPublicacion', '==', 'pendiente')
  );

  return intentar(async () =>
    (await getDocs(consulta))
      .docs.map(aPublicacion)
      .sort((a, b) => (a.fechaCreacion?.getTime() ?? 0) - (b.fechaCreacion?.getTime() ?? 0))
  );
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
