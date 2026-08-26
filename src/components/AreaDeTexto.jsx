import { useId } from 'react';

/**
 * Campo de texto largo con su contador de caracteres — HU-18.
 *
 * Es el hermano de «Campo.jsx» para lo que no cabe en una línea, y comparte con
 * él la regla de accesibilidad: el error va escrito debajo y enlazado con
 * «aria-describedby», nunca señalado solo con color (WCAG 2.1, criterio 1.4.1).
 *
 * El contador es lo que cumple el tercer criterio de aceptación de HU-18 —«debe
 * advertirse antes del envío»—: se recalcula en cada pulsación, así que el aviso
 * llega mientras se escribe y no al pulsar «Guardar». Entra en
 * «aria-describedby» para que un lector de pantalla lo lea al llegar al campo,
 * pero no es una región viva: anunciar el número en cada tecla convertiría el
 * formulario en un goteo imposible de escuchar.
 *
 * El «textarea» NO lleva atributo «maxLength». Cortar el texto en silencio es
 * peor que advertir: quien pega tres párrafos vería desaparecer el final sin
 * saber por qué, que es justo lo que el criterio pide evitar.
 */
export default function AreaDeTexto({
  etiqueta,
  valor,
  alCambiar,
  maximo,
  error = null,
  ayuda = null,
  filas = 6,
  requerido = true,
  ...resto
}) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const idContador = `${id}-contador`;

  const escritos = (valor ?? '').trim().length;
  const excedido = maximo != null && escritos > maximo;

  const descrito = [error ? idError : null, ayuda ? idAyuda : null, maximo ? idContador : null]
    .filter(Boolean)
    .join(' ');

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

      <textarea
        className={
          error || excedido ? 'campo__control campo__control--error' : 'campo__control'
        }
        id={id}
        rows={filas}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-invalid={error || excedido ? 'true' : undefined}
        aria-describedby={descrito || undefined}
        required={requerido}
        {...resto}
      />

      {maximo != null && (
        <span
          className={excedido ? 'campo__contador campo__contador--excedido' : 'campo__contador'}
          id={idContador}
        >
          {escritos} de {maximo} caracteres
          {excedido && ` · te sobran ${escritos - maximo}`}
        </span>
      )}

      {error && (
        <span className="campo__error" id={idError}>
          {error}
        </span>
      )}
    </p>
  );
}
