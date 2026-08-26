import { useId, useState } from 'react';
import Campo from '../../components/Campo.jsx';
import {
  ErrorDeGeocodificacion,
  buscarDireccion,
} from '../../services/geocodificacionService.js';
import { textoDeCoordenadas } from '../../utils/coordenadas.js';

/**
 * Dirección y punto en el mapa — HU-20, tercer criterio.
 *
 * La búsqueda **la dispara un botón**, no cada pulsación. Dos motivos, y el
 * segundo pesa más que el primero:
 *
 * 1. La política de uso de Nominatim prohíbe las consultas automáticas mientras
 *    se teclea, y es un servicio gratuito del que dependemos.
 * 2. El buscador falla con la nomenclatura colombiana de «carrera con calle»
 *    (véase la cabecera de geocodificacionService.js). Buscar solo cuando la
 *    persona lo pide convierte el fallo en algo que ve y puede corregir, en
 *    lugar de en un punto equivocado que se guarda sin que nadie mire.
 *
 * Se ofrecen **hasta tres candidatos con su nombre completo** y hay que elegir
 * uno. Ese es el paso que convierte «lo que encontró el buscador» en «el sitio
 * que dice el responsable del hub», y es la diferencia entre un mapa útil y un
 * mapa con puntos plausibles pero falsos.
 */
export default function BuscadorDeDireccion({
  direccion,
  punto,
  alCambiarDireccion,
  alElegirPunto,
  errorDeDireccion = null,
  errorDePunto = null,
}) {
  const id = useId();
  const [candidatos, setCandidatos] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState(null);

  async function buscar() {
    setBuscando(true);
    setFallo(null);
    setCandidatos(null);
    try {
      setCandidatos(await buscarDireccion(direccion));
    } catch (error) {
      setFallo(
        error instanceof ErrorDeGeocodificacion
          ? error.message
          : 'No se pudo buscar la dirección. Inténtalo de nuevo.'
      );
    } finally {
      setBuscando(false);
    }
  }

  return (
    <fieldset className="hub__ubicacion">
      <legend>Dónde está el espacio</legend>

      <Campo
        etiqueta="Dirección"
        valor={direccion}
        alCambiar={(valor) => {
          alCambiarDireccion(valor);
          // Cambiar la dirección invalida el punto ya elegido: si no, se
          // guardaría una dirección con las coordenadas de otra.
          if (punto) alElegirPunto(null);
          setCandidatos(null);
        }}
        error={errorDeDireccion}
        ayuda="Escríbela como se la darías a alguien que va a llegar."
      />

      <p className="hub__acciones-ubicacion">
        <button
          className="boton boton--secundario"
          type="button"
          onClick={buscar}
          disabled={buscando || direccion.trim() === ''}
        >
          {buscando ? 'Buscando…' : 'Buscar en el mapa'}
        </button>
      </p>

      {fallo && (
        <p className="campo__error" role="alert">
          {fallo}
        </p>
      )}

      {candidatos !== null && candidatos.length === 0 && !fallo && (
        <div className="hub__sin-resultados" role="status">
          <p>
            No se encontró esa dirección. El mapa de Santa Marta no tiene cartografiada la
            nomenclatura de «carrera con calle», así que prueba con{' '}
            <strong>un lugar de referencia cercano</strong>: el nombre del edificio, un
            parque, una universidad, o solo la calle sin el número.
          </p>
        </div>
      )}

      {candidatos !== null && candidatos.length > 0 && (
        <div className="hub__candidatos">
          <p id={`${id}-titulo`} className="campo__etiqueta">
            {candidatos.length === 1
              ? 'Esto es lo que se encontró. ¿Es tu espacio?'
              : 'Elige cuál de estos es tu espacio:'}
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
                        ? 'hub__candidato hub__candidato--elegido'
                        : 'hub__candidato'
                    }
                    type="button"
                    aria-pressed={elegido}
                    onClick={() => alElegirPunto(candidato)}
                  >
                    <span className="hub__candidato-nombre">{candidato.nombre}</span>
                    <span className="hub__candidato-punto">
                      {textoDeCoordenadas(candidato)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {punto && (
        <p className="hub__punto-elegido" role="status">
          Punto confirmado: <strong>{textoDeCoordenadas(punto)}</strong>. Es el que se usará
          para situar tu hub en el mapa.
        </p>
      )}

      {errorDePunto && (
        <p className="campo__error" role="alert">
          {errorDePunto}
        </p>
      )}
    </fieldset>
  );
}
