import { useState } from 'react';
import MapaDePunto from '../../components/MapaDePunto.jsx';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';
import { validarPuntoDePublicacion } from '../../utils/validaciones.js';

/**
 * Cambiar el punto de una publicación ya guardada — **tercer criterio de HU-22**.
 *
 * Es un mapa y dos botones, y lo interesante es lo que hace con el estado. El
 * punto en edición vive aquí y **no toca la lista** hasta que se guarda: quien
 * arrastra el marcador, lo mira y se arrepiente pulsa «Cancelar» y la publicación
 * sigue exactamente como estaba. Con un solo punto compartido, cada arrastre
 * habría sido ya un cambio y «cancelar» no tendría a qué volver.
 *
 * Se abre cerrado. Un mapa por cada publicación de la lista serían tantas
 * instancias de Leaflet como tarjetas, cada una pidiendo sus teselas al servidor
 * gratuito de OpenStreetMap nada más entrar en la página, y eso es justo lo que
 * su política de uso pide no hacer.
 */
export default function EditorDePunto({ publicacion, alGuardar }) {
  const [abierto, setAbierto] = useState(false);
  const [punto, setPunto] = useState(publicacion.punto);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const editable = publicacion.estadoPublicacion === 'pendiente';

  function abrir() {
    setPunto(publicacion.punto);
    setError(null);
    setAbierto(true);
  }

  async function guardar() {
    const problema = validarPuntoDePublicacion(punto);
    if (problema) {
      setError(problema);
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await alGuardar(punto);
      setAbierto(false);
    } catch (fallo) {
      setError(fallo?.message ?? 'No se pudo guardar el punto. Revisa la conexión.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="tarjeta-publicacion__punto">
      <p className="tarjeta-publicacion__punto-estado">
        {publicacion.punto ? (
          <>
            Situada en <strong>{textoDeCoordenadas(publicacion.punto)}</strong>
          </>
        ) : (
          <>
            <strong>Sin situar en el mapa.</strong> No aparece entre los puntos del mapa
            cultural.
          </>
        )}
      </p>

      {/* Ya aprobada no se toca: la regla exige que lo que se escribe siga
          'pendiente', así que el servidor rechazaría el cambio. Decirlo aquí
          evita ofrecer un botón que solo lleva a un error. */}
      {!editable && (
        <p className="tarjeta-publicacion__punto-bloqueado">
          El punto solo puede cambiarse mientras la publicación está en revisión.
        </p>
      )}

      {editable && !abierto && (
        <button className="boton boton--secundario" type="button" onClick={abrir}>
          {publicacion.punto ? 'Cambiar el punto' : 'Situar en el mapa'}
        </button>
      )}

      {editable && abierto && (
        <div className="tarjeta-publicacion__editor">
          <MapaDePunto
            punto={punto}
            alElegirPunto={setPunto}
            descripcion={`Sitúa «${publicacion.titulo}» con un clic sobre el mapa, o arrastra el marcador para afinarlo.`}
          />

          <p className="tarjeta-publicacion__punto-nuevo" role="status">
            {punto
              ? `Punto elegido: ${textoDeCoordenadas(punto)}`
              : 'Todavía no hay punto. Al guardar así, la publicación deja de aparecer en el mapa.'}
          </p>

          {error && (
            <p className="campo__error" role="alert">
              {error}
            </p>
          )}

          <p className="tarjeta-publicacion__acciones">
            <button className="boton" type="button" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar el punto'}
            </button>
            <button
              className="boton boton--secundario"
              type="button"
              onClick={() => setAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </button>
            {punto && (
              <button
                className="tarjeta-publicacion__quitar"
                type="button"
                onClick={() => setPunto(null)}
                disabled={guardando}
              >
                Quitar el punto
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
