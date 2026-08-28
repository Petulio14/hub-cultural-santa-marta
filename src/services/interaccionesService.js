/**
 * Registro anonimizado de interacciones — HU-29 · RF-15, tercer criterio.
 *
 * La colección existe en el modelo desde HU-05 y tiene regla desde HU-11. Esta
 * es la primera historia que **escribe** en ella, y con eso llegan dos cosas: el
 * servicio y una regla que por fin exige lo que el modelo declaraba (docs/28 §5).
 *
 * ## Qué se guarda, y sobre todo qué no
 *
 * Cuatro campos: el identificador del documento, a qué evento se refiere, de qué
 * tipo es y cuándo ocurrió. **Del visitante no se guarda nada**: ni quién es, ni
 * desde dónde entró, ni por qué canal contactó.
 *
 * Eso último merece explicación, porque sería el dato más interesante para el
 * actor cultural y es justo el que no se recoge. Guardar «contactó por WhatsApp»
 * no identifica a nadie por sí solo, pero el documento ya lleva el evento y la
 * hora: con un catálogo pequeño, la combinación de las tres cosas puede señalar
 * a una persona concreta, sobre todo si el actor recibe ese mensaje en el mismo
 * minuto. RNF-06 pide minimizar, y minimizar es no recoger lo que no hace falta
 * para el indicador que HU-34 va a calcular, que es **cuántos** contactos hubo.
 *
 * ## Por qué es «dispara y olvida»
 *
 * Quien pulsa «WhatsApp» quiere abrir WhatsApp. Esperar a que Firestore confirme
 * antes de dejarle ir sería cobrarle la latencia de un indicador que no le sirve
 * de nada, y en un móvil con mala señal eso son segundos mirando un botón que no
 * responde. La escritura sale y no se espera; si falla, se pierde ese registro y
 * no ocurre nada más.
 *
 * La contrapartida honesta es que **el recuento de HU-34 es una cota inferior**:
 * cuenta los contactos que se pudieron registrar, no todos los que hubo. Un
 * indicador que se anuncia como aproximado y lo es vale más que uno exacto que
 * cuesta segundos de espera a cada visitante.
 */
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ErrorDeDatos, intentar } from './errores.js';
import { configuracionCompleta, db } from './firebase.js';

const COLECCION = 'interacciones';

/** Los dos tipos que admite la regla: HU-29 escribe el segundo; HU-34, el primero. */
export const TIPOS_DE_INTERACCION = ['consulta', 'contacto'];

function exigirConfiguracion() {
  if (!configuracionCompleta) {
    throw new ErrorDeDatos(
      'La aplicación no está conectada a Firebase. Falta «.env.local» (docs/06-puesta-en-marcha.md §1.4).'
    );
  }
}

/**
 * Deja constancia de una interacción.
 *
 * El identificador se pide antes de escribir, igual que en «crearPublicacion»:
 * «doc(collection(...))» sin ruta devuelve una referencia con identificador ya
 * generado sin ir a la red, y así el documento nace con su propio «idInteraccion»
 * dentro en una sola escritura. Desde HU-29 la regla además **exige** que
 * coincida con la ruta.
 *
 * «fecha» la pone el servidor. No es comodidad: la regla exige
 * «fecha == request.time», que es lo único que un cliente no puede fabricar, y
 * sin eso los indicadores de HU-34 se podrían fechar a conveniencia.
 */
export async function registrarInteraccion({ idEvento, tipo }) {
  exigirConfiguracion();

  if (!TIPOS_DE_INTERACCION.includes(tipo)) {
    throw new ErrorDeDatos(`Tipo de interacción desconocido: «${tipo}».`);
  }
  if (typeof idEvento !== 'string' || idEvento.trim() === '') {
    throw new ErrorDeDatos('No se puede registrar una interacción sin saber de qué evento es.');
  }

  const referencia = doc(collection(db, COLECCION));

  return intentar(async () => {
    await setDoc(referencia, {
      idInteraccion: referencia.id,
      idEvento,
      tipo,
      fecha: serverTimestamp(),
    });
    return referencia.id;
  });
}
