/**
 * Los indicadores de uso del panel — HU-34 · RF-15, RNF-06.
 *
 * Único punto que lee la colección «interacciones» (docs/03 §3). Solo el
 * administrador puede hacerlo: la regla lo dice desde HU-11 y hay casos que lo
 * fijan desde HU-29.
 *
 * ## La decisión de esta historia: de dónde salen las consultas
 *
 * El modelo tiene desde HU-05 un campo «eventos.contadorConsultas» y un índice
 * «estadoPublicacion ASC, contadorConsultas DESC», los dos puestos pensando en
 * esta historia. Lo natural sería que la ficha de una publicación lo
 * incrementara al abrirse, y **no puede**: «allow update» sobre «eventos» exige
 * ser el dueño o el administrador, y quien consulta el catálogo no es ninguno de
 * los dos. HU-28 lo dejó anotado para que no se descubriera aquí (docs/27 §8).
 *
 * Había dos salidas y se tomó la segunda:
 *
 * 1. **Abrir la escritura del contador.** Se puede expresar en una regla —que
 *    solo cambie esa clave y que crezca exactamente en uno— y no se hizo. Deja a
 *    cualquiera escribiendo en «eventos», que es la colección que guarda el
 *    trabajo de los actores culturales, y el contador se puede inflar llamando
 *    muchas veces igual. El precio de un indicador no puede ser una puerta
 *    abierta en la colección más valiosa.
 * 2. **Contar los registros de «interacciones»**, que es lo que se hace. La
 *    colección ya acepta que cualquiera añada un registro de cuatro campos, ya
 *    prohíbe modificarlo y ya es de lectura exclusiva del administrador. No hizo
 *    falta tocar «firestore.rules».
 *
 * La consecuencia es que **«contadorConsultas» y su índice se quedan sin uso**.
 * Se conservan, como las otras dos filas que docs/04 §10 marca como planeadas y
 * no usadas: la diferencia entre lo que se diseñó y lo que se construyó es en sí
 * misma un dato del trabajo.
 *
 * ## Lo que los números no dicen
 *
 * Dos avisos que la vista repite en pantalla, porque un indicador que se
 * interpreta mal es peor que no tenerlo:
 *
 * - **Son una cota inferior.** El registro se dispara y no se espera respuesta
 *   (docs/28 §6), así que cuenta las consultas que se pudieron anotar, no todas
 *   las que hubo.
 * - **Se calculan sobre los últimos «TOPE_DE_REGISTROS».** Firestore no agrupa,
 *   así que agrupar es traerse los registros y contarlos en memoria. Con un tope
 *   el panel sigue abriendo igual de rápido dentro de un año.
 */
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { ErrorDeDatos, exigirRespuesta, intentar } from './errores.js';
import { ESTADOS_DE_PUBLICACION } from './eventosService.js';
import { configuracionCompleta, db } from './firebase.js';

const EVENTOS = 'eventos';
const INTERACCIONES = 'interacciones';

/**
 * Cuántos registros de interacción se traen para agrupar.
 *
 * Mil es mucho más de lo que este prototipo va a generar y bastante menos de lo
 * que tarda en notarse. Si algún día se queda corto, lo que hay que cambiar no
 * es el número: es contar en el servidor, y para eso hace falta escribir el
 * recuento en alguna parte cuando ocurre la consulta.
 */
