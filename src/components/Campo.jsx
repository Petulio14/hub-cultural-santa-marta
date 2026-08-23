import { useId } from 'react';

/**
 * Campo de formulario con su etiqueta y su mensaje de error.
 *
 * El error no se pinta solo en rojo: va escrito debajo del campo y enlazado con
 * «aria-describedby», de modo que un lector de pantalla lo anuncie al llegar al
 * campo. El color por sí solo no es un indicador accesible (WCAG 2.1, criterio
 * 1.4.1), y es la misma razón por la que el enlace activo del menú lleva
 * subrayado y no únicamente otro tono.
 */
export default function Campo({
  etiqueta,
  tipo = 'text',
  valor,
  alCambiar,
  error = null,
  ayuda = null,
  autoComplete,
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

      <input
        className={error ? 'campo__control campo__control--error' : 'campo__control'}
        id={id}
        type={tipo}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={descrito || undefined}
        autoComplete={autoComplete}
        required={requerido}
        {...resto}
      />

      {error && (
        <span className="campo__error" id={idError}>
          {error}
        </span>
      )}
    </p>
  );
}
