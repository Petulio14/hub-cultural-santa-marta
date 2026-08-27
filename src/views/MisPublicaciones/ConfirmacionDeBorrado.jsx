import { useState } from 'react';

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
 */
export default function ConfirmacionDeBorrado({ publicacion, alConfirmar }) {
  const [preguntando, setPreguntando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState(null);

  async function confirmar() {
    setBorrando(true);
    setError(null);
    try {
      await alConfirmar();
      // No se apaga «borrando» al terminar bien: la tarjeta entera desaparece con
      // la publicación, y apagarlo sería escribir sobre un componente que ya no
      // existe.
    } catch (fallo) {
      setError(fallo?.message ?? 'No se pudo eliminar la publicación. Revisa la conexión.');
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
    <span className="tarjeta-publicacion__confirmacion" role="alertdialog" aria-label="Confirmar la eliminación">
      <span className="tarjeta-publicacion__pregunta">
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
      >
        Cancelar
      </button>
      <button className="boton boton--peligro" type="button" onClick={confirmar} disabled={borrando}>
        {borrando ? 'Eliminando…' : 'Sí, eliminar'}
      </button>
    </span>
  );
}
