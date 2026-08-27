import { useEffect, useState } from 'react';
import { listarModeracionesDeEvento } from '../../services/moderacionService.js';
import { textoDeFecha } from '../../utils/fechas.js';

/**
 * Lo que el administrador escribió al devolver — **tercer criterio de HU-24**.
 *
 * ## Aquí es donde ocurre la «notificación»
 *
 * El criterio dice «notificarse al actor cultural». No hay correo: enviarlo
 * exigiría Cloud Functions, que a su vez exige el plan Blaze y un medio de pago
 * que el proyecto no tiene (docs/03 §6.1, RNF-10). Notificar es, por tanto,
 * dentro de la aplicación: la publicación aparece «Devuelta» y **debajo se lee
 * qué hay que corregir**, en el mismo sitio donde se va a corregir.
 *
 * Conviene decir lo que eso implica y lo que no: el actor se entera la próxima
 * vez que entra, no en el momento. Es una limitación real y está escrita en
 * docs/23 §3, no disimulada.
 *
 * ## Por qué se lee solo para las devueltas
 *
 * Cada publicación devuelta cuesta una consulta más. Pedir el historial de todas
 * las de la lista multiplicaría las lecturas por nada: una publicación aprobada o
 * pendiente no tiene observaciones que enseñar. Se lee donde hay algo que leer.
 *
 * ## Por qué se enseña sola y no tras pulsar
 *
 * Una observación que hay que ir a buscar no es una notificación. La tarjeta ya
 * dice «Devuelta»; lo que le falta a quien la lee es saber qué corregir, y eso es
 * exactamente lo que estaba prometido desde HU-21 y no se cumplía: el texto de
 * la tarjeta decía «Revisa las observaciones» y no había ninguna a la vista.
 */
export default function ObservacionesDeModeracion({ publicacion }) {
  const [observacion, setObservacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const idEvento = publicacion.id;
  const devuelta = publicacion.estadoPublicacion === 'devuelto';

  useEffect(() => {
    if (!devuelta) {
      setCargando(false);
      return;
    }

    let vigente = true;

    (async () => {
      try {
        const historial = await listarModeracionesDeEvento(idEvento);
        // La lista viene de la más reciente a la más antigua. Interesa la última
        // devolución: si hubo varias idas y venidas, la vieja ya se corrigió.
        const ultima = historial.find((registro) => registro.decision === 'devuelto');
        if (vigente) {
          setObservacion(ultima ?? null);
          setError(null);
        }
      } catch (fallo) {
        if (vigente) {
          setError(
            fallo?.message ?? 'No se pudieron leer las observaciones. Recarga la página.'
          );
        }
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    // Sin esto, volver atrás mientras la consulta está en marcha escribiría sobre
    // un componente ya desmontado.
    return () => {
      vigente = false;
    };
  }, [idEvento, devuelta]);

  if (!devuelta) return null;

  if (cargando) {
    return <p className="tarjeta-publicacion__observaciones">Leyendo las observaciones…</p>;
  }

  if (error) {
    return (
      <p className="campo__error" role="alert">
        {error}
      </p>
    );
  }

  if (!observacion) {
    // Puede pasar legítimamente: una publicación devuelta antes de que existiera
    // el registro, o una devolución cuyo registro no se pudo leer. Decirlo es
    // mejor que dejar un hueco donde debería haber una explicación.
    return (
      <p className="tarjeta-publicacion__observaciones">
        El administrador la devolvió, pero no hay observaciones guardadas. Escríbele si no
        sabes qué corregir.
      </p>
    );
  }

  return (
    <div className="tarjeta-publicacion__observaciones">
      <p className="tarjeta-publicacion__observaciones-titulo">
        Qué hay que corregir
        {observacion.fecha && (
          <span className="tarjeta-publicacion__observaciones-fecha">
            {' · '}
            {textoDeFecha(observacion.fecha)}
          </span>
        )}
      </p>
      <p className="tarjeta-publicacion__observaciones-texto">{observacion.observaciones}</p>
    </div>
  );
}
