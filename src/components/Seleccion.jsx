import { useId } from 'react';

/**
 * Desplegable con su etiqueta y su mensaje de error — HU-18, para HU-21.
 *
 * Mismo contrato que «Campo.jsx»: error escrito debajo y enlazado con
 * «aria-describedby». Se usa un «select» nativo y no una lista construida con
 * divs porque el nativo ya funciona con teclado, con lector de pantalla y con el
 * selector a pantalla completa del móvil, que es donde se va a rellenar este
 * formulario la mayoría de las veces (RNF-03).
 *
 * La primera opción está deshabilitada a propósito: es un rótulo, no un valor.
 * Sin ella el desplegable arrancaría con la primera categoría ya elegida y
 * cualquiera guardaría sin darse cuenta una clasificación que no eligió.
 */
export default function Seleccion({
  etiqueta,
  valor,
  alCambiar,
  opciones,
  vacia = 'Elige una opción',
  error = null,
  ayuda = null,
  requerido = true,
  ...resto
}) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descrito = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ');

  return (
    <p className="campo">
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>

      {ayuda && (
        <span className="campo__ayuda" id={idAyuda}>
          {ayuda}
        </span>
      )}

      <select
        className={error ? 'campo__control campo__control--error' : 'campo__control'}
        id={id}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={descrito || undefined}
        required={requerido}
        {...resto}
      >
        <option value="" disabled>
          {vacia}
        </option>
        {opciones.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.nombre}
          </option>
        ))}
      </select>

      {error && (
        <span className="campo__error" id={idError}>
          {error}
        </span>
      )}
    </p>
  );
}