export const TOPE_DE_REGISTROS = 1000;

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeDatos(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

/**
 * Cuántas publicaciones hay en cada estado — primer criterio, primera mitad.
 *
 * Tres consultas de recuento, que el servidor resuelve sin traer ni un
 * documento. Contar así trece publicaciones y contar así trece mil cuesta lo
 * mismo.
 *
 * Los tres estados se piden siempre, también los que dan cero: un panel donde la
 * fila «devuelto» desaparece cuando no hay ninguna devuelta se lee como que esa
 * categoría no existe, no como que está vacía.
 */
export async function contarPorEstado() {
  exigirConfiguracion();

  return intentar(async () => {
    const recuentos = await Promise.all(
      ESTADOS_DE_PUBLICACION.map(async (estado) => {
        const consulta = query(
          collection(db, EVENTOS),
          where('estadoPublicacion', '==', estado)
        );
        return (await getCountFromServer(consulta)).data().count;
      })
    );
    return Object.fromEntries(ESTADOS_DE_PUBLICACION.map((e, i) => [e, recuentos[i]]));
  });
}

/**
 * Cuántas publicaciones hay en cada categoría — primer criterio, segunda mitad.
 *
 * Recibe los identificadores en lugar de leerlos: el panel ya tiene la lista de
 * categorías cargada para su propia tabla, y volver a pedirla aquí sería una
 * lectura repetida de la misma página.
 *
 * Una consulta de recuento por categoría. Con las ocho de hoy son ocho
 * consultas que no traen documentos; si llegaran a ser cincuenta habría que
 * mirarlo, y es el mismo aviso que ya lleva «listarCategoriasConRecuento».
 */
export async function contarPorCategoria(identificadores) {
  exigirConfiguracion();
  const claves = identificadores ?? [];

  return intentar(async () => {
    const recuentos = await Promise.all(
      claves.map(async (idCategoria) => {
        const consulta = query(
          collection(db, EVENTOS),
          where('categoria', '==', idCategoria)
        );
        return (await getCountFromServer(consulta)).data().count;
      })
    );
    return Object.fromEntries(claves.map((c, i) => [c, recuentos[i]]));
  });
}

/**
 * Los registros de interacción más recientes — segundo criterio.
 *
 * Se ordenan por fecha descendente y se corta en «TOPE_DE_REGISTROS». Ordenar
 * por un solo campo no necesita índice compuesto, así que esta consulta no añade
 * ninguna fila a «firestore.indexes.json».
 *
 * Se traen los dos tipos en la misma lectura y se separan en memoria. Pedirlos
 * por separado serían dos consultas y dos índices —«tipo» más «fecha» es un
 * índice compuesto— para partir en dos una lista que ya está en la mano.
 */
export async function listarInteraccionesRecientes() {
  exigirConfiguracion();

  const consulta = query(
    collection(db, INTERACCIONES),
    orderBy('fecha', 'desc'),
    limit(TOPE_DE_REGISTROS)
  );

  return intentar(async () =>
    exigirRespuesta(await getDocs(consulta), 'los indicadores de uso').docs.map((documento) => {
      const datos = documento.data();
      return {
        id: documento.id,
        idEvento: datos.idEvento,
        tipo: datos.tipo,
        // «fecha» puede llegar nula el instante que va entre que el cliente
        // escribe y el servidor pone su marca de tiempo.
        fecha: datos.fecha?.toDate?.() ?? null,
      };
    })
  );
}

/**
 * Los datos de unas publicaciones concretas, por identificador.
 *
 * Es lo que convierte la lista de «masConsultadas» —que solo sabe de
 * identificadores y de cuentas— en algo que una persona pueda leer.
 *
 * Una lectura por identificador y no una consulta con «in»: «in» admite treinta
 * valores, así que serviría para el tope de diez que usa el panel, pero ata el
 * tope de la vista a un límite de Firestore que no tiene nada que ver. Diez
 * lecturas por documento cuestan lo mismo que una consulta que devuelve diez.
 *
 * Que una publicación ya no exista **no es un fallo**: HU-23 deja retirarlas y
 * los registros de interacción no se borran con ellas. Se devuelve lo que se
 * encontró y quien llama decide qué hacer con lo que falta, que es lo que hace
 * «conTitulo» en «utils/indicadores.js».
 *
 * Esta función lee «eventos» desde el servicio de indicadores, igual que
 * «contarPublicaciones» lo lee desde el de categorías: la regla de docs/03 §3
 * es que a Firebase se entra por «services/», no que cada colección tenga un
 * único servicio.
 */
export async function leerPublicacionesPorId(identificadores) {
  exigirConfiguracion();
  const claves = [...new Set(identificadores ?? [])];
  if (claves.length === 0) return {};

  return intentar(async () => {
    const documentos = await Promise.all(
      claves.map((id) => getDoc(doc(db, EVENTOS, id)))
    );

    const encontradas = {};
    for (const documento of documentos) {
      if (!documento.exists()) continue;
      const datos = documento.data();
      encontradas[documento.id] = {
        id: documento.id,
        titulo: datos.titulo,
        categoria: datos.categoria,
        estadoPublicacion: datos.estadoPublicacion,
      };
    }
    return encontradas;
  });
}
