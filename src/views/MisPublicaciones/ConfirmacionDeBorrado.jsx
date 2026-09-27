import { useId, useState } from 'react';
import { useFocoAlAbrir } from '../../hooks/useFocoAlAbrir.js';
import { mensajeDe } from '../../utils/errores.js';

/**
 * Confirmar antes de eliminar — **segundo criterio de HU-23** · RF-06.
 *
 * ## Por qué no `window.confirm`
 *
 * Es una línea de código y hace exactamente lo que pide el criterio, y aun así no
 * sirve:
 *
 * - **No puede decir qué se va a borrar.** Su texto es una cadena suelta; no
 *   puede enseñar el título ni la fecha de la publicación con el formato del
 *   resto de la aplicación. «¿Eliminar la publicación?» con tres publicaciones en
 *   pantalla es justo la pregunta que no despeja la duda.
 * - **El navegador puede suprimirlo.** Tras varios diálogos seguidos, Chrome
 *   ofrece «impedir que esta página cree más cuadros de diálogo», y a partir de
 *   ahí `confirm` devuelve `false` sin preguntar nada. Un criterio de aceptación
 *   que un ajuste del navegador puede apagar no está cumplido.
 * - **Bloquea el hilo** y no se puede estilar ni traducir.
 *
 * ## Por qué en la tarjeta y no en una ventana
 *
 * La pregunta aparece dentro de la tarjeta que se va a borrar, con su título
 * delante. Una ventana modal habría tapado precisamente lo que hay que mirar para
 * decidir, y habría obligado a repetir el título dentro para compensarlo.
 *
 * ## El orden de los botones
 *
 * «Cancelar» va **primero**, en el sitio donde estaba «Eliminar» cuando se pulsó.
 * Quien haga doble clic por costumbre —o por un ratón que rebota— cancela, no
 * borra. Poner el botón destructivo bajo el dedo que acaba de pulsar es regalarle
 * la segunda pulsación al accidente.
 *
 * Desde HU-32 «Cancelar» es además **lo que recibe el foco**, por lo mismo: el
 * equivalente con teclado de ese doble clic es un Intro repetido.
 *
 * ## Lo que HU-32 corrigió
 *
 * **Decía «role="alertdialog"» y no es un diálogo.** ARIA reserva ese papel para
 * una ventana modal: algo que tapa la pantalla, recibe el foco y lo retiene
 * mientras está abierto. Esto es lo contrario a propósito —vive dentro de la
 * tarjeta, sin tapar nada, por lo dicho arriba—, así que el papel prometía a un
 * lector de pantalla un comportamiento que nunca iba a ocurrir. Ahora es un
 * «group» con su nombre, que es lo que de verdad es.
 *
 * **Y el foco se perdía.** El botón «Eliminar» se desmonta al pulsarlo, y el
 * navegador devuelve el foco a «body»: con teclado había que recorrer la página
 * desde la cabecera para volver a la pregunta que se acababa de abrir. Lo recoge
 * «useFocoAlAbrir». La pregunta va enlazada con «aria-describedby» al botón que
 * recibe el foco, así que se lee al llegar sin necesidad de una región viva.
 */
export default function ConfirmacionDeBorrado({ publicacion, alConfirmar }) {
  const [preguntando, setPreguntando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState(null);
  const regionRef = useFocoAlAbrir(preguntando);
  const idPregunta = useId();

  async function confirmar() {
    setBorrando(true);
    setError(null);
    try {
      await alConfirmar();
      // No se apaga «borrando» al terminar bien: la tarjeta entera desaparece con
      // la publicación, y apagarlo sería escribir sobre un componente que ya no
      // existe.
    } catch (fallo) {
      setError(mensajeDe(fallo, 'No se pudo eliminar la publicación. Revisa la conexión.'));
      setBorrando(false);
    }
  }

  if (!preguntando) {
    return (
      <button
        className="boton boton--peligro"
        type="button"
        onClick={() => {
          setError(null);
          setPreguntando(true);
        }}
      >
        Eliminar
      </button>
    );
  }

  return (
    <span
      className="tarjeta-publicacion__confirmacion"
      role="group"
      aria-label="Confirmar la eliminación"
      ref={regionRef}
    >
      <span className="tarjeta-publicacion__pregunta" id={idPregunta}>
        Se va a eliminar <strong>«{publicacion.titulo}»</strong>. No se puede deshacer.
      </span>

      {error && (
        <span className="campo__error" role="alert">
          {error}
        </span>
      )}

      <button
        className="boton boton--secundario"
        type="button"
        onClick={() => setPreguntando(false)}
        disabled={borrando}
        data-foco-inicial
        aria-describedby={idPregunta}
      >
        Cancelar
      </button>
      <button className="boton boton--peligro" type="button" onClick={confirmar} disabled={borrando}>
        {borrando ? 'Eliminando…' : 'Sí, eliminar'}
      </button>
    </span>
  );
}
