import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ErrorDeDatos, intentar } from './errores.js';
import { configuracionCompleta, db } from './firebase.js';

/**
 * Moderación de publicaciones — HU-24 · RF-13.
 *
 * Este servicio es la excepción declarada a la regla de docs/03 §3, que dice que
 * cada colección tiene un único servicio que la escribe. Moderar toca **dos**:
 * cambia `eventos.estadoPublicacion` y crea el registro en `moderaciones`. No hay
 * forma de repartirlo entre dos servicios sin romper lo que lo hace correcto, así
 * que vive junto y se dice en voz alta. `eventosService.js` remite aquí.
 *
 * ## Por qué un lote y no dos escrituras
 *
 * El cuarto criterio de aceptación dice que de **cualquier** decisión debe quedar
 * constancia. Con dos escrituras sueltas hay un momento entre la primera y la
 * segunda: si la segunda falla —se corta la red, se cierra el portátil—, la
 * publicación queda aprobada y sin registro de quién la aprobó. Nadie se entera,
 * porque el resultado visible es el correcto.
 *
 * `writeBatch` hace las dos o ninguna. Es la diferencia entre un criterio que se
 * cumple y uno que se cumple casi siempre.
 *
 * ## Una pregunta que no se dio por sabida
 *
 * La regla de `moderaciones` exige `fecha == request.time`, y dentro de un lote
 * no era evidente que `serverTimestamp()` resuelva exactamente a ese valor: son
 * dos escrituras enviadas juntas y el momento de recepción no tiene por qué
 * coincidir con el de confirmación. En vez de suponerlo hay un caso en
 * `pruebas/reglas` que hace un lote real contra el emulador (docs/23 §4).
 */

const EVENTOS = 'eventos';
const MODERACIONES = 'moderaciones';

/** Las dos decisiones que el modelo admite (docs/04 §8). */
export const DECISIONES = ['aprobado', 'devuelto'];

export class ErrorDeModeracion extends ErrorDeDatos {
  constructor(mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorDeModeracion';
  }
}

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeModeracion(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

const aFecha = (marca) => (marca?.toDate ? marca.toDate() : null);

function aModeracion(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    idEvento: datos.idEvento,
    idAdministrador: datos.idAdministrador,
    decision: datos.decision,
    observaciones: datos.observaciones ?? null,
    fecha: aFecha(datos.fecha),
  };
}

/**
 * Aprueba o devuelve una publicación, y deja constancia — **segundo, tercer y
 * cuarto criterio de HU-24**.
 *
 * La observación es obligatoria al devolver y **no** se comprueba solo aquí: la
 * regla la exige igual, así que devolver sin explicar por qué es imposible
 * también para quien escriba por fuera de esta interfaz. Lo de aquí es el
 * mensaje entendible; lo del servidor es la garantía.
 */
export async function moderarPublicacion({
  idEvento,
  idAdministrador,
  decision,
  observaciones = null,
}) {
  exigirConfiguracion();

  if (!DECISIONES.includes(decision)) {
    throw new ErrorDeModeracion(`«${decision}» no es una decisión de moderación válida.`);
  }

  const limpias = (observaciones ?? '').trim();
  if (decision === 'devuelto' && limpias === '') {
    throw new ErrorDeModeracion(
      'Para devolver una publicación hay que escribir qué debe corregir su autor.'
    );
  }

  const registro = doc(collection(db, MODERACIONES));

  return intentar(async () => {
    const lote = writeBatch(db);

    lote.update(doc(db, EVENTOS, idEvento), { estadoPublicacion: decision });

    lote.set(registro, {
      idModeracion: registro.id,
      idEvento,
      idAdministrador,
      decision,
      // Nula al aprobar y con texto al devolver. La clave se escribe siempre
      // para que el documento no cambie de forma según la decisión, que es lo
      // mismo que se hizo con «coordenadas» en HU-21.
      observaciones: decision === 'devuelto' ? limpias : null,
      fecha: serverTimestamp(),
    });

    await lote.commit();
    return registro.id;
  });
}

/**
 * El historial de moderación de una publicación, de lo más reciente a lo más
 * antiguo.
 *
 * Se ordena en memoria por la misma razón que las publicaciones propias: el
 * índice compuesto que haría falta se despliega con otro comando (docs/04 §10) y
 * ordenar aquí no alcanza ningún documento de más, porque son todos los de este
 * evento y ya están leídos.
 *
 * Quién puede leerlo lo decide la regla: el administrador, y el actor dueño del
 * evento al que la moderación se refiere. Es lo que convierte «notificarse al
 * actor» en algo que ocurre de verdad (docs/23 §3).
 */
export async function listarModeracionesDeEvento(idEvento) {
  exigirConfiguracion();

  const consulta = query(collection(db, MODERACIONES), where('idEvento', '==', idEvento));

  return intentar(async () =>
    (await getDocs(consulta))
      .docs.map(aModeracion)
      .sort((a, b) => (b.fecha?.getTime() ?? 0) - (a.fecha?.getTime() ?? 0))
  );
}
