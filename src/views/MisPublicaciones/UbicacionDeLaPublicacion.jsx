import { useId } from 'react';
import Campo from '../../components/Campo.jsx';
import MapaDePunto from '../../components/MapaDePunto.jsx';
import { useBusquedaDeDireccion } from '../../hooks/useBusquedaDeDireccion.js';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';

/**
 * Dónde ocurre la publicación — HU-22 · RF-08, primer criterio.
 *
 * Dos caminos hasta el mismo punto y ninguno obligatorio:
 *
 * - **Buscar el lugar por su nombre.** Devuelve hasta tres candidatos, que son
 *   botones y se recorren con el tabulador. Es el camino accesible, y el único
 *   que funciona sin ratón.
 * - **Hacer clic o arrastrar sobre el mapa.** Es el camino preciso, y el único
 *   que sirve para un sitio sin nombre cartografiado —una playa, una esquina, un
 *   patio— que es la mitad de la agenda cultural de la ciudad.
 *
 * ## En qué se aparta de HU-20, y por qué
 *
 * En el formulario del hub, cambiar la dirección **borra** el punto ya elegido:
 * allí el punto se deriva de la dirección, y conservarlo guardaría una dirección
 * con las coordenadas de otra.
 *
 * Aquí no se borra, y es deliberado. El punto de una publicación no se deriva del
 * texto: se puede haber puesto con el dedo sobre el mapa, sin buscar nada. Borrarlo
 * en cada pulsación de un campo libre destruiría el trabajo de quien solo estaba
 * corrigiendo una tilde. Lo que sostiene la coherencia entre los dos es que el
 * punto **está a la vista**: se ve el marcador en el mapa y se leen sus
 * coordenadas debajo. No es estado escondido, así que no hace falta protegerlo
 * borrándolo.
 */
export default function UbicacionDeLaPublicacion({
  lugar,
  punto,
  alCambiarLugar,
  alElegirPunto,
  errorDeLugar = null,
  errorDePunto = null,
}) {
  const id = useId();
  const { candidatos, buscando, fallo, buscar, limpiar } = useBusquedaDeDireccion();

  async function buscarLugar() {
    const encontrados = await buscar(lugar);
    // Con un único resultado, elegir por la persona le ahorra un clic y no le
    // quita nada: el punto queda igualmente visible en el mapa y se puede mover.
    if (encontrados.length === 1) alElegirPunto(encontrados[0]);
  }

  return (
    <fieldset className="publicacion__ubicacion">
      <legend>Dónde ocurre</legend>

      <Campo
        etiqueta="Lugar"
        valor={lugar}
        alCambiar={(valor) => {
          alCambiarLugar(valor);
          limpiar();
        }}
        error={errorDeLugar}
        ayuda="El nombre del sitio, escrito como se lo dirías a quien va a llegar."
      />

      <p className="publicacion__acciones-ubicacion">
        <button
          className="boton boton--secundario"
          type="button"
          onClick={buscarLugar}
          disabled={buscando || lugar.trim() === ''}
        >
          {buscando ? 'Buscando…' : 'Buscar este lugar en el mapa'}
        </button>
      </p>

      {fallo && (
        <p className="campo__error" role="alert">
          {fallo}
        </p>
      )}

      {candidatos !== null && candidatos.length === 0 && !fallo && (
        <p className="publicacion__sin-resultados" role="status">
          No se encontró ese lugar. No pasa nada: <strong>sitúalo tú en el mapa</strong>,
          que para eso está. El mapa de Santa Marta no tiene cartografiada la nomenclatura
          de «carrera con calle», y muchos sitios buenos no tienen nombre.
        </p>
      )}

      {candidatos !== null && candidatos.length > 1 && (
        <div className="publicacion__candidatos">
          <p id={`${id}-titulo`} className="campo__etiqueta">
            Elige cuál de estos es el sitio:
          </p>
          <ul aria-labelledby={`${id}-titulo`}>
            {candidatos.map((candidato) => {
              const elegido =
                punto && punto.lat === candidato.lat && punto.lon === candidato.lon;
              return (
                <li key={`${candidato.lat},${candidato.lon}`}>
                  <button
                    className={
                      elegido
                        ? 'publicacion__candidato publicacion__candidato--elegido'
                        : 'publicacion__candidato'
                    }
                    type="button"
                    aria-pressed={elegido}
                    onClick={() => alElegirPunto(candidato)}
                  >
                    <span className="publicacion__candidato-nombre">{candidato.nombre}</span>
                    <span className="publicacion__candidato-punto">
                      {textoDeCoordenadas(candidato)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <MapaDePunto punto={punto} alElegirPunto={alElegirPunto} />

      <p className="publicacion__punto" role="status">
        {punto ? (
          <>
            Punto situado en <strong>{textoDeCoordenadas(punto)}</strong>. Arrastra el
            marcador si quieres afinarlo.{' '}
            <button
              className="publicacion__quitar-punto"
              type="button"
              onClick={() => alElegirPunto(null)}
            >
              Quitar el punto
            </button>
          </>
        ) : (
          'Todavía no has situado el punto. Sin él la publicación se guarda igual, pero no aparece en el mapa.'
        )}
      </p>

      {errorDePunto && (
        <p className="campo__error" role="alert">
          {errorDePunto}
        </p>
      )}
    </fieldset>
  );
}
