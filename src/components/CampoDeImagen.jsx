import { useId, useRef } from 'react';
import ImagenDeActor from './ImagenDeActor.jsx';

/**
 * Selector de la imagen del perfil, con su vista previa — HU-19.
 *
 * Lo que se ve **es** lo que se va a guardar: la vista previa no muestra el
 * archivo original, sino la imagen ya reducida. Enseñar el original y guardar
 * otra cosa sería mentir sobre el resultado, y en esta historia el resultado
 * cambia bastante — el archivo se reduce a 480 px y se recodifica como JPEG.
 *
 * El «input» de archivo va oculto y se activa desde un botón. No es maquillaje:
 * el control nativo no se puede dimensionar, así que a 360 px se sale de la
 * columna y no cumple el área mínima de toque de HU-10. El botón sí, y el
 * «input» sigue siendo el que hace el trabajo, con su etiqueta asociada, de modo
 * que el teclado y el lector de pantalla lo encuentran igual.
 */
export default function CampoDeImagen({
  imagen,
  nombre,
  alElegir,
  alQuitar,
  error = null,
  ocupado = false,
}) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const entrada = useRef(null);

  return (
    <div className="campo campo-imagen">
      <span className="campo__etiqueta" id={`${id}-etiqueta`}>
        Imagen del perfil
      </span>

      <span className="campo__ayuda" id={idAyuda}>
        JPG o PNG, hasta 2 MB. Se reduce automáticamente antes de guardarse, así que la
        página no tarda en abrirse para quien te visite.
      </span>

      <div className="campo-imagen__cuerpo">
        <ImagenDeActor
          imagen={imagen}
          nombre={nombre || 'tu perfil'}
          className="campo-imagen__vista"
        />

        <div className="campo-imagen__acciones">
          <input
            className="campo-imagen__entrada"
            id={id}
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png"
            disabled={ocupado}
            aria-describedby={[error ? idError : null, idAyuda].filter(Boolean).join(' ')}
            onChange={(evento) => {
              const archivo = evento.target.files?.[0] ?? null;
              alElegir(archivo);
              // Se vacía para que elegir dos veces el mismo archivo vuelva a
              // disparar el cambio. Sin esto, quien recorta su foto y la vuelve
              // a elegir no ve pasar nada.
              evento.target.value = '';
            }}
          />

          <label className="boton boton--secundario campo-imagen__boton" htmlFor={id}>
            {imagen ? 'Cambiar imagen' : 'Elegir imagen'}
          </label>

          {imagen && (
            <button
              className="enlace-texto"
              type="button"
              disabled={ocupado}
              onClick={() => {
                alQuitar();
                if (entrada.current) entrada.current.value = '';
              }}
            >
              Quitar la imagen
            </button>
          )}

          {ocupado && <span className="campo-imagen__estado">Reduciendo la imagen…</span>}
        </div>
      </div>

      {error && (
        <span className="campo__error" id={idError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
